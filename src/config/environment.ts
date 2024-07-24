import dotenv from 'dotenv';

const development = process.argv.includes('--development');
const test = process.argv.includes('--test');
dotenv.config({ path: development ? '.env.dev' : test ? '.env.test' : '.env' });

const port = +(process.env.PORT ?? 3000);
const mongoURI = process.env.MONGO_URI;

export const config = {
  port,
  mongoURI,
};
