const asyncHandler = require("express-async-handler");
const Comment = require("../models/commentModel");
const Video = require("../models/videoModel");
const mongoose = require("mongoose");

async function updateVideoScore(videoId, updatedVideoDoc) {
  await Video.findOneAndUpdate(
    { videoId },
    {
      score:
        updatedVideoDoc.views * 0.0015 +
        updatedVideoDoc.likes * 0.6 +
        updatedVideoDoc.dislikes * -0.35 +
        updatedVideoDoc.favNum * 0.3 +
        updatedVideoDoc.commentNum * 0.01,
    }
  );
}

// @desc   post a comment
// @route  POST /api/comments
// @access Private
const postComment = asyncHandler(async (req, res) => {
  if (!req.body.videoId) {
    res.status(400);
    throw new Error("请设置videoId");
  }
  if (!req.body.comment) {
    res.status(400);
    throw new Error("请设置评论内容");
  }
  const video = await Video.findOne({ videoId: req.body.videoId });
  if (!video) {
    res.status(400);
    throw new Error("videoId错误");
  }
  const comment = await Comment.create({
    user: req.user.id,
    videoId: req.body.videoId,
    username: req.user.name,
    comment: req.body.comment,
  });

  const updatedVideoDoc = await Video.findOneAndUpdate(
    { videoId: req.body.videoId },
    {
      $inc: { commentNum: 1 },
    },
    { new: true }
  );
  await updateVideoScore(req.body.videoId, updatedVideoDoc);
  res.status(200).json(comment);
});

// @desc   delete a comment
// @route  DELETE /api/comments
// @access Private
const deleteComment = asyncHandler(async (req, res) => {
  if (!req.body.commentId) {
    res.status(400);
    throw new Error("请设置评论id");
  }
  const id = mongoose.Types.ObjectId(req.body.commentId);
  const comment = await Comment.findById(id);
  if (!comment) {
    res.status(400);
    throw new Error("评论id错误");
  }

  if (comment.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error("无权限");
  }
  await comment.remove();
  const updatedVideoDoc = await Video.findOneAndUpdate(
    { videoId: comment.videoId },
    {
      $inc: { commentNum: -1 },
    },
    { new: true }
  );
  await updateVideoScore(comment.videoId, updatedVideoDoc);
  res.status(200).json({ commentId: req.body.commentId, action: "delete" });
});

// @desc   get comments on specific video
// @route  GET /api/comments/video/:videoId
// @access Public
const getComments = asyncHandler(async (req, res) => {
  const videoId = req.params.videoId;
  const comments = await Comment.find({ videoId });
  res.status(200).json(comments);
});

module.exports = {
  postComment,
  deleteComment,
  getComments,
};
