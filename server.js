var express = require("express");
var mongoose = require ("mongoose");
var axios = require("axios");
var cheerio = require("cheerio");

var db = require("./models");

var PORT = 3000;

var app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

mongoose.connect("mongodb://localhost/article-scraper", { useNewUrlParser: true });

// get route for scraping the website
app.get("/scrape", function(req, res) {
    axios.get("https://news.disney.com/")
    .then(function(response) {
        var $ = cheerio.load(response.data);


        $(".item-container h2").each(function(i, element) {
            var result = {};
            result.title = $(this)
                .children("a .skip-link-style")
                .attr("title");
            result.link = $(this)
                .children("a .skip-link-style")
                .attr("href");
            result.date = $(this)
                .children("p .publish-date")
                .text();
        })
    })
})