import express, { Request, Response } from 'express';
import cors from 'cors';
import routes from './routes';

export const getApp = async (): Promise<express.Application> => {
  const app = express();

  app.use(cors({ origin: true, credentials: true }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.get('/health', (req: Request, res: Response) => {
    return res.status(200).send('OK');
  });

  routes(app);

  return app;
};
