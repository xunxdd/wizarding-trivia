'use strict';
var proxyquire = require('proxyquire').noPreserveCache();
var data = require('../data/sorting-hat-quiz.json');
var chai = require('chai');
var helperSpy = {
  getSessionObj: function(sessionObj) {
    return {
        questions: data,
        currentQuestionIndex: 1,
        houseTally: {
          'Gryffindor': 0,
          'Ravenclaw': 0,
          'Slytherin': 0,
          'Hufflepuff': 0,
        }
    }
  },
  setSessionObj: function() {}
};

var helper = proxyquire('../sorting-hat-quiz', {
  './helper': helperSpy
});

const expect = chai.expect;

describe('Sorting Hat Quiz', function() {

  it('init', function () {
    console.log('at least init correctly');
  });

  it('getSortingResponse no house picked', function() {
    var texts = helper.getSortingResponse('sss');
    console.log(texts);
  })

  it('getSortingResponse a house is picked', function() {
    var texts = helper.getSortingResponse('a');
    console.log(texts);
  })

  it.only('getSortingHatQuestion', function() {
    console.log(data.length)
    var texts = helper.getSortingHatQuestion(1, data);
    console.log(texts);
  })

  describe('handleAnswerGoNext', function() {
    it('when invalid choice reprompt ', function() {
      var response = helper.handleAnswerGoNext('agag', {});
      expect(response.sayText).to.equal('Sorry, please answer A or B or C or D');
    })

    it('when valid choice given set session score ask for next question', function() {
      var response = helper.handleAnswerGoNext('a',  {});
      expect(response.sayText.indexOf('Question 2')).to.equal(0);
    })

    it('when all questions are answered, report result', function(){
      var helperSpy = {
        getSessionObj: function(sessionObj) {
          return {
              questions: data,
              currentQuestionIndex: 5,
              houseTally: {
                'Gryffindor': 0,
                'Ravenclaw': 0,
                'Slytherin': 0,
                'Hufflepuff': 0,
              }
          }
        },
        setSessionObj: function() {}
      };

      var helper = proxyquire('../sorting-hat-quiz', {
        './helper': helperSpy
      });
      var response = helper.handleAnswerGoNext('a', {});
      console.log('wha', response.sayText)
      expect(response.sayText.indexOf('You have picked')).to.be.above(0);
    });

  })

  describe('getSortingResponse', function() {
    it('when a house is picked', function() {

      var response = helper.getSortingResponse('a', {});
      console.log(response);
    })

    it('should start potter', function() {

      var response = helper.shouldStartPotterQuiz('a', {});
      console.log(response);
    })

    it('should start potter', function() {

      var response = helper.shouldStartPotterQuiz('b', {});
      console.log(response);
    })
  });
});
