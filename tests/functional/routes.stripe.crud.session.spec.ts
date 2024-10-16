import supertest from 'supertest';
import { expect } from 'chai';
import sinon from 'sinon';
import { config } from '../../src/config/environment';
import http from 'http';
import { getApp } from '../../src/app';
import { Logger } from '../../src/libs/Logger';
import Stripe from 'stripe';
import StripeService from '../../src/services/StripeSubscriptionSyncService';

let server: http.Server;
let stripeStub: Stripe;
let testConnectedAccountId: string = 'acct_123456789';
let testCustomerId: string = 'cus_123456789';

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

        // Set up Stripe stub
        stripeStub = {
            checkout: {
                sessions: {
                    create: sinon.stub(),
                },
            },
        } as unknown as Stripe;

        const stripeServiceStub = sinon.createStubInstance(StripeService);
        stripeServiceStub.getStripe.returns(stripeStub);
        sinon
            .stub(StripeService, 'retrieveServiceInstance')
            .returns(stripeServiceStub as any);
    });

    after(function () {
        if (server) {
            server.close(() => {
                Logger.info({
                    message: 'Test server closed',
                });
            });
        }
        sinon.restore();
    });

    it('should create a new session', async () => {
        const fakeSession = {
            id: 'cs_test_123456789',
            object: 'checkout.session',
            customer: testCustomerId,
            mode: 'setup',
        };
        (stripeStub.checkout.sessions.create as sinon.SinonStub).resolves(fakeSession);

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
        (stripeStub.checkout.sessions.create as sinon.SinonStub).rejects(new Error('Session creation failed'));

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
