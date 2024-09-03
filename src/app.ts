import express, { Request, Response, NextFunction } from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerJsDoc, { OAS3Definition, OAS3Options } from 'swagger-jsdoc';
import cors from 'cors';
import routes from './routes';
import path from 'path';
import { config } from './config/environment';

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
  apis: [path.join(__dirname, './routes/private/*.routes.ts')],
};

export const getApp = async (): Promise<express.Application> => {
  const app = express();

  app.use(cors({ origin: true, credentials: true }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.get('/health', (req: Request, res: Response) => {
    return res.status(200).send('OK');
  });

  app.use('/api-docs', swaggerUi.serve, (req: any, res: any, next: any) => {
    const swaggerDocs = swaggerJsDoc(swaggerOptions);
    swaggerUi.setup(swaggerDocs, {
      customCss: '.swagger-ui .models { display: none }',
    })(req, res, next);
  });

  routes(app);

  return app;
};
