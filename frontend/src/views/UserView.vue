<template>
    <router-view />
</template>

<script setup>

import { watch } from 'vue';
import { useRouter } from 'vue-router';
import { useLocalStorageRef } from '@/hooks/useLocalStorageRef';

const localStorageRef = useLocalStorageRef();
const localStorPDV = localStorageRef.getItemRef('pdvUser');

//用户退出登录时回到主页面
const router = useRouter();

watch(localStorPDV, (newStor) => {
    if (!newStor) {
        router.push({ name: 'home' });
    }
})
</script>