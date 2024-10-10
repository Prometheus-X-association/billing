# Configuring Stripe Webhooks

Stripe webhooks allow you to receive real-time notifications about events that occur in your Stripe account. This guide will walk you through the process of setting up and configuring Stripe webhooks for your application.

## Steps to Configure Stripe Webhooks

1. **Log in to your Stripe Dashboard**
   - Go to [https://dashboard.stripe.com/](https://dashboard.stripe.com/)
   - Sign in with your Stripe account credentials

2. **Navigate to the Webhooks section**
   - In the left sidebar, click on "Developers"
   - Then click on "Webhooks"

3. **Add a new endpoint**
   - Click on the "Add endpoint" button
   - Enter the URL where you want to receive webhook events (e.g., `https://your-domain.com/stripe/webhook`)
   - Select the events you want to listen for (e.g., `payment_intent.succeeded`, `invoice.paid`, etc.)
   - Click "Add endpoint" to save

4. **Retrieve your webhook signing secret**
   - After creating the endpoint, you'll see a "Signing secret" for that endpoint
   - Keep this secret safe and secure, as you'll need it to verify webhook signatures

5. **Add the signing secret to your .env file**
   - Open your project's `.env` file
   - Add a new line with your webhook signing secret:

     ```env
     STRIPE_SECRET_WEBHOOK=whsec_your_webhook_signing_secret_here
     ```

   - Make sure not to commit this file to version control

6. **Test your webhook**
   - Use Stripe's webhook testing tool in the dashboard to send test events to your endpoint
   - Verify that your application correctly receives and processes these test events

## Example Webhook Handler (Node.js/Express)

Here's a basic example of how to implement a webhook handler in a Node.js/Express application:
