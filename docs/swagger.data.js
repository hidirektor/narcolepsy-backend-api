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
    },
    {
        sectionTitle: 'Comic Categories',
        path: 'comic-categories/get-all',
        method: 'get',
        summary: 'List all comic categories',
        description: 'Retrieves a list of all comic categories. Requires a valid token and one of the following roles: EDITOR, MODERATOR, SYSOP.',
        responses: {
            200: {
                description: 'A list of comic categories',
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
        controller: 'controllers/providers/comic.category.controller.getAllCategoryAsync'
    },
    {
        sectionTitle: 'Comic Categories',
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
        controller: 'controllers/providers/comic.category.controller.getCategoryAsync'
    },
    {
        sectionTitle: 'Comic Categories',
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
        controller: 'controllers/providers/comic.category.controller.createCategoryAsync'
    },
    {
        sectionTitle: 'Comic Categories',
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
        controller: 'controllers/providers/comic.category.controller.updateCategoryAsync'
    },
    {
        sectionTitle: 'Comic Categories',
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
        controller: 'controllers/providers/comic.category.controller.removeCategoryAsync'
    },
    {
        sectionTitle: 'Comic Categories',
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
        controller: 'controllers/providers/premium.package.controller.confirmRemovePremiumPackageAsync',
    },
    {
        sectionTitle: 'Support Tickets',
        path: 'support-tickets/create-ticket',
        method: 'post',
        summary: 'Create a support ticket',
        description: 'Allows a user to create a support ticket with a maximum of 3 images. Users can create a new ticket every 10 minutes.',
        body: {
            ticketType: { type: 'string', required: true, description: 'Type of the ticket (SUGGESTION, PROBLEM, APPLY)' },
            ticketTitle: { type: 'string', required: true, description: 'Title of the support ticket' },
            ticketDescription: { type: 'string', required: true, description: 'Description of the support ticket' },
        },
        responses: {
            201: {
                description: 'Support ticket created successfully.',
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            properties: {
                                message: { type: 'string', example: 'Support ticket created successfully.' },
                                ticket: {
                                    type: 'object',
                                    properties: {
                                        ticketID: { type: 'string', example: 'abc123' },
                                        ticketType: { type: 'string', example: 'PROBLEM' },
                                        ticketTitle: { type: 'string', example: 'Issue with payment' },
                                        ticketDescription: { type: 'string', example: 'Details of the problem.' }
                                    },
                                },
                                uploadedImages: { type: 'array', items: { type: 'string', example: 'image/path.jpg' } },
                            },
                        },
                    },
                },
            },
            429: { description: 'Too many requests. Wait before creating another ticket.' },
            500: { description: 'Internal Server Error.' },
        },
        controller: 'controllers/tickets/createTicketAsync',
    },
    {
        sectionTitle: 'Support Tickets',
        path: 'support-tickets/my-tickets',
        method: 'get',
        summary: "List user's support tickets",
        description: 'Fetches the support tickets created by the authenticated user.',
        responses: {
            200: {
                description: "List of user's support tickets.",
                content: {
                    'application/json': {
                        schema: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    ticketID: { type: 'string', example: 'abc123' },
                                    ticketTitle: { type: 'string', example: 'Issue with payment' },
                                    ticketStatus: { type: 'string', example: 'CREATED' }
                                },
                            },
                        },
                    },
                },
            },
            500: { description: 'Internal Server Error.' },
        },
        controller: 'controllers/tickets/getMyTicketsAsync',
    },
    {
        sectionTitle: 'Support Tickets',
        path: 'support-tickets/get-all',
        method: 'get',
        summary: 'List all support tickets',
        description: 'Fetches all support tickets. Requires SYSOP role.',
        responses: {
            200: {
                description: 'List of all support tickets.',
                content: {
                    'application/json': {
                        schema: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    ticketID: { type: 'string', example: 'abc123' },
                                    ticketTitle: { type: 'string', example: 'Issue with payment' },
                                    ticketStatus: { type: 'string', example: 'CREATED' }
                                },
                            },
                        },
                    },
                },
            },
            403: { description: 'Forbidden. Only SYSOP role allowed.' },
            500: { description: 'Internal Server Error.' },
        },
        controller: 'controllers/tickets/getAllTicketsAsync',
    },
    {
        sectionTitle: 'Support Tickets',
        path: 'support-tickets/get/{ticketID}',
        method: 'get',
        summary: 'Get support ticket details',
        description: 'Fetches details of a specific support ticket by its ID.',
        parameters: {
            ticketID: 'ticketID',
        },
        responses: {
            200: {
                description: 'Details of the support ticket.',
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            properties: {
                                ticketID: { type: 'string', example: 'abc123' },
                                ticketTitle: { type: 'string', example: 'Issue with payment' },
                                ticketDescription: { type: 'string', example: 'Details of the problem.' },
                                ticketStatus: { type: 'string', example: 'CREATED' }
                            },
                        },
                    },
                },
            },
            404: { description: 'Ticket not found.' },
            500: { description: 'Internal Server Error.' },
        },
        controller: 'controllers/tickets/getTicketDetailsAsync',
    },
    {
        sectionTitle: 'Support Tickets',
        path: 'support-tickets/delete-ticket/{ticketID}',
        method: 'delete',
        summary: 'Delete a support ticket',
        description: 'Deletes a specific support ticket. Requires SYSOP role.',
        parameters: {
            ticketID: 'ticketID',
        },
        responses: {
            200: { description: 'Ticket deleted successfully.' },
            404: { description: 'Ticket not found.' },
            403: { description: 'Forbidden. Only SYSOP role allowed.' },
            500: { description: 'Internal Server Error.' },
        },
        controller: 'controllers/tickets/deleteTicketAsync',
    },
    {
        sectionTitle: 'Support Tickets',
        path: 'support-tickets/{ticketID}/reply',
        method: 'post',
        summary: 'Reply to a support ticket',
        description: 'Allows a user to reply to a support ticket. Can include images.',
        parameters: {
            ticketID: 'ticketID',
        },
        body: {
            ticketResponse: { type: 'string', required: true, description: 'Response to the support ticket' },
        },
        responses: {
            200: {
                description: 'Ticket replied successfully.',
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            properties: {
                                message: { type: 'string', example: 'Ticket replied successfully.' },
                                ticket: {
                                    type: 'object',
                                    properties: {
                                        ticketID: { type: 'string', example: 'abc123' },
                                        ticketResponse: { type: 'string', example: 'We are looking into the issue.' },
                                        ticketStatus: { type: 'string', example: 'ANSWERED' }
                                    },
                                },
                                uploadedImages: { type: 'array', items: { type: 'string', example: 'image/path.jpg' } },
                            },
                        },
                    },
                },
            },
            404: { description: 'Ticket not found.' },
            500: { description: 'Internal Server Error.' },
        },
        controller: 'controllers/tickets/replyTicketAsync',
    }
];

module.exports = endpoints;