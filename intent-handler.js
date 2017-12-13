'use strict';

var HogwartsManager = require('./hogwarts-manager');
var _ = require('lodash');
var helper = require('./helper');

function IntentHandler() {
  var manager = new HogwartsManager();
  var multiChoiceIntent = {
      name: 'multiChoiceIntent',
      utterances: {
        "slots": {
          "answerSlot": "AMAZON.NUMBER"
        },
        "utterances": ["{-|answerSlot}"]
      },
      callFunc: handleMultipleChoiceAnswerIntent
    },
    sortingHatIntent = {
      name: 'sortingHatIntent',
      utterances: {
        "utterances": ["{SORTING HAT}{| please}"]
      },
      callFunc: handleSortingAnswerIntent
    },
    yesIntent = {
      name: 'AMAZON.YesIntent',
      utterances: {},
      callFunc: handleYesIntent
    },
    noIntent = {
      name: 'AMAZON.NoIntent',
      utterances: {},
      callFunc: handleYesIntent
    };
  var helpIntent = {
      name: 'AMAZON.HelpIntent',
      utterances: {},
      callFunc: handleHelpIntent
    },
    cancelIntent = {
      name: 'AMAZON.CancelIntent',
      utterances: {},
      callFunc: goodBye
    },
    repeatIntent = {
      name: 'AMAZON.RepeatIntent',
      utterances: {},
      callFunc: handleRepeatIntent
    },
    stopIntent = {
      name: 'AMAZON.StopIntent',
      utterances: {},
      callFunc: goodBye
    },
    startOverIntent = {
      name: 'AMAZON.StartOverIntent',
      utterances: {},
      callFunc: handleStartOverIntent
    },
    donotKnowIntent = {
      "utterances": {
        "utterances": ["{Don't Know| Not Sure | I do not know | I don\'t know}"]
      },
      name: 'doNotKnowIntent',
      callFunc: handleDontKnowIntent
    };

  function handleHelpIntent(req, res) {
    var currentSessionName = helper.getSessionObj('currentSessionName', res);
    var helpText = 'The game has 3 difficulty levels: beginner zone, battlefield, challege. Each level has a number of multiple choice question. Please respond with 1, 2, 3, or 4.';
    if (currentSessionName === 'pre-sorting-hat') {
        helpText = "Before entering the beginner zone of the game, you will need to pick your house and ask one house specific question. To ask for sorting hat, please say Sorting Hat. "
    }
    res.say(helpText).reprompt(helpText).shouldEndSession(false);
  }

  function handleStartOverIntent(req, res) {
    handleLaunchRequest(req, res);
  }

  function handleRepeatIntent(req, res) {
    var repeatText = helper.getSessionObj('repeatText', res);
    res.say(repeatText).reprompt(repeatText).shouldEndSession(false);
  }

  function handleDontKnowIntent(req, res) {
    handleResultGoToNext(req, res, 'donotknow');
  }

  function handleYesIntent(req, res) {
    var texts = manager.onYesIntent(res);
    helper.setSessionObj('repeatText', texts.sayText, res);
    res.say(texts.sayText).reprompt(texts.repromptText).shouldEndSession(false);
  }

  function handleNoIntent(req, res) {
    goodBye(req, res);
  }

  function handleSortingAnswerIntent(req, res) {
    console.log('current session is ', helper.getSessionObj('currentSessionName', res), 'handleSortingAnswerIntent');
    var texts = manager.startSortingQuiz(res);
    helper.setSessionObj('repeatText', texts.sayText, res);
    res.say(texts.sayText).reprompt(texts.repromptText).shouldEndSession(false);
  }

  function handleMultipleChoiceAnswerIntent(req, res) {
    var answer = req.slot('answerSlot');
    //answer = parseInt(ans) + '';
    console.log('Please please log this ', answer)
    if (helper.isBadAnswer(answer)) {
      var sayText ='Sorry you answered ' + `<say-as interpret-as="spell-out">${answer}</say-as>` + '. Please simply answer ' + helper.getEmphasis('1 , 2, 3  or 4');
      helper.setSessionObj('repeatText', sayText, res);
      res.say(sayText).reprompt(sayText).shouldEndSession(false);
      return;
    }
    console.log('current session is ', helper.getSessionObj('currentSessionName', res), 'handleMultipleChoiceAnswerIntent');

    var texts = manager.getMultipleChoiceAnswerResponse(answer, res);
    if (texts.gameOver) {
      res.say(texts.sayText).shouldEndSession(true);
    } else {
      helper.setSessionObj('repeatText', texts.sayText, res);
      res.say(texts.sayText).reprompt(texts.repromptText).shouldEndSession(false);
    }
  }

  function handleLaunchRequest(req, res) {
    var texts = manager.getLaunchText(res);
    helper.setSessionObj('repeatText', texts.sayText, res);
    res.say(texts.sayText).reprompt(texts.repromptText).shouldEndSession(false);
  }

  function goodBye(req, res) {
    var goodBye = ' It was a pleasure playing with you. Come back soon. Goodbye!';
    res.say(goodBye).shouldEndSession(true);
  }

  return {
    handleLaunchRequest: handleLaunchRequest,
    yesIntent: yesIntent,
    noIntent: noIntent,
    stopIntent: stopIntent,
    startOverIntent: startOverIntent,
    helpIntent: helpIntent,
    repeatIntent: repeatIntent,
    cancelIntent: cancelIntent,
    sortingHatIntent: sortingHatIntent,
    multiChoiceIntent: multiChoiceIntent
  };
}

module.exports = IntentHandler;
