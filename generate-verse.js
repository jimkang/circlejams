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
      conclusion: 'Then sit – right back down.',
      formatter: formatVerse
    }
  ],
  [
    [4, 4],
    {
      action: 'spin all around',
      conclusion: 'Then sit – right back down.',
      formatter: formatVerse
    }
  ],
  [
    [5, 5],
    {
      action: 'touch the ground',
      conclusion: 'Then sit! Right back down.',
      formatter: formatVerse
    }
  ],
  [
    [6, 7],
    {
      verb: 'jump',
      pastTenseVerb: 'jumped',
      adverb: 'high',
      formatter: formatHaveAFriendVerse
    }
  ],
  [
    [8, 8],
    {
      verb: 'dance',
      pastTenseVerb: 'danced',
      adverb: 'great',
      formatter: formatHaveAFriendVerse
    }
  ],
  [
    [9, 9],
    {
      verb: 'scream',
      pastTenseVerb: 'screamed',
      adverb: 'piercingly',
      formatter: formatHaveAFriendVerse
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
    var fixedExhortationKit = fixedExhortationTable.roll();
    callNextTick(fixedExhortationKit.formatter, null, name, fixedExhortationKit, done);
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
        formatVerse(error, name, exhortation, done);
      }
    }
  }  
}

function formatVerse(error, name, exhortation, done) {
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

function formatHaveAFriendVerse(error, name, kit, done) {
  if (error) {
    done(error);
  }
  else {
    var friendElaboration = probable.pickFromArray([
      'who\'s pretty cool',
      'in Toddler 1',
      'in Toddler 2'
    ]);

    var verb = kit.verb;
    var capsVerb = changeCase.upperCaseFirst(verb);
    var verse = [
      `♪ I have friend ${friendElaboration}, and @${name} is their na-aaaame!`,
      `${capsVerb}! ${capsVerb}! ${capsVerb} ${verb} ${verb}!`,
      `${capsVerb}! ${capsVerb}! ${capsVerb} ${verb} ${verb}!`,
      `@${name} ${kit.pastTenseVerb} so ${kit.adverb}! ♪`
    ];
  }
  done(error, verse);
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
