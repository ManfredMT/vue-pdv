//获得用户登录状态以及保持在localStorage中的用户数据
import { useLocalStorageRef } from "./useLocalStorageRef";
import { computed } from "vue";

function useIsLogin() {
  const { getItemRef } = useLocalStorageRef();
  const localStorItem = getItemRef("pdvUser");
  const isLogin = computed(() => {
    const userToken = JSON.parse(localStorItem.value)?.token;
    return userToken !== undefined;
  });
  return {isLogin, localStorItem};
}

export { useIsLogin };
