'use strict';
var _ = require('lodash');
const GuessWho = require('../data/guessWho.json');
const WhichSpell = require('../data/which-spell.json');
const SaysWho = require('../data/SAYS_WHO.json');

function cleanUpSpell() {
  var charmQuestions = getSpellQuestions(_.cloneDeep(WhichSpell), 'Charm');
  var curseQuestions = getSpellQuestions(_.cloneDeep(WhichSpell), 'Curse');
  var spellQuestions = getSpellQuestions(_.cloneDeep(WhichSpell), 'Spell');
  return _.concat(charmQuestions, curseQuestions, spellQuestions);
}

function getSpellQuestions(data, type) {
  var spellNames =  _.map(data, 'Incantation');
  var array = _.filter(data, function(d) {
    return d.Type === type;
  });

  return  _.map(array, function(charm) {
      var question = {};
      question.text = 'Which spell can ' +  charm.Effect + '?';
      question.answer = charm.Incantation;
      var choices = _.reject(spellNames, function(name) {
        return name === charm.Incantation;
      });
      question.choices = _.take(_.shuffle(choices), 3);
      question.choices.push(question.answer);
      question.choices = _.shuffle(question.choices);
      question.level = charm.level;
      question.type = type;
      return question;
  });
}

function addLevelToSaysWho() {
  var array = SaysWho;
  array = _.map(array, function (d, index) {
    if (index< 12) {
      d.level = 'easy'
    } else if(index > 12 && index < 40) {
      d.level = 'medium';
    } else {
      d.level = 'hard';
    }
    return d;
  })
  console.log(JSON.stringify (array));
}
function cleanUpSaysWho() {
  var data = _.cloneDeep(SaysWho);
  var pathMap = {
    'Harry Potter and the Deathly Hallows - Part 1': 'deathly-hollow1',
    'Half Blood Prince': 'half-blood-prince',
    'prisoner of azkaban': 'prisoner-of-azkaban',
    'goblet-of-fire': 'goblet-of-fire',
    'sorcerer-stone': 'socererers-stone',
    'order-of-pheonix': 'order-of-phoenix'
  };
  var movieMap = {
    'Harry Potter and the Deathly Hallows - Part 1': 'Harry Potter and the Deathly Hallows - Part 1',
    'Half Blood Prince': 'Harry Potter and the Half-Blood Prince',
    'prisoner of azkaban': 'Harry Potter and the Prisoner of Azkaban',
    'goblet-of-fire': 'Harry Potter and the Goblet of Fire',
    'sorcerer-stone': 'Harry Potter and the Sorcerer\'s Stone',
    'order-of-pheonix': 'Harry Potter and the Order of the Phoenix'
  };
  var whos = _.map(data, function(d) {
    d.who = d.who.trim().toLowerCase();
    return d.who;
  });

  var choices = ['Ginny Weasley','Gilderoy Lockhart', 'Horace Slughorn','Molly Weasley', 'Professor McGonagall','Lucius Malfoy'];
  whos =_.uniq(_.concat(whos, choices)) ;
  _.map(data, function(d) {
    if (!d.file.endsWith('.mp3') && !d.file.endsWith('.wav')){
      d.file = d.file + '.mp3';
    }
    if (d.file.split('/').length <2) {
      var folder = pathMap[d.movie];
      var movie = movieMap[d.movie];
      d.file = (folder || '') + '/' + d.file;
      d.movie = movie;
    }

    d.file = d.file.trim();
    d.movie = d.movie.trim();
    d.who = d.who.trim();
    d.choices = _.reject(whos, function(choice) {
      return choice.toLowerCase() === d.who.toLowerCase();
    })

    d.choices = _.take(d.choices, 3) ;
    d.choices.push(d.who);
    d.choices = _.shuffle(d.choices);
    return d;
  });
  console.log(data)
  //console.log(whos);
  return data;
}

module.exports = {
  cleanUpSaysWho: cleanUpSaysWho,
  cleanUpSpell: cleanUpSpell,
  addLevelToSaysWho: addLevelToSaysWho
};
