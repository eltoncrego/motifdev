const express = require('express');

const router = express.Router();
const bodyParser = require('body-parser');

router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());
const Tag = require('./../models/tagModel');

/* GET all tag for testing. */
router.get('/', (req, res) => {
  if (req.query.userId) {
    Tag.find({ userId: req.query.userId }, (err, tags) => {
      const tagMap = {};

      tags.forEach((tag) => {
        tagMap[tag._id] = tag;
      });

      res.status(200).send({ status: 'SUCCESS', data: tagMap });
    });
  } else {
    res.status(500).send({ status: 'FAILURE', message: 'All required data not provided' });
  }
});


router.post('/create', (req, res, next) => {
  if (req.body.tag && req.body.userId) {
    Tag.find({
      userId: req.body.userId,
      tag: req.body.tag,
    },
    (err, tags) => {
      if (tags.length) {
        res.status(500).send({ status: 'FAILURE', message: 'Tag already exists' });
      } else {
        Tag.create([{
          userId: req.body.userId,
          tag: req.body.tag,
        }],
        (err, tagVal) => {
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

router.post('/edit', (req, res) => {
  if (req.body.newTag && req.body.oldTag && req.body.userId) {
    Tag.findOneAndUpdate({
      userId: req.body.userId,
      tag: req.body.oldTag,
    },
    {
      tag: req.body.newTag,
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
  } else {
    return res.status(500).send('There was a problem adding the tag. Not all required fields present');
  }
});

router.post('/delete', (req, res) => {
  if (req.body.tag && req.body.userId) {
    Tag.findOneAndDelete({
      userId: req.body.userId,
      tag: req.body.tag,
    }, (err, tag) => {
      if (err) {
        console.log(err);
        res.status(500).send({ status: 'FAILURE' });
      } else {
        res.status(200).send({ status: 'SUCCESS' });
      }
    });
  } else {
    return res.status(500).send('There was a problem adding the tag. Not all required fields present');
  }
});


module.exports = router;
