const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const db = require('../common/data/db.js');
const Sound = require('../common/model/sound').Sound;
const path = require('path');
const logger = require('../common/util/logger.js');

app.use('/raw', express.static(__dirname + '/../sounds'));
app.use(express.static(__dirname + '/../'));
app.use(express.static(__dirname));

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

var port = 8080;
var router = express.Router();

router.use(function(req, res, next) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
    res.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers");
    next();
});


router.get('/', function(req, res) {
    res.json({
        message: "Hooray! Welcome to Jacques' API!"
    })
});

router.route('/sounds')
    .get(function(req, res) {
        logger.info("Received request for sounds.");
        console.log("Received request for sounds.");
        db.getAllSounds()
            .then(function(sounds) {
                if (sounds) {
                    logger.info("Got sounds: " + sounds);
                    console.log("Got sounds: " + sounds);
                    res.json(sounds);
                } else {
                    console.log("Now you fucked up");
                    logger.info("Now you fucked up");
                    res.send("Now you fucked up");
                }
            }).catch(logger.error)
    })
    .post(function(req, res) {
        console.log("Got POST request");
        console.log(req.body);
        res.json({ message: 'Received sound request for ' + req.body.name });
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
app.get('/', function(req, res) {
    res.sendFile(__dirname + "/index.html");
});

app.listen(port);