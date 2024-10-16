import supertest from 'supertest';
import { expect } from 'chai';
import { config } from '../../src/config/environment';
import { getApp } from '../../src/app';
import http from 'http';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { Logger } from '../../src/libs/Logger';

let server: http.Server;
let priceId: string;
let customerId: string;
let paymentMethodId: string;
let testConnectedAccountId: string;
const participant = 'http://catalog.api.com/participant-1';
const participantCustomer = 'http://catalog.api.com/participant-customer-1';
let mongoServer: MongoMemoryServer;
let subscription: any;
let productId: string;
let offer = 'http://catalog.api.com/v1/catalog/serviceofferings/offer-1';

//Here we test the billing flow with an express connected account
describe('Billing scenario with express connected account', function () {
    before(async function () {
        //get app
        const app = await getApp();

        //connect to mongo
        mongoServer = await MongoMemoryServer.create();
        const mongoUri = mongoServer.getUri();
        await mongoose.connect(mongoUri);
        config.mongoURI = mongoUri;

        //start server
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

    after(async () => {
        if (server) {   
            //disconnect from mongo
            await mongoose.disconnect();
            await mongoServer.stop();
            //close server
            await new Promise<void>((resolve) => {
              server.close(() => {
                Logger.info({
                    message: 'Test server closed',
                });
                resolve();
              });
            });
          }
    });

    //create connected account
    it('should create a new connected account', async () => {
        const response = await supertest(server).post('/api/stripe/accounts').send({
          type: 'express', //required
          email: 'test@example.com', //required
          country: 'FR', //required
          capabilities: {
            card_payments: {
                requested: true, //required
            },
            transfers: {
                requested: true, //required
            },
          },
          business_type: 'company', //required
          business_profile: {
            name: 'Test Business', //required
          }
        });
        expect(response.status).to.equal(201);
        expect(response.body).to.have.property('id');
        expect(response.body).to.have.property('type', 'express');
        testConnectedAccountId = response.body.id;
    });

    //create account link for onboarding required for express connected account to activate the account
    it('should create a new account link', async () => {
        const response = await supertest(server).post(
          `/api/stripe/accounts/${testConnectedAccountId}/account_links`,
        ).send({
          refresh_url: 'https://www.test.com', //required
          return_url: 'https://www.test.com', //required
          type: 'account_onboarding', //required
        });
    
        expect(response.status).to.equal(200);
        expect(response.body).to.have.property('url');
        expect(response.body).to.have.property('object', 'account_link');
    });

    
    //link participant to connected account
    it('should link participant to connected account', async () => {
        const response = await supertest(server)
          .post('/api/stripe/link/connect')
          .send({ participant, stripeAccount: testConnectedAccountId });
    
        expect(response.status).to.equal(200);
        expect(response.body.participant).to.equal(participant);
        expect(response.body.stripeAccount).to.equal(testConnectedAccountId);
    });

    //add product offer and price
    it('should add product offer and price', async () => {
        const response = await supertest(server)
        .post('/api/stripe/products')
        .set('stripe-account', testConnectedAccountId as string)
        .send({
            name: 'Test Product', //required
            default_price_data: {
                unit_amount: 1000, //required
                currency: 'eur', //required
                recurring: {
                    interval: 'month'
                }
            }
        });
        expect(response.status).to.equal(201);
        expect(response.body).to.have.property('id');
        expect(response.body).to.have.property('default_price');
        productId = response.body.id;
        priceId = response.body.default_price;
    });

    //link product to offer
    it('should link product to offer', async () => {
        const response = await supertest(server)
          .post('/api/products')
          .set('stripe-account', testConnectedAccountId as string)
          .send({
            participant, //required
            stripeId: productId, //required
            defaultPriceId: priceId, //required
            offer, //required
          });

        expect(response.status).to.equal(201);
        expect(response.body).to.have.property('_id');
        expect(response.body).to.have.property('stripeId');
        expect(response.body).to.have.property('defaultPriceId');
        expect(response.body).to.have.property('participant');
        expect(response.body).to.have.property('offer', offer); 
    });

    //add customer
    it('should create a new customer', async () => {
        const response = await supertest(server)
          .post('/api/stripe/customers')
          .set('stripe-account', testConnectedAccountId as string)
          .send({
            email: 'test_customer_1@example.com', //required
            name: 'Test Customer 1', //required
            metadata: {
              participant: participantCustomer
            }
          });
        expect(response.status).to.equal(201);
        expect(response.body).to.have.property('id');
        expect(response.body).to.have.property(
          'email',
          'test_customer_1@example.com',
        );
        expect(response.body).to.have.property('metadata');
        expect(response.body.metadata).to.have.property('participant', participantCustomer);
        customerId = response.body.id;
    });
    
    //add payment method with session
    it('should create a checkout session for adding payment method', async () => {
        const response = await supertest(server)
            .post('/api/stripe/session')
            .set('stripe-account', testConnectedAccountId)
            .send({
                customer: customerId, //required
                mode: 'setup', //required
                success_url: 'https://example.com/success', //required
                cancel_url: 'https://example.com/cancel', //required
                currency: 'usd', //required
            });

        expect(response.status).to.equal(201);
        expect(response.body).to.have.property('id');
        expect(response.body).to.have.property('object', 'checkout.session');
        expect(response.body).to.have.property('customer');
        expect(response.body).to.have.property('mode', 'setup');
    });

    //link customer to participant
    it('should link participant to customer', async () => {
      const response = await supertest(server)
        .post('/api/stripe/link/customer')
        .send({ participant: participantCustomer, stripeCustomerId: customerId });
  
      expect(response.status).to.equal(200);
      expect(response.body.message).to.equal('Link established successfully');
    });

    //create subscription
    it('should create a new subscription for a customer', async () => {

        //add payment method for the customer for test purpose (not used in the flow)
        const paymentMethodResponse = await supertest(server)
          .post('/api/stripe/setupintent')
          .send({ 
            customer: customerId, 
            payment_method: 'pm_card_visa',
            usage: 'off_session'
          })
          .set('stripe-account',  testConnectedAccountId as string)
          .expect(201);

        paymentMethodId = paymentMethodResponse.body.payment_method;

        // Attach the payment method to the customer (not used in the flow)
        await supertest(server)
            .post(`/api/stripe/payment_methods/${paymentMethodId}/attach`)
            .send({ customer: customerId })
            .set('stripe-account', testConnectedAccountId as string)
            .expect(200);

        const response = await supertest(server)
          .post('/api/stripe/subscriptions')
          .set('stripe-account', testConnectedAccountId as string)
          .send({
            customerId: customerId, //required
            priceId: priceId, //required
            paymentMethodId: paymentMethodId, //not required in the flow
            metadata: {
              participant: participantCustomer, //required
              offer: offer //required
            }
          });
        expect(response.status).to.equal(201);
        expect(response.body).to.have.property('id');
        expect(response.body).to.have.property('customer');
        expect(response.body.customer).to.equal(customerId);
        subscription = response.body;
    });

    it('should add subscription', async () => {
      const mappedSubscription = [{
        isActive: true,
        stripeId: subscription.id,
        participant: subscription.metadata.participant,
        subscriptionType: 'payAmount',
        resource: subscription.metadata.offer,
        details: {
          payAmount: 1000,
          startDate: subscription.start_date,
          endDate: subscription?.ended_at,
        },
      }];

        const response = await supertest(server)
          .post('/api/sync/subscriptions')
          .send(mappedSubscription);
        expect(response.status).to.equal(201);
        expect(response.body).to.have.property('length', 1);
        expect(response.body[0]).to.have.property('participant', participantCustomer);
        expect(response.body[0]).to.have.property('subscriptionType', 'payAmount');
        expect(response.body[0]).to.have.property('resource', offer);
        expect(response.body[0]).to.have.property('details');
    });
});
