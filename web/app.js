const express = require('express');
const app = express() ;
const db = require('../db.js');

app.set('view engine', 'pug')
app.locals.pretty = true;
app.use(express.static(__dirname + '/public'));
app.get('/', function (req, res) {
	db.getAllSounds()
	.then(function(listSounds) {
		res.render('index', { sounds: listSounds})
	});

})

app.listen(3000, function () {
    console.log('Example app listening on port 3000!')
})
