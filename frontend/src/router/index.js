import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
//import LoginView from "../views/LoginView.vue";
// import RegisterView from "../views/RegisterView.vue";
// import VideoView from "../views/VideoView.vue";
import UserView from "../views/UserView.vue";
// import UserHome from "../components/UserHome.vue";
// import UserHistory from "../components/UserHistory.vue";
// import UserFavorites from "../components/UserFavorites.vue";
// import UserNotifications from "../components/UserNotifications.vue";
// import UserChangePasswd from "../components/UserChangePasswd.vue";
// import UserUpload from "../components/UserUpload.vue";
// import UserVideoManagement from "../components/UserVideoManagement.vue";
// import EditVideo from "../components/EditVideo.vue";

const LoginView = () => import("../views/LoginView.vue");
const RegisterView = () => import("../views/RegisterView.vue");
const VideoView = () => import("../views/VideoView.vue");
const UserHome = () => import("../components/UserHome.vue");
const UserHistory = () => import("../components/UserHistory.vue");
const UserFavorites = () => import("../components/UserFavorites.vue");
const UserNotifications = () => import("../components/UserNotifications.vue");
const UserChangePasswd = () => import("../components/UserChangePasswd.vue");
const UserUpload = () => import("../components/UserUpload.vue");
const UserVideoManagement = () =>
  import("../components/UserVideoManagement.vue");
const EditVideo = () => import("../components/EditVideo.vue");

const routes = [
  {
    path: "/",
    name: "home",
    component: HomeView,
  },
  {
    path: "/login",
    name: "login",
    component: LoginView,
  },
  {
    path: "/register",
    name: "register",
    component: RegisterView,
  },
  {
    path: "/video/:id",
    name: "video",
    component: VideoView,
  },
  {
    path: "/user/:userId",
    component: UserView,
    beforeEnter: (to) => {
      // 如果用户未登录,跳转到登录页面
      const userToken = JSON.parse(localStorage.getItem("pdvUser"))?.token;
      if (!userToken) {
        return {
          path: "/login",
          query: {
            origin: to.fullPath,
          },
        };
      }
      // 如果访问其他用户的URL,则跳回到自己的用户中心
      const storUserId = JSON.parse(localStorage.getItem("pdvUser"))?._id;
      if (storUserId) {
        if (storUserId !== to.params.userId) {
          return `/user/${storUserId}`;
        }
      } else {
        return "/";
      }
    },
    children: [
      {
        path: "",
        name: "user",
        component: UserHome,
      },
      {
        path: "history",
        name: "user-history",
        component: UserHistory,
      },
      {
        //收藏夹和点赞过的视频
        path: "favorites",
        name: "user-favorites",
        component: UserFavorites,
      },
      {
        path: "notifications",
        name: "user-notifications",
        component: UserNotifications,
      },
      {
        path: "change-password",
        name: "user-change-password",
        component: UserChangePasswd,
      },
      {
        path: "upload-video",
        name: "user-upload-video",
        component: UserUpload,
      },
      {
        path: "video-management",
        name: "user-video-management",
        component: UserVideoManagement,
      },
      {
        path: "edit-video/:videoId",
        name: "user-edit-video",
        component: EditVideo,
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else if (to.name === "video") {
      return { top: 0 };
    }
  },
});

export default router;
