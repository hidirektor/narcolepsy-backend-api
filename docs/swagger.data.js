const endpoints = [
    {
        sectionTitle: 'Authentication',
        path: 'auth/sign-up',
        method: 'post',
        summary: 'Register a new user',
        description: 'Creates a new user account in the system.',
        body: {
            userName: { type: 'string', required: true },
            userSurname: { type: 'string', required: true },
            eMail: { type: 'string', required: true },
            nickName: { type: 'string', required: true },
            phoneNumber: { type: 'string', required: true },
            countryCode: { type: 'string', required: true },
            password: { type: 'string', required: true },
            birthDate: { type: 'string', required: true },
            profilePhotoID: { type: 'string', required: true },
        },
        responses: {
            201: { description: 'User registered.' },
            400: { description: 'There was a problem adding the user!' },
            403: { description: 'Validation error.' },
        },
        controller: 'controllers/providers/authController.signUpAsync',
    },
    {
        sectionTitle: 'Authentication',
        path: 'auth/sign-in',
        method: 'post',
        summary: 'Authenticate user and provide access token',
        description: 'Authenticates the user and returns a token. Dont forget: you can choose eMail - password or phoneNumber - countryCode - password combination.',
        body: {
            eMail: { type: 'string', required: true },
            password: { type: 'string', required: true },
            phoneNumber: { type: 'string', required: false },
            countryCode: { type: 'string', required: false },
            rememberMe: { type: 'boolean', required: true },
        },
        responses: {
            200: {
                description: 'Login successful',
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            properties: {
                                findUser: {
                                    type: 'object',
                                    properties: {
                                        id: { type: 'integer', example: 1 },
                                        userID: { type: 'string', example: '7d83ce4d-4853-43d6-8d6c-fdbaa2c1539a' },
                                        userName: { type: 'string', example: 'Halil İbrahim' },
                                        userSurname: { type: 'string', example: 'Direktör' },
                                        eMail: { type: 'string', example: 'hidirektor@gmail.com' },
                                        nickName: { type: 'string', example: 'hidirektor' },
                                        phoneNumber: { type: 'string', example: '5556783423' },
                                        countryCode: { type: 'string', example: '+90' },
                                        password: { type: 'string', example: '$2a$10$suV//NKJ1kkbSeRc97Not.JRB6GVfirsC7cSPBQxO67Cb6LymPS.a' },
                                        userType: { type: 'string', example: 'PREMIUM' },
                                    },
                                },
                                accessToken: {
                                    type: 'string',
                                    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySUQiOiI3ZTU2OThjYS05Yjg3LTQ5ZTMtODNhZC1jZjJiODdhNzEyNzEiLCJ1c2VyVHlwZSI6IlVTRVIiLCJpYXQiOjE3MzM2NzU0MDYsImV4cCI6MTczMzc2MTgwNn0.321Id3qv6fxLLT7CIKbSQPlgX3ilgNIdMA-Z1h9StEk',
                                },
                            },
                        },
                    },
                },
            },
            401: { description: 'Check your credentials!' },
            403: { description: 'Validation error.' },
        },
        controller: 'controllers/providers/authController.loginAsync',
    },
    {
        sectionTitle: 'Authentication',
        path: 'auth/change-password',
        method: 'post',
        summary: 'Update the user’s password securely',
        description: 'Allows the user to change their password.',
        body: {
            userName: { type: 'string', required: true },
            oldPassword: { type: 'string', required: true },
            newPassword: { type: 'string', required: true },
            closeSessions: { type: 'boolean', required: true },
        },
        responses: {
            200: { description: 'Password changed successfully' },
            400: { description: 'Invalid request' },
            403: { description: 'Validation error.' },
        },
        controller: 'controllers/providers/authController.changePasswordAsync',
    },
    {
        sectionTitle: 'Authentication',
        path: 'auth/reset-password',
        method: 'post',
        summary: 'Reset password',
        description: 'Sends a password reset link to the user.',
        body: {
            userName: { type: 'string', required: true },
            newPassword: { type: 'string', required: true },
            otpCode: { type: 'string', required: true },
        },
        responses: {
            200: { description: 'Password reset successfully' },
            404: { description: 'Error resetting password.' },
            403: { description: 'Validation error.' },
        },
        controller: 'controllers/providers/authController.resetPasswordAsync',
    },
    {
        sectionTitle: 'Authentication',
        path: 'auth/logout',
        method: 'post',
        summary: 'Logout user',
        description: 'Logs out the current user.',
        body: {
            userID: { type: 'string', required: true },
            token: { type: 'string', required: true },
        },
        responses: {
            200: { description: 'Logout successful' },
            500: { description: 'Error logging out' },
            403: { description: 'Validation error.' },
        },
        controller: 'controllers/providers/authController.logoutAsync',
    },
    {
        sectionTitle: 'Authentication',
        path: 'auth/send-otp',
        method: 'post',
        summary: 'Send OTP',
        description: 'This endpoint sends otp to verified user methods. It will try send both eMail and SMS otp.',
        body: {
            userName: { type: 'string', required: true },
        },
        responses: {
            200: { description: 'OTP Code sent successfully' },
            404: { description: 'OTP code has already been generated for this user.' },
            403: { description: 'Validation error.' },
        },
        controller: 'controllers/providers/authController.sendOtpAsync',
    },
    {
        sectionTitle: 'Authentication',
        path: 'auth/verify-otp',
        method: 'post',
        summary: 'Verify OTP',
        description: 'This endpoint verifies entered otp code. And its not must used for any reset process. You can use reset-password endpoint directly.',
        body: {
            userName: { type: 'string', required: true },
            otpCode: { type: 'string', required: true },
        },
        responses: {
            200: { description: 'OTP Code verified successfully' },
            404: { description: 'Invalid OTP code.' },
            403: { description: 'Validation error.' },
        },
        controller: 'controllers/providers/authController.verifyOtpAsync',
    },
];

module.exports = endpoints;