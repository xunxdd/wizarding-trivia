'use strict';
var _ = require('lodash');
var helper = require('./helper');
const ABCD = '1234';
const GuessWho = require('./data/guesswho.json');
const WhichSpell = require('./data/which-spell.json');
const SaysWho = require('./data/SAYS_WHO.json');
const CAT_GUESS_WHO = 'Guess Who';
const CAT_Says_WHO = 'Says Who';
const CAT_Which_Spell = 'Which Spell';
const easy = 'easy';
const medium = 'medium';
const hard = 'hard';
const categories = [CAT_GUESS_WHO, CAT_Says_WHO, CAT_Which_Spell];
const medCategories = [CAT_GUESS_WHO, CAT_Says_WHO, CAT_Which_Spell];
const passScore = {
  easy: 30,
  medium: 40,
  hard: 40
};

function startPotterQuiz(res) {
  var categoryText = helper.getEmphasis(_.join(categories, ', '));
  var introductoryText = 'Welcome. You now have entered the beginner zone of Harry Potter Challenge. ' +
    ' You will be asked 2 questions from each of following categories:  ' + categoryText + '. ' +
    ' Each question is worth 10 points. ' +
    ' If you earn 30 points or more, you are allowed to move on to the Battle Field zone; ' +
    ' If you earn less than 30 points, you are out of the game. Are you ready?  ';

  startQuizSession(res, easy);
  setSession('min-level-score', passScore[easy], res);

  return {
    sayText: introductoryText,
    repromptText: introductoryText
  }
}

function getFirstQuestion(res) {
  var questionSet = getSessionObj('questions', res);
  return getQuestion(1, questionSet);
}

function getQuestion(index, questions) {
  var question = questions[index - 1];

  if (!question) {
    throw new Error(`no question found for ${index}`, index);
  }
  if (question.category === CAT_Says_WHO) {
    return getSaysWhoQuestion(index, question);
  }
  var choicesText = helper.getChoicesText(question);
  console.log('this is the question', questions[0], questions.length)
  var categoryText = helper.getEmphasis(question.category);
  var breakText = helper.getBreak();
  var questionText = `Question ${index}:  ${question.text} ${breakText} Please choose from the following: ${choicesText}`;

  return {
    sayText: questionText,
    repromptText: questionText
  };
}

function getSaysWhoQuestion(index, question) {
  var sayText, repromptText;
  var choices = helper.getChoicesText(question);
  var clip = 'Who is the character in the following sound clip? ' + helper.getBreak() + helper.getSound(question.file);
  var questionText = `Question ${index}:  ${clip} Please choose from the following: ${choices}`;
  return {
    sayText: questionText,
    repromptText: questionText
  };
}

function startQuizSession(res, level) {
  setSession('zone-level', level, res);
  var questions = getQuestionSet(level, 2);
  var score = getSessionObj('score', res);
  setSession('questions', questions, res);
  setSession('currentQuestionIndex', 1, res);
  setSession('score', parseInt(score) || 0, res);
}

function calcuScoreAndRecord(points, res) {
  var score = getSessionObj('score', res);
  console.log(score)
  var score = parseInt(score);
  score = score + points;
  console.log(score)
  setSession('score', score, res);
}

function getQuestionSet(level, number) {
  var questions1 = getQuestionsFromCategory(GuessWho, level, number, CAT_GUESS_WHO);
  var questions2 = getQuestionsFromCategory(SaysWho, level, number, CAT_Says_WHO);
  var questions3 = getQuestionsFromCategory(WhichSpell, level, number, CAT_Which_Spell);
  return _.concat(questions1, questions2, questions3);
}

function getQuestionsFromCategory(array, level, number, category) {
  var questions = _.filter(array, function(q) {
    return q.level === level;
  });

  questions = _.map(questions, function(q) {
    q.category = category;
    return q;
  })
  return _.take(_.shuffle(questions), number);
}

function getSessionObj(key, session) {
  return helper.getSessionObj(key, session);
}

function setSession(key, value, session) {
  helper.setSessionObj(key, value, session);
}

function parseAnswer(ans, choices) {
  var choiceIndex = ABCD.indexOf(parseInt(ans));
  console.log('choice index', choiceIndex, choices[choiceIndex])
  return choices[choiceIndex];
}

function getCorrectAnswerResponse(res) {
  var house = getSessionObj('housePicked', res);
  var score = getSessionObj('score', res);
  return helper.getSound('cheers-boos/applause.mp3') + ` 10 points to ${house}. ${house} now has a total of ${score} points. `;
}

function getWrongAnswerResponse() {
  return helper.getSound('cheers-boos/boo.mp3');
}

function handleAnswerGoNext(ans, res) {
  var questionSet = getSessionObj('questions', res);
  var currentQuestionIndex = parseInt(getSessionObj('currentQuestionIndex', res));
  var currentQuestion = questionSet[currentQuestionIndex - 1];
  var choices = currentQuestion.choices;
  var answer = parseAnswer(ans, choices);
  var score = 0;
  var responseText = "";
  var correctAns = currentQuestion.category === CAT_Says_WHO? currentQuestion.who : currentQuestion.answer;
  console.log(currentQuestion, answer, correctAns);
  if (answer === correctAns) {
    calcuScoreAndRecord(10, res);
    responseText = getCorrectAnswerResponse(res);
  } else {
    responseText = getWrongAnswerResponse();
  }
  var nextQuestionIndex = currentQuestionIndex + 1;
  if (currentQuestionIndex >= questionSet.length) {
    return completePotterQuizLevel(res);
  }

  setSession('currentQuestionIndex', nextQuestionIndex, res);
  var question = getQuestion(nextQuestionIndex, questionSet);

  return {
    sayText: responseText + question.sayText,
    repromptText: question.repromptText
  };

}

function gameOver(session) {
  var level = getSessionObj('zone-level', session);
  var minPoints = getSessionObj('min-level-score', session);
  var gameOver = helper.getSound('cheers-boos/game-over.mp3');
  var nextRound = (level === easy || level === medium)? 'to move on to the next round' : '';
  var text = gameOver + `Sorry. You did not make the required  ${minPoints} points ${nextRound}. Game Over.  Goodbye!`;
  return {
    sayText: text,
    gameOver: true
  }
}
//check level, if level not complete, comtinue to nextLevel or exit the game
function completePotterQuizLevel(session) {
  var level = getSessionObj('zone-level', session);
  var score = getSessionObj('score', session)
  var minPoints = getSessionObj('min-level-score', session);

  console.log('level, score', level, score)

  if (score < minPoints) {
    return gameOver(session);
  }

  var minPoints = score + passScore[level];
  setSession('min-level-score', minPoints, session);

  if (level === easy) {
    return goMedium(session);
  }

  if (level === medium) {
    return goDifficult(session);
  }

  if (level === hard) {
    return gameComplete(session, score);
  }

}

function gameComplete(res, score) {
  var housePicked = getSessionObj('housePicked', res);
  var gameOver = helper.getSound('cheers-boos/applause-loud.mp3');
  var text = gameOver +  `Very well done. ${score} points for ${housePicked}. You are a certified, battle tested Harry Potter Fan. Come back again! Goodbye.  `;
  return {
    sayText: text,
    gameOver: true
  }
}

function goMedium(res) {
  var categoryText = helper.getEmphasis(_.join(categories, ', '));
  var minPoints = getSessionObj('min-level-score', res);
  var applause = helper.getSound('cheers-boos/applause-md.mp3');
  var introductoryText = applause + 'Congradulations! You have now entered into the battlefield zone of Harry Potter Challenge. ' +
    'In this session, you will be asked 2 question from each of the categories: ' + categoryText +
    '. Each question is worth 10 points. ' +
    ` At the end of session if you have earned ${minPoints} points or more, you are allowed to move on to the Challenge zone; ` +
    ` If you earn less than ${minPoints} points, you are out of the game. Are you ready?  `;

  return goToNextLevel(res, introductoryText, medium);
}

function goDifficult(res) {
  var categoryText = helper.getEmphasis(_.join(categories, ', '));
  var minPoints = getSessionObj('min-level-score', res);
  var applause = helper.getSound('cheers-boos/applause-md.mp3');
  var introductoryText = applause + 'Congradulations! You are now entered into the battlefield zone of Harry Potter Challenge. ' +
    'In this session, you will be asked 2 question from each of the categories: ' + categoryText +
    ' Each question is worth 10 points.  ' +
    ` At the end of session if you have earned ${minPoints} points or more, you are allowed to move on to the Challenge zone; ` +
    ` If you earn less than ${minPoints} points, you are out of the game. Are you ready?  `;

  return goToNextLevel(res, introductoryText, hard);
}

function goToNextLevel(res, text, level) {
  startQuizSession(res, level);
  return {
    sayText: text,
    repromptText: text
  }
}

module.exports = {
  goMedium: goMedium,
  goDifficult: goDifficult,
  startQuizSession: startQuizSession,
  getSaysWhoQuestion: getSaysWhoQuestion,
  calcuScoreAndRecord: calcuScoreAndRecord,
  getQuestionSet: getQuestionSet,
  getQuestion: getQuestion,
  getFirstQuestion: getFirstQuestion,
  startPotterQuiz: startPotterQuiz,
  handleAnswerGoNext: handleAnswerGoNext
};
