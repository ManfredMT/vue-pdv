// vue无法跟踪localStorage的变化,使用自定义事件来跟踪localStorage的变化
import { ref, onMounted, onBeforeUnmount } from "vue";

function useLocalStorageRef() {
  const removeItem = function (keyName) {
    localStorage.removeItem(keyName);
    window.dispatchEvent(
      new CustomEvent(keyName + "-localStorage-changed", {
        detail: {
          storage: localStorage.getItem(keyName),
        },
      })
    );
  };

  const getItemRef = function (keyName) {
    const itemRef = ref(localStorage.getItem(keyName));
    const handleLocalStorageChange = (event) => {
      itemRef.value = event.detail.storage;
    };
    onMounted(() => {
      window.addEventListener(
        keyName + "-localStorage-changed",
        handleLocalStorageChange
      );
    });
    onBeforeUnmount(() => {
      //销毁时解绑事件监听器
      window.removeEventListener(
        keyName + "-localStorage-changed",
        handleLocalStorageChange
      );
    });
    return itemRef;
  };

  const setItem = function (keyName, keyValue) {
    localStorage.setItem(keyName, keyValue);
    window.dispatchEvent(
      new CustomEvent(keyName + "-localStorage-changed", {
        detail: {
          storage: localStorage.getItem(keyName),
        },
      })
    );
  };

  return {
    removeItem,
    getItemRef,
    setItem,
  };
}

export { useLocalStorageRef };
