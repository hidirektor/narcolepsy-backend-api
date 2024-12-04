require('dotenv/config');
const router = require('express')();

const ControllerFactory = require('../controllers/controllerFactory');
const {validators, verifyToken} = require('../middleware');
const authController = ControllerFactory.creating('auth.controller');

const authValidator = validators.authValidator;
const userValidator = validators.userValidator;

const tokenControl = verifyToken.tokenControl;

const endpoints = [
    {
        path: '/sign-up',
        method: 'post',
        summary: 'Register a new user',
        description: 'Creates a new user account in the system.',
        body: {
            username: { type: 'string', required: true },
            password: { type: 'string', required: true },
            email: { type: 'string', required: true },
        },
        responses: {
            201: { description: 'User registered successfully' },
            400: { description: 'Validation error' },
        },
    },
    {
        path: '/sign-in',
        method: 'post',
        summary: 'Login user',
        description: 'Authenticates the user and returns a token.',
        body: {
            email: { type: 'string', required: true },
            password: { type: 'string', required: true },
        },
        responses: {
            200: { description: 'Login successful', schema: { token: 'string' } },
            401: { description: 'Unauthorized' },
        },
    },
    {
        path: '/token-decode',
        method: 'get',
        summary: 'Decode token',
        description: 'Decodes the current user token.',
        responses: {
            200: { description: 'Token decoded successfully' },
            401: { description: 'Invalid token' },
        },
    },
    {
        path: '/changePassword',
        method: 'post',
        summary: 'Change password',
        description: 'Allows the user to change their password.',
        body: {
            oldPassword: { type: 'string', required: true },
            newPassword: { type: 'string', required: true },
        },
        responses: {
            200: { description: 'Password changed successfully' },
            400: { description: 'Invalid request' },
        },
    },
    {
        path: '/resetPassword',
        method: 'post',
        summary: 'Reset password',
        description: 'Sends a password reset link to the user.',
        body: {
            email: { type: 'string', required: true },
        },
        responses: {
            200: { description: 'Password reset link sent' },
            404: { description: 'User not found' },
        },
    },
    {
        path: '/logout',
        method: 'post',
        summary: 'Logout user',
        description: 'Logs out the current user.',
        responses: {
            200: { description: 'Logout successful' },
        },
    },
];

router.post('/sign-up', authValidator.signUp, authController.signUpAsync);

router.post('/sign-in', authValidator.login, authController.loginAsync);

router.get('/token-decode', tokenControl, authController.tokenDecodeAsync);

router.post(
    '/changePassword',
    tokenControl,
    authController.changePasswordAsync
);

router.post(
    '/resetPassword',
    authValidator.resetPassword,
    authController.resetPasswordAsync
);

router.post('/logout', tokenControl, authController.logoutAsync);

endpoints.forEach((endpoint) => {
    const middlewares = [];
    if (endpoint.body) middlewares.push(authValidator[endpoint.body]);
    if (endpoint.path === '/token-decode' || endpoint.path === '/logout') {
        middlewares.push(tokenControl);
    }

    const controllerMethod = authController[endpoint.path.replace('/', '')]; // Remove the 'Async' suffix
    if (controllerMethod) {
        router[endpoint.method](endpoint.path, ...middlewares, controllerMethod);
    } else {
        console.warn(`No controller method found for ${endpoint.path}`);
    }
});

module.exports = router;