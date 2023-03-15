const express = require("express");
const router = express.Router();
const {
  streamVideo,
  postVideo,
  likeVideo,
  cancelLike,
  dislikeVideo,
  cancelDislike,
  bookmarkVideo,
  cancelBookmark,
  watchVideo,
  getFeedbackOfVideo,
  getLikedVideos,
  getFavorites,
  getFeeds,
  getSearchResult,
  updateVideo,
  deleteVideo,
  getVideoInfo,
  getRecommends,
  getWatchHistory,
  getUserUploadedVideos,
  uploadFile,
} = require("../controllers/videoController");
const { protect } = require("../middleware/authMiddleware");

router.get("/stream/:videoId", streamVideo);
router.get("/user-uploaded", protect, getUserUploadedVideos);
router.route("/upload").post(protect, uploadFile);
router.route("/").post(protect, postVideo);
router.route("/like/:videoId").post(protect, likeVideo);
router.route("/cancel-like/:videoId").post(protect, cancelLike);
router.route("/dislike/:videoId").post(protect, dislikeVideo);
router.route("/cancel-dislike/:videoId").post(protect, cancelDislike);
router.route("/favorites/:videoId").post(protect, bookmarkVideo);
router.route("/remove-favorites/:videoId").post(protect, cancelBookmark);
router.route("/record/:videoId").post(protect, watchVideo);
router.route("/feedback/:videoId").get(protect, getFeedbackOfVideo);
router.route("/liked").get(protect, getLikedVideos);
router.route("/favorites").get(protect, getFavorites);
router.route("/feeds").post(getFeeds);
router.route("/search").post(getSearchResult);
router.route("/update/:videoId").put(protect, updateVideo);
router.route("/:videoId").delete(protect, deleteVideo);
router.route("/info/:videoId").get(getVideoInfo);
router.route("/recommend/:videoId").get(getRecommends);
router.route("/history").get(protect, getWatchHistory);

module.exports = router;
