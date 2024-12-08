require('dotenv/config');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const serve = require('./serve');
const { startQueueListener } = require('./utils/thirdParty/messaging/queueListener');

const PORT = process.env.PORT || 3000;
const app = express();

// including models
const db = require('./models');
const {join} = require("node:path");

// db connection with sequelize
db.sequelize.sync({force: false});

app.use(cors());

app.set('view engine', 'ejs');
app.set('utils/notification/views', join(__dirname, 'utils/notification/views'));

app.use(express.static(join(__dirname, 'public')));

app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({ extended: true }));

app.set('api_key', process.env.JWT_SECRET || 'secret');

app.use(serve);

// Start RabbitMQ Queue Listener
startQueueListener();

app.listen(PORT, () => {
    console.log('Ready on http://localhost:' + PORT);
});