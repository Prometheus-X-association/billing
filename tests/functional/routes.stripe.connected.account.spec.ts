import supertest from 'supertest';
import { expect } from 'chai';
import sinon from 'sinon';
import { config } from '../../src/config/environment';
import http from 'http';
import StripeConnectedAccountService from '../../src/services/StripeConnectedAccountService';
import { getApp } from '../../src/app';
import { _logYellow } from '../utils/utils';

let server: http.Server;
let stripeStub: any;
let testConnectedAccountId: string;
const id: string = 'acct_50726F6D6574686575732058';
const email: string = 'test_connected_account@example.com';
const type: string = 'standard';
// todo: connect to real stripe 'connected account'
describe('Stripe Connected Account CRUD API', function () {
  const title = this.title;

  before(async function () {
    _logYellow(`- ${title} running...`);

    const app = await getApp();
    await new Promise((resolve) => {
      const { port } = config;
      server = app.listen(port, () => {
        console.log(`Test server is running on port ${port}`);
        resolve(true);
      });
    });

    stripeStub = {
      accounts: {
        create: sinon.stub(),
        retrieve: sinon.stub(),
        update: sinon.stub(),
        del: sinon.stub(),
        createLoginLink: sinon.stub(),
      },
    };

    const stripeConnectedAccountService =
      StripeConnectedAccountService.retrieveServiceInstance();
    (stripeConnectedAccountService as any).stripeService = stripeStub;
  });

  after(async () => {
    server.close();
    sinon.restore();
  });

  it('should create a new connected account', async () => {
    const fakeAccount = {
      id,
      type,
      email,
    };

    stripeStub.accounts.create.resolves(fakeAccount);

    const response = await supertest(server).post('/api/stripe/accounts').send({
      type,
      country: 'FR',
      email,
    });

    expect(response.status).to.equal(201);
    expect(response.body).to.have.property('id', id);
    expect(response.body).to.have.property('type', type);
    testConnectedAccountId = response.body.id;
  });

  it('should retrieve an existing connected account by ID', async () => {
    const fakeAccount = {
      id: testConnectedAccountId,
      type,
      email,
    };

    stripeStub.accounts.retrieve.resolves(fakeAccount);

    const response = await supertest(server).get(
      `/api/stripe/accounts/${testConnectedAccountId}`,
    );

    expect(response.status).to.equal(200);
    expect(response.body).to.have.property('id', testConnectedAccountId);
    expect(response.body).to.have.property('type', type);
  });

  it('should update an existing connected account', async () => {
    const updatedAccount = {
      id: testConnectedAccountId,
      type,
      email,
      metadata: { key: 'value' },
    };

    stripeStub.accounts.update.resolves(updatedAccount);

    const response = await supertest(server)
      .post(`/api/stripe/accounts/${testConnectedAccountId}`)
      .send({
        metadata: { key: 'value' },
      });

    expect(response.status).to.equal(200);
    expect(response.body).to.have.property('id', testConnectedAccountId);
    expect(response.body).to.have.property('metadata').eql({ key: 'value' });
  });

  it('should create a login link for a connected account', async () => {
    const fakeLoginLink = {
      url: `https://connect.stripe.com/express/rba/${id}/login`,
    };

    stripeStub.accounts.createLoginLink.resolves(fakeLoginLink);

    const response = await supertest(server).post(
      `/api/stripe/accounts/${testConnectedAccountId}/login_links`,
    );

    expect(response.status).to.equal(200);
    expect(response.body).to.have.property('url');
    expect(response.body.url).to.be.a('string');
  });

  it('should delete an existing connected account', async () => {
    const deletedAccount = {
      id: testConnectedAccountId,
      deleted: true,
    };

    stripeStub.accounts.del.resolves(deletedAccount);

    const response = await supertest(server).delete(
      `/api/stripe/accounts/${testConnectedAccountId}`,
    );

    expect(response.status).to.equal(200);
    expect(response.body).to.have.property(
      'message',
      'Connected account deleted successfully.',
    );
  });

  it('should return a 404 for a non-existent connected account', async () => {
    stripeStub.accounts.retrieve.rejects(new Error('No such account'));

    const response = await supertest(server).get(
      '/api/stripe/accounts/non_existent_id',
    );

    expect(response.status).to.equal(404);
    expect(response.body).to.have.property(
      'message',
      'Connected account not found.',
    );
  });
});
