<template>
  <template v-if="mobile"> <!--移动端UI-->
    <template v-if="videoInfoLoading || recommendVideoLoading || videoFeedbackLoading">
      <v-progress-circular indeterminate color="primary"></v-progress-circular>
    </template>
    <template v-if="videoInfo">
      <video id="videoPlayer" :style="{ width: '100%' }" controls preload="metadata">
        <source :src="videoInfo.videoSrc" type="video/mp4" />
      </video>
      <div class="elevation-2 rounded mx-2">
        <div class="rounded mx-2 pa-2">
          <p class="text-h6 font-weight-bold px-1">
            {{ videoInfo.title }}
          </p>
          <p class="text-subtitle-1 font-weight-light py-1 px-1">
            <v-chip label size="x-small">
              频道
            </v-chip>
            {{ videoInfo.channelTitle }}
            &bull;
            <span class="text-body-2 font-weight-light">
              {{ new Date(videoInfo.createdAt).toLocaleDateString() }}
            </span>
          </p>
        </div>
        <template v-if="feedbackData">
          <div class="rounded ma-2 d-flex align-center justify-space-between">
            <div>
              <v-btn variant="text" icon="mdi-eye" color="black" :ripple="false"></v-btn>
              <span>{{ videoInfo.views }}</span>
            </div>
            <div>
              <v-btn variant="text" icon="mdi-star" :color="starColor" @click="onClickStarDebounce">
              </v-btn>
              <span>{{ videoInfo.favNum }}</span>
            </div>
            <div>
              <v-btn variant="text" icon="mdi-thumb-up" :color="likeColor" @click="onClickLikeDebounce">
              </v-btn>
              <span>{{ videoInfo.likes }}</span>
            </div>
            <div>
              <v-btn variant="text" icon="mdi-thumb-down" :color="dislikeColor" @click="onClickDislikeDebounce">
              </v-btn>
            </div>
          </div>
        </template>

        <div class="rounded ma-2 pa-3">
          <p class="text-body-1 font-weight-regular ">
            介绍:
            {{ videoInfo.description }}
          </p>
        </div>
      </div>
    </template>

    <template v-if="recommendVideos">
      <v-card class="mx-2">
        <v-tabs v-model="tab" bg-color="grey-lighten-3">
          <v-tab value="comments">评论</v-tab>
          <v-tab value="recommend">相关视频</v-tab>
        </v-tabs>

        <v-card-text>
          <v-window v-model="tab">
            <v-window-item value="comments">
              <template v-if="isLogin">
                <v-form v-model="form" @submit="onSubmitComment" class="mt-5">
                  <v-textarea label="评论" variant="outlined" clearable v-model="comment" :rules="[lengthLimit]"
                    auto-grow rows="2" :readonly="commentLoading">
                  </v-textarea>
                  <v-btn :disabled="!form" :loading="commentLoading" type="submit">
                    发布评论
                  </v-btn>
                </v-form>
              </template>
              <template v-else>
                <v-btn @click="toLogin" variant="outlined" class="mt-6">
                  登录后可以评论
                </v-btn>
              </template>
              <template v-if="commentsLoading">
                <v-progress-circular indeterminate color="primary"></v-progress-circular>
              </template>
              <template v-if="videoComments">
                <div>
                  <p class="text-h5 my-5 font-weight-medium">评论: </p>
                  <div class="pa-2" v-for="commentItem in videoComments" :key="commentItem._id">
                    <div class="d-flex align-center justify-space-between">
                      <p>
                        <span class="text-h6 font-weight-medium">
                          {{ commentItem.username }}
                        </span>
                        <br />
                        <span class="font-weight-light text-grey-darken-1">{{ new
                          Date(commentItem.createdAt).toLocaleString() }}</span>
                      </p>
                      <v-btn v-show="user && user._id === commentItem.user" icon="mdi-delete-outline"
                        color="red-lighten-1" @click="(e) => onDeleteComment(commentItem._id, e)" variant="text">
                      </v-btn>
                    </div>
                    <p class="pl-4 mb-6">{{ commentItem.comment }}</p>
                    <v-divider></v-divider>
                  </div>
                </div>
              </template>
            </v-window-item>

            <v-window-item value="recommend">
              <template v-if="recommendVideos.length">
                <div v-for="videoItem in recommendVideos" :key="videoItem.videoId" class="pa-1 mx-8">
                  <VideoCardY :imgSrc="videoItem.thumbnail" :title="videoItem.title" :views="videoItem.views"
                    :likes="videoItem.likes" :channel="videoItem.channelTitle"
                    :date="new Date(videoItem.createdAt).toLocaleDateString()"
                    :linkTo="{ name: 'video', params: { id: videoItem.videoId } }">
                  </VideoCardY>
                </div>
              </template>
              <template v-else>
                <p class="text-center text-body-2">无相关视频</p>
              </template>
            </v-window-item>

          </v-window>
        </v-card-text>
      </v-card>

    </template>

  </template>

  <template v-else> <!--桌面端UI-->
    <div class="px-md-16 px-sm-0">
      <v-row no-gutters>
        <v-spacer></v-spacer>
        <v-col cols="7"  class="pa-md-3 pa-sm-1 pt-md-0">
          <template v-if="videoInfoLoading">
            <v-sheet height="300" color="grey-lighten-3" rounded="lg">
            </v-sheet>
            <v-sheet height="25" color="grey-lighten-3" rounded="lg" class="my-5"></v-sheet>
            <v-sheet height="25" color="grey-lighten-3" rounded="lg" class="my-5 mr-16"></v-sheet>
          </template>
          <template v-if="videoInfo">
            <video id="videoPlayer" :style="{ width: '100%', maxHeight: '70vh' }" controls @volumechange="onVolumeChange"
              @loadeddata="onLoadedMetadata" ref="videoElement" preload="metadata">
              <source :src="videoInfo.videoSrc" type="video/mp4" />
            </video>
            <div class="d-flex mt-2">
              <div class="elevation-1 rounded flex-grow-1 mr-6 pt-2 pl-1 overflow-auto" :style="{ height: '150px' }">
                <p class="text-h6 font-weight-bold px-1">
                  {{ videoInfo.title }}
                </p>
                <p class="text-subtitle-1 font-weight-light py-1 px-5">
                  <v-chip label size="x-small">
                    频道
                  </v-chip>
                  {{ videoInfo.channelTitle }}
                </p>

                <div class="d-flex align-center px-5 py-1">
                  <v-icon icon="mdi-eye-outline" size="x-small" class="mr-1"></v-icon>
                  {{ videoInfo.views }}
                  <v-icon icon="mdi-thumb-up-outline" size="x-small" class="mr-1 ml-3"></v-icon>
                  {{ videoInfo.likes }}
                  <v-icon icon="mdi-star-outline" size="x-small" class="mr-1 ml-3"></v-icon>
                  {{ videoInfo.favNum }}
                  &nbsp;|&nbsp;
                  <v-icon icon="mdi-calendar-month-outline" size="x-small" class="mr-1 ml-2"></v-icon>
                  {{ new Date(videoInfo.createdAt).toLocaleDateString() }}
                </div>

                <p class="text-body-1 font-weight-regular px-5 py-1">
                  {{ videoInfo.description }}
                </p>
              </div>

              <template v-if="videoFeedbackLoading">
                <v-progress-circular indeterminate color="grey"></v-progress-circular>
              </template>
              <template v-if="feedbackData">
                <div class="d-flex flex-column justify-space-between">
                  <v-btn variant="outlined" prepend-icon="mdi-thumb-up" :color="likeColor" @click="onClickLikeDebounce">
                    点赞
                  </v-btn>
                  <v-btn variant="outlined" prepend-icon="mdi-thumb-down" :color="dislikeColor"
                    @click="onClickDislikeDebounce">
                    不喜欢
                  </v-btn>
                  <v-btn variant="outlined" prepend-icon="mdi-star" :color="starColor" @click="onClickStarDebounce">
                    收藏
                  </v-btn>
                </div>
              </template>
            </div>
          </template>

          <template v-if="isLogin">
            <v-form v-model="form" @submit="onSubmitComment" class="mt-10">
              <v-textarea label="评论" variant="outlined" clearable v-model="comment" :rules="[lengthLimit]"
                auto-grow rows="2" :readonly="commentLoading">
              </v-textarea>
              <v-btn :disabled="!form" :loading="commentLoading" type="submit">
                发布评论
              </v-btn>
            </v-form>
          </template>
          <template v-else>
            <v-btn @click="toLogin" variant="outlined" class="mt-6">
              登录后可以评论
            </v-btn>
          </template>
          <template v-if="commentsLoading">
            <v-progress-circular indeterminate color="primary"></v-progress-circular>
          </template>
          <template v-if="videoComments">
            <div>
              <p class="text-h5 my-5 font-weight-medium">评论: </p>
              <div class="pa-2" v-for="commentItem in videoComments" :key="commentItem._id">
                <div class="d-flex align-center justify-space-between">
                  <p>
                    <span class="text-h6 font-weight-medium mr-3">
                      {{ commentItem.username }}
                    </span>
                    <span class="font-weight-light">{{ new Date(commentItem.createdAt).toLocaleString() }}</span>
                  </p>
                  <v-btn v-show="user && user._id === commentItem.user" icon="mdi-delete-outline" color="red-lighten-1"
                    @click="(e) => onDeleteComment(commentItem._id, e)" variant="text">
                  </v-btn>
                </div>
                <p class="pl-4 mb-6">{{ commentItem.comment }}</p>
                <v-divider></v-divider>
              </div>
            </div>
          </template>
        </v-col>
        <v-col cols="3" class="pa-md-3 pa-sm-1 pt-md-0">
          <template v-if="recommendVideoLoading">
            <v-sheet height="200" color="grey-lighten-3" rounded="lg"></v-sheet>
            <v-sheet height="200" color="grey-lighten-3" rounded="lg" class="my-5"></v-sheet>
          </template>
          <template v-if="recommendVideos">
            <template v-if="recommendVideos.length">
              <div v-for="videoItem in recommendVideos" :key="videoItem.videoId" class="mb-md-6 mb-sm-2">
                <VideoCardY :imgSrc="videoItem.thumbnail" :title="videoItem.title" :views="videoItem.views"
                  :likes="videoItem.likes" :channel="videoItem.channelTitle"
                  :date="new Date(videoItem.createdAt).toLocaleDateString()"
                  :linkTo="{ name: 'video', params: { id: videoItem.videoId } }"></VideoCardY>
              </div>
            </template>
            <template v-else>
              <p class="text-center text-body-2">无相关视频</p>
            </template>
          </template>
        </v-col>
        <v-spacer></v-spacer>
      </v-row>
    </div>
  </template>
  
  <v-dialog v-model="dialog" width="auto">
    <v-card>
      <v-card-text>
        {{ dialogText }}
      </v-card-text>
      <v-card-actions>
        <v-btn @click="onConfirmDeleteComment">确定</v-btn>
        <v-btn color="primary" @click="dialog = false">取消</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
  
<script setup>

import { useRouter, useRoute } from 'vue-router';
import { ref, computed, onMounted, watch } from 'vue';
import {
  getVideoInformation,
  getVideoFeedback,
  getRecommends,
  likeVideo,
  cancelLikeVideo,
  dislikeVideo,
  cancelDislikeVideo,
  favVideo,
  removeFavVideo,
  recordWatchHis
} from '../utils/videoService';
import VideoCardY from '@/components/VideoCardY.vue';
import { debounce } from '../utils/tools';
import { useDisplay } from 'vuetify';
import { getComments, postComment, deleteComment } from '../utils/commentService';
import { useSnackbar } from '@/hooks/useSnackbar';
import { useIsLogin } from '@/hooks/useIsLogin';

const {isLogin, localStorItem: localStorPDV} = useIsLogin();

const {snackbar} = useSnackbar();

const router = useRouter();
const route = useRoute();

const { mobile } = useDisplay();

const videoInfoLoading = ref(false);
const videoInfo = ref(null);
const recommendVideoLoading = ref(false);
const recommendVideos = ref(null);
const videoFeedbackLoading = ref(false);
const feedbackData = ref(null);
const tab = ref(null);

const likeColor = ref('grey');
const dislikeColor = ref('grey');
const starColor = ref('grey');


const comment = ref(null);
const form = ref(false);
//发表评论按钮的loading
const commentLoading = ref(false);

//加载视频评论的loading
const commentsLoading = ref(false);
const videoComments = ref(null);

const dialog = ref(false);
const dialogText = ref('');
const deleteCommentId = ref(null);

function lengthLimit(v) {
  return v.length <= 300 || '最多300个字';
}

function onSubmitComment(e) {
  e.preventDefault();
  if (!form.value) return;
  commentLoading.value = true;
  const userToken = JSON.parse(localStorPDV.value)?.token;
  const videoId = route.params.id;
  postComment(videoId, comment.value, userToken).then((data) => {
    commentLoading.value = false;
    snackbar.success('成功发布评论',1500);
    comment.value = ''
    videoComments.value.push(data);
  }).catch((error) => {
    snackbar.error('发布评论错误: ' + error);
    commentLoading.value = false;
  }
  );
}

function onDeleteComment(commentId) {
  deleteCommentId.value = commentId;
  dialogText.value = "确定删除评论?"
  dialog.value = true;
}

function onConfirmDeleteComment() {
  dialog.value = false;
  const userToken = JSON.parse(localStorPDV.value)?.token;
  deleteComment(deleteCommentId.value, userToken).then(() => {
    snackbar.success('成功删除评论',1500)
    videoComments.value = videoComments.value.filter((c) => c._id !== deleteCommentId.value);
  }).catch((error) =>{
    console.error('删除评论错误: ' + error);
    snackbar.error('删除评论错误: ' + error, 3000);
  });
}

const user = computed(() => {
  return JSON.parse(localStorPDV.value);
})

function getPageData(videoId) {
  const userToken = JSON.parse(localStorPDV.value)?.token;
  videoInfoLoading.value = true;
  getVideoInformation(videoId).then((data) => {
    videoInfoLoading.value = false;
    videoInfo.value = data;
  }).catch((error) =>{
    console.error("获取视频信息错误: "+error);
    videoInfoLoading.value = false;
  });

  recommendVideoLoading.value = true;
  getRecommends(videoId).then((data) => {
    recommendVideoLoading.value = false;
    recommendVideos.value = data;
  }).catch((error) =>{
    console.error("获取推荐视频错误: "+error);
    recommendVideoLoading.value = false;
  });

  commentsLoading.value = true;
  getComments(videoId).then((data) => {
    commentsLoading.value = false;
    videoComments.value = data;
  }).catch((error) =>{
    console.error("获取评论错误: "+error);
    commentsLoading.value = false;
  });
  if (!isLogin.value) {
    feedbackData.value = true;
  } else {
    videoFeedbackLoading.value = true;
    getVideoFeedback(videoId, userToken).then((data) => {
      videoFeedbackLoading.value = false;
      likeColor.value = data.like ? 'black' : 'grey';
      dislikeColor.value = data.dislike ? 'black' : 'grey';
      starColor.value = data.favorites ? 'black' : 'grey';
      feedbackData.value = data;
    }).catch((error) =>{
      console.error("获取反馈信息错误: "+error);
      videoFeedbackLoading.value = false;
    })
  }

}

onMounted(() => {
  getPageData(route.params.id);
  const userToken = JSON.parse(localStorPDV.value)?.token;
  if (isLogin.value) {
    recordWatchHis(route.params.id, userToken).then(() => {
    }).catch((error) =>{
      console.error("记录观看历史错误: "+error);
    })
  }
});

// 当路由的视频id改变时,重新获取页面数据
watch(
  () => route.params.id,
  (newId) => {
    videoInfo.value = null;
    recommendVideos.value = null;
    feedbackData.value = null;
    videoComments.value = null;
    comment.value = '';
    getPageData(newId);
    const userToken = JSON.parse(localStorPDV.value)?.token;
    if (userToken) {
      recordWatchHis(route.params.id, userToken).then(() => {
      }).catch((error) => {
        console.error("记录观看历史错误: "+error)
      })
    }
  }
)

const onClickLikeDebounce = debounce(onClickLike, 500, true);

function onClickLike() {
  const videoId = route.params.id;
  if (!isLogin.value) {
    snackbar.info('请登录',2000);
  } else if (feedbackData.value.like) {
    //取消点赞
    videoInfo.value.likes--;
    likeColor.value = 'grey';
    const userToken = JSON.parse(localStorPDV.value)?.token;
    cancelLikeVideo(videoId, userToken).then(() => {
      feedbackData.value.like = 0;
      snackbar.success('成功取消点赞',1000)
    }).catch((error) => {
      videoInfo.value.likes++;
      likeColor.value = 'black';
      snackbar.error("取消点赞错误: "+error,3000);
      console.error("取消点赞错误: "+error);
    })
  } else {
    //点赞
    if (dislikeColor.value === 'black') {
      videoInfo.value.dislikes--;
      dislikeColor.value = 'grey';
    }
    videoInfo.value.likes++;
    likeColor.value = 'black';
    const userToken = JSON.parse(localStorPDV.value)?.token;
    likeVideo(videoId, userToken).then(() => {
      feedbackData.value.dislike = 0;
      feedbackData.value.like = 1;
      snackbar.success('点赞成功',1000);
    }).catch((error) => {
      videoInfo.value.likes--;
      likeColor.value = 'grey';
      snackbar.error("点赞错误: "+error,3000);
      console.error("点赞错误: "+error);
    })
  }
}

const onClickDislikeDebounce = debounce(onClickDislike, 500, true);

function onClickDislike() {
  const videoId = route.params.id;
  if (!isLogin.value) {
    snackbar.info('请登录',2000);
  } else if (feedbackData.value.dislike) {
    //取消点踩
    videoInfo.value.dislikes--;
    dislikeColor.value = 'grey';
    const userToken = JSON.parse(localStorPDV.value)?.token;
    cancelDislikeVideo(videoId, userToken).then(() => {
      feedbackData.value.dislike = 0;
      snackbar.success('取消点踩成功',1000);
    }).catch((error) => {
      videoInfo.value.dislikes++;
      dislikeColor.value = 'black';
      snackbar.error("取消点踩错误: "+error);
      console.error("取消点踩错误: "+error);
    })
  } else {
    //点踩
    if (likeColor.value === 'black') {
      videoInfo.value.likes--;
      likeColor.value = 'grey';
    }
    videoInfo.value.dislikes++;
    dislikeColor.value = 'black';
    const userToken = JSON.parse(localStorPDV.value)?.token;
    dislikeVideo(videoId, userToken).then(() => {
      feedbackData.value.dislike = 1;
      feedbackData.value.like = 0;
      snackbar.success('反馈成功',1000);
    }).catch((error) => {
      videoInfo.value.dislikes--;
      dislikeColor.value = 'grey';
      snackbar.error("点踩反馈错误: "+error,3000);
      console.error("点踩反馈错误: "+error);
    })
  }
}

const onClickStarDebounce = debounce(onClickStar, 500, true);

function onClickStar() {
  const videoId = route.params.id;
  if (!isLogin.value) {
    snackbar.info('请登录',2000)
  } else if (feedbackData.value.favorites) {
    //取消收藏
    videoInfo.value.favNum--;
    starColor.value = 'grey';
    const userToken = JSON.parse(localStorPDV.value)?.token;
    removeFavVideo(videoId, userToken).then(() => {
      feedbackData.value.favorites = 0;
      snackbar.success('成功取消收藏',1000);
    }).catch((error) => {
      videoInfo.value.favNum++;
      starColor.value = 'black';
      snackbar.error("取消收藏错误: "+error,3000);
      console.error("取消收藏错误: "+error)
    })
  } else {
    //收藏视频
    videoInfo.value.favNum++;
    starColor.value = 'black';
    const userToken = JSON.parse(localStorPDV.value)?.token;
    favVideo(videoId, userToken).then(() => {
      feedbackData.value.favorites = 1;
      snackbar.success('成功加入收藏夹',2000);
    }).catch((error) => {
      videoInfo.value.favNum--;
      starColor.value = 'grey';
      snackbar.error("收藏错误: "+error,3000);
      console.error("收藏错误: "+error);
    })
  }
}

// 进入登录页面,并且在query上加上路由的来源,当登录成功后返回到此页面
function toLogin() {
  router.push({
    path: '/login',
    query: {
      origin: route.fullPath
    }
  })
}

// 记录用户设置的视频音量
function onVolumeChange(e) {
  localStorage.setItem('video-volume', e.target.volume);
}

const videoElement = ref(null);

function onLoadedMetadata() {
  const storVolume = localStorage.getItem('video-volume');
  if (videoElement.value) {
    videoElement.value.volume = storVolume;
  }
}


</script>