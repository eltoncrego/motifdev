const express = require('express');

const router = express.Router();
const bodyParser = require('body-parser');

router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());
const Tag = require('./../models/tagModel');
const Song = require('./../models/taggedSongModel');

router.post('/', (req, res) => {
  if (req.body.query && req.body.userId) {
    const query = req.body.query;

    // Song.find({ userId: req.query.userId}, (err, songs) => {
    //     songs.forEach(console.log);
    // });
    Tag.find({ userId: req.body.userId }).then((tags) => {
        const tagIdToNameMap = {};
        tags.forEach((tag) => {
            tagIdToNameMap[tag._id] = tag.tag;
        });
        Song.find({ userId: req.body.userId }).then((songs) => {
            const matchingSongs = [];
            songs.forEach((song) => {
                try {
                    if (songMatches(query, tagIdToNameMap, song)) {
                        matchingSongs.push({"songId": song.songId, "songName": song.songName});
                    }
                } catch (e) {
                    res.status(500).send({ status: 'FAILURE', message: `Failed to parse query ${query}` });
                    return;
                }
            });
            res.status(200).send({ status: 'SUCCESS', data: matchingSongs });
        });
    });
  } else {
    res.status(500).send({ status: 'FAILURE', message: 'All required data not provided' });
  }
});

function songMatches(query, tagIdToNameMap, song) {
    const songTags = song.tagIds.map(id => tagIdToNameMap[id]);
    query = query.map(x => {
        if (x === "or") {
            return "||";
        } else if (x === "and") {
            return "&&";
        } else if (x === "(" || x === ")") {
            return x;
        } else {
            return songTags.indexOf(x) !== -1;
        }
    })

    return eval(query.join(' '));
}

module.exports = router;
