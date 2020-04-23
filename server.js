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

            db.Article.create(result)
            .then(function(dbArticle) {
                console.log(dbArticle);
            }).catch(function(err) {
                console.log(err);
            });
        });
        res.send("Scrape Complete");
    });
});

// get route for showing all articles in the database
app.get("/articles", function(req, res) {
    db.Article.find({})
        .then(function(dbArtile) {
            res.json(dbArticle)
        }).catch(function(err) {
            res.json(err);
        });
});

// get route for specific article by id, populate it with it's note
app.get("/articles/:id", function(req, res) {
    db.Article.findOne({ _id: req.params.id })
        .populate("note")
        .then(function(dbArticle) {
            res.json(dbArticle);
        }).catch(function(err) {
            res.json(err);
        });
});

// post route for saving/updating an article's note
app.post("/articles/:id", function(req, res) {
    db.Note.create(req.body)
        .then(function(dbNote) {
            return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
        }).then(function(dbArticle) {
            res.json(dbArticle);
        }).catch(function(err) {
            res.json(err);
        });
});

app.listen(PORT, function() {
    console.log("App running on port " + PORT);
});