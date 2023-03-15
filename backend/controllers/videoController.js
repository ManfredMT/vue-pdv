const asyncHandler = require("express-async-handler");
const Video = require("../models/videoModel");
const fs = require("fs");
const ffmpeg = require("fluent-ffmpeg");
const Behavior = require("../models/behaviorModel");
const Comment = require("../models/commentModel");
const File = require("../models/fileModel");

// @desc   video streaming
// @route  GET /api/videos/stream/:videoId
// @access Public
const streamVideo = asyncHandler(async (req, res) => {
  const range = req.headers.range;
  const videoId = req.params.videoId;
  if (!range) {
    res.status(416).send("Range not provided");
  }
  const videoPath = __dirname + `/../uploads/videos/${videoId}.mp4`;

  const videoSize = fs.statSync(videoPath).size;
  const chunkSize = 10 * 1024 * 1024; // 10 mb
  const start = Number(range.replace(/\D/g, ""));
  const end = Math.min(start + chunkSize, videoSize - 1);
  const contentLength = end - start + 1;
  const headers = {
    "Content-Range": `bytes ${start}-${end}/${videoSize}`,
    "Accept-Ranges": "bytes",
    "Content-Length": contentLength,
    "Content-Type": "video/mp4",
  };
  res.writeHead(206, headers);
  const videoStream = fs.createReadStream(videoPath, { start, end });
  videoStream.pipe(res);
});

const multer = require("multer");
const path = require("path");
const md5File = require("md5-file");
const { v4: uuidv4 } = require("uuid");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const chunkOrFile = req.headers["chunk-or-file"];
    const fileMD5 = req.headers["file-md5"];
    if (chunkOrFile === "chunk") {
      cb(null, "./uploads/chunks/" + fileMD5);
    } else if (chunkOrFile === "file") {
      console.log("small mp4 file dir");
      cb(null, "./uploads/videos");
    }
  },
  filename: function (req, file, cb) {
    const chunkOrFile = req.headers["chunk-or-file"];
    const fileMD5 = req.headers["file-md5"];

    if (chunkOrFile === "chunk") {
      const chunkCount = parseInt(req.headers["chunk-count"], 10);
      const totalChunkCount = parseInt(req.headers["total-chunk-count"], 10);
      const chunkSize = parseInt(req.headers["chunk-size"], 10);
      const filename =
        fileMD5 + "_" + chunkCount + "_" + totalChunkCount + "_" + chunkSize;
      cb(null, filename);
      req.on("aborted", () => {
        const fullFilePath = "./uploads/chunks/" + fileMD5 + "/" + filename;
        file.stream.on("end", () => {
          fs.unlink(fullFilePath, (err) => {
            console.log(fullFilePath);
            if (err) {
              throw err;
            }
          });
        });
        file.stream.emit("end");
      });
    } else if (chunkOrFile === "file") {
      // console.log("small mp4 file filename");
      cb(null, uuidv4() + path.extname(file.originalname));
    }
  },
});
function fileFilter(req, file, cb) {
  const chunkOrFile = req.headers["chunk-or-file"];
  const fileMD5 = req.headers["file-md5"];

  if (chunkOrFile === "chunk") {
    // 如果已经上传过相同文件,不放入硬盘(秒传)
    File.findOne({ md5: fileMD5 }).then((doc) => {
      if (doc) {
        cb(null, false);
      } else {
        const chunkCount = parseInt(req.headers["chunk-count"], 10);
        const totalChunkCount = parseInt(req.headers["total-chunk-count"], 10);
        const chunkSize = parseInt(req.headers["chunk-size"], 10);
        const dir = "./uploads/chunks/" + fileMD5;
        if (fs.existsSync(dir)) {
          const filenameStart = fileMD5 + "_" + chunkCount;
          const files = fs
            .readdirSync(dir)
            .filter((fn) => fn.startsWith(filenameStart));
          if (files.length === 1) {
            // 当前分片文件存在1个
            const filename = files[0];
            // 读取当前分片
            const stats = fs.statSync(dir + "/" + filename);
            const sizeFromRecord = parseInt(
              filename.substring(filename.lastIndexOf("_") + 1),
              10
            );
            if (sizeFromRecord !== stats.size) {
              // 检查当前分片大小,如果大小不对删除
              fs.rmSync(dir + "/" + filename);
              cb(null, true);
            } else {
              cb(null, false);
            }
          } else if (files.length === 0) {
            // 当前分片文件不存在
            if (chunkCount === 0) {
              cb(null, true);
            } else if (chunkCount > 0 && chunkCount < totalChunkCount - 1) {
              const lastChunkCount = chunkCount - 1;
              const filenameStart = fileMD5 + "_" + lastChunkCount;
              const preFiles = fs
                .readdirSync(dir)
                .filter((fn) => fn.startsWith(filenameStart));
              if (preFiles.length === 1) {
                // 前一个分片的文件存在1个
                const preFilename = preFiles[0];
                const preSizeFromStats = fs.statSync(
                  dir + "/" + preFilename
                ).size;
                if (preSizeFromStats === chunkSize) {
                  cb(null, true);
                } else {
                  cb(new Error("分片大小错误"));
                }
              } else {
                //前一个分片的文件不存在或存在多个,删除整个分片文件夹
                fs.rmSync(dir, { recursive: true });
                cb(new Error("分片文件错乱,请重新上传"));
              }
            } else if (chunkCount === totalChunkCount - 1) {
              cb(null, true);
            }
          } else if (files.length > 1) {
            // 当前分片文件存在多个,将这些文件全部删除
            files.forEach((fn) => {
              fs.rmSync(dir + "/" + fn);
            });
            cb(null, true);
          }
        } else {
          if (chunkCount === 0) {
            fs.mkdirSync(dir, { recursive: true });
            cb(null, true);
          } else {
            cb(new Error("分片顺序错误"));
          }
        }
      }
    });
  } else if (chunkOrFile === "file") {
    if (file.mimetype !== "video/mp4") {
      cb(new Error("Video type error"));
    } else {
      File.findOne({ md5: fileMD5 }).then((doc) => {
        cb(null, !doc);
      });
    }
  }
}
const upload = multer({
  storage: storage,
  fileFilter,
  limits: { fileSize: 100 * 1024 * 1024 },
}).single("file");

// @desc   upload video file
// @route  POST /api/videos/upload
// @access Private
const uploadFile = asyncHandler(async (req, res) => {
  // 根据http头判断是分片还是文件类型以及整个文件的md5
  const chunkOrFile = req.headers["chunk-or-file"];
  const md5 = req.headers["file-md5"];
  upload(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      // A Multer error occurred when uploading.
      console.log("multer错误: ", err, typeof err);
      return res.status(400).json({ message: err.message });
    } else if (err) {
      // An unknown error occurred when uploading.
      console.log("未知错误: ", err, typeof err);
      return res.status(400).json({ message: err.message });
    }

    // Everything went fine.

    if (chunkOrFile === "chunk") {
      const chunkCount = parseInt(req.headers["chunk-count"], 10);
      const totalChunkCount = parseInt(req.headers["total-chunk-count"], 10);
      // 如果已经上传过相同文件,直接返回已经上传过的文件(秒传)
      File.findOne({ md5 }).then((doc) => {
        if (doc) {
          if (chunkCount < totalChunkCount - 1) {
            return res.status(200).json({
              alreadyUploaded: doc.filename,
              fileMD5: md5,
            });
          } else if (chunkCount === totalChunkCount - 1) {
            console.log("last chunk already uploaded");
            return res
              .status(200)
              .json({ filename: doc.filename, fileMD5: md5 });
          }
        } else {
          if (chunkCount < totalChunkCount - 1) {
            return res.status(200).json({ fileMD5: md5, chunkCount });
          } else if (chunkCount === totalChunkCount - 1) {
            //最后一个分片,合并所有分片,验证md5
            const dir = "./uploads/chunks/" + md5;
            const chunkFilenames = fs.readdirSync(dir);
            chunkFilenames.sort((a, b) => {
              const startA = a.indexOf("_") + 1;
              const endA = a.indexOf("_", startA);
              const chunkCountA = parseInt(a.substring(startA, endA), 10);
              const startB = b.indexOf("_") + 1;
              const endB = b.indexOf("_", startB);
              const chunkCountB = parseInt(b.substring(startB, endB), 10);
              return chunkCountA - chunkCountB;
            });
            //console.log("chunkFilenames: ",chunkFilenames);
            const extname = req.headers["extname"];
            const videoFilename = uuidv4() + "." + extname;

            //console.log("process.memoryUsage(): ", process.memoryUsage());
            if (!fs.existsSync("./uploads/videos")) {
              fs.mkdirSync("./uploads/videos", { recursive: true });
            }
            chunkFilenames.forEach((fn) => {
              const chunkBuffer = fs.readFileSync(dir + "/" + fn);
              fs.appendFileSync(
                "./uploads/videos/" + videoFilename,
                chunkBuffer
              );
            });
            //console.log("after process.memoryUsage(): ", process.memoryUsage());

            //计算验证md5是否正确
            const hash = md5File.sync("./uploads/videos/" + videoFilename);
            if (hash === md5) {
              File.create({ filename: videoFilename, md5 });
              fs.rmSync(dir, { recursive: true });
              return res
                .status(200)
                .json({ filename: videoFilename, fileMD5: md5 });
            } else {
              fs.rmSync("./uploads/videos/" + videoFilename);
              return res.status(400).json({ message: "文件数据错误" });
            }
          }
        }
      });
    } else if (chunkOrFile === "file") {
      File.findOne({ md5 }).then((doc) => {
        if (!doc) {
          const filename = req.file.filename;
          File.create({ filename, md5 });
          return res.status(200).json({ filename, fileMD5: md5 });
        } else {
          const filename = doc.filename;
          return res.status(200).json({ filename, fileMD5: md5 });
        }
      });
    }
  });
});

// @desc   post a new video
// @route  POST /api/videos/
// @access Private
const postVideo = asyncHandler(async (req, res) => {
  if (!req.body.kind) {
    res.status(400);
    throw new Error("请设置视频的分类");
  }
  if (!req.body.title) {
    res.status(400);
    throw new Error("请设置视频的标题");
  }
  if (!req.body.filename) {
    res.status(400);
    throw new Error("未设置视频文件");
  } else {
    const filename = req.body.filename;
    const extname = filename.substring(filename.lastIndexOf(".") + 1);
    if (extname.toLowerCase() !== "mp4" && extname.toLowerCase() !== "m4v") {
      res.status(400);
      throw new Error("File type error");
    }
  }

  if (!req.body.md5) {
    res.status(400);
    throw new Error("未提供视频文件md5");
  } else {
    const fileDoc = await File.findOne({ md5: req.body.md5 });
    if (fileDoc) {
      const filename = fileDoc.filename;
      const videoId = filename.substring(0, filename.lastIndexOf("."));
      const videoDoc = await Video.findOne({ videoId });
      if (videoDoc) {
        res.status(400);
        throw new Error("视频已存在");
      }
    }
  }

  const videoFilename = req.body.filename;
  const videoId = videoFilename.substring(0, videoFilename.lastIndexOf("."));
  const videoSrc = "/api/videos/stream/" + videoId;

  let videoObj = {
    videoId,
    videoSrc,
    kind: req.body.kind,
    title: req.body.title,
    channelId: req.user.id,
    channelTitle: req.user.name,
  };
  if (req.body.description) {
    videoObj.description = req.body.description;
  }

  function ffmpegSync() {
    return new Promise((resolve, reject) => {
      ffmpeg(__dirname + "/../uploads/videos/" + videoFilename)
        .on("error", function (err) {
          console.log("Cannot process video: " + err.message);
          return reject(new Error(err));
        })
        .on("filenames", function (filenames) {
          console.log("Will generate " + filenames.join(", "));
        })
        .on("end", function () {
          console.log("Screenshots taken");
          resolve();
        })
        .takeScreenshots({
          count: 1,
          timemarks: ["10%"], // 10% of the video length
          folder: __dirname + "/../uploads/image",
          filename: "thumbnail-%b.png",
          size: "400x225",
        });
    });
  }

  try {
    await ffmpegSync();
  } catch (error) {
    res.status(400);
    throw new Error(error);
  }

  const thumbnailFilename = `thumbnail-${videoId}.png`;
  videoObj.thumbnail = "/api/image/" + thumbnailFilename;

  try {
    const video = await Video.create(videoObj);
    res.status(200).json(video);
  } catch (error) {
    res.status(400);
    throw new Error(error);
  }
});

// @desc   like a video
// @route  POST /api/videos/like/:videoId
// @access Private
const likeVideo = asyncHandler(async (req, res) => {
  const videoId = req.params.videoId;
  const video = await Video.findOne({ videoId });
  if (!video) {
    res.status(400);
    throw new Error("视频id错误");
  }
  const likeBehavior = await Behavior.find({
    user: req.user.id,
    kind: "like",
    videoList: videoId,
  });
  if (!likeBehavior.length) {
    try {
      await Behavior.findOneAndUpdate(
        { user: req.user.id, kind: "like" },
        {
          $push: {
            videoList: videoId,
          },
        }
      );
      const updatedVideoDoc = await Video.findOneAndUpdate(
        { videoId },
        {
          $inc: { likes: 1 },
        },
        { new: true }
      );
      await updateVideoScore(videoId, updatedVideoDoc);
    } catch (error) {
      res.status(400);
      throw new Error(error);
    }
  }

  const dislikeBehavior = await Behavior.find({
    user: req.user.id,
    kind: "dislike",
    videoList: videoId,
  });
  if (dislikeBehavior.length) {
    try {
      await Behavior.findOneAndUpdate(
        { user: req.user.id, kind: "dislike" },
        {
          $pull: {
            videoList: videoId,
          },
        }
      );
      const updatedVideoDoc = await Video.findOneAndUpdate(
        { videoId },
        {
          $inc: { dislikes: -1 },
        },
        { new: true }
      );
      await updateVideoScore(videoId, updatedVideoDoc);
    } catch (error) {
      res.status(400);
      throw new Error(error);
    }
  }
  res.status(200).json({ videoId, action: "like" });
});

// @desc   cancel the like
// @route  POST /api/videos/cancel-like/:videoId
// @access Private
const cancelLike = asyncHandler(async (req, res) => {
  const videoId = req.params.videoId;
  const video = await Video.findOne({ videoId });
  if (!video) {
    res.status(400);
    throw new Error("视频id错误");
  }
  const likeBehavior = await Behavior.find({
    user: req.user.id,
    kind: "like",
    videoList: videoId,
  });

  if (likeBehavior.length) {
    try {
      await Behavior.findOneAndUpdate(
        { user: req.user.id, kind: "like" },
        {
          $pull: {
            videoList: videoId,
          },
        }
      );
      const updatedVideoDoc = await Video.findOneAndUpdate(
        { videoId },
        {
          $inc: { likes: -1 },
        },
        { new: true }
      );
      await updateVideoScore(videoId, updatedVideoDoc);
    } catch (error) {
      res.status(400);
      throw new Error(error);
    }
  }

  res.status(200).json({ videoId, action: "cancel-like" });
});

// @desc   dislike a video
// @route  POST /api/videos/dislike/:videoId
// @access Private
const dislikeVideo = asyncHandler(async (req, res) => {
  const videoId = req.params.videoId;
  const video = await Video.findOne({ videoId });
  if (!video) {
    res.status(400);
    throw new Error("视频id错误");
  }

  const dislikeBehavior = await Behavior.find({
    user: req.user.id,
    kind: "dislike",
    videoList: videoId,
  });
  if (!dislikeBehavior.length) {
    try {
      await Behavior.findOneAndUpdate(
        { user: req.user.id, kind: "dislike" },
        {
          $push: {
            videoList: videoId,
          },
        }
      );
      const updatedVideoDoc = await Video.findOneAndUpdate(
        { videoId },
        {
          $inc: { dislikes: 1 },
        },
        { new: true }
      );
      await updateVideoScore(videoId, updatedVideoDoc);
    } catch (error) {
      res.status(400);
      throw new Error(error);
    }
  }

  const likeBehavior = await Behavior.find({
    user: req.user.id,
    kind: "like",
    videoList: videoId,
  });

  if (likeBehavior.length) {
    try {
      await Behavior.findOneAndUpdate(
        { user: req.user.id, kind: "like" },
        {
          $pull: {
            videoList: videoId,
          },
        }
      );
      const updatedVideoDoc = await Video.findOneAndUpdate(
        { videoId },
        {
          $inc: { likes: -1 },
        },
        { new: true }
      );
      await updateVideoScore(videoId, updatedVideoDoc);
    } catch (error) {
      res.status(400);
      throw new Error(error);
    }
  }
  res.status(200).json({ videoId, action: "dislike" });
});

// @desc   cancel dislike
// @route  POST /api/videos/cancel-dislike/:videoId
// @access Private
const cancelDislike = asyncHandler(async (req, res) => {
  const videoId = req.params.videoId;
  const video = await Video.findOne({ videoId });
  if (!video) {
    res.status(400);
    throw new Error("视频id错误");
  }

  const dislikeBehavior = await Behavior.find({
    user: req.user.id,
    kind: "dislike",
    videoList: videoId,
  });
  if (dislikeBehavior.length) {
    try {
      await Behavior.findOneAndUpdate(
        { user: req.user.id, kind: "dislike" },
        {
          $pull: {
            videoList: videoId,
          },
        }
      );
      const updatedVideoDoc = await Video.findOneAndUpdate(
        { videoId },
        {
          $inc: { dislikes: -1 },
        },
        { new: true }
      );
      await updateVideoScore(videoId, updatedVideoDoc);
    } catch (error) {
      res.status(400);
      throw new Error(error);
    }
  }

  res.status(200).json({ videoId, action: "cancel-dislike" });
});

// @desc   put a video to favorites
// @route  POST /api/videos/favorites/:videoId
// @access Private
const bookmarkVideo = asyncHandler(async (req, res) => {
  const videoId = req.params.videoId;
  const video = await Video.findOne({ videoId });
  if (!video) {
    res.status(400);
    throw new Error("视频id错误");
  }

  const favBehavior = await Behavior.find({
    user: req.user.id,
    kind: "favorites-default",
    videoList: videoId,
  });
  if (!favBehavior.length) {
    try {
      await Behavior.findOneAndUpdate(
        { user: req.user.id, kind: "favorites-default" },
        {
          $push: {
            videoList: videoId,
          },
        }
      );
      const updatedVideoDoc = await Video.findOneAndUpdate(
        { videoId },
        {
          $inc: { favNum: 1 },
        },
        { new: true }
      );
      await updateVideoScore(videoId, updatedVideoDoc);
    } catch (error) {
      res.status(400);
      throw new Error(error);
    }
  }

  res.status(200).json({ videoId, action: "bookmark" });
});

// @desc   remove a video from favorites
// @route  POST /api/videos/remove-favorites/:videoId
// @access Private
const cancelBookmark = asyncHandler(async (req, res) => {
  const videoId = req.params.videoId;
  const video = await Video.findOne({ videoId });
  if (!video) {
    res.status(400);
    throw new Error("视频id错误");
  }

  const favBehavior = await Behavior.find({
    user: req.user.id,
    kind: "favorites-default",
    videoList: videoId,
  });
  if (favBehavior.length) {
    try {
      await Behavior.findOneAndUpdate(
        { user: req.user.id, kind: "favorites-default" },
        {
          $pull: {
            videoList: videoId,
          },
        }
      );
      const updatedVideoDoc = await Video.findOneAndUpdate(
        { videoId },
        {
          $inc: { favNum: -1 },
        },
        { new: true }
      );
      await updateVideoScore(videoId, updatedVideoDoc);
    } catch (error) {
      res.status(400);
      throw new Error(error);
    }
  }
  res.status(200).json({ videoId, action: "cancel-bookmark" });
});

// @desc   record user watch history
// @route  POST /api/videos/record/:videoId
// @access Private
const watchVideo = asyncHandler(async (req, res) => {
  const videoId = req.params.videoId;
  const video = await Video.findOne({ videoId });
  if (!video) {
    res.status(400);
    throw new Error("视频id错误");
  }
  const updatedVideoDoc = await Video.findOneAndUpdate(
    { videoId },
    {
      $inc: { views: 1 },
    },
    { new: true }
  );
  await updateVideoScore(videoId, updatedVideoDoc);

  const historyBehavior = await Behavior.find({
    user: req.user.id,
    kind: "history",
    videoList: videoId,
  });
  if (historyBehavior.length) {
    try {
      await Behavior.findOneAndUpdate(
        { user: req.user.id, kind: "history" },
        {
          $pull: {
            videoList: videoId,
          },
        }
      );
      await Behavior.findOneAndUpdate(
        { user: req.user.id, kind: "history" },
        {
          $push: {
            videoList: videoId,
          },
        }
      );
    } catch (error) {
      res.status(400);
      throw new Error(error);
    }
  } else {
    try {
      await Behavior.findOneAndUpdate(
        { user: req.user.id, kind: "history" },
        {
          $push: {
            videoList: videoId,
          },
        }
      );
    } catch (error) {
      res.status(400);
      throw new Error(error);
    }
  }
  res.status(200).json({ videoId, action: "record" });
});

// @desc   get user feedback on video
// @route  GET /api/videos/feedback/:videoId
// @access Private
const getFeedbackOfVideo = asyncHandler(async (req, res) => {
  const videoId = req.params.videoId;
  const video = await Video.findOne({ videoId });
  if (!video) {
    res.status(400);
    throw new Error("视频id错误");
  }
  try {
    const favDoc = await Behavior.find({
      user: req.user.id,
      kind: "favorites-default",
      videoList: videoId,
    });
    const likeDoc = await Behavior.find({
      user: req.user.id,
      kind: "like",
      videoList: videoId,
    });
    const dislikeDoc = await Behavior.find({
      user: req.user.id,
      kind: "dislike",
      videoList: videoId,
    });
    if (likeDoc.length && dislikeDoc.length) {
      res
        .status(200)
        .json({ videoId, like: 0, dislike: 0, favorites: favDoc.length });
    } else {
      res.status(200).json({
        videoId,
        like: likeDoc.length,
        dislike: dislikeDoc.length,
        favorites: favDoc.length,
      });
    }
  } catch (error) {
    res.status(400);
    throw new Error(error);
  }
});

// @desc   get video information by videoId
// @route  GET /api/videos/info/:videoId
// @access Public
const getVideoInfo = asyncHandler(async (req, res) => {
  const videoId = req.params.videoId;
  const video = await Video.findOne({ videoId }).select("-score");
  if (!video) {
    res.status(400);
    throw new Error("视频id错误");
  } else {
    res.status(200).json(video);
  }
});

// @desc   get videos that get likes from users (last 100)
// @route  GET /api/videos/liked
// @access Private
const getLikedVideos = asyncHandler(async (req, res) => {
  const likeDoc = await Behavior.find(
    {
      user: req.user.id,
      kind: "like",
    },
    { videoList: { $slice: -100 } }
  );
  const videoIds = likeDoc[0].videoList.reverse();
  const query = [
    { $match: { videoId: { $in: videoIds } } },
    { $addFields: { __order: { $indexOfArray: [videoIds, "$videoId"] } } },
    { $sort: { __order: 1 } },
    { $unset: "score" },
  ];
  const videoDocs = await Video.aggregate(query);

  res.status(200).json(videoDocs);
});

// @desc   get videos from users' favorites
// @route  GET /api/videos/favorites
// @access Private
const getFavorites = asyncHandler(async (req, res) => {
  const favDoc = await Behavior.find(
    {
      user: req.user.id,
      kind: "favorites-default",
    },
    { videoList: { $slice: -100 } }
  );
  const videoIds = favDoc[0].videoList.reverse();
  const query = [
    { $match: { videoId: { $in: videoIds } } },
    { $addFields: { __order: { $indexOfArray: [videoIds, "$videoId"] } } },
    { $sort: { __order: 1 } },
    { $unset: "score" },
  ];
  const videoDocs = await Video.aggregate(query);

  res.status(200).json(videoDocs);
});

// @desc   get user watch history
// @route  GET /api/videos/history
// @access Private
const getWatchHistory = asyncHandler(async (req, res) => {
  const hisDoc = await Behavior.find(
    {
      user: req.user.id,
      kind: "history",
    },
    { videoList: { $slice: -100 } }
  );
  const videoIds = hisDoc[0].videoList.reverse();
  const query = [
    { $match: { videoId: { $in: videoIds } } },
    { $addFields: { __order: { $indexOfArray: [videoIds, "$videoId"] } } },
    { $sort: { __order: 1 } },
    { $unset: "score" },
  ];
  const videoDocs = await Video.aggregate(query);

  res.status(200).json(videoDocs);
});

// @desc   get video feeds
// @route  POST /api/videos/feeds
// @access Public
const getFeeds = asyncHandler(async (req, res) => {
  if (req.body.kind) {
    const videoResult = await Video.find({ kind: req.body.kind })
      .sort({ score: -1, _id: -1 })
      .limit(30)
      .select("-score");
    res.status(200).json(videoResult);
  } else {
    const videoResult = await Video.find()
      .sort({ score: -1, _id: -1 })
      .limit(30)
      .select("-score");
    res.status(200).json(videoResult);
  }
});

// @desc   get recommend videos
// @route  POST /api/videos/recommend/:videoId
// @access Public
const getRecommends = asyncHandler(async (req, res) => {
  const videoId = req.params.videoId;
  const video = await Video.findOne({ videoId });
  if (!video) {
    res.status(400);
    throw new Error("视频id错误");
  }
  const videoResult = await Video.find({
    kind: video.kind,
    videoId: { $ne: videoId },
  })
    .sort({ score: -1, _id: -1 })
    .limit(10)
    .select("-score");
  res.status(200).json(videoResult);
});

// @desc   get video search result
// @route  POST /api/videos/search
// @access Public
const getSearchResult = asyncHandler(async (req, res) => {
  if (!req.body.q) {
    res.status(400);
    throw new Error("请设置搜索内容");
  }
  const videoResult = await Video.find({
    title: { $regex: req.body.q, $options: "i" },
  })
    .sort({ score: -1, _id: -1 })
    .limit(30)
    .select("-score");
  res.status(200).json(videoResult);
});

// @desc   get user-uploaded videos
// @route  POST /api/videos/user-uploaded
// @access Private
const getUserUploadedVideos = asyncHandler(async (req, res) => {
  if (!req.user) {
    res.status(401);
    throw new Error("User not founded");
  }
  const videoResult = await Video.find({
    channelId: req.user.id,
  }).select("-score");
  res.status(200).json(videoResult);
});

// @desc   update video data
// @route  PUT /api/videos/update/:videoId
// @access Private
const updateVideo = asyncHandler(async (req, res) => {
  const videoId = req.params.videoId;
  const video = await Video.findOne({ videoId });
  if (!video) {
    res.status(400);
    throw new Error("视频id错误");
  }
  if (!req.user) {
    res.status(401);
    throw new Error("User not founded");
  }
  if (video.channelId.toString() !== req.user.id) {
    res.status(401);
    throw new Error("User not authorized");
  }
  let newVideoObj = {};
  if (req.body.kind) {
    newVideoObj.kind = req.body.kind;
  }
  if (req.body.title) {
    newVideoObj.title = req.body.title;
  }
  if (req.body.description) {
    newVideoObj.description = req.body.description;
  }
  try {
    await Video.findOneAndUpdate({ videoId }, newVideoObj);
    res.status(200).json({ videoId, action: "update" });
  } catch (error) {
    res.status(400);
    throw new Error(error);
  }
});

// @desc   delete a video
// @route  DELETE /api/videos/:videoId
// @access Private
const deleteVideo = asyncHandler(async (req, res) => {
  const videoId = req.params.videoId;
  const video = await Video.findOne({ videoId });
  if (!video) {
    res.status(400);
    throw new Error("视频id错误");
  }
  if (!req.user) {
    res.status(401);
    throw new Error("User not founded");
  }
  if (video.channelId.toString() !== req.user.id) {
    res.status(401);
    throw new Error("User not authorized");
  }
  try {
    await video.remove();
    await Behavior.updateMany(
      {
        user: req.user.id,
        videoList: videoId,
      },
      {
        $pull: { videoList: videoId },
      }
    );
    await Comment.deleteMany({ videoId });
    res.status(200).json({ videoId, action: "delete" });
  } catch (error) {
    res.status(400);
    throw new Error(error);
  }
});

async function updateVideoScore(videoId, updatedVideoDoc) {
  await Video.findOneAndUpdate(
    { videoId },
    {
      score:
        updatedVideoDoc.views * 0.0015 +
        updatedVideoDoc.likes * 0.6 +
        updatedVideoDoc.dislikes * -0.35 +
        updatedVideoDoc.favNum * 0.3 +
        updatedVideoDoc.commentNum * 0.01,
    }
  );
}

module.exports = {
  streamVideo,
  uploadFile,
  postVideo,
  likeVideo,
  cancelLike,
  dislikeVideo,
  cancelDislike,
  bookmarkVideo,
  cancelBookmark,
  watchVideo,
  getFeedbackOfVideo,
  getLikedVideos,
  getFavorites,
  getWatchHistory,
  getFeeds,
  getSearchResult,
  updateVideo,
  deleteVideo,
  getVideoInfo,
  getRecommends,
  getUserUploadedVideos,
};
