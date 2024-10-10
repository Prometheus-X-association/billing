# PTX Billing Component

## Overview

The PTX Billing Component is a comprehensive billing system that integrates with Stripe for payment processing. It provides a set of APIs for managing connected accounts, customers, products, prices, subscriptions, and other billing-related operations inside the PTX ecosystem.

## Key Features

1. Connected Account Management
2. Customer Management
3. Product Management
4. Price Management
5. Subscription Management
6. Setup Intent Handling
7. Payment Intent Management
8. Webhook Processing
9. ODRL Management endpoints

## Architecture

The project follows a modular architecture with the following main components:

1. Routes: Define API endpoints
2. Controllers: Handle request/response logic
3. Services: Implement business logic and interact with Stripe API
4. Models: Define data schema and interact with MongoDB

## Routes

see [routes](./src/routes) and [swagger](./docs/swagger.json) documentation at '/docs'.

## API Documentation

The API is documented using Swagger. Each route file contains detailed Swagger annotations describing the endpoints, request/response formats, and possible status codes.

You can also generate the static swagger.json documentation inside the docs folder by running `npm run swagger:generate`.

## Testing

The project includes unit, functional and scenario tests for various components, particularly for the billing and Stripe synchronization services.

All the tests are written with mocha, chai and sinon and are located in the tests folder.

They can be run with the command `npm test`, or `npm run test:unitary`, `npm run test:functional`, `npm run test:scenario`, `npm run test:integration` for specific types of tests.

The scenario and integration tests will create data in the stripe test environment so the .env.test file must be configured correctly with the correct stripe test keys.

The test command will generate an Html and json report in the mochawesome-report folder.

## Stripe Integration

The project heavily integrates with Stripe for payment processing. It includes services for managing Stripe resources such as connected accounts, customers, products, prices, and subscriptions.

See [stripe documentation](https://docs.stripe.com/api) for more information about the Stripe API and the parameters and options available.

## Connected Accounts

The system supports Stripe Connect, allowing for operations on behalf of connected accounts. Many routes and services include a `stripe-account` header to specify the account context.

This header is mandatory for all routes that interact with connected accounts, such as:

- /api/stripe/customers
- /api/stripe/payment_intents
- /api/stripe/prices
- /api/stripe/products
- /api/stripe/subscriptions

## Getting Started

To run the project:

1. Install dependencies: `npm install` or `pnpm install`
2. Set up environment variables (including Stripe API keys, webhook secret and mongoURI)
3. build the project: `npm build`
4. Start the server: `npm start`

For testing:

- Set up environment variables in .env.test (including Stripe API TEST keys, webhook TEST secret and mongoURI)
- Run tests: `npm test`
- Or run specific tests: `npm run test:unitary`, `npm run test:functional`, `npm run test:scenario`, `npm run test:integration`
- see reports in the mochawesome-report folder

For development:

- Set up environment variables in .env.dev
- Start in development mode: `npm run dev`
