var config = require('./config/config');
var probable = require('probable');
var callNextTick = require('call-next-tick');
var getRandomVerbs = require('./get-random-verbs');
var changeCase = require('change-case');
var WanderGoogleNgrams = require('wander-google-ngrams');
var createIsCool = require('iscool');

var iscool = createIsCool();

var fixedExhortationTable = probable.createRangeTable([
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

var exhortationTypeTable = probable.createTableFromDef({
  '0': 'fixed',
  '1': 'random-verb-fixed-elaboration',
  '2': 'random-verb-ngram-elaboration'
});

function generateVerse(opts, done) {
  var name;

  if (opts) {
    name = opts.name;
  }

  var exhortation;

  var exhortationType = exhortationTypeTable.roll();
  if (exhortationType === 'fixed') {
    callNextTick(formatVerse, null, fixedExhortationTable.roll());
  }
  else {
    getRandomVerbs(formatAsExhortation);
  }

  function formatAsExhortation(error, verbs) {
    var exhortation = {};
    if (error) {
      done(error);
    }
    else if (!verbs) {
      done(new Error('Could not get any verbs.'));
    }
    else {
      getActionElaboration(
        exhortationType, verbs[0], addElaborationAndConclusion
      );
    }

    function addElaborationAndConclusion(error, elaboration) {
      if (error) {
        done(error);
      }
      else {
        exhortation.action = verbs[0];
        exhortation.action += ' ' + elaboration;

        if (verbs.length > 1) {
          exhortation.conclusion = `Then ${verbs[1]}! Right back down.`;
        }
        formatVerse(error, exhortation);
      }
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

function getActionElaboration(exhortationType, verb, done) {
  if (exhortationType === 'random-verb-ngram-elaboration') {
    getNgramElaboration(verb, done);
  }
  else {
    // 'random-verb-fixed-elaboration'
    callNextTick(
      done, null, probable.roll(2) === 0 ? 'all around' : 'up and down'
    );
  }
}

function getNgramElaboration(verb, done) {
  var createWanderStream = WanderGoogleNgrams({
    wordnikAPIKey: config.wordnikAPIKey
  });

  var opts = {
    word: verb,
    direction: 'forward',
    repeatLimit: 1,
    tryReducingNgramSizeAtDeadEnds: true,
    shootForASentence: true,
    maxWordCount: 20,
    forwardStages: [
      {
        name: 'pushedVerb',
        needToProceed: ['noun', 'pronoun', 'noun-plural', 'adjective'],
        lookFor: '*_NOUN',
        posShouldBeUnambiguous: true
      },
      {
        name: 'done'
      }
    ]
  };
  var stream = createWanderStream(opts);
  var phrase = '';

  stream.on('error', reportError);
  stream.on('end', passPhrase);
  stream.on('data', saveWord);

  function saveWord(word) {
    if (word !== verb) {
      if (!iscool(word)) {
        console.log('Uncool word:', word);
      }
      else {
        if (phrase.length > 0) {
          phrase += ' ';
        }
        phrase += word;
      }
    }
  }

  function reportError(error) {
    // Don't stop everything for a stream error.
    console.log(error);
  }

  function passPhrase() {
    done(null, phrase);
  }
}

module.exports = generateVerse;
