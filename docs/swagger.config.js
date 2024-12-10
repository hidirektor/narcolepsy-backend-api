const fs = require('fs');
const path = require('path');
const endpoints = require('./swagger.data');

const generateSwaggerSpec = () => {
    const paths = {};
    const sections = {};

    endpoints.forEach(endpoint => {
        const { path, method, summary, description, body, responses, parameters, sectionTitle } = endpoint;

        if (!paths[path]) paths[path] = {};

        paths[path][method.toLowerCase()] = {
            summary,
            description,
            parameters: parameters
                ? Object.entries(parameters).map(([name, details]) => ({
                    name,
                    in: 'path',
                    required: details.required || false,
                    schema: {
                        type: details.type,
                    },
                }))
                : undefined,
            requestBody: body
                ? {
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: Object.fromEntries(
                                    Object.entries(body).map(([name, details]) => [
                                        name,
                                        { type: details.type },
                                    ])
                                ),
                                required: Object.entries(body)
                                    .filter(([, details]) => details.required)
                                    .map(([name]) => name),
                            },
                        },
                    },
                }
                : undefined,
            responses: Object.entries(responses).reduce((acc, [status, details]) => {
                acc[status] = {
                    description: details.description,
                    content: details.content
                        ? details.content
                        : details.schema
                            ? {
                                'application/json': {
                                    schema: details.schema,
                                },
                            }
                            : undefined,
                };
                return acc;
            }, {}),
            tags: sectionTitle ? [sectionTitle] : [],
        };

        if (sectionTitle) {
            if (!sections[sectionTitle]) sections[sectionTitle] = [];
            sections[sectionTitle].push(path);
        }
    });

    const tags = Object.keys(sections).map(title => ({
        name: title,
        description: `All endpoints related to ${title}`,
    }));

    const swaggerSpec = {
        openapi: '3.0.0',
        info: {
            title: 'NarcoLepsy API Gateway',
            version: '1.0.0',
            description: 'This backend system is designed to power the NarcoLepsy magazine platform.',
            contact: {
                name: 'Halil İbrahim Direktör',
                email: 'hidirektor@gmail.com',
                url: 'https://hidirektor.com.tr',
            },
        },
        servers: [
            {
                url: 'https://api.narcolepsy.com/v1/',
                description: 'Main Server',
            },
        ],
        paths,
        tags,
    };

    const filePath = path.join(__dirname, 'swagger.json');
    fs.writeFileSync(filePath, JSON.stringify(swaggerSpec, null, 2));

    return swaggerSpec;
};

module.exports = generateSwaggerSpec;