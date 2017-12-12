'use strict';
var _ = require('lodash');
var helper = require('./helper');
var sortingHelper = require('./sorting-hat-quiz');
var quizHelper = require('./potter-quiz');

function HogwartsManager() {
  var getStartedText = 'Welcome. Now let\'s start.';

  function getLaunchText(res) {
    var sortingQuestions = sortingHelper.houseChoice();
    var startText = getStartedText + sortingQuestions;
    setSession('currentSessionName', 'pre-sorting-hat', res);
    return {
      sayText: startText,
      repromptText: startText
    }
  }

  function startSortingQuiz(res) {
    setSession('currentSessionName', 'sorting-hat', res);

    var response = sortingHelper.startSortingQuiz(res);
    return {
      sayText: response.sayText,
      repromptText: response.repromptText
    }
  }

  function getSortingResponseText(answer, session) {
    var response = sortingHelper.getSortingResponse(answer, session);

    console.log('response', response.sayText)

    var sayText = response.sayText;
    var repromptText = response.repromptText;
    return {
      sayText: sayText,
      repromptText: repromptText
    }
  }

  function getSessionObj(key, session) {
    return helper.getSessionObj(key, session);
  }

  function setSession(key, value, session) {
    helper.setSessionObj(key, value, session);
  }

  function onYesIntent(res) {
    var currentSessionName = getSessionObj('currentSessionName', res);
    if (currentSessionName === 'potter-quiz') {
      return quizHelper.getFirstQuestion(res);
    }
    throw new Error('why i get an yes here')
    //return
  }

  function getMultipleChoiceAnswerResponse(ans, session) {

    var currentSessionName = getSessionObj('currentSessionName', session);
    switch (currentSessionName) {
      case 'pre-sorting-hat':
        console.log('flow', 'pre-sorting-hat', currentSessionName);
        return sortingHelper.getSortingResponse(ans, session);
      case 'sorting-hat':
        console.log('flow', 'sorting-hat', currentSessionName);
        var response = sortingHelper.handleAnswerGoNext(ans, session);
        console.log(response.sortingHatComplete, 'done sorting');
        if (response.sortingHatComplete) {
          setSession('currentSessionName', 'potter-quiz', session);
          var quizStart = quizHelper.startPotterQuiz(session);
          response.sayText = response.sayText + helper.getBreak() + quizStart.sayText;
          response.repromptText = response.repromptText + helper.getBreak() + quizStart.repromptText;
        }
        return response;
      case 'house-confirm':
        console.log('flow', 'house confir', currentSessionName);
        var result = sortingHelper.shouldStartPotterQuiz(ans, session);
        if (result.startPotterQuiz) {
          setSession('currentSessionName', 'potter-quiz', session);
          setSession('houseQuestion', null, session);
          var quizStart = quizHelper.startPotterQuiz(session);
          var response = {};
          response.sayText = helper.getSound('cheers-boos/applause.mp3') + quizStart.sayText;
          response.repromptText = quizStart.repromptText;
          return response;
        }
        var preTxt = 'Hmm. The answer is not correct. Let\' get some help from the sorting hat. ';
        var response = startSortingQuiz(session);
        response.sayText = preTxt + response.sayText;
        return response;

      case 'potter-quiz':
        console.log('flow', 'potter quize', currentSessionName);
        var response = quizHelper.handleAnswerGoNext(ans, session);
        return response;
      default:
        console.log('defautl');
        return sortingHelper.getSortingResponse(ans, session);
    }
  }

  return {
    getLaunchText: getLaunchText,
    startSortingQuiz: startSortingQuiz,
    onYesIntent: onYesIntent,
    getMultipleChoiceAnswerResponse: getMultipleChoiceAnswerResponse
  }
}

module.exports = HogwartsManager;
