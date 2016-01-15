var config = require('./config/config');
var filteredFollowback = require('filtered-followback');

filteredFollowback(
  {
    twitterCreds: config.twitter,
    neverUnfollow: [
      3247937115,
      2566358196,
      3236234039,
      3121911275,
      3045096328,
      2984664838,
      2948121401,
      3257074863,
      4105513965,
      1533777176
    ],
    blacklist: [
    ]
  },
  reportResults
);

function reportResults(error, followed, unfollowed, filteredOut) {
  if (error) {
    console.log(error);
  }
  console.log('Followed:', followed);
  console.log('Unfollowed:', unfollowed);
  console.log('Filtered out:', filteredOut);
}