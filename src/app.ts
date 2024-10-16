import express, { Request, Response, NextFunction } from 'express';
import swaggerUi from 'swagger-ui-express';
import cors from 'cors';
import routes from './routes';
import { swaggerDocs } from './config/swagger';

export const getApp = async (url?: string): Promise<express.Application> => {
  const app = express();

  app.use(cors({ origin: true, credentials: true }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.get('/health', (req: Request, res: Response) => {
    return res.status(200).send('OK');
  });

  app.use(
    '/docs',
    swaggerUi.serve,
    (req: Request, res: Response, next: NextFunction) => {
      swaggerUi.setup(swaggerDocs, {
        customCss: '.swagger-ui .models { display: none }',
      })(req, res, next);
    },
  );

  routes(app);

  return app;
};
