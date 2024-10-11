import swaggerJsDoc, { OAS3Definition, OAS3Options } from 'swagger-jsdoc';
import path from 'path';
import { config } from './environment';
    
const swaggerDefinition: OAS3Definition = {
    openapi: '3.0.0',
    info: {
      title: 'Billing',
      version: '1.0.0',
      description: 'Billing API documentation',
    },
    servers: [
      {
        url: `http://localhost:${config.port}`,
      },
    ],
  };

  const swaggerOptions: OAS3Options = {
    swaggerDefinition,
    apis: ['./src/routes/private/*.routes.ts'],
  };

  const swaggerDocs = swaggerJsDoc(swaggerOptions);

  export { swaggerDocs };
