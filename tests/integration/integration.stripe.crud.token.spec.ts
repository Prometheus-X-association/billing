import supertest from 'supertest';
import { expect } from 'chai';
import { config } from '../../src/config/environment';
import http from 'http';
import StripeCustomerCrudService from '../../src/services/StripeCustomerCrudService';
import { getApp } from '../../src/app';
import { Logger } from '../../src/libs/Logger';

let server: http.Server;

describe('Stripe Customer CRUD API', function () {
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
    });

    after(() => {
        if (server) {
            server.close(() => {
                Logger.info({
                  message: 'Test server closed',
                });
            });
        }
    });

    it('should create a new account token', async () => {
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
        expect(response.body).to.have.property(
            'object',
            'token',
        );
    });

    // Test can be enabled if the Stripe instructions have been followed
    // https://support.stripe.com/questions/enabling-access-to-raw-card-data-apis
    // it('should create a new card token', async () => {
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
    //     expect(response.body).to.have.property(
    //         'object',
    //         'token',
    //     );
    // });
});
