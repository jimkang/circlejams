var config = require('./config/config');
var callNextTick = require('call-next-tick');
var Twit = require('twit');
var async = require('async');
var pluck = require('lodash.pluck');
var probable = require('probable');
var postTweetChain = require('post-tweet-chain');
var generateVerse = require('./generate-verse');

var dryRun = false;
if (process.argv.length > 2) {
  dryRun = (process.argv[2].toLowerCase() == '--dry');
}

var twit = new Twit(config.twitter);

async.waterfall(
  [
    getFollowerIds,
    pickFollowerId,
    getFollower,
    getScreenName,
    composeVerse,
    postTweet
  ],
  wrapUp
);

function getFollowerIds(done) {
  twit.get('followers/ids', done);
}

function pickFollowerId(body, res, done) {
  callNextTick(done, null, probable.pickFromArray(body.ids));
}

function getFollower(id, done) {
  var lookupOpts = {
    user_id: id
  };
  twit.post('users/lookup', lookupOpts, done);
}

function getScreenName(body, res, done) {
  callNextTick(done, null, body[0].screen_name);
}

function composeVerse(screenName, done) {
  var opts = {
    name: screenName
  };
  generateVerse(opts, done);
}

function postTweet(verse, done) {
  if (dryRun) {
    console.log('Would have tweeted:', verse);
    callNextTick(done);
  }
  else {
    var opts = {
      twit: twit,
      parts: verse
    };
    postTweetChain(opts, done);
  }
}

function wrapUp(error, data) {
  if (error) {
    console.log(error, error.stack);

    if (data) {
      console.log('data:', data);
    }
  }
}
