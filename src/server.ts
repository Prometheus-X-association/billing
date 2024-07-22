import { config } from './config/environment';
import express, { Request, Response } from 'express';
import cors from 'cors';
import { IncomingMessage, Server, ServerResponse } from 'http';

export type AppServer = {
  app: express.Application;
  server: Server<typeof IncomingMessage, typeof ServerResponse>;
};

export const startServer = async (port?: number) => {
  const app = express();

  app.use(cors({ origin: true, credentials: true }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.get('/health', (req: Request, res: Response) => {
    return res.status(200).send('OK');
  });

  const PORT = port ? port : config.port;

  const server = app.listen(PORT, () => {
    console.log('Server running on: http://localhost:' + PORT);
  });

  return { app, server } as AppServer;
};
