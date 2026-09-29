const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const FormData = require("form-data");
const router = express.Router();

async function Twitter(url) {
  const form = await FormData();
  form.append("q", url);
  form.append("lang", "id");
  const result = { status: 200, result: {} };
  try {
    const response = await axios("https://x2twitter.com/api/ajaxSearch", {
      method: "POST",
      headers: {
        "Accept": "*/*",
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        "Cookie": "_gid=GA1.2.1642260851.1718419271;",
        "Origin": "https://x2twitter.com",
        "Referer": "https://x2twitter.com/id",
        "User-Agent": "GoogleBot"
      },
      data: form
    });
    const $ = await cheerio.load(response.data.data);
    const $$ = $(".tw-right > .dl-action");
    const _$ = $(".tw-middle > .content > .clearfix");
    result.result = {
      title: _$.find("h3").text(),
      duration: _$.find("p").text() + " Seconds",
      thumb: $(".tw-video > .tw-left > .thumbnail > .image-tw.open-popup > img").attr("src"),
      video: {
        fhd: $$.find("p").eq(0).find("a").attr("href"),
        hd: $$.find("p").eq(1).find("a").attr("href"),
        sd: $$.find("p").eq(2).find("a").attr("href"),
        sd2: $$.find("p").eq(3).find("a").attr("href"),
        audio: $$.find("p").eq(4).find("a").attr("data-audiourl"),
        image: $$.find("p").eq(5).find("a").attr("href")
      }
    };
  } catch (error) {
    return { status: 500, msg: "Something Error :/" };
  }
  return result;
}

router.get('/', async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).json({ error: "Missing 'url' parameter" });
  try {
    const anu = await Twitter(url);
    const data = anu.result;
    return res.json(data);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});
module.exports = router;
