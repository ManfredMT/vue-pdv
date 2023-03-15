<template>
    <v-card class="mx-md-5 mx-sm-3 ms-1">
        <v-tabs v-model="tab" bg-color="grey-lighten-5">
            <v-tab value="favorites">默认收藏夹</v-tab>
            <v-tab value="liked">点赞的视频</v-tab>
        </v-tabs>
        <v-card-text>
            <v-window v-model="tab">
                <v-window-item value="favorites">
                    <template v-if="favVideosLoading">
                        <v-progress-circular indeterminate color="primary"></v-progress-circular>
                    </template>
                    <template v-if="favVideos">
                        <p class="pl-md-2 pl-1 text-grey-darken-3 font-weight-light text-body-2">
                            共{{ favVideos.length }}个视频
                        </p>
                        <v-row no-gutters>
                            <v-col cols="12" sm="4" md="2" class="pa-md-2 pa-1" v-for="videoItem in favVideos"
                                :key="videoItem.videoId">
                                <VideoCardY :img-src="videoItem.thumbnail" :title="videoItem.title" :views="videoItem.views"
                                    :likes="videoItem.likes" :channel="videoItem.channelTitle"
                                    :linkTo="{ name: 'video', params: { id: videoItem.videoId } }">
                                    <template v-slot:img-overlay>
                                        <div class="d-flex justify-end">
                                            <v-menu>
                                                <template v-slot:activator="{ props }">
                                                    <v-btn v-bind="props" variant="tonal" color="white" icon
                                                        @click.prevent="() => { }">
                                                        <v-icon icon="mdi-dots-vertical"></v-icon>
                                                    </v-btn>
                                                </template>
                                                <v-list>
                                                    <v-list-item value="remove-fav"
                                                        @click.stop="(e) => onRemoveFav(videoItem.videoId, e)">
                                                        <v-list-item-title>移出收藏夹</v-list-item-title>
                                                    </v-list-item>
                                                </v-list>
                                            </v-menu>
                                        </div>
                                    </template>
                                </VideoCardY>
                            </v-col>
                        </v-row>
                    </template>
                </v-window-item>
                <v-window-item value="liked">
                    <template v-if="likedVideosLoading">
                        <v-progress-circular indeterminate color="primary"></v-progress-circular>
                    </template>
                    <template v-if="likedVideos">
                        <p class="pl-md-2 pl-1 text-grey-darken-3 font-weight-light text-body-2">
                            共{{ likedVideos.length }}个视频
                        </p>
                        <v-row no-gutters>
                            <v-col cols="12" sm="4" md="2" class="pa-md-2 pa-1" v-for="videoItem in likedVideos"
                                :key="videoItem.videoId">
                                <VideoCardY :img-src="videoItem.thumbnail" :title="videoItem.title" :views="videoItem.views"
                                    :likes="videoItem.likes" :channel="videoItem.channelTitle"
                                    :linkTo="{ name: 'video', params: { id: videoItem.videoId } }">
                                </VideoCardY>
                            </v-col>
                        </v-row>
                    </template>

                </v-window-item>
            </v-window>
        </v-card-text>
    </v-card>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import VideoCardY from './VideoCardY.vue';
import { getFavorites, getLikedVids, removeFavVideo } from '../utils/videoService'
import { useSnackbar } from "../hooks/useSnackbar";

const { snackbar } = useSnackbar();

const tab = ref(null);
const favVideosLoading = ref(false);
const favVideos = ref(null);
const likedVideosLoading = ref(false);
const likedVideos = ref(null);


onMounted(() => {
    const userToken = JSON.parse(localStorage.getItem('pdvUser'))?.token;
    if (userToken) {
        favVideosLoading.value = true;
        getFavorites(userToken).then((data) => {
            favVideosLoading.value = false;
            favVideos.value = data;
        }).catch((error) => { snackbar.error("获取收藏夹数据错误: " + error); });

        likedVideosLoading.value = true;
        getLikedVids(userToken).then((data) => {
            likedVideosLoading.value = false;
            likedVideos.value = data;
        }).catch((error) => { snackbar.error("获取点赞视频错误: " + error) });
    }
})

function onRemoveFav(videoId) {
    const userToken = JSON.parse(localStorage.getItem('pdvUser'))?.token;
    removeFavVideo(videoId, userToken).then(() => {
        getFavorites(userToken).then((data) => {
            favVideos.value = data;
        }).catch((error) => { snackbar.error("获取收藏夹数据错误: " + error) });
    }).catch((error) => { snackbar.error("移出收藏夹错误: " + error) })
}

</script>