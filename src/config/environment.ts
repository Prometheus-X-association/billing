import dotenv from 'dotenv';

const development =
  process.argv.findIndex((arg) => arg === '--development') !== -1;
dotenv.config({ path: development ? '.env.dev' : '.env' });

const port = +(process.env.port || 3000);

export const config = {
  port,
};
