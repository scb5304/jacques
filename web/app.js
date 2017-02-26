const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const db = require('../db.js');
const Sound = require('../model/sound').Sound;

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

var port = 8080;
var router = express.Router();

<<<<<<< HEAD
router.use(function(req, res, next) {
    console.log('Something is happening.');
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

app.listen(port);
console.log('Magic happens on port ' + port);