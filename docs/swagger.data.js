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
        path: 'auth/verify/:userID',
        method: 'get',
        summary: 'Verify User Email',
        description: 'The unique identifier of the user whose email is being verified.',
        parameters: {
            userID: 'userID',
        },
        responses: {
            200: { description: 'Your email has been successfully verified!' },
            404: { description: 'User email is already verified.' },
            403: { description: 'Validation error.' },
        },
        controller: 'controllers/providers/authController.verifyUserEmailAsync',
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
    {
        sectionTitle: 'Payment',
        path: 'payment/start-checkout-form',
        method: 'post',
        summary: 'Initialize CF',
        description: 'Initialize CF from Iyzico.',
        body: {
            userID: { type: 'string', required: true },
            packageID: { type: 'string', required: true },
            ipAddress: { type: 'string', required: true },
        },
        responses: {
            201: { description: 'CF data sent successfully.' },
            400: { description: 'Failed to initialize checkout.' },
            403: { description: 'Validation error.' },
        },
        controller: 'controllers/providers/authController.startCheckoutAsync',
    },
    {
        sectionTitle: 'Payment',
        path: 'payment/verify-payment',
        method: 'post',
        summary: 'Verify CF Payment',
        description: 'It allow to verify CF payment.',
        body: {
            token: { type: 'string', required: true },
            userID: { type: 'string', required: true },
        },
        responses: {
            201: { description: 'Payment verified successfully.' },
            400: { description: 'Payment failed. Please try again or contact us.' },
            403: { description: 'Validation error.' },
        },
        controller: 'controllers/providers/authController.verifyCheckoutPaymentAsync',
    },
    {
        sectionTitle: 'Payment',
        path: 'payment/check-payment/:userID',
        method: 'post',
        summary: 'Check User Payment On Web',
        description: 'This endpoint for payment callback.',
        parameters: {
            userID: 'userID',
        },
        responses: {
            200: { description: 'Your payment has been successfully verified!' },
            404: { description: 'Your payment already verified.' },
            403: { description: 'Validation error.' },
        },
        controller: 'controllers/providers/authController.verifyPaymentOnWebAsync',
    },
    {
        sectionTitle: 'Payment',
        path: 'payment/verify-payment/:userID',
        method: 'get',
        summary: 'Verify User Payment On Web',
        description: 'The unique identifier of the user whose payment is being verified.',
        parameters: {
            userID: 'userID',
        },
        responses: {
            200: { description: 'Your payment has been successfully verified!' },
            404: { description: 'Your payment already verified.' },
            403: { description: 'Validation error.' },
        },
        controller: 'controllers/providers/authController.verifyPaymentOnWebAsync',
    },
    {
        sectionTitle: 'User Profile',
        path: 'user/get-profile',
        method: 'post',
        summary: 'Retrieve user profile information',
        description: 'Fetches the detailed profile information of the authenticated user. Ensure the user is authenticated by providing a valid access token.',
        body: {
            eMail: { type: 'string', required: true },
            phoneNumber: { type: 'string', required: false },
            countryCode: { type: 'string', required: false },
        },
        responses: {
            200: {
                description: 'Profile retrieve successful',
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            properties: {
                                userData: {
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
                                profileData: {
                                    type: 'object',
                                    properties: {
                                        id: { type: 'integer', example: 1 },
                                        userID: { type: 'string', example: '7d83ce4d-4853-43d6-8d6c-fdbaa2c1539a' },
                                        profilePhotoID: { type: 'string', example: '7d83ce4d-4853-43d6-8d6c-fdbaa2c1539a' },
                                        avatarID: { type: 'string', example: '7d83ce4d-4853-43d6-8d6c-fdbaa2c1539a' },
                                        isActive: { type: 'boolean', example: 'true' },
                                        birthDate: { type: 'string', example: '1734023795' },
                                        updateDate: { type: 'string', example: '1734023795' },
                                    },
                                },
                                preferencesData: {
                                    type: 'object',
                                    properties: {
                                        id: { type: 'integer', example: 1 },
                                        userID: { type: 'string', example: '7d83ce4d-4853-43d6-8d6c-fdbaa2c1539a' },
                                        profilePhotoID: { type: 'string', example: '7d83ce4d-4853-43d6-8d6c-fdbaa2c1539a' },
                                        language: { type: 'string', example: 'tr' },
                                        themeColor: { type: 'string', example: 'dark' },
                                        pushNotification: { type: 'boolean', example: 'true' },
                                        mailNotification: { type: 'boolean', example: 'true' },
                                    },
                                },
                                verificationData: {
                                    type: 'object',
                                    properties: {
                                        id: { type: 'integer', example: 1 },
                                        userID: { type: 'string', example: '7d83ce4d-4853-43d6-8d6c-fdbaa2c1539a' },
                                        mailVerification: { type: 'string', example: '1734023795' },
                                        phoneVerification: { type: 'string', example: '1734023795' },
                                    },
                                },
                            },
                        },
                    },
                },
            },
            401: { description: 'User not found!' },
            403: { description: 'Validation error.' },
        },
        controller: 'controllers/providers/profileController.getProfileAsync',
    },
    {
        sectionTitle: 'User Profile',
        path: 'user/update-profile',
        method: 'post',
        summary: 'Update user profile information',
        description: "Allows authenticated users to update their profile details, including personal information, preferences, and other settings. The request body determines which fields to update, and any changes will also update the profile's timestamp. Ensure the user is authenticated by providing a valid access token.",
        body: {
            eMail: { type: 'string', required: true },
            phoneNumber: { type: 'string', required: false },
            countryCode: { type: 'string', required: false },
            userName: { type: 'string', required: false },
            userSurname: { type: 'string', required: false },
            nickName: { type: 'string', required: false },
            birthDate: { type: 'string', required: false },
            language: { type: 'string', required: false },
            themeColor: { type: 'string', required: false },
            pushNotification: { type: 'boolean', required: false },
            mailNotification: { type: 'boolean', required: false },
        },
        responses: {
            200: {
                description: 'Profile update successful',
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            properties: {
                                userData: {
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
                                profileData: {
                                    type: 'object',
                                    properties: {
                                        id: { type: 'integer', example: 1 },
                                        userID: { type: 'string', example: '7d83ce4d-4853-43d6-8d6c-fdbaa2c1539a' },
                                        profilePhotoID: { type: 'string', example: '7d83ce4d-4853-43d6-8d6c-fdbaa2c1539a' },
                                        avatarID: { type: 'string', example: '7d83ce4d-4853-43d6-8d6c-fdbaa2c1539a' },
                                        isActive: { type: 'boolean', example: 'true' },
                                        birthDate: { type: 'string', example: '1734023795' },
                                        updateDate: { type: 'string', example: '1734023795' },
                                    },
                                },
                                preferencesData: {
                                    type: 'object',
                                    properties: {
                                        id: { type: 'integer', example: 1 },
                                        userID: { type: 'string', example: '7d83ce4d-4853-43d6-8d6c-fdbaa2c1539a' },
                                        profilePhotoID: { type: 'string', example: '7d83ce4d-4853-43d6-8d6c-fdbaa2c1539a' },
                                        language: { type: 'string', example: 'tr' },
                                        themeColor: { type: 'string', example: 'dark' },
                                        pushNotification: { type: 'boolean', example: 'true' },
                                        mailNotification: { type: 'boolean', example: 'true' },
                                    },
                                },
                                verificationData: {
                                    type: 'object',
                                    properties: {
                                        id: { type: 'integer', example: 1 },
                                        userID: { type: 'string', example: '7d83ce4d-4853-43d6-8d6c-fdbaa2c1539a' },
                                        mailVerification: { type: 'string', example: '1734023795' },
                                        phoneVerification: { type: 'string', example: '1734023795' },
                                    },
                                },
                            },
                        },
                    },
                },
            },
            401: { description: 'User not found!' },
            403: { description: 'Validation error.' },
        },
        controller: 'controllers/providers/profileController.getProfileAsync',
    },
    {
        sectionTitle: 'File Management',
        path: 'file/upload-profile-photo',
        method: 'post',
        summary: 'Upload user profile photo',
        description: 'Uploads a profile photo for the specified user, identified either by eMail or by phoneNumber and countryCode. Accepts multipart/form-data.',
        body: {
            eMail: { type: 'string', required: false },
            phoneNumber: { type: 'string', required: false },
            countryCode: { type: 'string', required: false },
            profilePhoto: { type: 'file', required: true, description: 'Profile photo image file (multipart/form-data)' }
        },
        responses: {
            200: {
                description: 'File uploaded successfully',
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            properties: {
                                message: { type: 'string', example: 'File uploaded successfully' },
                                fileName: { type: 'string', example: 'profilephoto.jpg' }
                            },
                        },
                    },
                },
            },
            404: { description: 'User not found!' },
            403: { description: 'Validation error.' },
        },
        controller: 'controllers/providers/fileController.uploadProfilePhotoAsync',
    }
];

module.exports = endpoints;