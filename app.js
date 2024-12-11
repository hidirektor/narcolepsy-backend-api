require('dotenv/config');
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const bodyParser = require('body-parser');
const serve = require('./serve');
const { startQueueListener } = require('./utils/thirdParty/messaging/queueListener');
const generateSwaggerSpec = require('./docs/swagger.config');

const PORT = process.env.PORT || 3000;
const app = express();

app.set('trust proxy', false);

// including models
const db = require('./models');
const {join} = require("node:path");

// db connection with sequelize
db.sequelize.sync({force: false});

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});

app.use(cors());

app.use(limiter);

app.set('view engine', 'ejs');
app.set('utils/notification/views', join(__dirname, 'utils/notification/views'));

app.use(express.static(join(__dirname, 'public')));

app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({ extended: true }));

app.use(serve);

generateSwaggerSpec();

// Start RabbitMQ Queue Listener
startQueueListener();

app.listen(PORT, () => {
    console.log('Ready on http://localhost:' + PORT);
});