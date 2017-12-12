'use strict';
var _ = require('lodash');
const BASE_URI = 'https://s3.ca-central-1.amazonaws.com/audios-my/hp-soundclips/';
const ABCD = '1234';

function isBadAnswer(ans) {
  var ans = parseInt(ans) + '';
  var choiceIndex = ABCD.indexOf(ans);
  return (!ans || ans.length !== 1 || ABCD.indexOf(ans) < 0);
}

function getSound(name) {
  return '<audio src="' + BASE_URI + name.replace(/ /g, '+') + '" />';;
}

function getSessionObj(key, session) {
  if (session && session.sessionObject && session.sessionObject.get) {
    return session.sessionObject.get(key);
  }
}

function setSessionObj(key, value, session) {
  if (session && session.sessionObject && session.sessionObject.set) {
    session.sessionObject.set(key, value);
  }
}

function getBreak(level) {
  level = level || 'medium';
  return `<break strength="${level}" />`;
}

function getEmphasis(text, level) {
  level = level || 'moderate';
  return `<emphasis level="${level}">${text}</emphasis>`;
}

function getChoicesText(question) {
  var choiceText = ''
  var choices = _.map(question.choices, function(choice, index) {
    choiceText = choiceText + ABCD.charAt(index) + ': ' + choice + '; ';
  });
  return choiceText;
}

module.exports =  {
  isBadAnswer: isBadAnswer,
  getChoicesText: getChoicesText,
  getSound: getSound,
  getBreak: getBreak,
  getEmphasis: getEmphasis,
  getSessionObj: getSessionObj,
  setSessionObj: setSessionObj
}
