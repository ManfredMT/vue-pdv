import { ref } from "vue";

// 全局状态,任何组件可以通过snackbar.info, snackbar.error改变状态
const snackbar = ref(false);
const snackbarText = ref("");
const snackbarColor = ref("success");
const snackbarTimeout = ref(3000);
const snackbarCloseBtn = ref(false);

function useSnackbar() {
  const info = (text, timeout, closeBtn) => {
    snackbarText.value = text;
    snackbarColor.value = "info";
    snackbarTimeout.value = timeout;
    snackbarCloseBtn.value = closeBtn;
    snackbar.value = true;
  };

  const error = (text, timeout, closeBtn) => {
    snackbarText.value = text;
    snackbarColor.value = "error";
    snackbarTimeout.value = timeout;
    snackbarCloseBtn.value = closeBtn;
    snackbar.value = true;
  };

  const warning = (text, timeout, closeBtn) => {
    snackbarText.value = text;
    snackbarColor.value = "warning";
    snackbarTimeout.value = timeout;
    snackbarCloseBtn.value = closeBtn;
    snackbar.value = true;
  };

  const success = (text, timeout, closeBtn) => {
    snackbarText.value = text;
    snackbarColor.value = "success";
    snackbarTimeout.value = timeout;
    snackbarCloseBtn.value = closeBtn;
    snackbar.value = true;
  };

  return {
    snackbar:{
        info,
        error,
        warning,
        success
    },
    snackbarShow: snackbar,
    snackbarText,
    snackbarColor,
    snackbarTimeout,
    snackbarCloseBtn,
  };
}

export { useSnackbar };
