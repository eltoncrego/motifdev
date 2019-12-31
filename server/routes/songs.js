const express = require('express');
const async = require('async');

const router = express.Router();
const bodyParser = require('body-parser');

router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());
const Song = require('./../models/taggedSongModel');
const Tag = require('./../models/tagModel');

/* GET all songs for testing. */
router.get('/', (req, res, next) => {
  Song.find({}, (err, songs) => {
    const songMap = {};

    songs.forEach((song) => {
      songMap[song._id] = song;
    });

    res.status(200).send(songMap);
  });
});

router.post('/tag/add', (req, res, next) => {
  console.log(req.body);
  if (req.body.songId && req.body.songName && req.body.tag && req.body.userId && req.body.artist) {
    Tag.find({
      userId: req.body.userId,
      tag: req.body.tag,
    }, (error, tag) => {
      if (tag.length == 0) {
        Tag.create([{
          userId: req.body.userId,
          tag: req.body.tag,
        }],
        (err, tagVal) => {
          Song.findOneAndUpdate({
            userId: req.body.userId,
            songId: req.body.songId,
            songName: req.body.songName,
            artist: req.body.artist,
          },
          {
            $push: { tagIds: tagVal[0]._id },
          },
          {
            new: true, upsert: true,
          },
          (err, song) => {
            if (err) {
              console.log(err);
              res.status(500).send({ status: 'FAILURE' });
            } else {
              res.status(200).send({ status: 'SUCCESS' });
            }
          });
        });
      } else {
        Song.findOneAndUpdate({
          userId: req.body.userId,
          songId: req.body.songId,
          songName: req.body.songName,
          artist: req.body.artist,
        },
        {
          $push: { tagIds: tag[0]._id },
        },
        {
          new: true, upsert: true,
        },
        (err, song) => {
          if (err) {
            console.log(err);
            res.status(500).send({ status: 'FAILURE' });
          } else {
            res.status(200).send({ status: 'SUCCESS' });
          }
        });
      }
    });
  } else {
    return res.status(500).send('There was a problem adding the tag. Not all required fields present');
  }
});

router.post('/tag/delete', (req, res, next) => {
  if (req.body.songId && req.body.tag && req.body.userId) {
    Tag.find({
      userId: req.body.userId,
      tag: req.body.tag,
    }, (error, tag) => {
      if (tag.length == 0) {
        return res.status(500).send({
          message: `Couldn't find tag: ${req.body.tag}`,
          status: 'FAILURE',
        });
      }
      Song.findOneAndUpdate({
        userId: req.body.userId,
        songId: req.body.songId,
      },
      {
        $pullAll: { tagIds: [tag[0]._id] },
      },
      {
        new: true, upsert: true,
      },
      (err, song) => {
        if (err) {
          console.log(err);
          res.status(500).send({ status: 'FAILURE' });
        } else {
          res.status(200).send({ status: 'SUCCESS' });
        }
      });
    });
  } else {
    return res.status(500).send('There was a problem adding the tag. Not all required fields present');
  }
});

router.get('/tags', (req, res, next) => {
  const songIds = req.param('songIds').split(',');
  const userId = req.param('userId');
  if (songIds && userId) {
    const resolvedMap = {};
    Song.find({
      songId: { $in: songIds },
      userId,
    }).then(async (songs) => {
      for (let i = 0; i < songs.length; i++) {
        var song = songs[i];
        resolvedMap[song.songId] = { tags: [] };
        for (let j = 0; j < song.tagIds.length; j++) {
          await Tag.findById(song.tagIds[j], (err, tag) => {
            if (tag && !resolvedMap[song.songId].tags.includes(tag.tag)) {
              resolvedMap[song.songId].tags.push(tag.tag);
            }
          });
        }
      }

      return res.status(200).send({
        data: resolvedMap,
        status: 'SUCCESS',
      });
    });
  } else {
    return res.status(500).send('There was a problem adding the tag. Not all required fields present');
  }
});

router.post('/search', async (req, res, next) => {
  if (req.body.query && req.body.userId) {
    const resolvedList = [];
    const resolvedMap = {};
    const { query } = req.body;
    for (var i = 0; i < query.length; i++) {
      await Tag.find({
        tag: { $in: query[i] },
        userId: req.body.userId,
      }).then(async (tags) => {
        if (tags.length == 0) {
          return res.status(500).send({
            message: `Couldn't find tags: ${req.body.query[i]}`,
            status: 'FAILURE',
          });
        }
        const tagIds = [];
        for (let j = 0; j < tags.length; j++) {
          tagIds.push(tags[j]._id);
        }
        await Song.find({
          tagIds: { $all: tagIds },
        }).then((songs) => {
          if (songs.length === 0) {
            return res.status(500).send({
              message: 'There was a problem searching.',
              status: 'FAILURE',
            });
          }
          for (let j = 0; j < songs.length; j++) {
            if (!resolvedList.includes(songs[j].songId)) {
              resolvedList.push(songs[j].songId);
              resolvedMap[songs[j].songId] = songs[j];
            }
          }
        });
      });
    }
    return res.status(200).send(resolvedMap);
  }
  return res.status(500).send('There was a problem searching. Not all required fields present');
});

module.exports = router;
