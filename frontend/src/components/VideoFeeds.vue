<template>
  <template v-if="loading">
    <div class="text-center my-16">
      <v-progress-circular indeterminate color="primary"></v-progress-circular>
    </div>
  </template>
  <template v-if="videoFeeds">
    <div class="pa-md-10 pa-sm-8 pa-1">
      <p v-show="feedMessage" class="text-h6 pa-md-2 pa-sm-1 pa-1">{{ feedMessage }}</p>
      <v-row no-gutters>
        <v-col v-for="videoItem in videoFeeds" :key="videoItem.videoId" cols="12" sm="6" md="3" :class="colClass">
          <VideoCardY :img-src="videoItem.thumbnail" :title="videoItem.title" :views="videoItem.views"
            :likes="videoItem.likes" :channel="videoItem.channelTitle"
            :date="new Date(videoItem.createdAt).toLocaleDateString()"
            :linkTo="{ name: 'video', params: { id: videoItem.videoId } }"></VideoCardY>
        </v-col>
      </v-row>
    </div>
  </template>
</template>

<script setup>
import VideoCardY from './VideoCardY.vue';
import { ref, onMounted, watch } from 'vue';
import { getVideoFeeds, getVideoSearchResult } from '../utils/videoService'
import { useRoute } from 'vue-router';
import { useSnackbar } from "../hooks/useSnackbar";

const {snackbar} = useSnackbar();

const loading = ref(false);
const videoFeeds = ref(null);
const feedMessage = ref(null); //视频网格上的提示标题
const colClass = "pa-md-2 pa-sm-1 pa-1";


const route = useRoute();

function handleError(error) {
  loading.value = false;
  snackbar.error('视频获取失败: '+error,8000,true);
}

// 路由的query中有q有kind:优先根据q搜索视频
// 有q没kind: 根据q搜索视频
// 没q有kind: 根据kind得到该分类的视频
// 没q没kind: 获取默认推荐视频

onMounted(() => {
  loading.value = true;
  if (route.query.q) {
    getVideoSearchResult(route.query.q).then((data) => {
      loading.value = false;
      videoFeeds.value = data;
    }).catch(handleError);
  } else if (route.query.kind) {
    getVideoFeeds(route.query.kind).then((data) => {
      loading.value = false;
      videoFeeds.value = data;
    }).catch(handleError);
  } else {
    getVideoFeeds().then((data) => {
      loading.value = false;
      videoFeeds.value = data;
    }).catch(handleError);
  }
})


watch(
  () => route.query.q,
  (newQuery) => {
    if (newQuery) {
      //点击了搜索
      videoFeeds.value = null;
      feedMessage.value = `[${newQuery}]的搜索结果: `;
      loading.value = true;
      getVideoSearchResult(newQuery)
        .then((data) => {
          loading.value = false;
          videoFeeds.value = data;
        })
        .catch(handleError)
    } else if (!route.query.kind) {
      //点击了搜索框的清空按钮
      videoFeeds.value = null;
      feedMessage.value = '';
      loading.value = true;
      getVideoFeeds().then((data) => {
        loading.value = false;
        videoFeeds.value = data;
      }).catch(handleError)
    }
  },
)

watch(
  () => route.query.kind,
  (newKind) => {
    if (!newKind && route.query.q) return; //点击了搜索

    //选中或者取消选中视频分类
    videoFeeds.value = null;
    feedMessage.value = '';
    loading.value = true;
    getVideoFeeds(newKind).then((data) => {
      loading.value = false;
      videoFeeds.value = data;
    }).catch(handleError)
  },
)

</script>