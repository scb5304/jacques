require('dotenv').config({path: './../.env'});
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const db = require('../common/data/db.js');
const Sound = require('../common/model/sound').Sound;
const path = require('path');
const logger = require('../common/util/logger.js');

var appRoot = require('app-root-path');
var webRoot = appRoot + "/web";
var nodeModulesRoot = appRoot + "/node_modules";

console.log("Jacques Root: " + appRoot);
console.log("'Web' Root: " + webRoot);
console.log("Node modules root: " + nodeModulesRoot);

app.use('/raw', express.static(__dirname + '/../sounds'));
app.use(express.static(nodeModulesRoot));
app.use(express.static(webRoot));

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

var port = 8080;
var router = express.Router();

db.connect();

router.use(function(req, res, next) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", "GET");
    res.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers");
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

app.use('/api', router);
app.get('/*', function(req, res) {
    res.sendFile(__dirname + "/index.html");
});

app.listen(port);