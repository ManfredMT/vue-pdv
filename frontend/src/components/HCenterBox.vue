// 水平居中组件,可配置断点cols, sm, md, lg, xl 参考https://next.vuetifyjs.com/en/components/grids/

<template>
    <v-row>
        <v-spacer></v-spacer>
        <v-col :cols="props.cols" :md="props.md" v-bind="$attrs">
            <slot></slot>
        </v-col>
        <v-spacer></v-spacer>
    </v-row>
</template>

<script>
export default {
  inheritAttrs: false
}
</script>

<script setup>
const props = defineProps({
    cols: {
        type: Number,
        default: 11
    },
    md: {
        type: Number,
        default: 6
    }
})

</script>