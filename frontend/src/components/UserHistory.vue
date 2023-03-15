<template>
    <div>
        <div class="d-flex align-center justify-center mb-2">
            <v-icon icon="mdi-history" class="mx-2"></v-icon>
            <span class="font-weight-light text-h5">
                观看历史&nbsp;:
            </span>
        </div>
        <template v-if="loading">
            <div class="d-flex justify-center">
            <v-progress-circular indeterminate color="primary"></v-progress-circular>
            </div>
        </template>
        <template v-if="historyVideos">
            <template v-if="mobile">
                <div class="ma-1 d-flex justify-center" v-for="videoItem in historyVideos" :key="videoItem.videoId">
                    <VideoCardX :imgSrc="videoItem.thumbnail" :title="videoItem.title" :views="videoItem.views"
                        :likes="videoItem.likes" :channel="videoItem.channelTitle"
                        :linkTo="{ name: 'video', params: { id: videoItem.videoId } }"></VideoCardX>
                </div>
            </template>
            <template v-else>
                <v-timeline side="end">
                    <v-timeline-item dot-color="primary" size="x-small" v-for="videoItem in historyVideos"
                        :key="videoItem.videoId">
                        <VideoCardX :imgSrc="videoItem.thumbnail" :title="videoItem.title" :views="videoItem.views"
                            :likes="videoItem.likes" :channel="videoItem.channelTitle"
                            :linkTo="{ name: 'video', params: { id: videoItem.videoId } }">
                        </VideoCardX>
                    </v-timeline-item>
                </v-timeline>
            </template>
        </template>
    </div>
  
</template>

<script setup>
import VideoCardX from './VideoCardX.vue';
import { useDisplay } from 'vuetify';
import { getWatchHistory } from '../utils/videoService';
import { onMounted, ref } from 'vue';
import { useSnackbar } from "../hooks/useSnackbar";

const {snackbar} = useSnackbar();
const { mobile } = useDisplay();
const loading = ref(false);
const historyVideos = ref(null);


onMounted(() => {
    const userToken = JSON.parse(localStorage.getItem('pdvUser'))?.token;
    if (userToken) {
        loading.value = true;
        getWatchHistory(userToken).then((data) => {
            loading.value = false;
            historyVideos.value = data;
        }).catch((error) =>{snackbar.error('获取观看历史数据错误: '+error)})
    }
})


</script>