import supertest from 'supertest';
import { expect } from 'chai';
import sinon from 'sinon';
import { config } from '../../src/config/environment';
import http from 'http';
import StripeSessionService from '../../src/services/StripeSessionService';
import { getApp } from '../../src/app';
import { Logger } from '../../src/libs/Logger';

let server: http.Server;
let stripeStub: any;
let testConnectedAccountId: string;
let testCustomerId: string;

describe('Stripe Session CRUD API', function () {
    before(async function () {
        const app = await getApp();
        await new Promise<void>((resolve) => {
            const { port } = config;
            server = app.listen(port, () => {
                Logger.info({
                    message: `Test server is running on port ${port}`,
                });
                resolve();
            });
        });

        // This stripeStub object is created to mock the Stripe API functionality
        // It uses Sinon to create stub methods for various Stripe operations
        // These stubs will be used to simulate Stripe API responses in our tests
        stripeStub = {
            accounts: {
                create: sinon.stub(), // Stub for creating Stripe connected accounts
            },
            customers: {
                create: sinon.stub(), // Stub for creating Stripe customers
            },
            checkout: {
                sessions: {
                    create: sinon.stub(), // Stub for creating Stripe checkout sessions
                },
            },
        };

        const stripeSessionService = StripeSessionService.retrieveServiceInstance();
        (stripeSessionService as any).stripeService = stripeStub;

        // Create a test connected account
        const fakeAccount = {
            id: 'acct_123456789',
            type: 'standard',
            email: 'test@example.com',
        };
        stripeStub.accounts.create.resolves(fakeAccount);
        const accountResponse = await supertest(server).post('/api/stripe/accounts').send({
            type: 'standard',
            country: 'FR',
            email: 'test@example.com',
        });
        testConnectedAccountId = accountResponse.body.id;

        // Create a test customer
        const fakeCustomer = {
            id: 'cus_123456789',
            email: 'test_customer_1@example.com',
            name: 'Test Customer 1',
        };
        stripeStub.customers.create.resolves(fakeCustomer);
        const customerResponse = await supertest(server).post('/api/stripe/customers').send({
            email: 'test_customer_1@example.com',
            name: 'Test Customer 1',
        });
        testCustomerId = customerResponse.body.id;
    });

    after(function () {
        if (server) {
            server.close(() => {
                Logger.info({
                  message: 'Test server closed',
                });
              });
            sinon.restore();
        }
    });

    it('should create a new session', async () => {
        const fakeSession = {
            id: 'cs_test_123456789',
            object: 'checkout.session',
            customer: testCustomerId,
            mode: 'setup',
        };
        stripeStub.checkout.sessions.create.resolves(fakeSession);

        const response = await supertest(server)
            .post('/api/stripe/session')
            .set('stripe-account', testConnectedAccountId)
            .send({
                customer: testCustomerId,
                mode: 'setup',
                success_url: 'https://example.com/success',
                cancel_url: 'https://example.com/cancel'
            });

        expect(response.status).to.equal(201);
        expect(response.body).to.have.property('id');
        expect(response.body).to.have.property('object', 'checkout.session');
        expect(response.body).to.have.property('customer');
        expect(response.body).to.have.property('mode', 'setup');
    });

    it('should return 500 when session creation fails', async () => {
        stripeStub.checkout.sessions.create.rejects(new Error('Session creation failed'));

        const response = await supertest(server)
            .post('/api/stripe/session')
            .set('stripe-account', testConnectedAccountId)
            .send({
                customer: 'invalid_customer',
                line_items: [
                    {
                        price: 'price_12345',
                        quantity: 1
                    }
                ],
                mode: 'payment',
                success_url: 'https://example.com/success',
                cancel_url: 'https://example.com/cancel'
            });

        expect(response.status).to.equal(500);
        expect(response.body).to.have.property('message');
    });
});
