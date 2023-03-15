<template>
    <HCenterBox>
        <v-card min-height="300" class="my-5">
            <v-card-title class="text-center justify-center py-1 bg-grey-lighten-5">
                <v-icon icon="mdi-message-text-outline" class="mx-2"></v-icon>
                <span class="font-weight-light text-h5">
                    消息&nbsp;:
                </span>
            </v-card-title>
            <template v-if="informLoading">
                <v-progress-circular indeterminate color="primary"></v-progress-circular>
            </template>
            <template v-if="informs">
                <div class="rounded elevation-1 pa-2 mx-2 my-5" v-for="informItem in informs" :key="informItem._id">
                    <p class="text-subtitle-1 font-weight-black">你在
                        {{ new Date(informItem.createdAt).toLocaleString() }}
                        进行
                        {{ informItem.action === "login" ? "登录" : informItem.action === "change-password" ? "修改密码" : "未知" }}
                        操作
                    </p>
                    <p class="ml-2">ip: {{ informItem.ip }}</p>
                    <p class="ml-2">平台系统: {{ informItem.platform }}</p>
                    <p class="ml-2">浏览器: {{ informItem.browser }}</p>
                </div>
            </template>
        </v-card>
    </HCenterBox>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { getInforms } from "../utils/informService";
import HCenterBox from "./HCenterBox.vue";
import { useSnackbar } from "@/hooks/useSnackbar";

const {snackbar} = useSnackbar();

const informLoading = ref(false);
const informs = ref(null);

onMounted(() => {
    const userToken = JSON.parse(localStorage.getItem('pdvUser'))?.token;
    informLoading.value = true;
    getInforms(userToken).then((data) => {
        informs.value = data;
        console.log("informs.value: ", informs.value);
    }).catch((error) =>{snackbar.error("获取通知错误: "+error)})
    .finally(()=>{
        informLoading.value = false;
    });
})


</script>