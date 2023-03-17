//获得用户登录状态以及保持在localStorage中的用户数据
import { useLocalStorageRef } from "./useLocalStorageRef";
import { computed } from "vue";
import jwt_decode from "jwt-decode";

function useIsLogin() {
  const { getItemRef } = useLocalStorageRef();
  const localStorItem = getItemRef("pdvUser");
  const isLogin = computed(() => {
    const userToken = JSON.parse(localStorItem.value)?.token;
    if(!userToken) {
      return false;
    }
    const {exp} = jwt_decode(userToken);
    const expirationTime = (exp * 1000) - 60000;
    if(Date.now() >= expirationTime) {
      return false;
    }
    return true;
  });
  return {isLogin, localStorItem};
}

export { useIsLogin };
