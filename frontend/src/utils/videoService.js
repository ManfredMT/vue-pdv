const API_URL = "/api/videos/";

import { fetchWrapper } from "./tools";

async function getVideoFeeds(kind) {
  let bodyOj = kind ? { kind } : {};
  try {
    const data = await fetchWrapper(API_URL + "feeds", {
      method: "POST",
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
      },
      body: JSON.stringify(bodyOj),
    });
    return data;
  } catch (error) {
    return Promise.reject(error);
  }
}

async function getVideoSearchResult(query) {
  try {
    const data = await fetchWrapper(API_URL + "search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
      },
      body: JSON.stringify({ q: query }),
    });
    return data;
  } catch (error) {
    return Promise.reject(error);
  }
}

async function getVideoInformation(videoId) {
  try {
    const data = await fetchWrapper(API_URL + "info/" + videoId, {
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

async function getVideoFeedback(videoId, token) {
  try {
    const data = await fetchWrapper(API_URL + "feedback/" + videoId, {
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

async function getRecommends(videoId) {
  try {
    const data = await fetchWrapper(API_URL + "recommend/" + videoId, {
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
      },
    });
    return data;
  } catch (error) {
    return Promise.reject(error);
  }
}

async function likeVideo(videoId, token) {
  try {
    const data = await fetchWrapper(API_URL + "like/" + videoId, {
      method: "POST",
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

async function cancelLikeVideo(videoId, token) {
  try {
    const data = await fetchWrapper(API_URL + "cancel-like/" + videoId, {
      method: "POST",
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

async function dislikeVideo(videoId, token) {
  try {
    const data = await fetchWrapper(API_URL + "dislike/" + videoId, {
      method: "POST",
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

async function cancelDislikeVideo(videoId, token) {
  try {
    const data = await fetchWrapper(API_URL + "cancel-dislike/" + videoId, {
      method: "POST",
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

async function favVideo(videoId, token) {
  try {
    const data = await fetchWrapper(API_URL + "favorites/" + videoId, {
      method: "POST",
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

async function removeFavVideo(videoId, token) {
  try {
    const data = await fetchWrapper(API_URL + "remove-favorites/" + videoId, {
      method: "POST",
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

async function recordWatchHis(videoId, token) {
  try {
    const data = await fetchWrapper(API_URL + "record/" + videoId, {
      method: "POST",
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

async function getWatchHistory(token) {
  try {
    const data = await fetchWrapper(API_URL + "history", {
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

async function getFavorites(token) {
  try {
    const data = await fetchWrapper(API_URL + "favorites", {
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

async function getLikedVids(token) {
  try {
    const data = await fetchWrapper(API_URL + "liked", {
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

async function getUploadedVids(token) {
  try {
    const data = await fetchWrapper(API_URL + "user-uploaded", {
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

async function deleteVideo(videoId, token) {
  try {
    const data = await fetchWrapper(API_URL + videoId, {
      method: "DELETE",
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

async function updateVideo(videoId, token, updatedInfo) {
  let newVideoObj = {};
  if (updatedInfo.kind) newVideoObj.kind = updatedInfo.kind;
  if (updatedInfo.title) newVideoObj.title = updatedInfo.title;
  if (updatedInfo.description)
    newVideoObj.description = updatedInfo.description;
  try {
    const data = await fetchWrapper(API_URL + "update/" + videoId, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(newVideoObj),
    });
    return data;
  } catch (error) {
    return Promise.reject(error);
  }
}

async function postVideo(token, videoData) {
  let videoObj = {
    filename: videoData.filename,
    title: videoData.title,
    kind: videoData.kind,
    md5: videoData.md5,
  };
  if (videoData.description) {
    videoObj.description = videoData.description;
  }
  try {
    const data = await fetchWrapper(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(videoObj),
    });
    return data;
  } catch (error) {
    return Promise.reject(error);
  }
}

export {
  getVideoFeeds,
  getVideoSearchResult,
  getVideoInformation,
  getVideoFeedback,
  getRecommends,
  likeVideo,
  cancelLikeVideo,
  dislikeVideo,
  cancelDislikeVideo,
  favVideo,
  removeFavVideo,
  recordWatchHis,
  getFavorites,
  getLikedVids,
  getWatchHistory,
  getUploadedVids,
  deleteVideo,
  updateVideo,
  postVideo,
};
