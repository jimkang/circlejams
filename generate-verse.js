var probable = require('probable');
var callNextTick = require('call-next-tick');

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
      conclusion: 'Then sit – right back down.'
    }
  ]
]);

function generateVerse(opts, done) {
  var name;

  if (opts) {
    name = opts.name;
  }

  var exhortation = exhortationTable.roll();

  var verse = [
    `If your name is @${name}, ${exhortation.action}!`,
    `${exhortation.action}!`,
    `${exhortation.action}`,
    `If your name is @${name}, ${exhortation.action}!`,
    `${exhortation.conclusion}`
  ];

  callNextTick(done, null, verse);
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
