<template>
    <HCenterBox>
        <div class="mb-6 text-center text-h6">用户视频上传</div>
        <v-form v-model="form" @submit="onSubmit">
            <v-file-input v-model="file" label="视频文件" accept="video/mp4" :rules="[required, checkMediaTypeMp4]"
                @change="onChangeFile" show-size>
            </v-file-input>
            <template v-if="displayUploadProgress">
                <v-row class="mb-3">
                <v-col cols="auto" align-self="center">    
                <v-progress-linear v-model="percent" height="25" color="primary">
                    <strong class="text-grey-lighten-1">{{ Math.ceil(percent) }}%</strong>
                </v-progress-linear>
                </v-col>
                
                <v-col cols="1" align-self="center">
                <template v-if="displayPauseBtn">
                    <v-btn icon="mdi-pause" size="small" variant="text" @click="onClickPause"></v-btn>
                </template>
                <template v-else>
                    <v-btn icon="mdi-send" size="small" variant="text" @click="onClickContinue"></v-btn>
                </template>
            </v-col>
            </v-row>
            </template>
            <template v-if="displayMD5Progress">
                <p class="text-grey-lighten-1 mb-6">计算文件md5中...</p>
            </template>
            <v-text-field class="my-2" v-model="title" :readonly="formLoading" :rules="[required, lengthLimit50]" clearable
                label="视频标题" variant="outlined" color="primary">
            </v-text-field>
            <v-select label="视频分类" variant="solo" v-model="kind" :readonly="formLoading" :rules="[required]" color="primary"
                :items="items" item-title="title" item-value="value">
            </v-select>
            <v-textarea counter class="my-2" label="视频介绍(最多500字)" clearable v-model="description" :readonly="formLoading"
                rows="3" validate-on="submit" variant="outlined" color="primary" auto-grow>
            </v-textarea>
            <v-btn :loading="formLoading" block type="submit">
                上传视频
            </v-btn>
        </v-form>
    </HCenterBox>
</template>

<script setup>
import { ref, onBeforeUnmount } from 'vue';
import FileUploader from "../utils/fileUploader";
import { postVideo } from "../utils/videoService";
import { useSnackbar } from "../hooks/useSnackbar";
import HCenterBox from './HCenterBox.vue';

const { snackbar } = useSnackbar();
const form = ref(false);
const formLoading = ref(false);
const title = ref('');
const description = ref('');
const kind = ref('');
const file = ref(null);
const percent = ref(0);
const displayUploadProgress = ref(false);
const displayMD5Progress = ref(false);
let displayPauseBtn = ref(true);

let fileUploader = null;

const items = [
    {
        title: '音乐',
        value: 'music'
    },
    {
        title: '教育',
        value: 'education'
    },
    {
        title: '影视',
        value: 'movie'
    },
    {
        title: '体育',
        value: 'sport'
    },
    {
        title: '科技',
        value: 'technology'
    },
    {
        title: '其他',
        value: 'others'
    },
]

onBeforeUnmount(() => {
    if (fileUploader) {
        fileUploader.pause();
    }
})

function onClickPause() {
    if(fileUploader) {
        fileUploader.abort();
        snackbar.info('暂停上传',1500);
    }
    displayPauseBtn.value = !displayPauseBtn.value;
}

function onClickContinue() {
    if(fileUploader) {
        fileUploader.resume();
        snackbar.info('继续上传',1500);
    }
    displayPauseBtn.value = !displayPauseBtn.value;
}

function required(v) {
    return !!v || '此项不可为空'
}

function checkMediaTypeMp4(v) {
    if (v.length) {
        const type = v[0].type;
        return type === 'video/mp4' || '视频文件必须为mp4格式';
    } else {
        return true;
    }
}

function lengthLimit50(v) {
    return v.length <= 50 || '最多50个字';
}

function onSubmit(e) {
    e.preventDefault();
    // console.log("onSubmit: ", form.value)
    if (description.value.length > 50) {
        snackbar.warning("视频介绍最多500字", 3000);
    }
    else if (form.value) {
        const token = JSON.parse(localStorage.getItem('pdvUser'))?.token;
        if (file.value[0]) {
            //提交
            formLoading.value = true;
            fileUploader = new FileUploader(file.value[0],
                "/api/videos/upload",
                { headers: { Authorization: `Bearer ${token}`, } });
            fileUploader.onUploadError((error) => {
                console.error("onUploadError: ", error);
                formLoading.value = false;
                snackbar.error("上传错误： " + error, 5000);
            });
            fileUploader.onFileReaderError((error) => {
                console.error("onFileReaderError: ", error);
                formLoading.value = false;
                snackbar.error("文件读取错误： " + error, 5000);
            });
            fileUploader.onProgress((progress) => {
                //console.log("progress: ", progress.loaded, progress.total);
                percent.value = progress.loaded / progress.total * 100;
                if (displayMD5Progress.value) {
                    displayMD5Progress.value = false;
                }
                if (!displayUploadProgress.value) {
                    displayUploadProgress.value = true;
                }
            });
            fileUploader.onUploadFinished((data) => {
                const videoData = {
                    filename: data.filename,
                    title: title.value,
                    kind: kind.value,
                    md5: data.fileMD5
                };
                if (description.value) {
                    videoData.description = description.value;
                }
                postVideo(token, videoData).then(() => {
                    formLoading.value = false;
                    snackbar.success("上传视频成功");
                }).catch((error) => {
                    formLoading.value = false;
                    snackbar.error("创建视频错误: " + error, 5000);
                })
            });
            fileUploader.onAlreadyUploaded((data) => {
                const videoData = {
                    filename: data.alreadyUploaded,
                    title: title.value,
                    kind: kind.value,
                    md5: data.fileMD5
                };
                if (description.value) {
                    videoData.description = description.value;
                }
                postVideo(token, videoData).then(() => {
                    formLoading.value = false;
                    snackbar.success("上传视频成功");

                }).catch((error) => {
                    formLoading.value = false;
                    snackbar.error("创建视频错误: " + error);
                })
            });
            // fileUploader.onMD5Finished((md5)=>{
            //     console.log("计算md5完成: ",md5);
            // });
            // fileUploader.onMD5Progress(({loaded, total})=>{
            //     console.log(`计算md5进度: ${loaded} / ${total}`);
            // })
            displayUploadProgress.value = false;
            displayMD5Progress.value = true;
            fileUploader.upload();
        }
    }
}

function onChangeFile(e) {
    if (e.target.files.length) {
        const filename = e.target.files[0].name;
        title.value = filename.substring(0, filename.lastIndexOf('.'));
    }
}

</script>