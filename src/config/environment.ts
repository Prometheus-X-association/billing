import dotenv from 'dotenv';

const development = process.argv.includes('--development');
const test = process.argv.includes('--test');
dotenv.config({ path: development ? '.env.dev' : test ? '.env.test' : '.env' });

//port
const port = +(process.env.PORT ?? 3000);

//mongodb
const mongoURI =
  process.env.MONGO_URI ?? 'mongodb://127.0.0.1:27017/billing-dev';

// stripe keys
const stripeSecretKey = process.env.STRIPE_SECRET_KEY ?? null;
const stripeWebhookSecret = process.env.STRIPE_SECRET_WEBHOOK ?? null;

if (test && (!stripeSecretKey?.includes('test'))) {
  console.log('Stripe keys test are needed for test environment');
  process.exit(1);
}

export const config = {
  port,
  mongoURI,
  stripeSecretKey,
  stripeWebhookSecret,
};
