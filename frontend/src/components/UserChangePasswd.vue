<template>
    <div class="px-3">
        <v-card class="mx-auto px-6 py-8 mt-8" max-width="400">
            <div class="text-center">
                <v-avatar color="warning" class="mb-5" size="large"><v-icon icon="mdi-key-change"
                        size="large" /></v-avatar>
                <p class="text-h5 mb-3">修改密码</p>
            </div>
            <FormBox v-model:form="form" @submitForm="debounceSubmit" submitBtnText="确认修改" 
            :loading="loading" :v-btn-attrs="{color: 'warning'}">
                <template v-slot:form-input>
                    <v-text-field v-model="oldPassword" :readonly="loading" :rules="[required]" class="mb-2" clearable
                    label="原密码" variant="outlined" color="warning" type="password">
                </v-text-field>
                <v-text-field v-model="newPassword" :readonly="loading" :rules="[required]" clearable label="新密码"
                    placeholder="输入新密码" variant="outlined" type="password" color="warning">
                </v-text-field>
                <v-text-field v-model="confirm" :readonly="loading" :rules="[required, checkSame]" clearable
                    label="确认密码" variant="outlined" type="password" color="warning">
                </v-text-field>
                </template>
                <template v-slot:form-hint>
                    密码修改后请重新登录
                </template>
            </FormBox>
        </v-card>
    </div>
    <v-dialog v-model="dialog" persistent width="400">
        <v-card>
            <v-card-text>密码修改成功,请重新登录</v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="green-darken-1" variant="text" @click="onClickDialogOk">
                    确定
                </v-btn>
                <v-spacer></v-spacer>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script setup>
import { ref } from 'vue';
import { changePassword } from '../utils/authService';
import { debounce } from '../utils/tools';
import { useSnackbar } from "../hooks/useSnackbar";
import FormBox from './FormBox.vue';
import {useLocalStorageRef} from '../hooks/useLocalStorageRef';

const localStorageRef  = useLocalStorageRef();

const {snackbar} = useSnackbar();
const oldPassword = ref('');
const newPassword = ref('');
const confirm = ref('');
const form = ref(false);
const loading = ref(false);
const dialog = ref(false);

function required(v) {
    return !!v || '此项不可为空'
}

function checkSame(v) {
    return v === newPassword.value || '确认密码和密码不一致';
}

const debounceSubmit = debounce(changeSubmit, 900, true);

function onClickDialogOk() {
    dialog.value = false;
    localStorageRef.removeItem('pdvUser');
}

function changeSubmit(e) {
    e.preventDefault();
    if(newPassword.value !== confirm.value) {
        snackbar.error("确认密码和密码不一致");
        return;
    }
    const token = JSON.parse(localStorage.getItem('pdvUser'))?.token;
    changePassword(token, oldPassword.value, newPassword.value)
        .then(() => {
            dialog.value = true;
        }).catch((error) => {
            snackbar.error('登录失败: '+error,9000,true);
        })
}

</script>