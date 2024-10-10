import supertest from 'supertest';
import { expect } from 'chai';
import { config } from '../../src/config/environment';
import { getApp } from '../../src/app';
import http from 'http';
import { _logYellow, _logGreen, _logObject } from '../utils/utils';
import BillingCustomerService from '../../src/services/BillingCustomerService';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { Logger } from '../../src/libs/Logger';
import { encodeToBase64 } from '../../src/libs/base64';

const billingCustomerService = BillingCustomerService.retrieveServiceInstance();

let server: http.Server;
let customer1Id: string;
let customer2Id: string;
let mongoServer: MongoMemoryServer;

describe('Billing Customer via API', function () {
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

    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
    config.mongoURI = mongoUri;


    // Add test customers
    const customer1 = await billingCustomerService.addCustomer({
        participant: 'http://catalog.api.com/participant-1',
        stripeCustomerId: 'customer-1',
      });

      if(customer1) {
        customer1Id = customer1._id;
      }

    const customer2 = await billingCustomerService.addCustomer( {
        participant: 'http://catalog.api.com/participant-2',
        stripeCustomerId: 'customer-2',
      });

      if(customer2) {
        customer2Id = customer2._id;
      }
  });

  after(async () => {
    if (server) {
      await mongoose.disconnect();
      await mongoServer.stop();
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

  it('should get all customers', async () => {
    const response = await supertest(server).get('/api/customers');
    expect(response.status).to.equal(200);
    expect(response.body).to.be.an('array').with.lengthOf(2);
  });

  it('should get customer by id', async () => {
    const response = await supertest(server).get(`/api/customers/${customer1Id}`);
    expect(response.status).to.equal(200);
    expect(response.body).to.have.property('_id');
  });
  
  it('should get customer by participant', async () => {
    const participant = encodeToBase64('http://catalog.api.com/participant-2');
    const response = await supertest(server).get(`/api/customers/participant/${participant}`);
    expect(response.status).to.equal(200);
    expect(response.body).to.have.property('stripeCustomerId', 'customer-2');
  });

  it('should get customer by customer id', async () => {
    const stripeCustomerId = 'customer-1';
    const response = await supertest(server).get(`/api/customers/stripe/${stripeCustomerId}`);
    expect(response.status).to.equal(200);
    expect(response.body).to.have.property('stripeCustomerId', stripeCustomerId);
  });

  it('should return 404 for non-existent customer', async () => {
    const stripeCustomerId = 'non-existent-id';
    const response = await supertest(server).get(`/api/customers/${stripeCustomerId}`);
    expect(response.status).to.equal(404);
    expect(response.body).to.have.property('message', 'Customer not found.');
  });
});