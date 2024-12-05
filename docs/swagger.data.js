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
        controller: 'controllers/providers/authController.signUp',
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
        controller: 'controllers/providers/authController.signIn',
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
        controller: 'controllers/providers/authController.tokenDecode',
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
        controller: 'controllers/providers/authController.changePassword',
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
        controller: 'controllers/providers/authController.resetPassword',
    },
    {
        path: '/logout',
        method: 'post',
        summary: 'Logout user',
        description: 'Logs out the current user.',
        responses: {
            200: { description: 'Logout successful' },
        },
        controller: 'controllers/providers/authController.logout',
    },
];

module.exports = endpoints;