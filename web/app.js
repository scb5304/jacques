const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const db = require('../db.js');
const Sound = require('../model/sound').Sound;
const path = require('path');

app.use(express.static('public'));
app.use(express.static('public/html/'));
app.use(express.static('public/test/'));
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());


var port = 8080;
var router = express.Router();


router.use(function(req, res, next) {
    console.log('Something is happening.');
    next();
});

router.all('/', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
 });

router.get('/', function(req, res) {
    res.json({
        message: "Hooray! Welcome to Jacques' API!"
    })
});

router.route('/sounds')
    .get(function(req, res) {
        db.getAllSounds()
            .then(function(sounds) {
                if (sounds) {
                    res.json(sounds);
                } else {
                    res.send("Now you fucked up");
                }
            }).catch(console.error)
    })
    .post(function(req, res) {
        console.log("Got request: " + req);
        res.send("Got request: " + req);
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
	res.sendFile("index.html");
});

app.listen(port);
console.log('Magic happens on port ' + port);
