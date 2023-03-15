<template>
    <div class="ma-2 text-h6">上传的视频:</div>
    <template v-if="uploadedVideosLoading">
        <v-progress-circular indeterminate color="primary"></v-progress-circular>
    </template>
    <template v-if="uploadedVideos">
        <p class="ml-2 my-3 text-grey-darken-3 font-weight-light text-body-2">
            共{{ uploadedVideos.length }}个视频
        </p>
        <v-row class="pa-1" no-gutters>
            <v-col class="pa-1" cols="6" sm="4" md="2" v-for="videoItem in uploadedVideos" :key="videoItem.videoId">
                <VideoCardY :img-src="videoItem.thumbnail" :title="videoItem.title" :views="videoItem.views"
                    :likes="videoItem.likes" :date="new Date(videoItem.createdAt).toLocaleDateString()"
                    :linkTo="{ name: 'video', params: { id: videoItem.videoId } }">
                    <template v-slot:img-overlay>
                        <div class="d-flex justify-end">
                            <v-menu>
                                <template v-slot:activator="{ props }">
                                    <v-btn v-bind="props" variant="tonal" color="white" icon @click.prevent="() => { }">
                                        <v-icon icon="mdi-dots-vertical"></v-icon>
                                    </v-btn>
                                </template>
                                <v-list>
                                    <v-list-item value="delete-video"
                                        @click.stop="(e) => onDeleteVideo(videoItem.videoId, e)">
                                        <v-list-item-title>删除视频</v-list-item-title>
                                    </v-list-item>
                                    <v-list-item value="edit-video" @click.stop="(e) => toEditPage(videoItem.videoId, e)">
                                        <v-list-item-title>编辑视频</v-list-item-title>
                                    </v-list-item>
                                </v-list>
                            </v-menu>
                        </div>
                    </template>
                </VideoCardY>
            </v-col>
        </v-row>
    </template>
    
</template>

<script setup>
import { ref, onMounted } from "vue";
import { getUploadedVids, deleteVideo } from "../utils/videoService";
import VideoCardY from "./VideoCardY.vue";
import { useRouter } from "vue-router";
import { useSnackbar } from "../hooks/useSnackbar";

const {snackbar} = useSnackbar();

const router = useRouter();

const uploadedVideosLoading = ref(false);
const uploadedVideos = ref(null);


onMounted(() => {
    const userToken = JSON.parse(localStorage.getItem('pdvUser'))?.token;
    if (userToken) {
        uploadedVideosLoading.value = true;
        getUploadedVids(userToken).then((data) => {
            uploadedVideosLoading.value = false;
            uploadedVideos.value = data;
        }).catch((error) =>{
            snackbar.error('获得上传视频错误: '+error);
        });
    }
})

function onDeleteVideo(videoId) {
    const userToken = JSON.parse(localStorage.getItem('pdvUser'))?.token;
    deleteVideo(videoId, userToken).then(()=>{
        snackbar.success('成功删除视频',1500);
        getUploadedVids(userToken).then((data) => {
            uploadedVideos.value = data;
        }).catch((error) =>{snackbar.error('获得上传视频错误: '+error)});
    }).catch((error)=>{snackbar.error("删除视频错误: "+error)});
}

function toEditPage(videoId) {
    router.push({
        name: 'user-edit-video',
        params: {
            userId: JSON.parse(localStorage.getItem('pdvUser'))._id,
            videoId,
        }
    })
}

</script>

