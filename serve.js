const express = require('express');
const app = express();
const routers = require('./routers');

const swaggerUi = require('swagger-ui-express');
const fs = require('fs');
const {join} = require("node:path");

app.get('/', function (req, res) {
    res.json('NarcoLepsy Magazine System');
});


app.use('/v1/api-docs', swaggerUi.serve, (req, res) => {
    const swaggerSpec = JSON.parse(fs.readFileSync(join(__dirname, './docs/swagger.json'), 'utf8'));

    res.setHeader('Cache-Control', 'no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    res.render('api-docs', { swaggerSpec: JSON.stringify(swaggerSpec) });
});

app.use('/v1/auth', routers.authRouter);
app.use('/v1/payment', routers.paymentRouter);
app.use('/v1/user', routers.profileRouter);
app.use('/v1/file', routers.fileRouter);

app.use((req, res, next) => {
    res.status(404).send('404 NOT FOUND');
});

module.exports = app;