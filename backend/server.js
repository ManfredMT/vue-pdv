const express = require("express");
const http = require("http");
const dotenv = require("dotenv").config();
const useragent = require("express-useragent");

const port = process.env.PORT || 5000;
const { connectDB } = require("./config/db");
const { errorHandler } = require("./middleware/errorMiddleware");
const cors = require("cors");
const rateLimit = require("express-rate-limit");

connectDB();

//获得客户机的真实ip而不是代理服务器的ip
const app = express();
if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", true);
}

const httpServer = http.createServer(app);

app.use(
  cors(
    //设置origin为false取消所有cors.
    { origin: false }
  )
);

app.use(useragent.express());

const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // ms
  max: 5000, // Limit each IP to xx requests per `window`
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/api/users", limiter, require("./routes/userRoutes"));
app.use("/api/videos", limiter, require("./routes/videoRoutes"));
app.use("/api/comments", limiter, require("./routes/commentRoutes"));

app.use(errorHandler);

//Serving static image files
const limiterStatic = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minutes
  max: 200, // Limit each IP to 200 requests per `window`
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
const path = require("path");
app.use(
  "/api/image",
  limiterStatic,
  express.static(path.join(__dirname, "uploads/image"))
);

//前端页面的静态服务器
if (process.env.NODE_ENV === "production") {
  const expressStaticGzip = require("express-static-gzip");
  app.use(
    limiterStatic,
    expressStaticGzip(path.join(__dirname, "../frontend/dist"), {
      enableBrotli: true,
      orderPreference: ["br"],
    })
  );
  //app.use("/", limiterStatic, express.static(path.join(__dirname, "../frontend/dist")))
  app.get("/*", limiterStatic, function (req, res) {
    res.sendFile(path.join(__dirname, "../frontend/dist", "index.html"));
  });
}

httpServer.listen(port, () => {
  console.log(`HTTP服务器启动,端口为: ${port}`);
});
