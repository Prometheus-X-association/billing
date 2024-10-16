import supertest from 'supertest';
import { expect } from 'chai';
import { config } from '../../src/config/environment';
import http from 'http';
import { getApp } from '../../src/app';
import StripePersonCrudService from '../../src/services/StripePersonCrudService';
import { Logger } from '../../src/libs/Logger';

let server: http.Server;
let testAccountId: string;
let testPersonId: string;

const stripePersonService = StripePersonCrudService.retrieveServiceInstance();

const first_name = 'test_first_name';
const last_name = 'test_last_name';

const createTestAccount = async (): Promise<string> => {
  const stripe = stripePersonService.getStripe();
  if (!stripe) {
    throw new Error('Stripe instance not available');
  }

  const accountToken = await stripe.tokens.create({
    // account: {
    //   individual: {
    //     email: 'test@example.com',
    //     dob: {
    //       day: 1,
    //       month: 1,
    //       year: 1990,
    //     },
    //     address: {
    //       line1: '3 bis rue Exemple',
    //       city: 'Paris',
    //       postal_code: '75001',
    //       country: 'FR',
    //     },
    //     first_name,
    //     last_name,
    //   },
    //   business_type: 'individual',
    //   tos_shown_and_accepted: true,
    // },
    account: {
      company: {
        name: 'Example SARL',
        address: {
          line1: '3 bis rue Example',
          city: 'Paris',
          postal_code: '75001',
          country: 'FR',
        },
      },
      business_type: 'company',
      tos_shown_and_accepted: true,
    },
  });

  const account = await stripe.accounts.create({
    type: 'custom',
    country: 'FR',
    email: 'test@example.com',
    account_token: accountToken.id,
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true },
    },
  });

  if (!account?.id) {
    throw new Error('Failed to create test account');
  }

  return account.id;
};

describe('Stripe Person CRUD API', function () {
  before(async function () {

    testAccountId = await createTestAccount();
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

  after(async () => {
    if (server) {
      server.close(() => {
        Logger.info({
          message: 'Test server closed',
        });
      });
      if (testAccountId) {
        await stripePersonService.getStripe()?.accounts.del(testAccountId);
      }
    }
  });

  it('should create a new person', async () => {
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
    const response = await supertest(server).get(
      `/api/stripe/accounts/${testAccountId}/persons/${testPersonId}`,
    );
    expect(response.status).to.equal(200);
    expect(response.body).to.have.property('id', testPersonId);
    expect(response.body).to.have.property('first_name', first_name);
  });

  it('should update an existing person', async () => {
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
    const response = await supertest(server).get(
      `/api/stripe/accounts/${testAccountId}/persons/non_existent_id`,
    );
    expect(response.status).to.equal(404);
    expect(response.body).to.have.property('message', 'Person not found.');
  });
});
