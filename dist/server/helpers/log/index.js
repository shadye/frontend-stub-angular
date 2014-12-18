// MODULES =====================================================================
var express      = require('express'),
    errorhandler = require('errorhandler'),
    morgan       = require('morgan');

// LOG SETTINGS ================================================================
module.exports = function(app) {

  app.use(errorhandler());
  app.use(morgan({format: 'dev'}));

}
