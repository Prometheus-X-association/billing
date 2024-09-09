import { config } from './config/environment';
import { getApp } from './app';
import express from 'express';
import { IncomingMessage, Server, ServerResponse } from 'http';
import BillingSubscriptionSyncService from './services/BillingSubscriptionSyncService';
import { Logger } from './libs/Logger';
import { BillingSubscriptionCleanRefresh } from './services/BillingSubscriptionCleanRefresh';

type AppServer = {
  app: express.Application;
  server: Server<typeof IncomingMessage, typeof ServerResponse>;
};

export const main = async (): Promise<AppServer> => {
  const app = await getApp();
  const { port } = config;
  // Init sync service on server start
  const syncService = await BillingSubscriptionSyncService.getService();
  // Init cleaner service on server start
  const cleanerService = new BillingSubscriptionCleanRefresh({}, syncService);
  cleanerService.start();
  const server = app.listen(port, () => {
    Logger.log({
      message: `Server running on: http://localhost: ${port}`,
    });
  });
  return { app, server };
};

main();
