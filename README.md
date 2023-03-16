# vue-pdv

响应式视频网站

## 功能

- 用户登录,注册和修改密码
- 前端响应式布局
- 搜索视频,查看不同分类的视频
- 收藏视频,点赞视频
- 显示视频播放量
- 视频观看历史
- 支持上传视频,不限视频大小,断点续传.
- 视频管理
- 查看登录和修改密码记录(ip,设备,时间等)
- 发布评论
- 视频推荐
- 记录视频音量
- 后端api接口限流
- 支持多种视频格式

## 技术栈

**前端**:

- vue3
- vue-router4
- vuetify3

**后端**:

- Express.js
- mongoose
- JWT
- multer
- fluent-ffmpeg

## 安装依赖

```bash
npm install
```

## 开发

1. 安装数据库mongoDB
2. 安装ffmpeg和ffprobe,下载地址: <https://ffmpeg.org/download.html>
3. 配置.env文件,参考.envexample文件

后端:

```bash
npm start
```

前端:

```bash
npm run serve
```
