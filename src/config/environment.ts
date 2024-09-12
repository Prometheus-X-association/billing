import dotenv from 'dotenv';

const development = process.argv.includes('--development');
const test = process.argv.includes('--test');
dotenv.config({ path: development ? '.env.dev' : test ? '.env.test' : '.env' });

const port = +(process.env.PORT ?? 3000);
const mongoURI =
  process.env.MONGO_URI ?? 'mongodb://127.0.0.1:27017/billing-dev';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY ?? null;

export const config = {
  port,
  mongoURI,
  stripeSecretKey,
};
