const API_URL = "/api/users/";

import {fetchWrapper} from "./tools";

// 得到用户的通知,比如登录记录和修改密码记录
async function getInforms(token) {
  try {
    const data = await fetchWrapper(API_URL+"record", {
      method: "GET",
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
        Authorization: `Bearer ${token}`,
      },
    });
    return data;
  } catch (error) {
    return Promise.reject(error);
  }
}

export {
    getInforms
}