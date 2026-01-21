import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'IFESX API',
            version: '1.0.0',
            description: 'API documentation for IFESX Scheduling System (VDV 452)',
        },
        servers: [
            {
                url: 'http://localhost:3000',
                description: 'Development server',
            },
        ],
    },
    apis: ['./src/controllers/*.ts', './src/models/**/*.ts', './src/app.ts'], // Files containing annotations
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
