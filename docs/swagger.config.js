const swaggerJSDoc = require('swagger-jsdoc');
const endpoints = require('./swagger.data');
const path = require('path');

// Swagger Definition
const swaggerDefinition = {
    openapi: '3.0.0',
    info: {
        title: 'Complete IoT Solution API',
        version: '1.0.0',
        description: 'API documentation for the Complete IoT Solution',
    },
    servers: [
        {
            url: 'http://localhost:4000/api/v1', // Base URL
        },
    ],
};

// Generate Paths and Middleware
const generatePathsAndRoutes = (router, authValidator, tokenControl) => {
    const paths = {};

    endpoints.forEach((endpoint) => {
        if (!endpoint.path || !endpoint.method || !endpoint.controller) {
            console.warn(`Invalid endpoint: ${JSON.stringify(endpoint)}`);
            return;
        }

        // Add to Swagger paths
        paths[endpoint.path] = {
            [endpoint.method]: {
                summary: endpoint.summary || '',
                description: endpoint.description || '',
                requestBody: endpoint.body
                    ? {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: endpoint.body,
                                },
                            },
                        },
                    }
                    : undefined,
                responses: Object.entries(endpoint.responses || {}).reduce((acc, [status, response]) => {
                    acc[status] = { description: response.description };
                    return acc;
                }, {}),
            },
        };

        // Resolve controller dynamically
        try {
            const [controllerPath, functionName] = endpoint.controller.split('.');
            const controller = require(path.resolve(controllerPath));

            if (!controller || typeof controller[functionName] !== 'function') {
                throw new Error(`Method ${functionName} not found in ${controllerPath}`);
            }

            // Add routes to Express router
            const middlewares = [];
            if (endpoint.body) middlewares.push(authValidator[endpoint.body]);
            if (['/token-decode', '/logout'].includes(endpoint.path)) {
                middlewares.push(tokenControl);
            }
            router[endpoint.method](endpoint.path, ...middlewares, controller[functionName]);
        } catch (error) {
            console.error(`No controller method found for ${endpoint.path}:`, error.message);
        }
    });

    return paths;
};

module.exports = (router, authValidator, tokenControl) => {
    const paths = generatePathsAndRoutes(router, authValidator, tokenControl);

    return {
        ...swaggerDefinition,
        paths,
    };
};