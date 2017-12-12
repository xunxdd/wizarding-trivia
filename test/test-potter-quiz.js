'use strict';
var proxyquire = require('proxyquire').noPreserveCache();
var chai = require('chai');
var _ = require('lodash');
const GuessWho = require('../data/guesswho.json');
const WhichSpell = require('../data/which-spell.json');
const SaysWho = require('../data/SAYS_WHO.json');

var questions = _.concat(_.take(GuessWho, 2), _.take(WhichSpell, 2) , _.take(SaysWho, 2));
questions = _.map(questions, function (question, index) {
  if (index < 2) {
    question.category = 'guess who';
  } else if(index > 2 && index< 4) {
    question.category = 'Says Who';
  } else {
    question.category = 'Which Spell';
  }
  return question;
})
var helperSpy = {
  getSessionObj: function(sessionObj) {
    return questions
  },
  setSessionObj: function() {}
};

var potterQuiz = proxyquire('../potter-quiz', {
  './helper': helperSpy
});

const expect = chai.expect;

describe('potterQuiz', function() {

  it('startPotterQuiz', function () {
    var testText = potterQuiz.startPotterQuiz();
    console.log(testText);
    //console.log('at least init correctly');
  });

  it('handleAnswerGoNext', function () {

    var testText = potterQuiz.handleAnswerGoNext('c');
  });

  it('getQuestionSet', function() {
    var questions = potterQuiz.getQuestionSet('easy', 2);
    console.log(questions);
  })
  it('getQuestion', function() {
    var questions = potterQuiz.getQuestionSet('easy', 2);
    var test = potterQuiz.getQuestion(1, questions);
    console.log(test)
  })
  it('getSaysWhoQuestion', function() {
    var test = potterQuiz.getSaysWhoQuestion(3, questions[3]);
    console.log(test)
  })

  it('calcAndRecordScore', function() {
    var helperSpy = {
      getSessionObj: function(sessionObj) {
        return 10
      },
      setSessionObj: function() {}
    };

    var potterQuiz = proxyquire('../potter-quiz', {
      './helper': helperSpy
    });
    potterQuiz.calcuScoreAndRecord(10, {})
  })

  it('goMedium', function() {
    var helperSpy = {
      getSessionObj: function(sessionObj) {
        return 80
      },
      setSessionObj: function() {}
    };

    var potterQuiz = proxyquire('../potter-quiz', {
      './helper': helperSpy
    });
    var text = potterQuiz.goMedium()
    console.log(text);
  })
});
