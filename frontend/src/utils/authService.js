const API_URL = "/api/users/";

import {fetchWrapper} from "./tools";

async function changePassword(token, oldPassword, newPassword) {
  try {
    const data = await fetchWrapper(API_URL + "update-password", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ origin: oldPassword, password: newPassword }),
    });
    return data;
  } catch (error) {
    return Promise.reject(error);
  }
}

async function login(name, password) {
  try {
    const data = await fetchWrapper(API_URL + "login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
      },
      body: JSON.stringify({ name, password }),
    });
    return data;
  } catch (error) {
    return Promise.reject(error);
  }
}

async function register(name, password) {
  try {
    const data = await fetchWrapper(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
      },
      body: JSON.stringify({ name, password }),
    });
    return data;
  } catch (error) {
    return Promise.reject(error);
  }
}

//得到用户的发布视频数量,点赞数和收藏数
async function getActivity(token) {
  try {
    const data = await fetchWrapper(API_URL+"activity", {
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

export { changePassword, login, register, getActivity };
