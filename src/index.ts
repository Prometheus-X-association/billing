import { config } from './config/environment';
import { getApp } from './app';
import express from 'express';
import { IncomingMessage, Server, ServerResponse } from 'http';
import BillingSubscriptionSyncService from './services/BillingSubscriptionSyncService';
import { Logger } from './libs/Logger';

type AppServer = {
  app: express.Application;
  server: Server<typeof IncomingMessage, typeof ServerResponse>;
};

export const main = async (): Promise<AppServer> => {
  const app = await getApp();
  const { port } = config;
  // Init sync service on server start
  await BillingSubscriptionSyncService.getService();
  const server = app.listen(port, () => {
    Logger.log({
      message: `Server running on: http://localhost: ${port}`,
    });
  });
  return { app, server };
};

main();
