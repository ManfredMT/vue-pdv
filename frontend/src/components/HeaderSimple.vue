<template>
    <header class="d-flex align-center justify-md-space-around py-1">
        <h1 class="ml-mb-0">
            <router-link to="/">
                <v-img src="./../assets/PDV.svg" alt="vuePDV demo website" :height="mobile ? 60 : 90"
                    :width="mobile ? 90 : 135"></v-img>
            </router-link>
        </h1>
        <div class="d-md-none"> <!-- 移动端UI -->
            <v-btn variant="text" icon="mdi-menu" color="black" @click.stop="drawer = !drawer"></v-btn>
            <v-navigation-drawer v-model="drawer" location="left" temporary>
                <v-list :lines="false" nav :selected="listSelected" @click:select="onClickSelectList">
                    <v-list-item v-for="item in drawerItems" :key="item.key" :value="item.key" @click="listItemClickDrawer">
                        <template v-slot:prepend>
                            <v-icon :icon="item.icon"></v-icon>
                        </template>
                        <v-list-item-title>{{ item.title }}</v-list-item-title>
                    </v-list-item>
                </v-list>
            </v-navigation-drawer>
            <v-btn variant="text" icon="mdi-magnify" color="black" @click="dialog = true"></v-btn>
            <v-dialog v-model="dialog" width="400">
                <v-card color="grey-lighten-3">
                    <v-card-text>
                        <v-text-field density="compact" variant="solo" label="搜索" prepend-inner-icon="mdi-magnify"
                            single-line hide-details clearable v-model="searchText"
                            @click:prepend-inner="onClickSearchMobile" @click:clear="onClickClear"></v-text-field>
                    </v-card-text>
                </v-card>
            </v-dialog>

        </div>
        <div class="d-none d-md-flex align-center"> <!-- 桌面端UI -->
            <v-btn-toggle v-model="videoKind" rounded="0" density="comfortable" group color="primary">
                <v-btn v-for="item in drawerItems" :key="item.key" :value="item.key" rounded="lg"
                    class="text-h6 font-weight-light mx-1" @click="onClickBtnToggle">
                    {{ item.title }}
                </v-btn>
            </v-btn-toggle>

            <v-sheet width="160" class="ml-3">
                <v-text-field label="搜索" prepend-inner-icon="mdi-magnify" variant="outlined" single-line density="compact"
                    hide-details clearable v-model="searchText" @click:prepend-inner="onClickSearch"
                    @click:clear="onClickClear"></v-text-field>
            </v-sheet>
        </div>
        <template v-if="isLogin">
            <div class="ml-auto ml-md-0 mr-3 mr-md-0">
                <v-avatar color="primary" density="comfortable">
                    <span class="text-h5">{{ JSON.parse(localStorPDV).name.charAt(0) }}</span>
                </v-avatar>
                <v-menu width="200">
                    <template v-slot:activator="{ props }">
                        <v-btn v-bind="props" size="small" variant="plain" icon color="gray">
                            <v-icon icon="mdi-menu-down"></v-icon>
                        </v-btn>
                    </template>
                    <v-list :lines="false" nav>
                        <v-list-item :title="JSON.parse(localStorPDV).name">
                            <template v-slot:prepend>
                                <v-avatar color="primary" density="comfortable">
                                    <span class="text-h5">{{
                                        JSON.parse(localStorPDV).name.charAt(0)
                                    }}</span>
                                </v-avatar>
                            </template>
                        </v-list-item>
                        <v-divider class="mb-3"></v-divider>
                        <v-list-item v-for="item in menuItems" :key="item.key" :value="item.key"
                            @click="(e) => listItemClick(item.key, e)">
                            <template v-slot:prepend>
                                <v-icon :icon="item.icon"></v-icon>
                            </template>
                            <v-list-item-title>{{ item.title }}</v-list-item-title>
                        </v-list-item>
                    </v-list>
                </v-menu>
            </div>
        </template>
        <template v-else>
            <v-btn class="ml-auto ml-md-0 mr-3 mr-md-0" variant="outlined" color="primary" @click="toLoginPage">未登录</v-btn>
        </template>
    </header>
</template>

<script setup>


import router from '@/router';
import { ref, watch, reactive } from 'vue';
import { useRoute } from 'vue-router';
import { useDisplay } from 'vuetify';
import { useLocalStorageRef } from '@/hooks/useLocalStorageRef';
import { useIsLogin } from '@/hooks/useIsLogin';

const localStorageRef = useLocalStorageRef();
const {isLogin, localStorItem: localStorPDV} = useIsLogin();

const { mobile } = useDisplay();

const drawer = ref(false);
const dialog = ref(false);
const searchText = ref('');
const videoKind = ref('');
let listSelected = reactive([]);

const route = useRoute()

const menuItems = [
    {
        key: 'notifications',
        title: '消息',
        icon: 'mdi-message'
    },
    {
        key: 'favorites',
        title: '收藏夹',
        icon: 'mdi-star'
    },
    {
        key: 'history',
        title: '观看历史',
        icon: 'mdi-history'
    },
    {
        key: 'upload-video',
        title: '上传视频',
        icon: 'mdi-upload'
    },
    {
        key: 'video-management',
        title: '视频管理',
        icon: 'mdi-video'
    },
    {
        key: 'logout',
        title: '退出登录',
        icon: 'mdi-logout'
    },
    {
        key: 'change-password',
        title: '修改密码',
        icon: 'mdi-key-change'
    },

]

const drawerItems = [
    {
        key: 'music',
        title: '音乐',
        icon: 'mdi-music-note'
    },
    {
        key: 'education',
        title: '教育',
        icon: 'mdi-school'
    },
    {
        key: 'movie',
        title: '影视',
        icon: 'mdi-movie-roll'
    },
    {
        key: 'sport',
        title: '体育',
        icon: 'mdi-run'
    },
    {
        key: 'technology',
        title: '科技',
        icon: 'mdi-memory'
    },
    {
        key: 'others',
        title: '其他',
        icon: 'mdi-file-question'
    },
]

function onClickSearchMobile() {
    router.push({ path: "/", query: { q: searchText.value } });
    dialog.value = false;
}

function onClickSearch() {
    router.push({ path: "/", query: { q: searchText.value } });
}

function onClickClear() {
    router.push("/")
}

function onClickSelectList(o) {
    if (!o.value) {
        router.push("/");
    } else {
        router.push({ path: "/", query: { kind: o.id } });
    }
}

function listItemClickDrawer() {
    drawer.value = false;
}

function onClickBtnToggle() {
    router.push({ path: "/", query: { kind: videoKind.value } });
}

// 使选中的视频类型和路由中query.kind保持一致
watch(
    () => route.query.kind,
    (newKind) => {
        videoKind.value = newKind;
        listSelected = [newKind];
    }
)

// 使searchText.value和路由中query.q的值一致
watch(
    () => route.query.q,
    (newQuery) => {
        searchText.value = newQuery;
    }
)

function listItemClick(value) {
    if (value === 'logout') {
        localStorageRef.removeItem('pdvUser');
    } else if (value === 'notifications') {
        router.push({
            name: 'user-notifications',
            params: {
                userId: JSON.parse(localStorage.getItem('pdvUser'))._id
            }
        })
    } else if (value === 'favorites') {
        router.push({
            name: 'user-favorites',
            params: {
                userId: JSON.parse(localStorage.getItem('pdvUser'))._id
            }
        })
    } else if (value === 'history') {
        router.push({
            name: 'user-history',
            params: {
                userId: JSON.parse(localStorage.getItem('pdvUser'))._id
            }
        })
    } else if (value === 'change-password') {
        router.push({
            name: 'user-change-password',
            params: {
                userId: JSON.parse(localStorage.getItem('pdvUser'))._id
            }
        })
    } else if (value === 'upload-video') {
        router.push({
            name: 'user-upload-video',
            params: {
                userId: JSON.parse(localStorage.getItem('pdvUser'))._id
            }
        })
    } else if (value === 'video-management') {
        router.push({
            name: 'user-video-management',
            params: {
                userId: JSON.parse(localStorage.getItem('pdvUser'))._id
            }
        })
    }
}

function toLoginPage() {
    router.push('/login');
}


</script>