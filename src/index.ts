import { config } from './config/environment';
import { getServerApp } from './server';
import express from 'express';
import { IncomingMessage, Server, ServerResponse } from 'http';

type AppServer = {
  app: express.Application;
  server: Server<typeof IncomingMessage, typeof ServerResponse>;
};

export const main = async (): Promise<AppServer> => {
  const app = await getServerApp();
  const { port } = config;
  const server = app.listen(port, () => {
    console.log('Server running on: http://localhost:' + port);
  });
  return { app, server };
};

main();
