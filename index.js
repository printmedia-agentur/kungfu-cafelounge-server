/* ===================
   Import Environment
=================== */
require('custom-env').env(true);

/* ===================
   Import Node Modules
=================== */
const express = require('express');
const app = express();
const cors = require('cors');
const path = require('path');
const port = process.env.PORT || 8080;
const morgan = require('morgan');
const favicon = require('express-favicon');
const { version } = require('./package.json');
require('dotenv').config();

/* ===================
   MongoDB config
=================== */
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const config = require('./config/database')

/* ===================
   Import routes
=================== */
const verify = require('./routes/verify');
const authentication = require('./routes/authentication');
const appointments = require('./routes/appointments');
const payments = require('./routes/payments');

/* ===================
   Error Tracking
=================== */
const Sentry = require('@sentry/node');
Sentry.init({
  dsn: '',
  environment: process.env.NODE_ENV,
  release: version,
});

/* ===================
   Database Connection
=================== */
mongoose.connect(
  config.uri,
  {
    useNewUrlParser: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  },
  (err) => {
    if (err) {
      Sentry.captureException(err);
    } else {
      console.log('Connected to ' + config.db);
    }
  }
);
mongoose.set('useCreateIndex', true);

/* ===================
   Middlewares
=================== */
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('tiny'));
}
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

/* ===================
   Stats API
=================== */
const initStats = require('@phil-r/stats');
const { statsMiddleware, getStats } = initStats({
  endpointStats: true,
  complexEndpoints: [],
  customStats: false,
  addHeader: true,
});
app.use(statsMiddleware);

/* ===================
   Swagger API Docs
=================== */
const expressSwagger = require('express-swagger-generator')(app);
let options = {
  swaggerDefinition: {
    info: {
      description:
        '',
      title: '',
      version: version,
    },
    host: process.env.HOST,
    basePath: '',
    produces: ['application/json'],
    schemes: ['https'],
    securityDefinitions: {
      JWT: {
        type: 'apiKey',
        in: 'header',
        name: 'Authorization',
        description: '',
      },
    },
  },
  basedir: __dirname, //app absolute path
  files: ['./routes/**/*.js'], //Path to the API handle folder
};
expressSwagger(options);

/* ===================
   Routes
=================== */
app.use('/verify', verify);
app.use('/authentication', authentication);
app.use('/appointments', appointments);
app.use('/payments', payments);

/* ===================
   Render base pages
=================== */
app.get('/stats', (req, res) => res.send(getStats()));

app.get('*', (req, res) => {
  res.sendStatus(200);
});

/* ===================
   Start Server on Port 8080
=================== */
app.listen(port, () => {
  console.log('Listening on port ' + port + ' in ' + process.env.NODE_ENV + ' mode');
});

module.exports = app;
