var probable = require('probable');
var callNextTick = require('call-next-tick');
var getRandomVerbs = require('./get-random-verbs');
var changeCase = require('change-case');

var exhortationTable = probable.createRangeTable([
  [
    [0, 3],
    {
      action: 'jump up and down',
      conclusion: 'Then sit – right back down.'
    }
  ],
  [
    [4, 4],
    {
      action: 'spin all around',
      conclusion: 'Then sit – right back down.'
    }
  ],
  [
    [5, 5],
    {
      action: 'touch the ground',
      conclusion: 'Then sit! Right back down.'
    }
  ]
]);

function generateVerse(opts, done) {
  var name;

  if (opts) {
    name = opts.name;
  }

  var exhortation;

  if (probable.roll(2) === 0) {
    getRandomVerbs(formatAsExhortation);
  }
  else {
    callNextTick(formatVerse, null, exhortationTable.roll());
  }

  function formatAsExhortation(error, verbs) {
    var exhortation = {};
    if (error) {
      done(error);
    }
    else {
      if (verbs.length > 0) {
        exhortation.action = verbs[0];
        exhortation.action += ' ' + getActionElaboration();
      }
      if (verbs.length > 1) {
        exhortation.conclusion = `Then ${verbs[1]}! Right back down.`;
      }
      formatVerse(error, exhortation);
    }
  }

  function formatVerse(error, exhortation) {
    var verse;

    if (error) {
      done(error);
    }
    else {
      var actionSentence = changeCase.upperCaseFirst(`${exhortation.action}!`);
      verse = [
        `♪ If your name is @${name}, ${exhortation.action}!`,
        actionSentence,
        actionSentence,
        `If your name is @${name}, ${exhortation.action}!`,
        `${exhortation.conclusion} ♪`
      ];
    }
    done(error, verse);
  }
}

function getActionElaboration() {
  return probable.roll(2) === 0 ? 'all around' : 'up and down';
}

function spin(name) {
  return [
    `If your name is @${screenName}, jump up and down!`,
    `Jump up and down!`,
    `Jump up and down!`,
    `If your name is @${screenName}, jump up and down!`,
    `Then sit – right back down.`
  ];
}

function touch(name) {
  return [
    `If your name is @${screenName}, jump up and down!`,
    `Jump up and down!`,
    `Jump up and down!`,
    `If your name is @${screenName}, jump up and down!`,
    `Then sit – right back down.`
  ];
}

module.exports = generateVerse;
