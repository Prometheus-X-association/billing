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

describe('Stripe Token CRUD API', function () {
    before(async function () {
        const app = await getApp();
        await new Promise((resolve) => {
            const { port } = config;
            server = app.listen(port, () => {
                Logger.info({
                    message: `Test server is running on port ${port}`,
                });
                resolve(true);
            });
        });

        // Set up Stripe stub
        stripeStub = {
            tokens: {
                create: sinon.stub(),
            },
        } as unknown as Stripe;

        const stripeServiceStub = sinon.createStubInstance(StripeService);
        stripeServiceStub.getStripe.returns(stripeStub);
        sinon
            .stub(StripeService, 'retrieveServiceInstance')
            .returns(stripeServiceStub as any);
    });

    after(() => {
        if (server) {
            server.close(() => {
                Logger.info({
                  message: 'Test server closed',
                });
            });
        }
        sinon.restore();
    });

    it('should create a new account token', async () => {
        const fakeToken = {
            id: 'tok_123456789',
            object: 'token',
            type: 'account',
        };
        (stripeStub.tokens.create as sinon.SinonStub).resolves(fakeToken);

        const response = await supertest(server)
            .post('/api/stripe/token')
            .send({
                "account": {
                    "business_type": "company",
                    "tos_shown_and_accepted": "true",
                    "company": {
                        "name": "My Company"
                    }
                }
            });
        expect(response.status).to.equal(201);
        expect(response.body).to.have.property('id');
        expect(response.body).to.have.property('object', 'token');
    });

    // Test can be enabled if the Stripe instructions have been followed
    // https://support.stripe.com/questions/enabling-access-to-raw-card-data-apis
    // it('should create a new card token', async () => {
    //     const fakeCardToken = {
    //         id: 'tok_987654321',
    //         object: 'token',
    //         type: 'card',
    //         card: {
    //             id: 'card_123456789',
    //             last4: '4242',
    //             brand: 'Visa',
    //             exp_month: 5,
    //             exp_year: 2026,
    //         },
    //     };
    //     (stripeStub.tokens.create as sinon.SinonStub).resolves(fakeCardToken);

    //     const response = await supertest(server)
    //         .post('/api/stripe/token')
    //         .send({
    //             card: {
    //                 number: '4242424242424242',
    //                 exp_month: '5',
    //                 exp_year: '2026',
    //                 cvc: '314',
    //             },
    //         });
    //     expect(response.status).to.equal(201);
    //     expect(response.body).to.have.property('id');
    //     expect(response.body).to.have.property('card');
    //     expect(response.body).to.have.property('object', 'token');
    // });
});
