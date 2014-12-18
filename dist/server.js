'use strict';

// MODULES =====================================================================
var log        = require('./server/helpers/log/config')(module),
    express    = require('express'),
    bodyParser = require('body-parser'),
    http       = require('http'),
    url        = require('url'),
    path       = require('path'),
    join       = path.join,
    app        = express();

// APP CONFIG ==================================================================
app.use(bodyParser());
app.use('/', express.static(join(process.cwd(), './')));

// APP SERVER ==================================================================
require('./server/helpers/log')(app);
require('./server/views')(app);

http.createServer(app).listen(3000, function(){
    log.info('Express for test started on localhost:3000');
});
