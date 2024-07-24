import dotenv from 'dotenv';

const development =
  process.argv.findIndex((arg) => arg === '--development') !== -1;
dotenv.config({ path: development ? '.env.dev' : '.env' });

const port = +(process.env.PORT ?? 3000);
const mongoURI = process.env.MONGO_URI;

export const config = {
  port,
  mongoURI,
};
