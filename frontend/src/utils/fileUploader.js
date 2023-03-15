import SparkMD5 from "spark-md5";

class FileUploader {
  constructor(file, action, options) {
    this.file = file;
    this.action = action;
    this.options = options;
    this.fileSize = file.size;
    this.chunkSize = 5 * 1024 * 1024; //5M
    this.totalChunkCount = Math.ceil(this.fileSize / this.chunkSize);
    this.pauseSignal = false;
    this.md5 = null;
    this.uploadErrorCallback = null;
    this.uploadFinishedCallback = null;
    this.fileReaderErrorCallback = null;
    this.progressCallback = null;
    this.md5ProgressCallback = null;
    this.md5FinishedCallback = null;
    this.alreadyUploaded = null;
    this.abortController = new AbortController();
  }

  onUploadError(callback) {
    if (typeof callback === "function") {
      this.uploadErrorCallback = callback;
    }
  }

  onUploadFinished(callback) {
    if (typeof callback === "function") {
      this.uploadFinishedCallback = callback;
    }
  }

  onFileReaderError(callback) {
    if (typeof callback === "function") {
      this.fileReaderErrorCallback = callback;
    }
  }

  onProgress(callback) {
    if (typeof callback === "function") {
      this.progressCallback = callback;
    }
  }

  onAlreadyUploaded(callback) {
    if (typeof callback === "function") {
      this.alreadyUploaded = callback;
    }
  }

  onMD5Progress(callback) {
    if (typeof callback === "function") {
      this.md5ProgressCallback = callback;
    }
  }

  onMD5Finished(callback) {
    if (typeof callback === "function") {
      this.md5FinishedCallback = callback;
    }
  }

  //用来合并对象的工具函数,此函数不会使对象的属性丢失.
  mergeDeep(target, ...sources) {
    function isObject(item) {
      return item && typeof item === "object" && !Array.isArray(item);
    }
    if (!sources.length) return target;
    const source = sources.shift();

    if (isObject(target) && isObject(source)) {
      for (const key in source) {
        if (isObject(source[key])) {
          if (!target[key]) Object.assign(target, { [key]: {} });
          this.mergeDeep(target[key], source[key]);
        } else {
          Object.assign(target, { [key]: source[key] });
        }
      }
    }

    return this.mergeDeep(target, ...sources);
  }

  //分片计算md5,大文件也不会占用过高内存
  async computeMD5() {
    const file = this.file;
    const blobSlice =
      File.prototype.slice ||
      File.prototype.mozSlice ||
      File.prototype.webkitSlice;
    const chunkSize = 20 * 1024 * 1024;
    const totalChunkCount = Math.ceil(file.size / chunkSize);
    let currentChunk = 0;
    const spark = new SparkMD5.ArrayBuffer();
    const fileReader = new FileReader();

    return new Promise(
      function (resolve, reject) {
        fileReader.onload = function (e) {
          spark.append(e.target.result); // Append array buffer

          if (this.md5ProgressCallback) {
            const loaded =
              (currentChunk + 1) * chunkSize > file.size
                ? file.size
                : (currentChunk + 1) * chunkSize;
            this.md5ProgressCallback({
              loaded,
              total: file.size,
            });
          }
          currentChunk++;

          if (currentChunk < totalChunkCount) {
            loadNext();
          } else {
            const md5 = spark.end();
            this.md5 = md5;
            if (this.md5FinishedCallback) {
              this.md5FinishedCallback({ md5 });
            }
            resolve(md5);
          }
        }.bind(this);
        fileReader.onerror = function () {
          // console.warn("file read error");
          reject("文件读取错误");
        };
        function loadNext() {
          const start = currentChunk * chunkSize;
          const end =
            start + chunkSize >= file.size ? file.size : start + chunkSize;
          fileReader.readAsArrayBuffer(blobSlice.call(file, start, end));
        }
        loadNext();
      }.bind(this)
    );
  }

  //得到当前要发送第几个分片,从0开始计数直到this.totalChunkCount-1
  getChunkCount(md5) {
    const chunkCountInStorage = localStorage.getItem(md5);
    if (chunkCountInStorage) {
      return parseInt(chunkCountInStorage, 10);
    } else {
      return 0;
    }
  }

  //得到要发送的分片数据,类型为Blob
  getChunk(chunkCount) {
    const startIndex = chunkCount * this.chunkSize;
    const endIndex =
      startIndex + this.chunkSize >= this.fileSize
        ? this.fileSize
        : startIndex + this.chunkSize;
    const blobSlice =
      File.prototype.slice ||
      File.prototype.mozSlice ||
      File.prototype.webkitSlice;
    return blobSlice.call(this.file, startIndex, endIndex); //type
  }

  //fetch错误处理和返回数据json的封装
  async fetchWrapper(action, fetchOptions) {
    const response = await fetch(action, fetchOptions);
    if (!response.ok) {
      let message = "";
      const error = response;
      if (typeof response.json === "function") {
        try {
          const jsonError = await error.json();
          // Json error from API
          message =
            (jsonError.response &&
              jsonError.response.data &&
              jsonError.response.data.message) ||
            jsonError.message ||
            jsonError.toString();
          return Promise.reject(message);
        } catch (err) {
          // Generic error from API
          message = error.statusText;
          return Promise.reject(message);
        }
      } else {
        // Fetch error
        message = error;
        return Promise.reject(message);
      }
    }
    const json = await response.json();
    return json;
  }

  //当发送的文件大小大于this.chunkSize时发送分片
  async sendChunk(blobChunk, chunkCount, md5) {
    const formData = new FormData();
    formData.append("file", blobChunk);
    const extname = this.file.name.substring(
      this.file.name.lastIndexOf(".") + 1
    );

    const fetchOptions = {
      method: "POST",
      body: formData,
      headers: {
        "chunk-or-file": "chunk",
        "total-chunk-count": this.totalChunkCount + "",
        "chunk-count": chunkCount + "",
        "file-md5": md5,
        "file-type": this.file.type,
        "chunk-size": blobChunk.size + "",
        extname: extname,
      },
      signal: this.abortController.signal,
    };
    this.mergeDeep(fetchOptions, this.options);

    try {
      const data = await this.fetchWrapper(this.action, fetchOptions);
      return data;
    } catch (error) {
      return Promise.reject(error);
    }
  }

  //当发送的文件大小小于等于this.chunkSize时发送整个文件
  async sendFile(md5) {
    const formData = new FormData();
    formData.append("file", this.file);
    const fetchOptions = {
      method: "POST",
      body: formData,
      headers: {
        "chunk-or-file": "file",
        "file-md5": md5,
      },
    };
    this.mergeDeep(fetchOptions, this.options);

    try {
      const data = await this.fetchWrapper(this.action, fetchOptions);
      return data;
    } catch (error) {
      return Promise.reject(error);
    }
  }

  //暂停上传,如果有正在传输的包,发送完成后停止
  pause() {
    this.pauseSignal = true;
  }

  //中断上传
  abort() {
    this.abortController.abort();
  }

  //恢复上传
  resume() {
    this.pauseSignal = false;
    this.abortController = new AbortController();
    this.upload();
  }

  reUpload() {}

  wait(t) {
    return new Promise((resolve) => setTimeout(resolve, t));
  }

  //递归的发送分片
  recurseSendChunk(md5) {
    let chunkCount = this.getChunkCount(md5);

    if (this.progressCallback) {
      this.progressCallback({
        loaded: chunkCount * this.chunkSize,
        total: this.fileSize,
      });
    }

    const blobChunk = this.getChunk(chunkCount);
    if (!this.pauseSignal) {
      if (chunkCount >= 0 && chunkCount < this.totalChunkCount - 1) {
        this.sendChunk(blobChunk, chunkCount, md5)
          .then((data) => {
            //服务器已经存在的文件，直接返回上传完成的结果
            if (data?.alreadyUploaded) {
              if (this.progressCallback) {
                this.progressCallback({
                  loaded: this.fileSize,
                  total: this.fileSize,
                });
              }
              if (this.alreadyUploaded) {
                this.alreadyUploaded(data);
              }
            } else {
              localStorage.setItem(md5, ++chunkCount);
              if (this.progressCallback) {
                this.progressCallback({
                  loaded: chunkCount * this.chunkSize,
                  total: this.fileSize,
                });
              }
              this.recurseSendChunk(md5);
            }
          })
          .catch((error) => {
            if (!(error?.name === "AbortError") && this.uploadErrorCallback) {
              this.uploadErrorCallback(error);
            }
          });
      } else if (chunkCount === this.totalChunkCount - 1) {
        // 发送最后一个分片
        this.sendChunk(blobChunk, chunkCount, md5)
          .then((data) => {
            if (this.progressCallback) {
              this.progressCallback({
                loaded: this.fileSize,
                total: this.fileSize,
              });
            }
            localStorage.removeItem(md5);
            if (this.uploadFinishedCallback) {
              this.uploadFinishedCallback(data);
            }
          })
          .catch((error) => {
            if (this.uploadErrorCallback) {
              this.uploadErrorCallback(error);
            }
          });
      }
    }
  }

  sendFileOrUploadChunks(md5) {
    if (this.totalChunkCount === 1) {
      this.sendFile(md5)
        .then((data) => {
          if (this.progressCallback) {
            this.progressCallback({
              loaded: this.fileSize,
              total: this.fileSize,
            });
          }
          if (this.uploadFinishedCallback) {
            this.uploadFinishedCallback(data);
          }
        })
        .catch((error) => {
          if (this.uploadErrorCallback) {
            this.uploadErrorCallback(error);
          }
        });
    } else if (this.totalChunkCount > 1) {
      this.recurseSendChunk(md5);
    }
  }

  //上传函数,用来启动上传
  upload() {
    if (this.md5) {
      const md5 = this.md5;
      this.sendFileOrUploadChunks(md5);
    } else {
      this.computeMD5()
        .then((md5) => {
          this.sendFileOrUploadChunks(md5);
        })
        .catch((error) => {
          if (this.fileReaderErrorCallback) {
            this.fileReaderErrorCallback(error);
          }
        });
    }
  }
}

export default FileUploader;
