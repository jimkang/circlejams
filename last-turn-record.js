var level = require('level');
var Sublevel = require('level-sublevel')
var moment = require('moment');

function LastTurnRecord(opts) {
  var dbLocation;

  if (opts) {
    dbLocation = opts.dbLocation;
  }

  var dbOpts = {
    valueEncoding: 'utf8'
  };
  var db = Sublevel(level(dbLocation, dbOpts));
  var turns = db.sublevel('turns');

  function recordTurn(userId, date, done) {
    turns.put(userId, date.toISOString(), done);
  }

  function getLastTurnDateForUser(userId, done) {
    debugger;
    turns.get(userId, reconstituteDate);

    function reconstituteDate(error, dateString) {
      debugger;
      if (error) {
        done(error);
      }
      else {
        done(error, new Date(dateString));
      }
    }
  }

  function userDidHaveATurnRecently(userId, span, spanUnit, done) {
    debugger;
    getLastTurnDateForUser(userId, compareDateToSpan);

    function compareDateToSpan(error, date) {
      debugger;
      if (error) {
        if (error.type === 'NotFoundError') {
          done(null, false);
        }
        else {
          done(error);
        }
      }
      else {
        var nTimeAgo = moment().subtract(span, spanUnit);
        done(null, (moment(date).isBefore(nTimeAgo)));
      }
    }
  }

  return {
    recordTurn: recordTurn,
    getLastTurnDateForUser: getLastTurnDateForUser,
    userDidHaveATurnRecently: userDidHaveATurnRecently
  };
}

module.exports = LastTurnRecord;
