import { config } from './config/environment';
import { getApp } from './app';
import express from 'express';
import { IncomingMessage, Server, ServerResponse } from 'http';
import BillingSubscriptionSyncService from './services/BillingSubscriptionSyncService';
import { Logger } from './libs/Logger';
import { BillingSubscriptionCleanRefresh } from './services/BillingSubscriptionCleanRefresh';
import StripeSubscriptionSyncService from './services/StripeSubscriptionSyncService';
import StripeSubscriptionCrudService from './services/StripeSubscriptionCrudService';

type AppServer = {
  app: express.Application;
  server: Server<typeof IncomingMessage, typeof ServerResponse>;
};

export const main = async (): Promise<AppServer> => {
  const app = await getApp();
  const { port } = config;
  // Init sync service on server start
  const syncService =
    await BillingSubscriptionSyncService.retrieveServiceInstance();
  // Init stripe services on server start
  StripeSubscriptionSyncService.retrieveServiceInstance();
  StripeSubscriptionCrudService.retrieveServiceInstance();
  // Init cleaner service on server start
  const cleanerService = new BillingSubscriptionCleanRefresh({}, syncService);
  await cleanerService.start();
  const server = app.listen(port, () => {
    Logger.log({
      message: `Server running on: http://localhost: ${port}`,
    });
  });
  return { app, server };
};

// eslint-disable-next-line @typescript-eslint/no-floating-promises
main();
