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
let testAccountId: string = 'acct_123456789';
let testPersonId: string;
let stripeStub: Stripe;

const first_name = 'test_first_name';
const last_name = 'test_last_name';

describe('Stripe Person CRUD API', function () {
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
      accounts: {
        createPerson: sinon.stub(),
        retrievePerson: sinon.stub(),
        updatePerson: sinon.stub(),
        deletePerson: sinon.stub(),
      },
    } as unknown as Stripe;

    const stripeServiceStub = sinon.createStubInstance(StripeService);
    stripeServiceStub.getStripe.returns(stripeStub);
    sinon
      .stub(StripeService, 'retrieveServiceInstance')
      .returns(stripeServiceStub as any);
  });

  after(async () => {
    if (server) {
      server.close(() => {
        Logger.info({
          message: 'Test server closed',
        });
      });
    }
    sinon.restore();
  });

  it('should create a new person', async () => {
    const fakePerson = {
      id: 'person_123456789',
      first_name,
      last_name,
      email: 'test_person_1@example.com',
      relationship: { representative: false, executive: true },
      dob: { day: 1, month: 1, year: 1990 },
    };
    (stripeStub.accounts.createPerson as sinon.SinonStub).resolves(fakePerson);

    const response = await supertest(server)
      .post(`/api/stripe/accounts/${testAccountId}/persons`)
      .send({
        first_name,
        last_name,
        email: 'test_person_1@example.com',
        relationship: { representative: false, executive: true },
        dob: { day: 1, month: 1, year: 1990 },
      });

    expect(response.status).to.equal(201);
    expect(response.body).to.have.property('id');
    expect(response.body).to.have.property('first_name', first_name);
    testPersonId = response.body.id;
  });

  it('should retrieve a person', async () => {
    const fakePerson = {
      id: testPersonId,
      first_name,
      last_name,
    };
    (stripeStub.accounts.retrievePerson as sinon.SinonStub).resolves(fakePerson);

    const response = await supertest(server).get(
      `/api/stripe/accounts/${testAccountId}/persons/${testPersonId}`,
    );

    expect(response.status).to.equal(200);
    expect(response.body).to.have.property('id', testPersonId);
    expect(response.body).to.have.property('first_name', first_name);
  });

  it('should update an existing person', async () => {
    const fakeUpdatedPerson = {
      id: testPersonId,
      first_name: 'first_name_2',
      last_name,
    };
    (stripeStub.accounts.updatePerson as sinon.SinonStub).resolves(fakeUpdatedPerson);

    const response = await supertest(server)
      .post(`/api/stripe/accounts/${testAccountId}/persons/${testPersonId}`)
      .send({
        first_name: 'first_name_2',
      });

    expect(response.status).to.equal(200);
    expect(response.body).to.have.property('id', testPersonId);
    expect(response.body).to.have.property('first_name', 'first_name_2');
  });

  it('should delete a person', async () => {
    const fakeDeletedPerson = {
      id: testPersonId,
      deleted: true,
    };
    (stripeStub.accounts.deletePerson as sinon.SinonStub).resolves(fakeDeletedPerson);

    const response = await supertest(server).delete(
      `/api/stripe/accounts/${testAccountId}/persons/${testPersonId}`,
    );

    expect(response.status).to.equal(200);
    expect(response.body).to.have.property(
      'message',
      'Person deleted successfully.',
    );
  });

  it('should return 404 for non-existent person', async () => {
    (stripeStub.accounts.retrievePerson as sinon.SinonStub).rejects(new Error('Person not found'));

    const response = await supertest(server).get(
      `/api/stripe/accounts/${testAccountId}/persons/non_existent_id`,
    );

    expect(response.status).to.equal(404);
    expect(response.body).to.have.property('message', 'Person not found.');
  });
});
