const swaggerJSDoc = require('swagger-jsdoc');
const fs = require('fs');
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

// Dynamically load endpoints from routers
const getEndpoints = () => {
    const endpoints = [];
    const routerPath = path.join(__dirname, '../routers');
    fs.readdirSync(routerPath)
        .filter((file) => file !== 'index.js' && file.endsWith('.js')) // Exclude index.js
        .forEach((file) => {
            const router = require(path.join(routerPath, file));
            if (router.endpoints) {
                endpoints.push(...router.endpoints);
            }
        });
    return endpoints;
};

const generatePaths = () => {
    const paths = {};
    getEndpoints().forEach((endpoint) => {
        paths[endpoint.path] = {
            [endpoint.method]: {
                summary: endpoint.summary,
                description: endpoint.description,
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: endpoint.body,
                            },
                        },
                    },
                },
                responses: Object.entries(endpoint.responses).reduce((acc, [status, response]) => {
                    acc[status] = { description: response.description };
                    return acc;
                }, {}),
            },
        };
    });
    return paths;
};

const swaggerSpec = {
    ...swaggerDefinition,
    paths: generatePaths(),
};

module.exports = swaggerSpec;
