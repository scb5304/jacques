require("dotenv").config({path: "./../.env"});

const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const db = require("../common/data/db.js");
const Sound = require("../common/model/sound").Sound;
const Category = require("../common/model/category").Category;
const logger = require("../common/util/logger.js");

const app = express();
const router = express.Router();
const port = 8081;

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

db.connect();

router.use(function(req, res, next) {
    if (req.method === "GET") {
        res.header("Access-Control-Allow-Origin", "*");
        next();
    }
});

router.route("/sounds")
    .get(function(req, res) {
        db.getAllSounds()
            .then(function(sounds) {
                res.json(sounds);
            }).catch(function(error) {
                logger.error(error);
                res.status(500).send({error: "Failed to get sounds. Error: " + err});
            });
    })
    .post(function(req, res) {
        console.log("Got POST request");
        console.log(req.body);
    });

router.route("/sounds/:sound_name")
    .get(function(req, res) {
        Sound.findOne({
            name: req.params.sound_name
        }, function(err, sound) {
            if (err) {
                logger.error(err);
                res.status(500).send({error: "Failed to get this sound. Error: " + err});
            } else {
                res.json(sound);
            }
        });
    });

router.route("/categories")
    .get(function(req, res) {
        db.getAllCategories()
            .then(function(categories) {
                res.json(categories);
            }).catch(function(error) {
                logger.error(error);
                res.status(500).send({error: "Failed to get categories. Error: " + err});
            });
    });

router.route("/categories/:category_name")
    .get(function(req, res) {
        Category.findOne({
            name: req.params.category_name
        }, function(err, category) {
            if (err) res.send(err);
            res.json(category);
        });
    });

app.use("/api", router);

app.listen(port);