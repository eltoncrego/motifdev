var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());
var Tag = require('./../models/tagModel');

/* GET all tag for testing. */
router.post('/', function (req, res, next) {
  if (req.body.userId) {
    Tag.find({ userId: req.body.userId }, function (err, tags) {
      var tagMap = {};

      tags.forEach(function (tag) {
        tagMap[tag._id] = tag;
      });

      res.status(200).send(tagMap);
    });
  } else {
    res.status(500).send({ "status": "FAILURE", "message": "All required data not provided" });
  }
});


router.post('/create', function (req, res, next) {
  if (req.body.tag && req.body.userId) {
    Tag.find({
      userId: req.body.userId,
      tag: req.body.tag
    },
      function (err, tags) {
        if (tags.length) {
          res.status(500).send({ "status": "FAILURE", "message": "Tag already exists" });
        } else {
          Tag.create([{
            userId: req.body.userId,
            tag: req.body.tag
          }],
            function (err, tagVal) {
              if (err) {
                console.log(err);
                res.status(500).send({ "status": "FAILURE" });
              } else {
                res.status(200).send({ "status": "SUCCESS" });
              }
            });
        }
      });
  } else {
    return res.status(500).send("There was a problem adding the tag. Not all required fields present")
  }
});

router.post('/edit', function (req, res, next) {
  if (req.body.newTag && req.body.oldTag && req.body.userId) {
    Tag.findOneAndUpdate({
      userId: req.body.userId,
      tag: req.body.oldTag
    },
      {
        tag: req.body.newTag
      },
      {
        new: true, upsert: true
      },
      function (err, song) {
        if (err) {
          console.log(err);
          res.status(500).send({ "status": "FAILURE" });
        } else {
          res.status(200).send({ "status": "SUCCESS" });
        }
      });


  } else {
    return res.status(500).send("There was a problem adding the tag. Not all required fields present")
  }

});

router.post('/delete', function (req, res, next) {
  if (req.body.tag && req.body.userId) {
    Tag.findOneAndDelete({
      userId: req.body.userId,
      tag: req.body.tag
    }, function (err, tag) {
      if (err) {
        console.log(err);
        res.status(500).send({ "status": "FAILURE" });
      } else {
        res.status(200).send({ "status": "SUCCESS" });
      }
    });
  } else {
    return res.status(500).send("There was a problem adding the tag. Not all required fields present");
  }

});


module.exports = router;
