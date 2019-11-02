var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());
var Song = require('./../models/taggedSongModel');

/* GET all songs for testing. */
router.get('/', function(req, res, next) {
	Song.find({}, function(err, songs) {
	    var songMap = {};

	    songs.forEach(function(song) {
	      songMap[song._id] = song;
	    });

	    res.status(200).send(songMap);  
	});
});

router.post('/add', function(req, res, next) {
	if (req.body.songId && req.body.tag && req.body.user) {

		Song.findOneAndUpdate({
			user : req.body.user,
			songId : req.body.songId
		},
		{
			"$push": { tags : req.body.tags } 
		},
		function (err, songId) {
			if (err) {
				Song.create({
				user : req.body.user,
			    songId : req.body.songId,
			    tags : [req.body.tag],
			  	},
			  	function (err, songId) {
			  		console.log(songId);
				    if (err) return res.status(500).send("There was a problem adding the tag.")
				    res.status(200).send();
				});	
			}
		});
		
	} else {
		return res.status(500).send("There was a problem adding the tag. Not all required fields present")
	}
});


module.exports = router;
