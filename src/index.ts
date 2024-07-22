import { config } from './config/environment';
import { AppServer, startServer } from './server';

export const main = async (options: { port?: number }): Promise<AppServer> => {
  const { port } = options;
  return await startServer(port);
};

main({ port: config.port });
