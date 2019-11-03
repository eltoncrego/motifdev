var express = require('express');
var async = require("async");
var router = express.Router();
var bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());
var Song = require('./../models/taggedSongModel');
var Tag = require('./../models/tagModel');

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

router.post('/tag/add', function(req, res, next) {
	if (req.body.songId && req.body.tag && req.body.userId) {
		Tag.find({ 
				userId: req.body.userId,
				tag: req.body.tag
		}, function(error, tag) {
			if (tag.length == 0) {
				Tag.create([{
					userId: req.body.userId,
					tag: req.body.tag
				}],
				function(err, tagVal) {
					console.log(tagVal[0]);
					Song.findOneAndUpdate({
						userId : req.body.userId,
						songId : req.body.songId
					},
			   		{
			   		 $push: { tagIds: tagVal[0]._id } 
			   		},
					{
						new: true, upsert: true
					},
					function (err, song) {
						if (err) {
							console.log(err);
							res.status(500).send({"status":"FAILURE"});
						} else {
							res.status(200).send({"status":"SUCCESS"});
						}
					});	
				});
			} else {
				Song.findOneAndUpdate({
					userId : req.body.userId,
					songId : req.body.songId
				},
		   		{
		   		 $push: { tagIds: tag[0]._id } 
		   		},
				{
					new: true, upsert: true
				},
				function (err, song) {
					if (err) {
						console.log(err);
						res.status(500).send({"status":"FAILURE"});
					} else {
						res.status(200).send({"status":"SUCCESS"});
					}
				});	
			}
		});		
	} else {
		return res.status(500).send("There was a problem adding the tag. Not all required fields present")
	}

});

router.post('/tag/delete', function(req, res, next) {
	if (req.body.songId && req.body.tag && req.body.userId) {
		Tag.find({ 
				userId: req.body.userId,
				tag: req.body.tag
		}, function(error, tag) {
			if (tag.length == 0) {
				return res.status(500).send({
					"message":"Couldn't find tag: " + req.body.tag,
					"status":"FAILURE"
				});
			} else {
				Song.findOneAndUpdate({
					userId : req.body.userId,
					songId : req.body.songId
				},
		   		{
		   		 $pullAll: { tagIds: [tag[0]._id] } 
		   		},
				{
					new: true, upsert: true
				},
				function (err, song) {
					if (err) {
						console.log(err);
						res.status(500).send({"status":"FAILURE"});
					} else {
						res.status(200).send({"status":"SUCCESS"});
					}
				});	
			}
		});		
	} else {
		return res.status(500).send("There was a problem adding the tag. Not all required fields present");
	}
});

router.post('/tags', function(req, res, next) {
	if (req.body.songIds && req.body.userId) {
		var resolvedMap = {};
		Song.find({ 
			'songId': { $in: req.body.songIds},
			'userId': req.body.userId
		}).then(async function(songs) {
			if (songs.length == 0) {
				return res.status(500).send({
					"message":"Couldn't find songs: " + req.body.songIds,
					"status":"FAILURE"
				});
			} else {
				for (var i = 0; i < songs.length; i++) {
					var song = songs[i];
					resolvedMap[song.songId] = {"tags": []};
					for(var j = 0; j < song.tagIds.length; j++) {
						await Tag.findById(song.tagIds[j], function(err, tag) {
							resolvedMap[song.songId].tags.push(tag.tag);
						});
 					}
				}
			}
			return res.status(200).send(resolvedMap);
		});
	} else {
		return res.status(500).send("There was a problem adding the tag. Not all required fields present");
	}
});

router.post('/search', async function(req, res, next) {
	if (req.body.query && req.body.userId) {
		var resolvedList = [];
		var query = req.body.query;
		for(var i = 0;i < query.length; i++) {
			await Tag.find({ 
				'tag': { $in: query[i]},
				'userId': req.body.userId
			}).then(async function(tags) {
				if (tags.length == 0) {
					return res.status(500).send({
						"message":"Couldn't find songs: " + req.body.songIds,
						"status":"FAILURE"
					});
				} else {
					var tagIds = [];
					for (var j = 0; j < tags.length; j++) {
						tagIds.push(tags[j]._id);
					}
					await Song.find({
						tagIds: {"$all":tagIds}  
					}).then(function(songs) {
						if (songs.length === 0) {
							return res.status(500).send({
								"message":"There was a problem searching.",
								"status":"FAILURE"
							});
						}
						for (var j = 0; j < songs.length; j++) {
							if (!resolvedList.includes(songs[j].songId)) {
								resolvedList.push(songs[j].songId);
							}
						}
					});
				}
			});
		}
		return res.status(200).send(resolvedList);
	} else {
		return res.status(500).send("There was a problem searching. Not all required fields present");
	}
});

module.exports = router;
