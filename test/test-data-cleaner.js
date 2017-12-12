'use strict';
var cleaner = require('../util/data-cleaner');

describe('potterQuiz', function() {

  it('clean up says who', function () {
    cleaner.cleanUpSaysWho();
  });

  it('clean up which spell', function () {
    var data = cleaner.cleanUpSpell();
    console.log(JSON.stringify(data));
  });

  it('add nextLevel says', function () {
    var data = cleaner.addLevelToSaysWho();
    console.log(JSON.stringify(data));
  });
});
