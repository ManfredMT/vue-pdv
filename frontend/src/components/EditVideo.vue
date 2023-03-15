<template>
    <HCenterBox>
        <div class="mb-6 text-center text-h6">修改视频信息</div>
        <template v-if="videoInfoLoading">
        </template>
        <template v-if="videoInfo">
            <v-form @submit="onSubmit">
                <div class="px-10 pb-5">
                    <v-img :aspect-ratio="16 / 9" cover :src="videoInfo.thumbnail"></v-img>
                </div>
                <v-text-field class="my-2" v-model="title" :readonly="formLoading" :rules="[required, lengthLimit50]"
                    clearable label="视频标题" variant="outlined" color="primary">
                </v-text-field>
                <v-select label="视频分类" variant="solo" v-model="kind" :readonly="formLoading" :rules="[required]"
                    color="primary" :items="items" item-title="title" item-value="value">
                </v-select>
                <v-textarea class="my-2" label="视频介绍" clearable v-model="description" :readonly="formLoading" rows="3"
                    :rules="[lengthLimit500]" variant="outlined" color="primary" auto-grow>
                </v-textarea>
                <v-btn :loading="formLoading" block type="submit">
                    确认修改
                </v-btn>
            </v-form>
        </template>
    </HCenterBox>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { getVideoInformation, updateVideo } from "../utils/videoService";
import { useRoute } from "vue-router";
import { useSnackbar } from "../hooks/useSnackbar";
import HCenterBox from "./HCenterBox.vue";

const { snackbar } = useSnackbar();

const route = useRoute();

const videoInfoLoading = ref(false);
const videoInfo = ref(null);
const title = ref('');
const kind = ref('');
const formLoading = ref(false);
const description = ref('');


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

function required(v) {
    return !!v || '此项不可为空'
}

function lengthLimit50(v) {
    return v.length <= 50 || '最多50个字';
}

function lengthLimit500(v) {
    return v.length <= 500 || '最多500个字';
}


onMounted(() => {
    const videoId = route.params.videoId;
    videoInfoLoading.value = true;
    getVideoInformation(videoId).then((data) => {
        videoInfoLoading.value = false;
        videoInfo.value = data;
        title.value = data.title;
        kind.value = data.kind;
        description.value = data.description;
    }).catch((error) => {
        snackbar.error("获取视频信息错误: " + error, 3000);
    });
})

function onSubmit(e) {
    e.preventDefault();
    let updatedInfo = {};
    if (title.value !== videoInfo.value.title) {
        updatedInfo.title = title.value;
    }
    if (kind.value !== videoInfo.value.kind) {
        updatedInfo.kind = kind.value;
    }
    if (description.value !== videoInfo.value.description) {
        updatedInfo.description = description.value;
    }
    const videoId = route.params.videoId;
    const userToken = JSON.parse(localStorage.getItem('pdvUser'))?.token;
    updateVideo(videoId, userToken, updatedInfo).then(() => {
        snackbar.success("成功修改视频信息", 1500);
    }).catch((error) => {
        snackbar.error("修改视频信息错误: " + error);
    });
}

</script>