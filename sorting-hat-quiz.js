'use strict';
var _ = require('lodash');
var data = require('./data/sorting-hat-quiz.json');
var HouseQuestions = require('./data/house-related-questions');
var helper = require('./helper');
const ABCD = '1234';
const HOUSES = ['Hufflepuff', 'Slytherin', 'Ravenclaw', 'Gryffindor'];

function houseChoice() {
  var sortingHat = 'Please just say 1, 2, 3, or 4. If you are not sure, please say "Sorting Hat".';
  var houses = ['1. Gryffindor', '2. Hufflepuff', '3. Ravenclaw', '4. Slytherin'];
  return ' Which house do you think you rightfully belong to? Please choose from the following: ' +
    houses.join(', ') + ". " + sortingHat;
}

function housePick(ans) {

  var choices = {
    1: 'Gryffindor',
    2: 'Hufflepuff',
    3: 'Ravenclaw',
    4: 'Slytherin'
  }
  return _.get(choices, ans, '');
}

function startSortingQuiz(res) {
  var sayText, repromptText;
  sayText = ' Let\'s start. Please answer the following questions ';
  repromptText = sayText;
  initSortingHatQuiz(res);
  var question = getFirstSortingHatQuetions(res);
  return {
    startSortingQuiz: true,
    sayText: sayText + helper.getBreak() + question.sayText,
    repromptText: question.repromptText,
  }
}

function getSortingResponse(ans, session) {
  var selectedChoice = housePick(ans);
  var sayText, repromptText;
  if (selectedChoice) {
    sayText = "You have picked " + helper.getSound(`houses/just${selectedChoice}.mp3`) + ' Fabulous! '; //.reprompt(startText).shouldEndSession(false);
    var questionIntroText = `Now I will need to ask you one question about ${selectedChoice}. Answer it right, you will proceed; answer it wrong, you will need to be sorted by sorting hat. Let's start:  `;
    var houseQuestion = _.shuffle(HouseQuestions)[0];
    houseQuestion.houseSelected = selectedChoice;
    houseQuestion.choices = _.shuffle(houseQuestion.choices);
    setSession('houseQuestion', houseQuestion, session);
    setSession('currentSessionName', 'house-confirm', session);
    setSession('housePicked', selectedChoice, session);
    var questionText = houseQuestion.text + selectedChoice + '? ' + 'Is it: ' + helper.getChoicesText(houseQuestion) + '? Please answer 1, 2, 3, or 4. ';
    repromptText = sayText + questionText;
  }

  return {
    sayText: sayText + questionIntroText + questionText,
    repromptText: questionText,
  }
}

function shouldStartPotterQuiz(ans, session) {
  var houseQuestion = getSessionObj('houseQuestion', session);
  var answer = houseQuestion.answer;
  var houseSelected = houseQuestion.houseSelected;
  var correctAnswer = answer[houseSelected];
  var index = ABCD.indexOf(ans);
  var sayText, repromptText;
  return {
    startPotterQuiz: houseQuestion.choices[index] === correctAnswer
  }
}

function getFirstSortingHatQuetions(session) {
  var hatSession = getSessionObj('sortingHat', session);
  var questionSet = hatSession.questions;
  return getSortingHatQuestion(1, questionSet);
}

function getSortingHatQuestion(index, questions) {
  var question = questions[index - 1];

  if (!question) {
    throw new Error(`no question found for ${index}`, index);
  }
  var sayText, repromptText;
  var choiceText = '';
  _.map(question.choices, function(question, index) {
    choiceText = choiceText + ABCD.charAt(index) + ': ' + question.text + '; ';
  });
  var questionText = `<p>Question ${index}:</p>  <p>${question.question}</p>  Please choose from the following: ${choiceText}`;
  return {
    sayText: questionText,
    repromptText: questionText
  };
}

function getSortingHatAnswer(ans, choices) {
  var choiceIndex = ABCD.indexOf(ans);
  return choices[choiceIndex];
}

function handleAnswerGoNext(ans, session) {
  var hatSession = getSessionObj('sortingHat', session);
  var questionSet = hatSession.questions;
  var currentQuestionIndex = hatSession.currentQuestionIndex || 1;
  var currentQuestion = questionSet[currentQuestionIndex - 1];
  var choices = currentQuestion.choices;
  var answer = getSortingHatAnswer(ans, choices);
  console.log('the answer is', answer);
  recordAnswerInSession(answer, session);
  if (currentQuestionIndex >= questionSet.length) {
    return completeSortingHatQuiz(session);
  }

  var nextQuestionIndex = currentQuestionIndex + 1;
  hatSession = getSessionObj('sortingHat', session);
  hatSession.currentQuestionIndex = nextQuestionIndex;
  setSession('sortingHat', hatSession, session);
  return getSortingHatQuestion(nextQuestionIndex, questionSet);
}

function recordAnswerInSession(choicePicked, session) {
  var point = choicePicked.point;
  var hatSession = getSessionObj('sortingHat', session);
  if (!_.includes(HOUSES, point)) {
    throw new Error(`darn, something is wrong, this house ${point} does not exist`, point);
  }
  var value = hatSession.houseTally[point];
  hatSession.houseTally[point] = parseInt(value) + 1;
  console.log('exaga value', point + '=', hatSession.houseTally[point], hatSession)

  setSession('sortingHat', hatSession, session);
}

function completeSortingHatQuiz(session) {
  var hatSession = getSessionObj('sortingHat', session);
  var tally = hatSession.houseTally;
  var picks = _.map(Object.keys(tally), function(key) {
    return {
      name: key,
      value: tally[key]
    }
  })
  var maxPick = _.maxBy(picks, function(pick) {
    return pick.value;
  });
  setSession('housePicked', maxPick.name, session);
  setSession('sortingHat', null, session);
  var houseName = maxPick.name;
  var text = 'Fabulous. The house for you is ' + helper.getSound(`houses/just${houseName}.mp3`, houseName);
  return {
    sortingHatComplete: true,
    sayText: text,
    repromptText: text
  }
}

function getSessionObj(key, session) {
  return helper.getSessionObj(key, session);
}

function setSession(key, value, session) {
  helper.setSessionObj(key, value, session);
}

function initSortingHatQuiz(session) {
  setSession('sortingHat', {
    //currentSessionName: 'sorting-hat-quiz',
    questions: _.shuffle(data),
    currentQuestionIndex: 1,
    houseTally: {
      'Gryffindor': 0,
      'Ravenclaw': 0,
      'Slytherin': 0,
      'Hufflepuff': 0,
    }
  }, session);
}

module.exports = {
  getFirstSortingHatQuetions: getFirstSortingHatQuetions,
  shouldStartPotterQuiz: shouldStartPotterQuiz,
  startSortingQuiz: startSortingQuiz,
  handleAnswerGoNext: handleAnswerGoNext,
  getSortingHatAnswer: getSortingHatAnswer,
  getSortingHatQuestion: getSortingHatQuestion,
  getSortingResponse: getSortingResponse,
  houseChoice: houseChoice
};
