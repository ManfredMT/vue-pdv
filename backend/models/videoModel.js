const mongoose = require("mongoose");

const videoSchema = mongoose.Schema(
  {
    videoId: {
      type: String,
      required: [true, "Please add a video id"],
      unique: true,
    },
    videoSrc: {
      type: String,
      required: true,
      unique: true,
    },
    kind: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    channelId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    channelTitle: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    thumbnail: {
      type: String,
      required: true,
    },
    likes: {
      type: Number,
      default: 0,
    },
    dislikes: {
      type: Number,
      default: 0,
    },
    favNum: {
      type: Number,
      default: 0,
    },
    commentNum: {
      type: Number,
      default: 0,
    },
    views: {
      type: Number,
      default: 0,
    },
    score: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);


module.exports = mongoose.model("Video", videoSchema);
