// 视频卡片,左海报右信息
<template>
    <v-card :to="props.linkTo" density="comfortable">
        <div class="d-flex">
            <v-img width="170" :src="props.imgSrc" :aspect-ratio="16 / 9" cover>
            </v-img>
            <div class="px-2" :style="{width: '280px'}">
                <p class="font-weight-bold text-subtitle-2 mt-1" :style="{ height: '46px', overflow: 'clip' }">
                    {{ props.title }}
                </p>
                <p class="font-weight-light text-body-2">
                    <span >
                        <v-chip label size="x-small">
                            频道
                        </v-chip>
                        {{ props.channel }}
                    </span>
                </p>
                <p class="font-weight-light text-body-2">
                    <v-icon icon="mdi-eye-outline" size="x-small"></v-icon>
                    {{ formattedView }}&nbsp;
                    &nbsp;|&nbsp;
                    <v-icon icon="mdi-thumb-up-outline" size="x-small"></v-icon>
                    {{ formattedLikes }}&nbsp;
                </p>
            </div>
        </div>
    </v-card>
</template>

<script setup>

import { computed } from 'vue';
const props = defineProps(['imgSrc', 'title', 'views', 'likes', 'channel', 'linkTo']);
const formattedView = computed(() => {
    const views = props.views;
    if (views <= 1000) return views;
    else {
        const thousandViews = views / 1000;
        return thousandViews.toFixed(1) + 'k';
    }
})

const formattedLikes = computed(() => {
    const likes = props.likes;
    if (likes <= 1000) return likes;
    else {
        const thousandLikes = likes / 1000;
        return thousandLikes.toFixed(1) + 'k';
    }
})
</script>