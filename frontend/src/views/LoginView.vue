<template>
    <div class="px-3">
        <v-card class="mx-auto px-6 py-8 mt-8" max-width="400">
            <div class="text-center">
                <v-avatar color="primary" class="mb-5" size="large"><v-icon icon="mdi-login" size="large" /></v-avatar>
                <p class="text-h5 mb-3">登录账号</p>
            </div>
            <FormBox v-model:form="form" @submitForm="debounceLogin" submitBtnText="登录" :loading="loading">
                <template v-slot:form-input>
                    <v-text-field v-model="userName" :readonly="loading" :rules="[required]" class="mb-2" clearable
                        label="用户名" variant="outlined" color="primary">
                    </v-text-field>
                    <v-text-field v-model="password" :readonly="loading" :rules="[required]" clearable label="密码"
                        placeholder="输入密码" variant="outlined" type="password" color="primary">
                    </v-text-field>
                </template>
                <template v-slot:form-hint>
                    还未注册账号?&nbsp;
                    <router-link :to="{ path: '/register', query: route.query }">点击注册
                    </router-link>
                </template>
            </FormBox>
        </v-card>
    </div>
</template>

<script setup>

import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { debounce } from '../utils/tools';
import { login } from '@/utils/authService';
import { useSnackbar } from '@/hooks/useSnackbar';
import FormBox from '@/components/FormBox.vue';
import { useLocalStorageRef } from '@/hooks/useLocalStorageRef';

const localStorageRef = useLocalStorageRef();

const { snackbar } = useSnackbar();
const router = useRouter();
const route = useRoute();
const form = ref(false);
const loading = ref(false);
const userName = ref('');
const password = ref('');



function required(v) {
    return !!v || '此项不可为空'
}

// 防抖
const debounceLogin = debounce(loginSubmit, 900, true);

function loginSubmit(e) {
    e.preventDefault();
    if (!form.value) return;
    loading.value = true;
    login(userName.value, password.value)
        .then((data) => {
            localStorageRef.setItem('pdvUser', JSON.stringify(data));
            snackbar.success('登录成功', 1000);
            // 登录成功后回到原来的路由,没有则返回首页
            const from = route.query.origin ?? '/';
            router.push({
                path: from,
                replace: true,
            });
        }).catch((error) => {
            snackbar.error('登录失败: ' + error, -1, true);
        }).finally(() => {
            loading.value = false;
        })
}

</script>