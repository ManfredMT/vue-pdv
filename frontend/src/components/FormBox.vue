// 表单
<template>
    <v-form :model-value="form" @update:modelValue="newValue=>emit('update:form', newValue)" 
    @submit="emit('submitForm', $event)">
        <slot name="form-input"></slot>
        <p class="text-center font-weight-light text-medium-emphasis">
            <slot name="form-hint"></slot>
        </p>
        <br />
        <v-btn :disabled="!props.form" :loading="props.loading" block color="primary" 
        size="large" type="submit"
            variant="elevated" v-bind="props.vBtnAttrs">
            {{ props.submitBtnText }}
        </v-btn>
    </v-form>
</template>

<script setup>
const props = defineProps(['form', 'submitBtnText', 'loading', 'vBtnAttrs']);
const emit = defineEmits(['submitForm', 'update:form']);

</script>