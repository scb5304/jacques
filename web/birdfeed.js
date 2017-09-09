require('dotenv').config({path: './../.env'});
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const db = require('../common/data/db.js');
const Sound = require('../common/model/sound').Sound;
const Category = require('../common/model/category').Category;
const path = require('path');
const logger = require('../common/util/logger.js');

var appRoot = require('app-root-path');
var soundsPath = appRoot + "/sounds";
var webPath = appRoot + "/web";
var nodeModulesPath = appRoot + "/node_modules/..";

app.use('/raw', express.static(__dirname + '/../sounds'));
app.use(express.static(webPath));
app.use(express.static(nodeModulesPath));

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

var port = 8080;
var router = express.Router();

db.connect();

router.use(function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "http://127.0.0.1:8080");
    next();
});

router.route('/sounds')
    .get(function(req, res) {
        db.getAllSounds()
            .then(function(sounds) {
                if (sounds) {
                    res.json(sounds);
                } else {
                    logger.info("Now you fucked up");
                }
            }).catch(logger.error)
    })
    .post(function(req, res) {
        console.log("Got POST request");
        console.log(req.body);
    });

router.route('/sounds/:sound_name')
    .get(function(req, res) {
        Sound.findOne({
            name: req.params.sound_name
        }, function(err, sound) {
            if (err) res.send(err);
            res.json(sound);
        });
    });

router.route('/categories')
    .get(function(req, res) {
        db.getAllCategories()
            .then(function(categories) {
                if (categories) {
                    res.json(categories);
                } else {
                    logger.info("Now you fucked up");
                }
            }).catch(logger.error)
    });

router.route('/categories/:category_name')
    .get(function(req, res) {
        Category.findOne({
            name: req.params.category_name
        }, function(err, category) {
            if (err) res.send(err);
            res.json(category);
        });
    });

app.use('/api', router);

app.use(function(req, res) {
    res.sendFile(`${__dirname}/index.html`);
});

app.listen(port);
