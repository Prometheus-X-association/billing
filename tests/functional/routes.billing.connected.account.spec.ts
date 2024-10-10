import supertest from 'supertest';
import { expect } from 'chai';
import { config } from '../../src/config/environment';
import { getApp } from '../../src/app';
import http from 'http';
import BillingConnectedAccountService from '../../src/services/BillingConnectedAccountService';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { Logger } from '../../src/libs/Logger';
import { encodeToBase64 } from '../../src/libs/base64';

const billingConnectedAccountService =
  BillingConnectedAccountService.retrieveServiceInstance();

let server: http.Server;
let testStripeAccountId: string | undefined;
let mongoServer: MongoMemoryServer;

describe('Billing Connected Account via API', function () {
  before(async function () {
    const app = await getApp();
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
    config.mongoURI = mongoUri;

    await new Promise((resolve) => {
      const { port } = config;
      server = app.listen(port, () => {
        Logger.info({
          message: `Test server is running on port ${port}`,
        });
        resolve(true);
      });
    });

    // Add mock data
    const testConnectedAccount = await billingConnectedAccountService.addConnectedAccount({
      participant: 'http://catalog.api.com/participant-1',
      stripeAccount: 'acct_123',
    });
    if (testConnectedAccount?._id) {
      testStripeAccountId = testConnectedAccount?._id;
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

  it('should get connected account by ID', async () => {
    const response = await supertest(server).get(
      `/api/connected-accounts/${testStripeAccountId}`,
    );
    expect(response.status).to.equal(200);
    expect(response.body).to.have.property('_id');
  });

  it('should get connected account by participant ID', async () => {
    const participant = 'http://catalog.api.com/participant-1';
    const encodedParticipant = encodeToBase64(participant);
    const response = await supertest(server).get(
      `/api/connected-accounts/participant/${encodedParticipant}`,
    );
    expect(response.status).to.equal(200);
    expect(response.body).to.have.property('participant', participant);
  });

  it('should get connected account by Stripe account', async () => {
    const stripeAccount = 'acct_123';
    const response = await supertest(server).get(
      `/api/connected-accounts/connected-account/${stripeAccount}`,
    );
    expect(response.status).to.equal(200);
    expect(response.body).to.have.property('stripeAccount', 'acct_123');
  });

  it('should return 404 when connected account is not found', async () => {
    const id = 'non_existent_id';
    const response = await supertest(server).get(
      `/api/connected-accounts/${id}`,
    );
    expect(response.status).to.equal(404);
    expect(response.body).to.have.property('message', 'Connected account not found.');
  });

  it('should get all connected accounts', async () => {
    const response = await supertest(server).get(
      '/api/connected-accounts',
    );
    expect(response.status).to.equal(200);
    expect(response.body).to.be.an('array').with.lengthOf(1);
  });
});