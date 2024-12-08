const endpoints = require('./swagger.data');

const generateSwaggerSpec = () => {
    const paths = {};

    endpoints.forEach(endpoint => {
        const { path, method, summary, description, body, responses } = endpoint;

        if (!paths[path]) paths[path] = {};

        paths[path][method.toLowerCase()] = {
            summary,
            description,
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
                    ...(details.schema ? { content: { 'application/json': { schema: details.schema } } } : {}),
                };
                return acc;
            }, {}),
        };
    });

    return {
        openapi: '3.0.0',
        info: {
            title: 'NarcoLepsy API Gateway',
            version: '1.0.0',
            description: 'This backend system is designed to power the NarcoLepsy magazine platform, encompassing both manghwa and manhwa content. It serves as the core infrastructure for managing and operating the entire magazine ecosystem efficiently and reliably.',
        },
        servers: [
            {
                url: 'https://api.narcolepsy.com/v1/',
                description: 'Main Server',
            },
        ],
        paths,
    };
};

const spec = generateSwaggerSpec();
module.exports = spec;