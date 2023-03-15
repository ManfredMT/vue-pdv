const API_URL = "/api/comments/";

import {fetchWrapper} from "./tools";

async function getComments(videoId) {
  try {
    const data = await fetchWrapper(API_URL + "video/" + videoId, {
      method: "GET",
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
      },
    });
    return data;
  } catch (error) {
    return Promise.reject(error);
  }
}

async function postComment(videoId, comment, token) {
  try {
    const data = await fetchWrapper(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({videoId, comment})
    });
    return data;
  } catch (error) {
    return Promise.reject(error);
  }
}

async function deleteComment(commentId, token) {
  try {
    const data = await fetchWrapper(API_URL, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({commentId})
    });
    return data;
  } catch (error) {
    return Promise.reject(error);
  }
}

export { getComments,postComment,deleteComment };
