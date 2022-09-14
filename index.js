const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

const url = "https://kimetsu-no-yaiba.fandom.com/wiki/Kimetsu_no_Yaiba_Wiki";
const characterUrl = "https://kimetsu-no-yaiba.fandom.com/wiki/";

//get all character
app.get("/v1", (req, resp) => {
  const thumnails = [];
  try {
    axios(url).then((res) => {
      const html = res.data;
      const $ = cheerio.load(html);
      const limit = Number(req.query.limit);
      $(".portal", html).each(function () {
        const name = $(this).find("a").attr("title");
        const url = $(this).find("a").attr("href");
        const image = $(this).find("a > img").attr("data-src");
        console.log(image);

        thumnails.push({
          name,
          url: "http://localhost:8000/v1" + url.split("/wiki")[1],
          image,
        });
      });
      if (limit && limit > 0) {
        resp.status(200).send(thumnails.splice(0, limit));
      } else {
        resp.status(200).send(thumnails);
      }
    });
  } catch (err) {
    resp.status(500).send("Server error");
  }
});

//get chatacter
app.get("/v1/:character", (req, resq) => {
  console.log(req.params.character);
  let url = characterUrl + req.params.character;
  const titles = [];
  const details = [];
  const characters = [];
  const characterObj = {};
  const galleries = [];
  try {
    axios(url).then((res) => {
      const html = res.data;
      const $ = cheerio.load(html);
      //get galary
      $(".wikia-gallery-item", html).each(function () {
        const gallery = $(this).find("a > img").attr("data-src");
        galleries.push(gallery);
      });
      //Get the title of character
      $("aside", html).each(function () {
        const image = $(this).find("img").attr("src");
        $(this)
          .find("section > div > h3")
          .each(function () {
            titles.push($(this).text());
          });
        $(this)
          .find("section > div > div")
          .each(function () {
            details.push($(this).text());
          });

        if (image !== undefined) {
          for (let i = 0; i < titles.length; i++) {
            characterObj[titles[i].toLowerCase()] = details[i];
          }
          characters.push({
            name: req.params.character.replace("_", " "),
            galleries,
            image,
            ...characterObj,
          });
        }
      });
      resq.status(200).send(characters);
    });
  } catch (err) {
    resq.status(500).send(err);
  }
});

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log("Sever is running...");
});
