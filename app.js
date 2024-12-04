require('dotenv/config');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const serve = require('./serve');
//const startQueueListener = require('./utils/3rdPartyServices/rabbitmq/queueListener');

const PORT = process.env.PORT || 3000;
const app = express();

// including models
const db = require('./models');

// db connection with sequelize
db.sequelize.sync({force: true});

app.use(cors());

app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({ extended: true }));

app.set('api_key', process.env.SECRET_KEY || 'secret');

app.use(serve);

// Start RabbitMQ Queue Listener
//startQueueListener();

app.listen(PORT, () => {
    console.log('Ready on http://localhost:' + PORT);
});