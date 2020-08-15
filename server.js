const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const errorhandler = require('errorhandler');
const bodyParser = require('body-parser');

const apiRouter = require('./api/api');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(morgan('dev'));
app.use(cors());
app.use(bodyParser.json());

app.use('/api', apiRouter);

app.use(errorhandler());



app.listen(PORT, () => {
    console.log(`Go ahead caller, I'm listening...`);
});

module.exports = app;