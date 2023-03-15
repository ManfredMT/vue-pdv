<template>
  <v-app>
    <HeaderSimple></HeaderSimple>
    <v-main>
      <router-view />
    </v-main>
    <FooterSimple></FooterSimple>
    <v-snackbar v-model="snackbarShow" location="top" :color="snackbarColor" :timeout="snackbarTimeout">
      {{ snackbarText }}
        <template v-if="snackbarCloseBtn" v-slot:actions>
          <v-btn color="gray" variant="text" @click="snackbarShow = false">
            关闭
          </v-btn>
        </template>
    </v-snackbar>
  </v-app>
</template>

<script setup>
import FooterSimple from './components/FooterSimple.vue';
import HeaderSimple from './components/HeaderSimple.vue';

import {useSnackbar} from './hooks/useSnackbar';

const {snackbarShow, snackbarText, snackbarColor, snackbarTimeout, snackbarCloseBtn} = useSnackbar();

</script>
