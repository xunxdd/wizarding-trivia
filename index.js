var alexa = require('alexa-app');
var app = new alexa.app('harry_potter_quiz');

var intentHandler = require('./intent-handler');
var _ = require('lodash');

var IntentHandler = new intentHandler();
var intents = [
  IntentHandler.sortingHatIntent,
  IntentHandler.multiChoiceIntent,
  IntentHandler.yesIntent,
  IntentHandler.noIntent,
  IntentHandler.stopIntent,
  IntentHandler.cancelIntent,
  IntentHandler.helpIntent,
  IntentHandler.repeatIntent,
  IntentHandler.startOverIntent
];

try {
  app.launch(function (req, res) {
    return IntentHandler.handleLaunchRequest(req, res);
  });

} catch(ex) {
  console.log(ex)
}

_.each(intents, function (intent) {
  app.intent(intent.name, intent.utterances, function (req, res) {
    return intent.callFunc(req, res);
  });
});


module.exports = app;
