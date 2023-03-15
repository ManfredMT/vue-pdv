const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const Behavior = require("../models/behaviorModel");
const Record = require("../models/recordModel");
const Video = require("../models/videoModel");

// @desc   Register new user
// @route  POST /api/users
// @access Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, password } = req.body;

  if (!name || !password) {
    res.status(400);
    throw new Error("请填写完整信息");
  }

  const userExists = await User.findOne({ name });

  if (userExists) {
    res.status(400);
    throw new Error("用户已存在");
  }

  //console.log(`申请注册新用户：用户名：(${name})`);

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  //console.log(`申请注册新用户：用户名：(${name}),密码哈希成功`);

  try {
    const user = await User.create({
      name,
      password: hashedPassword,
    });
    if (user) {
      //console.log(`新用户注册成功，用户名为${user.name}`);
      await Behavior.create({ user: user.id, kind: "like", videoList: [] });
      await Behavior.create({ user: user.id, kind: "dislike", videoList: [] });
      await Behavior.create({ user: user.id, kind: "history", videoList: [] });
      await Behavior.create({
        user: user.id,
        kind: "favorites-default",
        videoList: [],
      });
      res.status(201).json({
        _id: user.id,
        name: user.name,
        token: generateToken(user._id),
      });
    } else {
      res.status(400);
      throw new Error("用户注册失败");
    }
  } catch (error) {
    res.status(400);
    throw new Error(error);
  }
});

// @desc   Authenticate a user
// @route  POST /api/users/login
// @access Public
const loginUser = asyncHandler(async (req, res) => {
  const { name, password } = req.body;

  if (!name || !password) {
    res.status(400);
    throw new Error("请填写完整信息");
  }

  const user = await User.findOne({ name });
  if (!user) {
    res.status(400);
    throw new Error("用户不存在");
  }

  if (await bcrypt.compare(password, user.password)) {
    await Record.create({
      user: user.id,
      action: "login",
      ip: req.ip,
      browser: req.useragent.browser,
      platform: req.useragent.platform,
    });

    res.json({
      _id: user.id,
      name: user.name,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error("密码错误");
  }
});

// @desc   Get user data
// @route  GET /api/users/me
// @access Private
const getMe = asyncHandler(async (req, res) => {
  res.status(200).json(req.user);
});

// @desc   Get user activity data
// @route  GET /api/users/activity
// @access Private
const getActivity = asyncHandler(async (req, res) => {
  const videoDocs = await Video.find({ channelId: req.user.id });
  const likeDoc = await Behavior.findOne({ user: req.user.id, kind: "like" });
  const favDoc = await Behavior.findOne({
    user: req.user.id,
    kind: "favorites-default",
  });
  res.status(200).json({
    name: req.user.name,
    id: req.user.id,
    videoNum: videoDocs.length,
    likeNum: likeDoc.videoList.length,
    favNum: favDoc.videoList.length,
  });
});

// @desc   Update user password
// @route  PUT /api/users/update-password
// @access Private
const updatePassword = asyncHandler(async (req, res) => {
  const { origin, password } = req.body;

  if (!origin || !password) {
    res.status(400);
    throw new Error("请填写完整信息");
  }

  if (!req.user) {
    res.status(401);
    throw new Error("无权限");
  }

  const user = await User.findOne({ name: req.user.name });
  if (!user) {
    res.status(400);
    throw new Error("用户不存在");
  }
  if (!(await bcrypt.compare(origin, user.password))) {
    res.status(400);
    throw new Error("密码错误");
  }
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    { password: hashedPassword },
    {
      new: true,
    }
  );

  if (updatedUser) {
    await Record.create({
      user: user.id,
      action: "change-password",
      ip: req.ip,
      browser: req.useragent.browser,
      platform: req.useragent.platform,
    });

    res.status(200).json({
      _id: updatedUser.id,
      name: updatedUser.name,
    });
  } else {
    res.status(400);
    throw new Error("密码更改失败");
  }
});

// @desc   get user records
// @route  GET /api/users/record
// @access Private
const getRecords = asyncHandler(async (req, res) => {
  if (!req.user) {
    res.status(401);
    throw new Error("无权限");
  }
  const records = await Record.find({ user: req.user.id })
    .sort({
      _id: -1,
    })
    .limit(30);
  res.status(200).json(records);
});

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "5d",
  });
};

module.exports = {
  loginUser,
  registerUser,
  getMe,
  updatePassword,
  getRecords,
  getActivity,
};
