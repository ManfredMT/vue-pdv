<template>
    <div class="px-3">
        <v-card class="mx-auto px-6 py-8 mt-8" max-width="400">
            <div class="text-center">
                <v-avatar color="primary" class="mb-5" size="large"><v-icon icon="mdi-account-plus"
                        size="large" /></v-avatar>
                <p class="text-h5 mb-3">注册账号</p>
            </div>
            <FormBox v-model:form="form" @submitForm="debounceRegister" submitBtnText="注册" :loading="loading">
                <template v-slot:form-input>
                    <v-text-field v-model="userName" :readonly="loading" :rules="[required, checkLength]" class="mb-2" clearable
                    label="用户名" variant="outlined" color="primary">
                </v-text-field>
                <v-text-field v-model="password" :readonly="loading" :rules="[required]" clearable label="密码"
                    placeholder="输入密码" variant="outlined" type="password" color="primary">
                </v-text-field>
                <v-text-field v-model="confirm" :readonly="loading" :rules="[required, checkSame]" clearable
                    label="确认密码" variant="outlined" type="password" color="primary">
                </v-text-field>
                </template>
                <template v-slot:form-hint>
                    已有账号?&nbsp;<router-link
                        :to="{ path: '/login', query: route.query }">点击登录</router-link>
                </template>
            </FormBox>
        </v-card>
    </div>
</template>

<script setup>

import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { debounce } from '../utils/tools';
import { register } from '@/utils/authService';
import { useSnackbar } from '@/hooks/useSnackbar';
import FormBox from '@/components/FormBox.vue';
import { useLocalStorageRef } from '@/hooks/useLocalStorageRef';

const localStorageRef = useLocalStorageRef();

const {snackbar} = useSnackbar();

const route = useRoute();
const router = useRouter();
const userName = ref('');
const password = ref('');
const confirm = ref('');
const form = ref(false);
const loading = ref(false);

const debounceRegister = debounce(registerSubmit, 900, true);
function required(v) {
    return !!v || '此项不可为空'
}

function checkLength(v) {
    return v.length <= 20 || '用户名过长'
}

function checkSame(v) {
    return v === password.value || '确认密码和密码不一致';
}

function registerSubmit(e) {
    e.preventDefault();
    if (!form.value) return;
    loading.value = true;
    register(userName.value, password.value).then((data) => {
        localStorageRef.setItem('pdvUser', JSON.stringify(data));
        snackbar.success('注册成功',1000);
        // 注册成功后回到原来的路由,没有则返回首页
        const from = route.query.origin ?? '/';
        router.push({
            path: from,
            replace: true,
        });
    }).catch((error) => {
        snackbar.error('注册失败: '+error,-1,true);
    }).finally(()=>{
        loading.value = false;
    });

}

</script>