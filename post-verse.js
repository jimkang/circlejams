// require('longjohn');
var config = require('./config/config');
var callNextTick = require('call-next-tick');
var Twit = require('twit');
var async = require('async');
var pluck = require('lodash.pluck');
var probable = require('probable');
var postTweetChain = require('post-tweet-chain');
var generateVerse = require('./generate-verse');
var LastTurnRecord = require('./last-turn-record');

var lastTurnRecord = LastTurnRecord({
  dbLocation: __dirname + '/data/last-turns.db'
});

var callOutId;

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
  var ids = body.ids.slice();
  var id = probable.pickFromArray(ids).toString();
  lastTurnRecord.userDidHaveATurnRecently(id, 1, 'd', decideToUse);

  function decideToUse(error, hadATurnRecently) {
    if (error) {
      done(error);
    }
    else if (hadATurnRecently) {
      console.log(id, 'had a turn recently. Trying again.');
      ids.splice(ids.indexOf(id), 1);
      if (ids.length > 0) {
        id = probable.pickFromArray(ids).toString();
        callNextTick(
          lastTurnRecord.userDidHaveATurnRecently, id, 2, 'd', decideToUse
        );
      }
      else {
        done(new Error('Everyone has had a turn recently.'));
      }
    }
    else {
      callOutId = id;
      done();
    }
  }
}

function getFollower(done) {
  var lookupOpts = {
    user_id: callOutId
  };
  twit.post('users/lookup', lookupOpts, done);
}

function getScreenName(body, res, done) {
  if (Array.isArray(body) && body.length > 0) {
    callNextTick(done, null, body[0].screen_name);
  }
  else {
    callNextTick(done, new Error('Could not find screen_name.'));
  }
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
  else {
    // Technically, the user wasn't replied to, but good enough.
    lastTurnRecord.recordTurn(callOutId, new Date(), reportRecording);
  }
}

function reportRecording(error) {
  if (error) {
    console.log(error, error.stack);

    if (data) {
      console.log('data:', data);
    }
  }
  else {
    console.log('Recorded turn for', callOutId);
  }
}
