'use strict';
var proxyquire = require('proxyquire').noPreserveCache();
var assert = require('assert');
var helperSpy = {
  getSessionObj: function(sessionObj) {
    return {
      currentSessionName: 'sorting-hat-quiz',
      sortingHat: {
        questions: []
      }
    }
  }
}
var emptyFunc = function() {};
var sortSpy = {
  getFirstSortingHatQuetions: function() {
    return {
      sayText: 'qusetion',
      repromptText: 'reprompt '
    }
  },
  handleAnswerGoNext: function() {
    return {
      sayText: 'next',
      repromptText: 'next '
    }
  },
  startSortingQuiz: function() {
    return {
      sayText: 'start quiz',
      repromptText: 'start quiz'
    }
  },
  getSortingHatAnswer: emptyFunc,
  getSortingHatQuestion: emptyFunc,
  getSortingResponse: function() {
    return {
      startSortingQuiz: true,
      sayText: 'say text',
      repromptText: 'reprompt ',
    }
  },
  houseChoice: emptyFunc
}
var Handler = proxyquire('../hogwarts-manager', {
  './helper': helperSpy,
  './sorting-hat-quiz': sortSpy
});
var chai = require('chai');
var should = chai.should(),
  expect = chai.expect;

describe('Hogwarts Manager', function() {
  var handler = new Handler();

  it('init', function() {
    console.log('at least init correctly');
    console.log(Handler.helper);

  });

  it('getLaunchText', function() {
    var texts = handler.getLaunchText();
    console.log(texts)
  });

  describe('handleSortingAnswerIntent', function() {
    it('handleSortingAnswerIntent when sorting hat is asked', function() {
      var texts = handler.getSortingResponseText('ss');
      console.log(texts)
    });

    it('handleSortingAnswerIntent when a specific house is picked', function() {
      var texts = handler.getSortingResponseText('a');
      console.log(texts)
    })
  });

  describe('multiple choice answer', function() {
    it('if pre sorting hat', function() {
      var session = 'pre-sorting-hat';

      var helperSpy = {
        getSessionObj: function(sessionObj) {
          return 'pre-sorting-hat'
        }
      }
      var Handler = proxyquire('../hogwarts-manager', {
        './helper': helperSpy,
        './sorting-hat-quiz': sortSpy
      });
      handler = new Handler();
      var texts = handler.getMultipleChoiceAnswerResponse('a');
      console.log(texts)
    })

    it('if sorting hat quiz', function() {

      var helperSpy = {
        getSessionObj: function(sessionObj) {
          return 'sorting-hat-quiz'
        }
      }
      var Handler = proxyquire('../hogwarts-manager', {
        './helper': helperSpy,
        './sorting-hat-quiz': sortSpy
      });
      handler = new Handler();
      var texts = handler.getMultipleChoiceAnswerResponse('a', {});
      expect(texts.sayText).to.equal('next')
    })
  });

  it('start quiz', function() {
    var texts = handler.startSortingQuiz({});
    expect(texts.sayText).to.equal('start quiz')
  })

});
