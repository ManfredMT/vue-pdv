// 防抖
function debounce(fn, t, immediate) {
  let timer = null;
  return function(...args) {
    let that = this;
    if(timer) clearTimeout(timer);
    if(immediate) {
      let callNow = !timer;
      timer = setTimeout(function() {
        timer = null;
      }, t);
      if(callNow) {
        fn.apply(that, args);
      }
    }else {
      timer = setTimeout(fn.bind(that, ...args), t);
    }
  }
}

//fetch错误处理和返回数据json的封装
async function fetchWrapper(action, fetchOptions) {
  const response = await fetch(action, fetchOptions);

  if (!response.ok) {
    let message = "";
    const error = response;
    if (typeof response.json === "function") {
      try {
        const jsonError = await error.json();
        message =
          (jsonError.response &&
            jsonError.response.data &&
            jsonError.response.data.message) ||
          jsonError.message ||
          jsonError.toString();
        return Promise.reject(message);
      } catch (err) {
        // Generic error from API
        message = error.statusText;
        return Promise.reject(message);
      }
    } else {
      // Fetch error
      message = error;
      return Promise.reject(message);
    }
  }
  const json = await response.json();
  return json;
}

export {debounce, fetchWrapper}