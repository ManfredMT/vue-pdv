<template>
    <v-row>
        <v-spacer></v-spacer>
        <v-col cols="11" md="5">
            <template v-if="loading">
                <v-progress-circular indeterminate color="primary"></v-progress-circular>
            </template>
            <template v-if="userActivity">
                <div class="rounded elevation-1 px-10 py-16">
                    <div class="d-flex justify-center">
                        <v-avatar color="primary" size="x-large">
                            <span class="text-h4">{{ userActivity.name.charAt(0) }}</span>
                        </v-avatar>
                    </div>
                    <p class="text-center text-h4 my-2">{{ userActivity.name }}</p>
                    <div class="d-flex justify-space-evenly mt-10">
                        <div class="d-flex flex-column align-center text-h6">
                            <p>发布</p>
                            <p>{{ userActivity.videoNum }}</p>
                        </div>
                        <div class="d-flex flex-column align-center text-h6">
                            <p>点赞</p>
                            <p>{{ userActivity.likeNum }}</p>
                        </div>
                        <div class="d-flex flex-column align-center text-h6">
                            <p>收藏</p>
                            <p>{{ userActivity.favNum }}</p>
                        </div>
                    </div>
                </div>
            </template>
        </v-col>
        <v-spacer></v-spacer>
    </v-row>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useSnackbar } from '@/hooks/useSnackbar';
import { getActivity } from "../utils/authService";

const loading = ref(false);
const userActivity = ref(null);

const { snackbar } = useSnackbar();

onMounted(() => {
    const userToken = JSON.parse(localStorage.getItem('pdvUser'))?.token;
    loading.value = true;
    getActivity(userToken).then((data) => {
        loading.value = false;
        userActivity.value = data;
    }).catch((error) => {
        snackbar.error("获取用户信息错误: " + error);
    })
})

</script>