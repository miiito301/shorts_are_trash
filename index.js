const express = require("express")
const app = express()
const { createProxyMiddleware } = require("http-proxy-middleware")

const rateLimit = require("express-rate-limit")
require("dotenv").config()
const url = require("url")


const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10000,
})

app.use(limiter)


app.get("/", (req, res) => {
    const params = url.parse(req.url).query     
    console.log(params)                         
})

app.use("/youtube-search", (req, res, next) => {
    // APIキーを query に追加
    const originalUrl = new url.URL(req.originalUrl, `http://${req.headers.host}`);
    originalUrl.searchParams.set("key", process.env.YOUTUBE_API_KEY);

    // req.url を書き換える
    req.url = `/youtube/v3/search?${originalUrl.searchParams.toString()}`;

    createProxyMiddleware({
        target: process.env.BASE_API_URL_YOUTUBE,
        changeOrigin: true,
    })(req, res, next);
});

const port = process.env.PORT || 5000


app.listen(5000, () => {
    console.log("Listening on localhost port 5000")
})

module.exports = app