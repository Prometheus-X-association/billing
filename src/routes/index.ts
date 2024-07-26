import e, { Application } from 'express';
import privateRoutes from './private/';

type RouterSetup = {
  prefix: string;
  routers: {
    prefix: string;
    router: e.Router;
  }[];
  middleware?: () => unknown;
};

const routersToSetup = [privateRoutes];

export = (app: Application) => {
  routersToSetup.forEach((config: RouterSetup) => {
    const { prefix, middleware } = config;
    config.routers.forEach((router) => {
      const fullPrefix = prefix + router.prefix;
      const routers = middleware ? [middleware, router.router] : router.router;
      app.use(fullPrefix, routers);
    });
  });
};
