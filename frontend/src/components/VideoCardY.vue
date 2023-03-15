// 视频卡片,上海报下信息
<template>
    <v-card :to="props.linkTo" density="comfortable" class="pb-2">
        <v-img :src="props.imgSrc" :aspect-ratio="16 / 9" cover>
            <slot name="img-overlay">
            </slot>
        </v-img>
        <p class="font-weight-bold text-body-2 my-2 mx-4" :style="{ height: '40px', overflow: 'clip' }">{{ props.title }}
        </p>
        <v-card-subtitle>
            <template v-if="props.channel">
                <span>
                    <v-chip label size="x-small">
                        频道
                    </v-chip>
                    {{ props.channel }}
                </span>
            </template>
            <template v-if="props.channel && props.date">
                &bull;
            </template>
            <template v-if="props.date">
                {{ props.date }}
            </template>
            <br />
            <v-icon icon="mdi-eye-outline" size="x-small"></v-icon>
            {{ formattedView }}&nbsp;
            &nbsp;|&nbsp;
            <v-icon icon="mdi-thumb-up-outline" size="x-small"></v-icon>
            {{ formattedLikes }}&nbsp;
        </v-card-subtitle>
    </v-card>
</template>

<script setup>


import { computed } from 'vue';
const props = defineProps(['imgSrc', 'title', 'date', 'views', 'likes', 'channel', 'linkTo']);
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