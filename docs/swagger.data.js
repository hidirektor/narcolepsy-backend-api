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
        security: [
            {
                bearerAuth: [],
            },
        ],
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
        security: [
            {
                bearerAuth: [],
            },
        ],
        controller: 'controllers/providers/authController.logoutAsync',
    },
    {
        sectionTitle: 'Authentication',
        path: 'auth/verify/{userID}',
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
        security: [
            {
                bearerAuth: [],
            },
        ],
        controller: 'controllers/providers/authController.startCheckoutAsync',
    },
    {
        sectionTitle: 'Payment',
        path: 'payment/check-payment/{userID}',
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
        path: 'payment/verify-payment/{userID}',
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
        security: [
            {
                bearerAuth: [],
            },
        ],
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
        security: [
            {
                bearerAuth: [],
            },
        ],
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
            profilePhoto: { type: 'file', required: true, description: 'Profile photo image file (multipart/form-data)' },
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
        security: [
            {
                bearerAuth: [],
            },
        ],
        controller: 'controllers/providers/fileController.uploadProfilePhotoAsync',
    },
    {
        sectionTitle: "File Management",
        path: "file/get-profile-photo/{eMail}",
        method: "get",
        summary: "Fetch user profile photo",
        description: "Retrieves the profile photo of a user based on their email address. Returns the image file directly.",
        parameters: {
            eMail: {
                type: "string",
                required: true,
                description: "The email address of the user whose profile photo is to be fetched."
            }
        },
        responses: {
            200: {
                description: "Profile photo fetched successfully",
                content: {
                    "image/png": {
                        schema: {
                            type: "string",
                            format: "binary"
                        }
                    }
                }
            },
            404: {
                "description": "User or profile photo not found."
            },
            500: {
                "description": "Internal server error occurred while fetching the profile photo."
            }
        },
        security: [
            {
                "bearerAuth": []
            }
        ],
        controller: "controllers/providers/fileController.getProfilePhotoAsync"
    },
    {
        sectionTitle: 'Comic Category Management',
        path: 'comic-categories/get-all',
        method: 'get',
        summary: 'List all Comic Category Management',
        description: 'Retrieves a list of all Comic Category Management. Requires a valid token and one of the following roles: EDITOR, MODERATOR, SYSOP.',
        responses: {
            200: {
                description: 'A list of Comic Category Management',
                content: {
                    'application/json': {
                        schema: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    categoryID: { type: 'string', example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479' },
                                    categoryName: { type: 'string', example: 'Action' },
                                }
                            }
                        }
                    }
                }
            },
            401: { description: 'Unauthorized or Invalid Token' },
            403: { description: 'Forbidden: Your role does not have access to this resource.' },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
        controller: 'controllers/providers/comic.category.controller.getAllCategoryAsync'
    },
    {
        sectionTitle: 'Comic Category Management',
        path: 'comic-categories/get/{categoryID}',
        method: 'get',
        summary: 'Get a specific comic category',
        description: 'Retrieves a specific comic category by its unique ID. Requires valid token and role (EDITOR, MODERATOR, SYSOP).',
        parameters: {
            categoryID: 'categoryID'
        },
        responses: {
            200: {
                description: 'Comic category detail',
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            properties: {
                                categoryID: { type: 'string', example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479' },
                                categoryName: { type: 'string', example: 'Action' },
                            }
                        }
                    }
                }
            },
            401: { description: 'Unauthorized or Invalid Token' },
            403: { description: 'Forbidden: Your role does not have access to this resource.' },
            404: { description: 'Category not found.' }
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
        controller: 'controllers/providers/comic.category.controller.getCategoryAsync'
    },
    {
        sectionTitle: 'Comic Category Management',
        path: 'comic-categories/create-category',
        method: 'post',
        summary: 'Create a new comic category',
        description: 'Creates a new comic category. Requires valid token and role (EDITOR, MODERATOR, SYSOP).',
        body: {
            categoryName: { type: 'string', required: true, description: 'Name of the comic category' },
        },
        responses: {
            201: {
                description: 'Category created successfully',
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            properties: {
                                categoryID: { type: 'string', example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479' },
                                categoryName: { type: 'string', example: 'Adventure' },
                            }
                        }
                    }
                }
            },
            400: { description: 'Bad Request: Missing or invalid categoryName' },
            401: { description: 'Unauthorized or Invalid Token' },
            403: { description: 'Forbidden: Your role does not have access to this resource.' },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
        controller: 'controllers/providers/comic.category.controller.createCategoryAsync'
    },
    {
        sectionTitle: 'Comic Category Management',
        path: 'comic-categories/edit-category',
        method: 'post',
        summary: 'Edit an existing comic category',
        description: 'Updates the specified comic category. Requires valid token and role (EDITOR, MODERATOR, SYSOP).',
        body: {
            categoryID: { type: 'string', required: true, description: 'Uniqueu ID for desired comic category' },
            categoryName: { type: 'string', required: true, description: 'New name for the comic category' },
        },
        responses: {
            200: {
                description: 'Category updated successfully',
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            properties: {
                                categoryID: { type: 'string', example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479' },
                                categoryName: { type: 'string', example: 'Action - Updated' },
                            }
                        }
                    }
                }
            },
            400: { description: 'Bad Request: Missing or invalid categoryName' },
            401: { description: 'Unauthorized or Invalid Token' },
            403: { description: 'Forbidden: Your role does not have access to this resource.' },
            404: { description: 'Category not found.' }
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
        controller: 'controllers/providers/comic.category.controller.updateCategoryAsync'
    },
    {
        sectionTitle: 'Comic Category Management',
        path: 'comic-categories/delete-category/{categoryID}',
        method: 'delete',
        summary: 'Delete a comic category',
        description: 'Deletes the specified comic category. Requires valid token and role (EDITOR, MODERATOR, SYSOP).',
        parameters: {
            categoryID: 'categoryID'
        },
        responses: {
            204: {
                description: 'Category deletion started successfully. Mappings require confirmation for deletion.',
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            properties: {
                                message: {
                                    type: 'string',
                                    example: 'Category deletion started successfully. Mappings require confirmation for deletion.'
                                },
                                operationKey: {
                                    type: 'string',
                                    example: '5728bf67-575f-48bd-b299-3ea145228a66'
                                },
                                afftecedComics: {
                                    type: 'array',
                                    items: {
                                        type: 'object',
                                        properties: {
                                            id: { type: 'integer', example: 4 },
                                            categoryID: {
                                                type: 'string',
                                                example: 'ef3d5aff-2917-4b3c-9ef1-a5950c3f67c4'
                                            },
                                            comicID: { type: 'string', example: '546435tgsdfsdf' }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            401: { description: 'Unauthorized or Invalid Token' },
            403: { description: 'Forbidden: Your role does not have access to this resource.' },
            404: { description: 'Category not found.' }
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
        controller: 'controllers/providers/comic.category.controller.removeCategoryAsync'
    },
    {
        sectionTitle: 'Comic Category Management',
        path: 'comic-categories/confirm-delete-category',
        method: 'post',
        summary: 'Confirm deletion of a comic category',
        description: 'This endpoint confirms the deletion of a comic category and its related mappings. Requires valid token and role (EDITOR, MODERATOR, SYSOP).',
        body: {
            operationKey: { type: 'string', required: true, description: 'Unique operation key for the deletion confirmation' },
        },
        responses: {
            200: {
                description: 'Category deleted successfully.',
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            properties: {
                                message: {
                                    type: 'string',
                                    example: 'Category deleted successfully.'
                                },
                                afftecedComics: {
                                    type: 'array',
                                    items: {
                                        type: 'object',
                                        properties: {
                                            id: { type: 'integer', example: 4 },
                                            categoryID: {
                                                type: 'string',
                                                example: 'ef3d5aff-2917-4b3c-9ef1-a5950c3f67c4'
                                            },
                                            comicID: { type: 'string', example: '546435tgsdfsdf' }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            400: { description: 'Invalid or expired operation key' },
            401: { description: 'Unauthorized or Invalid Token' },
            403: { description: 'Invalid token for this operation' },
            500: { description: 'Internal Server Error' },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
        controller: 'controllers/providers/comicCategoryController.confirmRemoveCategoryAsync',
    },
    {
        sectionTitle: 'Premium Packages',
        path: 'premium-packages/get-all',
        method: 'get',
        summary: 'List all premium packages',
        description: 'Retrieves a list of all premium packages. Requires a valid token.',
        responses: {
            200: {
                description: 'A list of premium packages',
                content: {
                    'application/json': {
                        schema: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    packageID: { type: 'string', example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479' },
                                    packageName: { type: 'string', example: 'Premium' },
                                    packageDescription: { type: 'string', example: 'HD kullanılabilir.\nUltra HD kullanılabilir.' },
                                    packagePrice: { type: 'double', example: '54.99' },
                                    packageTime: { type: 'integer', example: '30' },
                                }
                            }
                        }
                    }
                }
            },
            401: { description: 'Unauthorized or Invalid Token' },
            403: { description: 'Forbidden: Your role does not have access to this resource.' },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
        controller: 'controllers/providers/premium.package.controller.getAllPremiumPackageAsync'
    },
    {
        sectionTitle: 'Premium Packages',
        path: 'premium-packages/get/{packageID}',
        method: 'get',
        summary: 'Get a specific premium package',
        description: 'Retrieves a specific premium package by its unique ID. Requires valid token.',
        parameters: {
            packageID: 'packageID'
        },
        responses: {
            200: {
                description: 'Premium package detail',
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            properties: {
                                categoryID: { type: 'string', example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479' },
                                packageName: { type: 'string', example: 'Premium' },
                                packageDescription: { type: 'string', example: 'HD kullanılabilir.\nUltra HD kullanılabilir.' },
                                packagePrice: { type: 'double', example: '54.99' },
                                packageTime: { type: 'integer', example: '30' },
                            }
                        }
                    }
                }
            },
            401: { description: 'Unauthorized or Invalid Token' },
            403: { description: 'Forbidden: Your role does not have access to this resource.' },
            404: { description: 'Premium package not found.' }
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
        controller: 'controllers/providers/premium.package.controller.getPremiumPackageAsync'
    },
    {
        sectionTitle: 'Premium Packages',
        path: 'premium-packages/create-premium-package',
        method: 'post',
        summary: 'Create a new premium package',
        description: 'Creates a new premium package. Requires valid token and role (SYSOP).',
        body: {
            packageName: { type: 'string', required: true, description: 'Name of the premium package' },
            packageDescription: { type: 'string', required: true, description: 'Description of the premium package' },
            packagePrice: { type: 'double', required: true, description: 'Price of the premium package' },
            packageTime: { type: 'integer', required: true, description: 'Time of the premium package' },
        },
        responses: {
            201: {
                description: 'Premium package created successfully',
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            properties: {
                                packageID: { type: 'string', example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479' },
                                packageName: { type: 'string', example: 'Premium' },
                                packageDescription: { type: 'string', example: 'HD kullanılabilir.\nUltra HD kullanılabilir.' },
                                packagePrice: { type: 'double', example: '54.99' },
                                packageTime: { type: 'integer', example: '30' },
                            }
                        }
                    }
                }
            },
            400: { description: 'Bad Request: Missing or invalid categoryName' },
            401: { description: 'Unauthorized or Invalid Token' },
            403: { description: 'Forbidden: Your role does not have access to this resource.' },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
        controller: 'controllers/providers/premium.package.controller.createPremiumPackageAsync'
    },
    {
        sectionTitle: 'Premium Packages',
        path: 'premium-packages/edit-premium-package',
        method: 'post',
        summary: 'Edit an existing premium package',
        description: 'Updates the specified premium package. Requires valid token and role (SYSOP).',
        body: {
            packageID: { type: 'string', required: true, description: 'Uniqueu ID for desired premium package' },
            packageName: { type: 'string', required: true, description: 'New name for the premium package' },
            packageDescription: { type: 'string', required: true, description: 'New description for the premium package' },
            packagePrice: { type: 'double', required: true, description: 'New price for the premium package' },
            packageTime: { type: 'integer', required: true, description: 'New time value for the premium package' },
        },
        responses: {
            200: {
                description: 'Premium package updated successfully',
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            properties: {
                                packageID: { type: 'string', example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479' },
                                packageName: { type: 'string', example: 'Premium' },
                                packageDescription: { type: 'string', example: 'HD kullanılabilir.\nUltra HD kullanılabilir.' },
                                packagePrice: { type: 'double', example: '54.99' },
                                packageTime: { type: 'integer', example: '30' },
                            }
                        }
                    }
                }
            },
            400: { description: 'Bad Request: Missing or invalid packageName, packageDescription, packagePrice, packageTime' },
            401: { description: 'Unauthorized or Invalid Token' },
            403: { description: 'Forbidden: Your role does not have access to this resource.' },
            404: { description: 'Premium package not found.' }
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
        controller: 'controllers/providers/premium.package.controller.updatePremiumPackageAsync'
    },
    {
        sectionTitle: 'Premium Packages',
        path: 'premium-packages/delete-premium-package/{packageID}',
        method: 'delete',
        summary: 'Delete a premium package',
        description: 'Deletes the specified premium package. Requires valid token and role (SYSOP).',
        parameters: {
            packageID: 'packageID'
        },
        responses: {
            200: {
                description: 'Premium package deleted or required confirmation.',
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            properties: {
                                message: { type: 'string', example: 'Premium package deletion requires confirmation. Use the provided operation key to confirm.' },
                                operationKey: { type: 'string', example: '78e2249c-b9dd-4e72-afef-f0ae6396f891' },
                                affectedPremiumPackage: {
                                    type: 'object',
                                    properties: {
                                        id: { type: 'integer', example: 6 },
                                        packageID: { type: 'string', example: 'fc224dd0-b26b-4536-b6fe-e3a8a38f8a05' },
                                        packageName: { type: 'string', example: 'Premium' },
                                        packageDescription: { type: 'string', example: 'HD kullanılabilir.\nUltra HD kullanılabilir.' },
                                        packagePrice: { type: 'number', format: 'float', example: 0.2 },
                                        packageTime: { type: 'integer', example: 30 },
                                    },
                                },
                                deletedPremiumUsers: {
                                    type: 'array',
                                    items: {
                                        type: 'object',
                                        properties: {
                                            userID: { type: 'string', example: '150cf986-e74e-4e80-b7a0-b22e0e0348b7' },
                                            userName: { type: 'string', example: 'Halil İbrahim' },
                                            userSurname: { type: 'string', example: 'Direktör' },
                                            eMail: { type: 'string', example: 'hidirektor@gmail.com' },
                                        },
                                    },
                                },
                                affectedOrders: {
                                    type: 'array',
                                    items: {
                                        type: 'object',
                                        properties: {
                                            id: { type: 'integer', example: 3 },
                                            userID: { type: 'string', example: '150cf986-e74e-4e80-b7a0-b22e0e0348b7' },
                                            orderID: { type: 'string', example: '547f5c16-4189-448a-96db-f394ae8dc80d' },
                                            packageID: { type: 'string', example: 'fc224dd0-b26b-4536-b6fe-e3a8a38f8a05' },
                                            paymentMethod: { type: 'string', example: 'Iyzico' },
                                            paymentStatus: { type: 'string', example: 'COMPLETED' },
                                            orderPrice: { type: 'number', format: 'float', example: 0.2 },
                                            userIP: { type: 'string', example: '192.168.2.2' },
                                            iyzicoToken: { type: 'string', example: '613b5b2b-0192-4530-a2ef-85a1431b4eea' },
                                            iyzicoSignature: { type: 'string', example: '6dac12f81c509e5c78387e140201ee6cfc2db30cb081d15bd02ce22b906cdd23' },
                                            orderDate: { type: 'integer', example: 1734132274 },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
            401: { description: 'Unauthorized or Invalid Token' },
            403: { description: 'Forbidden: Your role does not have access to this resource.' },
            404: { description: 'Premium package not found.' }
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
        controller: 'controllers/providers/premium.package.controller.removePremiumPackageAsync'
    },
    {
        sectionTitle: 'Premium Packages',
        path: 'premium-packages/confirm-delete-premium-package',
        method: 'post',
        summary: 'Confirm deletion of premium package',
        description: 'This endpoint confirms the deletion of a premium package and its related mappings. Requires valid token and role (SYSOP).',
        body: {
            operationKey: { type: 'string', required: true, description: 'Unique operation key for the deletion confirmation' },
        },
        responses: {
            200: {
                description: 'Premium package deletion requires confirmation.',
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            properties: {
                                message: { type: 'string', example: 'Premium package deletion requires confirmation. Use the provided operation key to confirm.' },
                                affectedPremiumPackage: {
                                    type: 'object',
                                    properties: {
                                        id: { type: 'integer', example: 6 },
                                        packageID: { type: 'string', example: 'fc224dd0-b26b-4536-b6fe-e3a8a38f8a05' },
                                        packageName: { type: 'string', example: 'Premium' },
                                        packageDescription: { type: 'string', example: 'HD kullanılabilir.\nUltra HD kullanılabilir.' },
                                        packagePrice: { type: 'number', format: 'float', example: 0.2 },
                                        packageTime: { type: 'integer', example: 30 },
                                    },
                                },
                                deletedPremiumUsers: {
                                    type: 'array',
                                    items: {
                                        type: 'object',
                                        properties: {
                                            userID: { type: 'string', example: '150cf986-e74e-4e80-b7a0-b22e0e0348b7' },
                                            userName: { type: 'string', example: 'Halil İbrahim' },
                                            userSurname: { type: 'string', example: 'Direktör' },
                                            eMail: { type: 'string', example: 'hidirektor@gmail.com' },
                                        },
                                    },
                                },
                                affectedOrders: {
                                    type: 'array',
                                    items: {
                                        type: 'object',
                                        properties: {
                                            id: { type: 'integer', example: 3 },
                                            userID: { type: 'string', example: '150cf986-e74e-4e80-b7a0-b22e0e0348b7' },
                                            orderID: { type: 'string', example: '547f5c16-4189-448a-96db-f394ae8dc80d' },
                                            packageID: { type: 'string', example: 'fc224dd0-b26b-4536-b6fe-e3a8a38f8a05' },
                                            paymentMethod: { type: 'string', example: 'Iyzico' },
                                            paymentStatus: { type: 'string', example: 'COMPLETED' },
                                            orderPrice: { type: 'number', format: 'float', example: 0.2 },
                                            userIP: { type: 'string', example: '192.168.2.2' },
                                            iyzicoToken: { type: 'string', example: '613b5b2b-0192-4530-a2ef-85a1431b4eea' },
                                            iyzicoSignature: { type: 'string', example: '6dac12f81c509e5c78387e140201ee6cfc2db30cb081d15bd02ce22b906cdd23' },
                                            orderDate: { type: 'integer', example: 1734132274 },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
            400: { description: 'Invalid or expired operation key' },
            401: { description: 'Unauthorized or Invalid Token' },
            403: { description: 'Invalid token for this operation' },
            500: { description: 'Internal Server Error' },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
        controller: 'controllers/providers/premium.package.controller.confirmRemovePremiumPackageAsync',
    },
    {
        sectionTitle: 'Support Tickets Management',
        path: 'support-tickets/create-ticket',
        method: 'post',
        summary: 'Create a ticket',
        description: 'Allows users to create a ticket without attachments.',
        body: {
            eMail: { type: 'string', required: true },
            ticketType: { type: 'string', required: true, enum: ['SUGGESTION', 'PROBLEM', 'APPLY'] },
            ticketTitle: { type: 'string', required: true },
            ticketDescription: { type: 'string', required: true },
            comicID: { type: 'string', required: false },
            episodeID: { type: 'string', required: false },
        },
        responses: {
            200: {
                description: 'Ticket created successfully',
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            properties: {
                                message: { type: 'string', example: 'Ticket created successfully' },
                                ticketData: {
                                    type: 'object',
                                    properties: {
                                        ticketID: { type: 'string', example: 'uuid-v4-string' },
                                        userID: { type: 'string', example: 'uuid-v4-string' },
                                        ticketType: { type: 'string', example: 'SUGGESTION' },
                                        ticketTitle: { type: 'string', example: 'App Issue' },
                                        ticketDescription: { type: 'string', example: 'Detailed description of the issue' },
                                        ticketStatus: { type: 'string', example: 'CREATED' },
                                    },
                                },
                            },
                        },
                    },
                },
            },
            400: { description: 'Validation error: Missing fields' },
            500: { description: 'Internal server error' },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
        controller: 'controllers/providers/ticketController.createTicketAsync',
    },
    {
        sectionTitle: 'Support Tickets Management',
        path: 'support-tickets/create-ticket/with-attachment',
        method: 'post',
        summary: 'Create a ticket with attachments',
        description: 'Allows users to create a ticket with one or more attachments (max 3).',
        body: {
            eMail: { type: 'string', required: true },
            ticketType: { type: 'string', required: true, enum: ['SUGGESTION', 'PROBLEM', 'APPLY'] },
            ticketTitle: { type: 'string', required: true },
            ticketDescription: { type: 'string', required: true },
            comicID: { type: 'string', required: false },
            episodeID: { type: 'string', required: false },
            attachments: {
                type: "array",
                required: true,
                items: {
                    type: "file"
                },
                description: "Attachments for the ticket (max 3 files)"
            }
        },
        responses: {
            200: {
                description: 'Ticket created successfully',
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            properties: {
                                message: { type: 'string', example: 'Ticket created with attachments' },
                                ticketData: {
                                    type: 'object',
                                    properties: {
                                        ticketID: { type: 'string', example: 'uuid-v4-string' },
                                        userID: { type: 'string', example: 'uuid-v4-string' },
                                        ticketType: { type: 'string', example: 'SUGGESTION' },
                                        ticketTitle: { type: 'string', example: 'App Issue' },
                                        ticketDescription: { type: 'string', example: 'Detailed description of the issue' },
                                        ticketStatus: { type: 'string', example: 'CREATED' },
                                        ticketAttachments: {
                                            type: 'array',
                                            items: { type: 'string', example: 'path/to/attachment.jpg' },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
            400: { description: 'Validation error: Missing fields or invalid attachment count' },
            500: { description: 'Internal server error' },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
        controller: 'controllers/providers/ticketController.createTicketWithAttachmentAsync',
    },
    {
        sectionTitle: 'Support Tickets Management',
        path: 'support-tickets/reply-ticket',
        method: 'post',
        summary: 'Reply to a ticket',
        description: 'Allows users to reply to an existing ticket without attachments.',
        body: {
            eMail: { type: 'string', required: true },
            ticketID: { type: 'string', required: true },
            ticketResponse: { type: 'string', required: true },
        },
        responses: {
            200: {
                description: 'Reply added successfully',
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            properties: {
                                message: { type: 'string', example: 'Reply added successfully' },
                                responseData: {
                                    type: 'object',
                                    properties: {
                                        responseID: { type: 'string', example: 'uuid-v4-string' },
                                        ticketID: { type: 'string', example: 'uuid-v4-string' },
                                        userID: { type: 'string', example: 'uuid-v4-string' },
                                        ticketResponse: { type: 'string', example: 'Reply content' },
                                    },
                                },
                            },
                        },
                    },
                },
            },
            400: { description: 'Validation error: Missing fields' },
            404: { description: 'User or ticket not found' },
            500: { description: 'Internal server error' },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
        controller: 'controllers/providers/ticketController.replyTicketAsync',
    },
    {
        sectionTitle: 'Support Tickets Management',
        path: 'support-tickets/reply-ticket/with-attachment',
        method: 'post',
        summary: 'Reply to a ticket with attachments',
        description: 'Allows users to reply to an existing ticket and upload attachments.',
        body: {
            eMail: { type: 'string', required: true },
            ticketID: { type: 'string', required: true },
            ticketResponse: { type: 'string', required: true },
            attachments: {
                type: "array",
                required: true,
                items: {
                    type: "file"
                },
                description: "Attachments for the ticket (max 3 files)"
            }
        },
        responses: {
            201: {
                description: 'Reply added successfully',
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            properties: {
                                message: { type: 'string', example: 'Reply added with attachments' },
                                responseData: {
                                    type: 'object',
                                    properties: {
                                        responseID: { type: 'string', example: 'uuid-v4-string' },
                                        ticketID: { type: 'string', example: 'uuid-v4-string' },
                                        userID: { type: 'string', example: 'uuid-v4-string' },
                                        ticketResponse: { type: 'string', example: 'Reply content' },
                                        responseAttachments: {
                                            type: 'array',
                                            items: { type: 'string', example: 'path/to/attachment.jpg' },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
            400: { description: 'Validation error: Missing fields or invalid attachment count' },
            404: { description: 'User or ticket not found' },
            500: { description: 'Internal server error' },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
        controller: 'controllers/providers/ticketController.replyTicketWithAttachmentAsync',
    },
    {
        sectionTitle: 'Support Tickets Management',
        path: 'support-tickets/delete-ticket/{ticketID}',
        method: 'delete',
        summary: 'Initiate deletion of a ticket',
        description: 'Allows SYSOP users to initiate ticket deletion. Returns an operation key for confirmation.',
        parameters: {
            ticketID: { type: 'string', required: true, description: 'ID of the ticket to be deleted.' }
        },
        responses: {
            200: {
                description: 'Ticket deletion initiation successful',
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            properties: {
                                message: { type: 'string', example: 'Ticket deletion requires confirmation. Use the provided operation key to confirm.' },
                                operationKey: { type: 'string', example: 'uuid-v4-string' },
                                ticketData: {
                                    type: 'object',
                                    properties: {
                                        ticketID: { type: 'string', example: 'uuid-v4-string' },
                                        ticketType: { type: 'string', example: 'SUGGESTION' },
                                        ticketTitle: { type: 'string', example: 'App Issue' },
                                        ticketDescription: { type: 'string', example: 'Detailed description of the issue' },
                                        ticketStatus: { type: 'string', example: 'CREATED' },
                                    },
                                },
                                responseData: {
                                    type: 'array',
                                    items: {
                                        type: 'object',
                                        properties: {
                                            responseID: { type: 'string', example: 'uuid-v4-string' },
                                            ticketResponse: { type: 'string', example: 'Reply content' },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
            400: { description: 'Validation error: Invalid ticket ID or other issues' },
            403: { description: 'Unauthorized: Only SYSOP users can access this endpoint' },
            500: { description: 'Internal server error' },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
        controller: 'controllers/providers/ticketController.deleteTicketAsync',
    },
    {
        sectionTitle: 'Support Tickets Management',
        path: 'support-tickets/confirm-delete-ticket',
        method: 'post',
        summary: 'Confirm ticket deletion',
        description: 'Allows SYSOP users to confirm ticket deletion using an operation key. Deletes the ticket and its associated data.',
        body: {
            operationKey: { type: 'string', required: true, description: 'Unique operation key received during deletion initiation.' },
        },
        responses: {
            200: {
                description: 'Ticket and associated data deleted successfully',
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            properties: {
                                message: { type: 'string', example: 'Ticket and associated data deleted successfully.' },
                            },
                        },
                    },
                },
            },
            400: { description: 'Invalid or expired operation key.' },
            403: { description: 'Unauthorized: Only SYSOP users can access this endpoint' },
            404: { description: 'Ticket not found' },
            500: { description: 'Internal server error' },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
        controller: 'controllers/providers/ticketController.confirmDeleteTicketAsync',
    },
    {
        sectionTitle: 'Support Tickets Management',
        path: 'support-tickets/get-all',
        method: 'get',
        summary: 'Fetch all tickets',
        description: 'Allows SYSOP users to fetch all tickets and their responses. Optionally filter by ticket status. Optional filter for ticket status (e.g., CREATED, ANSWERED, CUSTOMER_RESPONSE).',
        parameters: {
            status: {
                type: 'string',
                required: false,
                description: 'Optional filter for ticket status (e.g., CREATED, ANSWERED, CUSTOMER_RESPONSE).',
            },
        },
        responses: {
            200: {
                description: 'Tickets fetched successfully',
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            properties: {
                                message: { type: 'string', example: 'Tickets fetched successfully' },
                                tickets: {
                                    type: 'array',
                                    items: {
                                        type: 'object',
                                        properties: {
                                            ticketID: { type: 'string', example: 'uuid-v4-string' },
                                            ticketType: { type: 'string', example: 'SUGGESTION' },
                                            ticketTitle: { type: 'string', example: 'App Issue' },
                                            ticketDescription: { type: 'string', example: 'Detailed description of the issue' },
                                            ticketStatus: { type: 'string', example: 'CREATED' },
                                        },
                                    },
                                },
                                responses: {
                                    type: 'array',
                                    items: {
                                        type: 'object',
                                        properties: {
                                            responseID: { type: 'string', example: 'uuid-v4-string' },
                                            ticketResponse: { type: 'string', example: 'Reply content' },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
            403: { description: 'Unauthorized: Only SYSOP users can access this endpoint' },
            500: { description: 'Internal server error' },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
        controller: 'controllers/providers/ticketController.getAllTicketsAsync',
    },
    {
        sectionTitle: 'Support Tickets Management',
        path: 'support-tickets/get-ticket/{ticketID}',
        method: 'get',
        summary: 'Fetch specific ticket and responses',
        description: 'Fetches a specific ticket and its associated responses by ticket ID.',
        parameters: {
            ticketID: { type: 'string', required: true, description: 'The unique ID of the ticket.' },
        },
        responses: {
            200: {
                description: 'Ticket and responses fetched successfully',
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            properties: {
                                message: { type: 'string', example: 'Ticket fetched successfully' },
                                ticket: {
                                    type: 'object',
                                    properties: {
                                        ticketID: { type: 'string', example: 'uuid-v4-string' },
                                        ticketType: { type: 'string', example: 'SUGGESTION' },
                                        ticketTitle: { type: 'string', example: 'App Issue' },
                                        ticketDescription: { type: 'string', example: 'Detailed description of the issue' },
                                        ticketStatus: { type: 'string', example: 'CREATED' },
                                    },
                                },
                                responses: {
                                    type: 'array',
                                    items: {
                                        type: 'object',
                                        properties: {
                                            responseID: { type: 'string', example: 'uuid-v4-string' },
                                            ticketResponse: { type: 'string', example: 'Reply content' },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
            404: { description: 'Ticket not found' },
            500: { description: 'Internal server error' },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
        controller: 'controllers/providers/ticketController.getTicketByIDAsync',
    },
    {
        sectionTitle: 'Support Tickets Management',
        path: 'support-tickets/get-response/{responseID}',
        method: 'get',
        summary: 'Fetch specific response',
        description: 'Fetches a specific response by its response ID.',
        parameters: {
            responseID: { type: 'string', required: true, description: 'The unique ID of the response.' },
        },
        responses: {
            200: {
                description: 'Response fetched successfully',
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            properties: {
                                message: { type: 'string', example: 'Response fetched successfully' },
                                response: {
                                    type: 'object',
                                    properties: {
                                        responseID: { type: 'string', example: 'uuid-v4-string' },
                                        ticketID: { type: 'string', example: 'uuid-v4-string' },
                                        ticketResponse: { type: 'string', example: 'Reply content' },
                                    },
                                },
                            },
                        },
                    },
                },
            },
            404: { description: 'Response not found' },
            500: { description: 'Internal server error' },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
        controller: 'controllers/providers/ticketController.getResponseByIDAsync',
    },
    {
        sectionTitle: 'Support Tickets Management',
        path: 'support-tickets/get-responses/{ticketID}',
        method: 'get',
        summary: 'Fetch all responses for a ticket',
        description: 'Fetches all responses associated with a specific ticket by ticket ID.',
        parameters: {
            ticketID: { type: 'string', required: true, description: 'The unique ID of the ticket.' },
        },
        responses: {
            200: {
                description: 'Responses fetched successfully',
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            properties: {
                                message: { type: 'string', example: 'Responses fetched successfully' },
                                responses: {
                                    type: 'array',
                                    items: {
                                        type: 'object',
                                        properties: {
                                            responseID: { type: 'string', example: 'uuid-v4-string' },
                                            ticketResponse: { type: 'string', example: 'Reply content' },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
            404: { description: 'Ticket not found' },
            500: { description: 'Internal server error' },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
        controller: 'controllers/providers/ticketController.getResponsesByTicketIDAsync',
    },
    {
        sectionTitle: 'Support Tickets Management',
        path: 'support-tickets/get-user-ticket/{eMail}',
        method: 'get',
        summary: 'Fetch user tickets and responses',
        description: 'Fetches all tickets and responses for a specific user by their email address.',
        parameters: {
            eMail: { type: 'string', required: true, description: 'The email address of the user.' },
        },
        responses: {
            200: {
                description: 'User tickets and responses fetched successfully',
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            properties: {
                                message: { type: 'string', example: 'User tickets fetched successfully' },
                                tickets: {
                                    type: 'array',
                                    items: {
                                        type: 'object',
                                        properties: {
                                            ticketID: { type: 'string', example: 'uuid-v4-string' },
                                            ticketType: { type: 'string', example: 'SUGGESTION' },
                                            ticketTitle: { type: 'string', example: 'App Issue' },
                                            ticketDescription: { type: 'string', example: 'Detailed description of the issue' },
                                            ticketStatus: { type: 'string', example: 'CREATED' },
                                        },
                                    },
                                },
                                responses: {
                                    type: 'array',
                                    items: {
                                        type: 'object',
                                        properties: {
                                            responseID: { type: 'string', example: 'uuid-v4-string' },
                                            ticketResponse: { type: 'string', example: 'Reply content' },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
            404: { description: 'User not found' },
            500: { description: 'Internal server error' },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
        controller: 'controllers/providers/ticketController.getUserTicketsAsync',
    },
    {
        sectionTitle: 'Support Tickets Management',
        path: 'support-tickets/close-ticket/{ticketID}',
        method: 'patch',
        summary: 'Close a ticket',
        description: 'Allows users to close a ticket. USER and PREMIUM users can only close their own tickets. Returns an error if the ticket is already closed.',
        parameters: {
            ticketID: { type: 'string', required: true, description: 'The unique identifier of the ticket to be closed.' },
        },
        responses: {
            200: {
                description: 'Ticket closed successfully',
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            properties: {
                                message: { type: 'string', example: 'Ticket closed successfully' },
                                ticketID: { type: 'string', example: 'uuid-v4-string' },
                                updatedStatus: { type: 'string', example: 'CLOSED' },
                            },
                        },
                    },
                },
            },
            400: {
                description: 'This ticket is already closed',
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            properties: {
                                message: { type: 'string', example: 'This ticket is already closed' },
                            },
                        },
                    },
                },
            },
            403: {
                description: 'Unauthorized: You cannot close this ticket',
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            properties: {
                                message: { type: 'string', example: 'You are not authorized to close this ticket' },
                            },
                        },
                    },
                },
            },
            404: {
                description: 'Ticket not found',
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            properties: {
                                message: { type: 'string', example: 'Ticket not found' },
                            },
                        },
                    },
                },
            },
            500: {
                description: 'Internal server error',
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            properties: {
                                message: { type: 'string', example: 'An unexpected error occurred' },
                            },
                        },
                    },
                },
            },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
        controller: 'controllers/providers/ticketController.closeTicketAsync',
    },
    {
        sectionTitle: 'Support Tickets Management',
        path: 'support-tickets/delete-response/{responseID}',
        method: 'delete',
        summary: 'Delete a response',
        description: 'Allows users to delete a response they created. If the response has attachments, they are also deleted from MinIO.',
        parameters: {
            responseID: {
                type: 'string',
                required: true,
                description: 'The unique identifier of the response to be deleted.',
            },
        },
        responses: {
            200: {
                description: 'Response deleted successfully',
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            properties: {
                                message: { type: 'string', example: 'Response deleted successfully' },
                            },
                        },
                    },
                },
            },
            400: { description: 'Invalid responseID parameter' },
            403: { description: 'Unauthorized: You can only delete your own responses' },
            404: { description: 'Response not found' },
            500: { description: 'Internal server error' },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
        controller: 'controllers/providers/ticketController.deleteResponseAsync',
    },
    {
        sectionTitle: 'Support Tickets Management',
        path: 'support-tickets/edit-response',
        method: 'put',
        summary: 'Edit a ticket response',
        description: 'Allows users to edit their responses to tickets. Responses cannot be edited if the associated ticket is closed.',
        body: {
            responseID: {
                type: 'string',
                required: true,
                description: 'The unique identifier of the response to edit.',
            },
            ticketResponse: {
                type: 'string',
                required: true,
                description: 'The updated content of the response.',
            },
        },
        responses: {
            200: {
                description: 'Response updated successfully',
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            properties: {
                                message: { type: 'string', example: 'Response updated successfully' },
                                updatedResponse: {
                                    type: 'object',
                                    properties: {
                                        responseID: { type: 'string', example: 'uuid-v4-string' },
                                        ticketResponse: { type: 'string', example: 'Updated response content' },
                                    },
                                },
                            },
                        },
                    },
                },
            },
            400: {
                description: 'Invalid input or response cannot be edited',
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            properties: {
                                message: { type: 'string', example: 'This response cannot be edited as the associated ticket is closed.' },
                            },
                        },
                    },
                },
            },
            403: { description: 'Unauthorized: User does not own the response' },
            404: { description: 'Response or associated ticket not found' },
            500: { description: 'Internal server error' },
        },
        security: [
            {
                BearerAuth: [],
            },
        ],
        controller: 'controllers/ticketController.editResponseAsync',
    },
    {
        sectionTitle: 'Support Tickets Management',
        path: 'support-tickets/edit-ticket',
        method: 'put',
        summary: 'Edit an existing ticket',
        description: 'Allows users to edit their own tickets. At least one of "ticketTitle" or "ticketDescription" must be provided. Tickets with "CLOSED" status cannot be edited.',
        parameters: null,
        body: {
            ticketID: {
                type: 'string',
                description: 'The UUID of the ticket to edit',
                required: true,
                example: '9b3c2345-5a1e-4e6d-96cd-10b821f92f2f',
            },
            ticketTitle: {
                type: 'string',
                description: 'The new title of the ticket',
                required: false,
                example: 'Updated Ticket Title',
            },
            ticketDescription: {
                type: 'string',
                description: 'The new description of the ticket',
                required: false,
                example: 'Updated Ticket Description',
            },
        },
        responses: {
            200: {
                description: 'Ticket updated successfully',
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            properties: {
                                message: { type: 'string', example: 'Ticket updated successfully' },
                                updatedTicket: {
                                    type: 'object',
                                    properties: {
                                        ticketID: { type: 'string', example: '9b3c2345-5a1e-4e6d-96cd-10b821f92f2f' },
                                        ticketTitle: { type: 'string', example: 'Updated Ticket Title' },
                                        ticketDescription: { type: 'string', example: 'Updated Ticket Description' },
                                    },
                                },
                            },
                        },
                    },
                },
            },
            400: {
                description: 'Validation error or invalid ticket status',
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            properties: {
                                message: { type: 'string', example: 'Validation error message or "This ticket is closed and cannot be edited"' },
                            },
                        },
                    },
                },
            },
            403: {
                description: 'Unauthorized: User is not allowed to edit this ticket',
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            properties: {
                                message: { type: 'string', example: 'You are not authorized to edit this ticket' },
                            },
                        },
                    },
                },
            },
            404: {
                description: 'Ticket not found',
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            properties: {
                                message: { type: 'string', example: 'Ticket not found' },
                            },
                        },
                    },
                },
            },
            500: {
                description: 'Internal server error',
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            properties: {
                                message: { type: 'string', example: 'An error occurred while processing the request' },
                            },
                        },
                    },
                },
            },
        },
        security: [
            {
                BearerAuth: [],
            },
        ],
        controller: 'controllers/ticketController.editTicketAsync',
    },
    {
        sectionTitle: 'Support Tickets Management',
        path: 'support-tickets/delete-attachment',
        method: 'delete',
        summary: "Delete an attachment from a ticket or response",
        description: 'Allows users to delete an attachment from either a ticket or a response.',
        body: {
            ticketID: {
                type: 'string',
                required: false,
                description: 'The unique identifier of the ticket. Required if deleting from a ticket.',
            },
            responseID: {
                type: 'string',
                required: false,
                description: 'The unique identifier of the response. Required if deleting from a response.',
            },
            fileName: {
                type: 'string',
                required: true,
                description: 'The name of the file to delete.',
            },
        },
        responses: {
            200: {
                description: 'Attachment deleted successfully',
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            properties: {
                                message: { type: 'string', example: 'Attachment removed successfully from the ticket.' },
                                updatedAttachments: {
                                    type: 'array',
                                    items: { type: 'string', example: 'updated-file-name.png' },
                                },
                            },
                        },
                    },
                },
            },
            400: { description: 'Invalid input' },
            404: { description: 'Ticket, response, or file not found' },
            500: { description: 'Internal server error' },
        },
        security: [
            {
                BearerAuth: [],
            },
        ],
        controller: 'controllers/ticketController.deleteAttachmentAsync',
    },
    {
        sectionTitle: 'Support Tickets Management',
        path: 'support-tickets/add-attachment',
        method: 'post',
        summary: 'Add attachments to a ticket or response',
        description: 'Allows users to add attachments to either a ticket or a response. Maximum of 3 attachments are allowed.',
        body: {
            ticketID: {
                type: 'string',
                required: false,
                description: 'The unique identifier of the ticket. Required if adding to a ticket.',
            },
            responseID: {
                type: 'string',
                required: false,
                description: 'The unique identifier of the response. Required if adding to a response.',
            },
            attachments: {
                type: "array",
                required: true,
                items: {
                    type: "file"
                },
                description: "Attachments for the ticket (max 3 files)"
            }
        },
        responses: {
            200: {
                description: 'Attachments added successfully',
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            properties: {
                                message: { type: 'string', example: 'Attachments added successfully to the ticket.' },
                                updatedAttachments: {
                                    type: 'array',
                                    items: { type: 'string', example: 'new-file-name.png' },
                                },
                            },
                        },
                    },
                },
            },
            400: { description: 'Invalid input or too many attachments' },
            404: { description: 'Ticket or response not found' },
            500: { description: 'Internal server error' },
        },
        security: [
            {
                BearerAuth: [],
            },
        ],
        controller: 'controllers/ticketController.addAttachmentAsync',
    },
    {
        sectionTitle: 'Comic Season Management',
        path: 'comic-seasons/create-season',
        method: 'post',
        summary: 'Create a new season',
        description: 'Allows users to create a new season for a comic.',
        body: {
            comicID: {
                type: 'string',
                required: true,
                description: 'The unique identifier of the comic.',
            },
            seasonName: {
                type: 'string',
                required: true,
                description: 'The name of the season.',
            },
            seasonOrder: {
                type: 'integer',
                required: true,
                description: 'The display order of the season.',
            },
        },
        responses: {
            200: {
                description: 'Season created successfully',
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            properties: {
                                message: { type: 'string', example: 'Season created successfully.' },
                                seasonData: {
                                    type: 'object',
                                    properties: {
                                        seasonID: { type: 'string', example: 'uuid-value' },
                                        seasonName: { type: 'string', example: 'Season 1' },
                                        seasonOrder: { type: 'integer', example: 1 },
                                    },
                                },
                            },
                        },
                    },
                },
            },
            400: { description: 'Invalid input data' },
            500: { description: 'Internal server error' },
        },
        security: [
            {
                BearerAuth: [],
            },
        ],
        controller: 'controllers/seasonController.createSeasonAsync',
    },
    {
        sectionTitle: 'Comic Season Management',
        path: 'comic-seasons/edit-season',
        method: 'put',
        summary: 'Edit an existing season',
        description: 'Allows users to update the details of an existing season.',
        body: {
            seasonID: {
                type: 'string',
                required: true,
                description: 'The unique identifier of the season to edit.',
            },
            seasonName: {
                type: 'string',
                required: false,
                description: 'The new name of the season.',
            },
            seasonOrder: {
                type: 'integer',
                required: false,
                description: 'The new display order of the season.',
            },
        },
        responses: {
            200: {
                description: 'Season updated successfully',
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            properties: {
                                message: { type: 'string', example: 'Season updated successfully.' },
                                updatedSeason: {
                                    type: 'object',
                                    properties: {
                                        seasonID: { type: 'string', example: 'uuid-value' },
                                        seasonName: { type: 'string', example: 'Updated Season Name' },
                                        seasonOrder: { type: 'integer', example: 2 },
                                    },
                                },
                            },
                        },
                    },
                },
            },
            400: { description: 'Invalid input data' },
            404: { description: 'Season not found' },
            500: { description: 'Internal server error' },
        },
        security: [
            {
                BearerAuth: [],
            },
        ],
        controller: 'controllers/seasonController.editSeasonAsync',
    },
    {
        sectionTitle: 'Comic Season Management',
        path: 'comic-seasons/get-all',
        method: 'get',
        summary: 'Get all seasons',
        description: 'Fetches a list of all seasons available.',
        responses: {
            200: {
                description: 'List of seasons retrieved successfully',
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            properties: {
                                message: { type: 'string', example: 'Seasons retrieved successfully.' },
                                seasons: {
                                    type: 'array',
                                    items: {
                                        type: 'object',
                                        properties: {
                                            seasonID: { type: 'string', example: 'uuid-value' },
                                            seasonName: { type: 'string', example: 'Season 1' },
                                            seasonOrder: { type: 'integer', example: 1 },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
            500: { description: 'Internal server error' },
        },
        security: [
            {
                BearerAuth: [],
            },
        ],
        controller: 'controllers/seasonController.getAllSeasonsAsync',
    },
    {
        sectionTitle: 'Comic Season Management',
        path: 'comic-seasons/get/{seasonID}',
        method: 'get',
        summary: 'Get a specific season by ID',
        description: 'Fetches the details of a season by its unique identifier.',
        parameters: {
            seasonID: {
                type: 'string',
                required: true,
                description: 'The unique identifier of the season.',
            },
        },
        responses: {
            200: {
                description: 'Season details retrieved successfully',
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            properties: {
                                message: { type: 'string', example: 'Season retrieved successfully.' },
                                season: {
                                    type: 'object',
                                    properties: {
                                        seasonID: { type: 'string', example: 'uuid-value' },
                                        seasonName: { type: 'string', example: 'Season 1' },
                                        seasonOrder: { type: 'integer', example: 1 },
                                    },
                                },
                            },
                        },
                    },
                },
            },
            404: { description: 'Season not found' },
            500: { description: 'Internal server error' },
        },
        security: [
            {
                BearerAuth: [],
            },
        ],
        controller: 'controllers/seasonController.getSeasonByIDAsync',
    },
    {
        sectionTitle: 'Comic Season Management',
        path: 'comic-seasons/delete-season/{seasonID}',
        method: 'delete',
        summary: 'Delete a season',
        description: 'Allows users to delete a season by its unique identifier.',
        parameters: {
            seasonID: {
                type: 'string',
                required: true,
                description: 'The unique identifier of the season to delete.',
            },
        },
        responses: {
            200: {
                description: 'Season deletion initiated successfully',
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            properties: {
                                message: { type: 'string', example: 'Season deletion initiated. Use operation key to confirm.' },
                                operationKey: { type: 'string', example: 'uuid-value' },
                            },
                        },
                    },
                },
            },
            404: { description: 'Season not found' },
            500: { description: 'Internal server error' },
        },
        security: [
            {
                BearerAuth: [],
            },
        ],
        controller: 'controllers/seasonController.deleteSeasonAsync',
    },
    {
        sectionTitle: 'Comic Season Management',
        path: 'comic-seasons/confirm-delete-season',
        method: 'post',
        summary: 'Confirm season deletion',
        description: 'Confirms the deletion of a season using an operation key.',
        body: {
            operationKey: {
                type: 'string',
                required: true,
                description: 'The unique operation key for confirming the deletion.',
            },
        },
        responses: {
            200: {
                description: 'Season deleted successfully',
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            properties: {
                                message: { type: 'string', example: 'Season deleted successfully.' },
                            },
                        },
                    },
                },
            },
            400: { description: 'Invalid or expired operation key' },
            500: { description: 'Internal server error' },
        },
        security: [
            {
                BearerAuth: [],
            },
        ],
        controller: 'controllers/seasonController.confirmDeleteSeasonAsync',
    },
    {
        sectionTitle: 'Comic Season Management',
        path: 'comic-seasons/get-seasons-by-comic/{comicID}',
        method: 'get',
        summary: 'Get all seasons by comic ID',
        description: 'Fetches all seasons related to a specific comic.',
        parameters: {
            comicID: {
                type: 'string',
                required: true,
                description: 'The unique identifier of the comic.',
            },
        },
        responses: {
            200: {
                description: 'Seasons retrieved successfully',
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            properties: {
                                message: { type: 'string', example: 'Seasons retrieved successfully.' },
                                seasons: {
                                    type: 'array',
                                    items: {
                                        type: 'object',
                                        properties: {
                                            seasonID: { type: 'string', example: 'uuid-value' },
                                            seasonName: { type: 'string', example: 'Season 1' },
                                            seasonOrder: { type: 'integer', example: 1 },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
            404: { description: 'Comic not found' },
            500: { description: 'Internal server error' },
        },
        security: [
            {
                BearerAuth: [],
            },
        ],
        controller: 'controllers/seasonController.getSeasonsByComicAsync',
    },
    {
        sectionTitle: "Comic Management",
        path: "comics/create-comic",
        method: "post",
        summary: "Create a new comic",
        description: "Create a new comic along with its details and upload a banner image to MinIO storage.",
        body: {
            comicName: { "type": "string", "required": true, "description": "The name of the comic." },
            comicDescription: { "type": "string", "required": true, "description": "A detailed description of the comic." },
            comicDescriptionTitle: { "type": "string", "required": false, "description": "An optional short description title." },
            sourceCountry: { "type": "string", "required": true, "description": "The country of origin for the comic." },
            publishDate: { "type": "string", "required": true, "description": "The publication date in string format." },
            comicStatus: { "type": "string", "required": true, "description": "The status of the comic ('CONTINUE', 'MID_FINAL', 'FINAL')." },
            comicLanguage: { "type": "string", "required": true, "description": "The language of the comic." },
            comicAuthor: { "type": "string", "required": false, "description": "The author of the comic." },
            comicEditor: { "type": "string", "required": false, "description": "The editor of the comic." },
            comicCompany: { "type": "string", "required": false, "description": "The company publishing the comic." },
            comicArtist: { "type": "string", "required": false, "description": "The artist of the comic." },
            comicBanner: {
                type: "file",
                required: true,
                description: "The new banner image file for the comic."
            }
        },
        responses: {
            201: {
                description: "Comic created successfully.",
                content: {
                    "application/json": {
                        schema: {
                            type: "object",
                            properties: {
                                message: { "type": "string", "example": "Comic created successfully." },
                                comic: { "type": "object" }
                            }
                        }
                    }
                }
            },
            400: { "description": "Invalid input data or missing file." },
            500: { "description": "Internal server error." }
        },
        security: [{ "BearerAuth": [] }],
        controller: "controllers/comicController.createComic"
    },
    {
        sectionTitle: "Comic Management",
        path: "comics/bulk-create",
        method: "post",
        summary: "Bulk upload comics and episodes",
        description: "Uploads a zip file containing comic metadata and episodes. The zip should include data.yml and episode folders.",
        body: {
            file: {
                type: "file",
                required: true,
                description: "Zip file containing comic and episode data."
            },
            userID: {
                type: "string",
                required: true,
                description: "User ID of the publisher."
            }
        },
        responses: {
            201: { description: "Comic and episodes uploaded successfully." },
            400: { description: "Validation error." },
            500: { description: "Internal server error." }
        },
        security: [{ "bearerAuth": [] }],
        controller: "controllers/comic.controller.bulkCreateComicAsync"
    },
    {
        sectionTitle: 'Comic Management',
        path: 'comics/change-comic-banner',
        method: 'post',
        summary: 'Change comic banner',
        description: 'Allows users to update the banner image of an existing comic.',
        body: {
            comicID: {
                type: 'string',
                required: true,
                description: 'The unique identifier of the comic.',
            },
            comicBanner: {
                type: "file",
                required: true,
                description: "The new banner image file for the comic."
            }
        },
        responses: {
            200: {
                description: 'Comic banner updated successfully',
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            properties: {
                                message: { type: 'string', example: 'Comic banner updated successfully' },
                                comicID: { type: 'string', example: 'uuid-value' },
                                comicBannerID: { type: 'string', example: 'new-uploaded-file-name.png' },
                            },
                        },
                    },
                },
            },
            400: { description: 'Invalid input data' },
            404: { description: 'Comic not found' },
            500: { description: 'Internal server error' },
        },
        controller: 'controllers/comicController.changeComicBanner',
    },
    {
        sectionTitle: 'Comic Management',
        path: 'comics/delete-comic/{comicID}',
        method: 'delete',
        summary: 'Delete a comic',
        description: 'Deletes a comic and its associated data. Requires confirmation if dependencies exist.',
        parameters: {
            comicID: { type: 'string', required: true, description: 'The unique identifier of the comic.' },
        },
        responses: {
            200: { description: 'Comic deleted successfully' },
            400: { description: 'Comic has dependencies; confirmation required' },
            500: { description: 'Internal server error' },
        },
        security: [{ BearerAuth: [] }],
        controller: 'controllers/comicController.deleteComic',
    },
    {
        sectionTitle: 'Comic Management',
        path: 'comics/confirm-delete-comic',
        method: 'post',
        summary: 'Confirm comic deletion',
        description: 'Confirms the deletion of a comic and its dependencies.',
        body: {
            operationKey: { type: 'string', required: true, description: 'The operation key for confirming deletion.' },
        },
        responses: {
            200: { description: 'Comic and dependencies deleted successfully' },
            400: { description: 'Invalid or expired operation key' },
            500: { description: 'Internal server error' },
        },
        security: [{ BearerAuth: [] }],
        controller: 'controllers/comicController.confirmDeleteComic',
    },
    {
        sectionTitle: "Comic Management",
        path: "comics/edit-comic",
        method: "put",
        summary: "Edit an existing comic",
        description: "Allows users to update the details of an existing comic. Only the fields provided in the request body will be updated.",
        body: {
            comicID: {
                type: "string",
                required: true,
                description: "The unique identifier of the comic to be updated."
            },
            comicName: {
                type: "string",
                required: false,
                description: "The new name of the comic."
            },
            comicDescription: {
                type: "string",
                required: false,
                description: "The new detailed description of the comic."
            },
            comicDescriptionTitle: {
                type: "string",
                required: false,
                description: "The new short description title for the comic."
            },
            sourceCountry: {
                type: "string",
                required: false,
                description: "The updated country of origin for the comic."
            },
            publishDate: {
                type: "string",
                required: false,
                description: "The new publication date as a string."
            },
            comicStatus: {
                type: "string",
                required: false,
                description: "The updated status of the comic ('CONTINUE', 'MID_FINAL', 'FINAL')."
            },
            comicLanguage: {
                type: "string",
                required: false,
                description: "The updated language of the comic."
            },
            comicAuthor: {
                type: "string",
                required: false,
                description: "The updated author of the comic."
            },
            comicEditor: {
                type: "string",
                required: false,
                description: "The updated editor of the comic."
            },
            comicCompany: {
                type: "string",
                required: false,
                description: "The updated company publishing the comic."
            },
            comicArtist: {
                type: "string",
                required: false,
                description: "The updated artist of the comic."
            }
        },
        responses: {
            200: {
                description: "Comic updated successfully.",
                content: {
                    "application/json": {
                        schema: {
                            type: "object",
                            properties: {
                                message: { "type": "string", "example": "Comic updated successfully." }
                            }
                        }
                    }
                }
            },
            400: {
                description: "Invalid input data."
            },
            404: {
                description: "Comic not found."
            },
            500: {
                description: "Internal server error."
            }
        },
        security: [{ "BearerAuth": [] }],
        controller: "controllers/comicController.editComic"
    },
    {
        sectionTitle: 'Comic Management',
        path: 'comics/get-all',
        method: 'get',
        summary: 'Get all comics',
        description: 'Retrieves all comics.',
        responses: {
            200: { description: 'Comics fetched successfully' },
            500: { description: 'Internal server error' },
        },
        security: [{ BearerAuth: [] }],
        controller: 'controllers/comicController.getAll',
    },
    {
        sectionTitle: 'Comic Management',
        path: 'comics/get/{comicID}',
        method: 'get',
        summary: 'Get a comic by ID',
        description: 'Retrieves a specific comic by its unique identifier.',
        parameters: {
            comicID: { type: 'string', required: true, description: 'The unique identifier of the comic.' },
        },
        responses: {
            200: { description: 'Comic fetched successfully' },
            404: { description: 'Comic not found' },
            500: { description: 'Internal server error' },
        },
        security: [{ BearerAuth: [] }],
        controller: 'controllers/comicController.getById',
    },
    {
        sectionTitle: 'Comic Management',
        path: 'comics/get-by-category/{categoryName}',
        method: 'get',
        summary: 'Get comics by category',
        description: 'Retrieves comics that belong to a specific category.',
        parameters: {
            categoryName: { type: 'string', required: true, description: 'The name of the category.' },
        },
        responses: {
            200: { description: 'Comics fetched successfully' },
            404: { description: 'No comics found for the specified category' },
            500: { description: 'Internal server error' },
        },
        security: [{ BearerAuth: [] }],
        controller: 'controllers/comicController.getByCategory',
    },
    {
        sectionTitle: 'Comic Management',
        path: 'comics/get-by-episode/{episodeID}',
        method: 'get',
        summary: 'Get a comic by episode ID',
        description: 'Retrieves the comic associated with a specific episode.',
        parameters: {
            episodeID: { type: 'string', required: true, description: 'The unique identifier of the episode.' },
        },
        responses: {
            200: { description: 'Comic fetched successfully' },
            404: { description: 'No comic found for the specified episode' },
            500: { description: 'Internal server error' },
        },
        security: [{ BearerAuth: [] }],
        controller: 'controllers/comicController.getByEpisode',
    },
    {
        sectionTitle: 'Comic Episode Management',
        path: 'comic-episodes/create-episode',
        method: 'post',
        summary: 'Create a new episode',
        description: 'Creates a new episode with a banner and multiple images converted into a PDF.',
        body: {
            comicID: { type: 'string', required: true, description: 'The unique identifier of the comic.' },
            seasonID: { type: 'string', required: false, description: 'The unique identifier of the season.' },
            episodeOrder: { type: 'integer', required: true, description: 'The order of the episode, must be greater than 0.' },
            episodePrice: { type: 'number', format: 'double', required: true, description: 'The price of the episode.' },
            episodeName: { type: 'string', required: true, description: 'The name of the episode.' },
            episodePublisher: { type: 'string', required: true, description: 'Email of the publisher, used to find the userID.' },
            episodeBanner: { type: 'file', required: true, description: 'The banner image for the episode.' },
            episodeImages: { type: 'array', items: { type: 'file' }, required: true, description: 'Images for the episode, converted to a PDF.' },
        },
        responses: {
            201: { description: 'Episode created successfully.' },
            400: { description: 'Validation error or missing required data.' },
            500: { description: 'Internal server error.' },
        },
        security: [{ BearerAuth: [] }],
        controller: 'controllers/episodeController.createEpisodeAsync',
    },
    {
        sectionTitle: 'Comic Episode Management',
        path: 'comic-episodes/change-episode-pdf',
        method: 'post',
        summary: 'Change episode PDF',
        description: 'Updates the PDF for an existing episode, deleting the old one.',
        body: {
            episodeID: { type: 'string', required: true, description: 'The unique identifier of the episode.' },
        },
        files: {
            episodeImages: { type: 'array', items: { type: 'file' }, required: true, description: 'Images for the updated episode, converted to a new PDF.' },
        },
        responses: {
            200: { description: 'Episode PDF updated successfully.' },
            400: { description: 'Validation error or missing required data.' },
            404: { description: 'Episode not found.' },
            500: { description: 'Internal server error.' },
        },
        security: [{ BearerAuth: [] }],
        controller: 'controllers/episodeController.changeEpisodePdfAsync',
    },
    {
        sectionTitle: 'Comic Episode Management',
        path: 'comic-episodes/edit-episode',
        method: 'put',
        summary: 'Edit episode details',
        description: 'Updates the details of an existing episode, excluding files.',
        body: {
            episodeID: { type: 'string', required: true, description: 'The unique identifier of the episode.' },
            comicID: { type: 'string', required: false, description: 'The unique identifier of the comic.' },
            seasonID: { type: 'string', required: false, description: 'The unique identifier of the season.' },
            episodeOrder: { type: 'integer', required: false, description: 'The order of the episode.' },
            episodePrice: { type: 'number', format: 'double', required: false, description: 'The price of the episode.' },
            episodeName: { type: 'string', required: false, description: 'The name of the episode.' },
            episodePublisher: { type: 'string', required: false, description: 'Email of the publisher, used to find the userID.' },
        },
        responses: {
            200: { description: 'Episode details updated successfully.' },
            400: { description: 'Validation error or missing required data.' },
            404: { description: 'Episode not found.' },
            500: { description: 'Internal server error.' },
        },
        security: [{ BearerAuth: [] }],
        controller: 'controllers/episodeController.editEpisodeAsync',
    },
    {
        sectionTitle: 'Comic Episode Management',
        path: 'comic-episodes/change-episode-banner',
        method: 'post',
        summary: 'Change episode banner',
        description: 'Updates the banner image for an existing episode.',
        body: {
            episodeID: { type: 'string', required: true, description: 'The unique identifier of the episode.' },
        },
        files: {
            episodeBanner: { type: 'file', required: true, description: 'The new banner image for the episode.' },
        },
        responses: {
            200: { description: 'Episode banner updated successfully.' },
            400: { description: 'Validation error or missing required data.' },
            404: { description: 'Episode not found.' },
            500: { description: 'Internal server error.' },
        },
        security: [{ BearerAuth: [] }],
        controller: 'controllers/episodeController.changeEpisodeBannerAsync',
    },
    {
        sectionTitle: 'Comic Episode Management',
        path: 'comic-episodes/delete-episode/{episodeID}',
        method: 'delete',
        summary: 'Delete an episode',
        description: 'Deletes an episode if it has no dependencies, otherwise requires confirmation.',
        parameters: {
            episodeID: { type: 'string', required: true, description: 'The unique identifier of the episode.' },
        },
        responses: {
            200: { description: 'Episode deleted successfully.' },
            400: { description: 'Episode has dependencies and requires confirmation.' },
            404: { description: 'Episode not found.' },
            500: { description: 'Internal server error.' },
        },
        security: [{ BearerAuth: [] }],
        controller: 'controllers/episodeController.deleteEpisodeAsync',
    },
    {
        sectionTitle: 'Comic Episode Management',
        path: 'comic-episodes/confirm-delete-episode',
        method: 'post',
        summary: 'Confirm delete episode',
        description: 'Confirms the deletion of an episode with dependencies after user confirmation.',
        body: {
            operationKey: { type: 'string', required: true, description: 'The operation key for confirming deletion.' },
        },
        responses: {
            200: { description: 'Episode and dependencies deleted successfully.' },
            400: { description: 'Invalid or expired operation key.' },
            500: { description: 'Internal server error.' },
        },
        security: [{ BearerAuth: [] }],
        controller: 'controllers/episodeController.confirmDeleteEpisodeAsync',
    },
    {
        sectionTitle: 'Comic Episode Management',
        path: 'comic-episodes/get-all',
        method: 'get',
        summary: 'Get all episodes',
        description: 'Retrieves all episodes.',
        responses: {
            200: { description: 'Episodes fetched successfully.' },
            500: { description: 'Internal server error.' },
        },
        security: [{ BearerAuth: [] }],
        controller: 'controllers/episodeController.getAllEpisodesAsync',
    },
    {
        sectionTitle: 'Comic Episode Management',
        path: 'comic-episodes/get-by-season/{seasonID}',
        method: 'get',
        summary: 'Get episodes by season',
        description: 'Retrieves episodes belonging to a specific season.',
        parameters: {
            seasonID: { type: 'string', required: true, description: 'The unique identifier of the season.' },
        },
        responses: {
            200: { description: 'Episodes fetched successfully.' },
            404: { description: 'No episodes found for the specified season.' },
            500: { description: 'Internal server error.' },
        },
        security: [{ BearerAuth: [] }],
        controller: 'controllers/episodeController.getBySeasonAsync',
    },
    {
        sectionTitle: 'Comic Episode Management',
        path: 'comic-episodes/get-by-comic/{comicID}',
        method: 'get',
        summary: 'Get episodes by comic',
        description: 'Retrieves episodes belonging to a specific comic.',
        parameters: {
            comicID: { type: 'string', required: true, description: 'The unique identifier of the comic.' },
        },
        responses: {
            200: { description: 'Episodes fetched successfully.' },
            404: { description: 'No episodes found for the specified comic.' },
            500: { description: 'Internal server error.' },
        },
        security: [{ BearerAuth: [] }],
        controller: 'controllers/episodeController.getByComicAsync',
    },
    {
        sectionTitle: 'Comic Episode Management',
        path: 'comic-episodes/get/{episodeID}',
        method: 'get',
        summary: 'Get episode by ID',
        description: 'Retrieves the details of an episode by its unique identifier.',
        parameters: {
            episodeID: { type: 'string', required: true, description: 'The unique identifier of the episode.' },
        },
        responses: {
            200: { description: 'Episode fetched successfully.' },
            404: { description: 'Episode not found.' },
            500: { description: 'Internal server error.' },
        },
        security: [{ BearerAuth: [] }],
        controller: 'controllers/episodeController.getEpisodeByIdAsync',
    },
    {
        sectionTitle: "User Actions",
        path: "/user-actions/follow",
        method: "post",
        summary: "Follow a comic or category",
        description: "Allows users to follow a comic or category.",
        body: {
            userID: { "type": "string", "required": true },
            comicID: { "type": "string", "required": false },
            categoryID: { "type": "string", "required": false }
        },
        responses: {
            200: { "description": "Followed successfully" },
            400: { "description": "Validation error" },
            500: { "description": "Internal server error" }
        },
        security: [{ "bearerAuth": [] }],
        controller: "controllers/userActions.controller.followEntityAsync"
    },
    {
        sectionTitle: "User Actions",
        path: "/user-actions/unfollow",
        method: "post",
        summary: "Unfollow a comic or category",
        description: "Allows users to unfollow a comic or category.",
        body: {
            userID: { "type": "string", "required": true },
            comicID: { "type": "string", "required": false },
            categoryID: { "type": "string", "required": false }
        },
        responses: {
            200: { "description": "Unfollowed successfully" },
            400: { "description": "Validation error" },
            500: { "description": "Internal server error" }
        },
        security: [{ "bearerAuth": [] }],
        controller: "controllers/userActions.controller.unfollowEntityAsync"
    },
    {
        sectionTitle: "User Actions",
        path: "/user-actions/rate",
        method: "post",
        summary: "Rate an episode",
        description: "Allows users to rate an episode.",
        body: {
            userID: { "type": "string", "required": true },
            episodeID: { "type": "string", "required": true },
            userRating: { "type": "number", "required": true, "minimum": 0, "maximum": 5 }
        },
        responses: {
            200: { "description": "Rated successfully" },
            400: { "description": "Validation error" },
            500: { "description": "Internal server error" }
        },
        security: [{ "bearerAuth": [] }],
        controller: "controllers/userActions.controller.rateEpisodeAsync"
    },
    {
        sectionTitle: "User Actions",
        path: "/user-actions/edit-rate",
        method: "put",
        summary: "Edit user rating for an episode",
        description: "Allows a user to edit their existing rating for a specific episode.",
        body: {
            userID: { "type": "string", "required": true, "description": "The unique ID of the user." },
            episodeID: { "type": "string", "required": true, "description": "The unique ID of the episode." },
            userRating: { "type": "number", "required": true, "description": "The updated rating for the episode (1-5)." }
        },
        responses: {
            200: { "description": "Rating updated successfully" },
            404: { "description": "Rating not found for the user and episode." },
            500: { "description": "Internal server error." }
        },
        security: [{ "bearerAuth": [] }],
        controller: "controllers/userActions.controller.editEpisodeRateAsync"
    },
    {
        sectionTitle: "User Actions",
        path: "/user-actions/delete-rate",
        method: "delete",
        summary: "Delete user rating for an episode",
        description: "Deletes the user's existing rating for a specific episode.",
        body: {
            userID: { "type": "string", "required": true, "description": "The unique ID of the user." },
            episodeID: { "type": "string", "required": true, "description": "The unique ID of the episode." }
        },
        responses: {
            200: { "description": "Rating deleted successfully" },
            404: { "description": "Rating not found for the user and episode." },
            500: { "description": "Internal server error." }
        },
        security: [{ "bearerAuth": [] }],
        controller: "controllers/userActions.controller.deleteEpisodeRateAsync"
    },
    {
        sectionTitle: "User Actions",
        path: "/user-actions/comment",
        method: "post",
        summary: "Comment on an episode",
        description: "Allows users to add a comment to an episode.",
        body: {
            userID: { "type": "string", "required": true },
            episodeID: { "type": "string", "required": true },
            userComment: { "type": "string", "required": true }
        },
        responses: {
            200: { "description": "Comment added successfully" },
            400: { "description": "Validation error" },
            500: { "description": "Internal server error" }
        },
        security: [{ "bearerAuth": [] }],
        controller: "controllers/userActions.controller.commentEpisodeAsync"
    },
    {
        sectionTitle: "User Actions",
        path: "/user-actions/edit-comment",
        method: "put",
        summary: "Edit user comment for an episode",
        description: "Allows a user to edit their existing comment for a specific episode.",
        body: {
            userID: { "type": "string", "required": true, "description": "The unique ID of the user." },
            commentID: { "type": "string", "required": true, "description": "The unique ID of the comment." },
            userComment: { "type": "string", "required": true, "description": "The updated comment content." }
        },
        responses: {
            200: { "description": "Comment updated successfully" },
            404: { "description": "Comment not found for the user." },
            500: { "description": "Internal server error." }
        },
        security: [{ "bearerAuth": [] }],
        controller: "controllers/userActions.controller.editEpisodeCommentAsync"
    },
    {
        sectionTitle: "User Actions",
        path: "/user-actions/delete-comment",
        method: "delete",
        summary: "Delete user comment for an episode",
        description: "Deletes the user's existing comment for a specific episode.",
        body: {
            userID: { "type": "string", "required": true, "description": "The unique ID of the user." },
            commentID: { "type": "string", "required": true, "description": "The unique ID of the comment." }
        },
        responses: {
            200: { "description": "Comment deleted successfully" },
            404: { "description": "Comment not found for the user." },
            500: { "description": "Internal server error." }
        },
        security: [{ "bearerAuth": [] }],
        controller: "controllers/userActions.controller.deleteEpisodeCommentAsync"
    },
    {
        sectionTitle: "User Actions",
        path: "/user-actions/comments/get-by-episode/:episodeID",
        method: "get",
        summary: "Get all comments by episode ID",
        description: "Fetches all user comments associated with a specific episode.",
        parameters: {
            episodeID: {
                type: "string",
                required: true,
                description: "The unique ID of the episode."
            }
        },
        responses: {
            200: { "description": "Comments fetched successfully" },
            404: { "description": "No comments found for the given episode ID." },
            500: { "description": "Internal server error." }
        },
        security: [{ "bearerAuth": [] }],
        controller: "controllers/userActions.controller.getAllCommentsByEpisodeAsync"
    },
    {
        sectionTitle: "User Actions",
        path: "/user-actions/comments/get/:commentID",
        method: "get",
        summary: "Get a specific comment by ID",
        description: "Fetches a single user comment based on its unique ID.",
        parameters: {
            commentID: {
                type: "string",
                required: true,
                description: "The unique ID of the comment."
            }
        },
        responses: {
            200: { "description": "Comment fetched successfully" },
            404: { "description": "Comment not found." },
            500: { "description": "Internal server error." }
        },
        security: [{ "bearerAuth": [] }],
        controller: "controllers/userActions.controller.getCommentByIDAsync"
    },
    {
        sectionTitle: "User Actions",
        path: "/user-actions/comments/get-all",
        method: "get",
        summary: "Get all user comments",
        description: "Fetches all user comments available in the database.",
        parameters: [],
        responses: {
            200: {
                description: "All comments fetched successfully",
                content: {
                    "application/json": {
                        schema: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    commentID: { "type": "string", "example": "f47ac10b-58cc-4372-a567-0e02b2c3d479" },
                                    userID: { "type": "string", "example": "e71ac10b-91cd-4472-a567-0e02b2c3d411" },
                                    comicID: { "type": "string", "example": "d29bc10b-33ab-4572-c101-0e02b2c3d588" },
                                    episodeID: { "type": "string", "example": "b21ec10b-91bc-4872-d123-0e02b2c3d433" },
                                    userComment: { "type": "string", "example": "This is a great episode!" }
                                }
                            }
                        }
                    }
                }
            },
            500: { description: "Internal server error." }
        },
        security: [{ "bearerAuth": [] }],
        controller: "controllers/userActions.controller.getAllCommentsAsync"
    },
    {
        sectionTitle: "Comic Stats Management",
        path: "comic-stats/{statType}/{type}/{id}",
        method: "get",
        summary: "Fetch stats based on type",
        description: "Fetches rates, views, downloads, or comments for comics, episodes, categories, or seasons.",
        parameters: {
            statType: {
                type: "string",
                enum: ["rates", "views", "downloads", "comments"],
                required: true
            },
            type: {
                type: "string",
                enum: ["comic", "episode", "category", "season"],
                required: true
            },
            id: {
                type: "string",
                description: "UUID of the respective comic, episode, category, or season.",
                required: true
            }
        },
        responses: {
            200: {
                description: "Statistics fetched successfully",
                content: {
                    "application/json": {
                        schema: {
                            type: "object",
                            properties: {
                                total: { "type": "integer", "example": 42 },
                                data: {
                                    type: "array",
                                    items: {
                                        type: "object"
                                    }
                                }
                            }
                        }
                    }
                }
            },
            400: { description: "Validation error: Invalid type or parameters" },
            500: { description: "Internal server error" }
        },
        security: [
            {
                "bearerAuth": []
            }
        ],
        controller: "controllers/stats/stats.controller.getStats"
    },
    {
        sectionTitle: "Comic Stats Management",
        path: "comic-stats/user-stats/{statType}/{type}/{id}",
        method: "post",
        summary: "Fetch user-specific stats by type",
        description: "Fetches user-specific downloads, ratings, or comments for comics or episodes.",
        parameters: {
            statType: {
                type: "string",
                enum: ["downloads", "ratings", "comments"],
                required: true
            },
            type: {
                type: "string",
                enum: ["comic", "episode"],
                required: true
            },
            id: {
                type: "string",
                description: "UUID of the respective comic or episode.",
                required: true
            }
        },
        body: {
            userID: {
                type: "string",
                description: "UUID of the user",
                required: true
            }
        },
        responses: {
            200: {
                description: "User-specific stats fetched successfully",
                content: {
                    "application/json": {
                        schema: {
                            type: "object",
                            properties: {
                                statType: { "type": "string", "example": "ratings" },
                                type: { "type": "string", "example": "comic" },
                                id: { "type": "string", "example": "uuid-v4-id" },
                                userID: { "type": "string", "example": "uuid-v4-id" },
                                data: {
                                    type: "array",
                                    items: {
                                        type: "object"
                                    }
                                }
                            }
                        }
                    }
                }
            },
            400: { description: "Validation error: Invalid parameters or body" },
            404: { description: "No stats found for the given parameters" },
            500: { description: "Internal server error" }
        },
        security: [
            {
                "bearerAuth": []
            }
        ],
        controller: "controllers/stats/stats.controller.getUserStats"
    }
];

module.exports = endpoints;