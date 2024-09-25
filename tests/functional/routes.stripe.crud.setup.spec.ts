import supertest from 'supertest';
import { expect } from 'chai';
import http from 'http';
import { getApp } from '../../src/app';
import sinon from 'sinon';
import Stripe from 'stripe';
import StripeService from '../../src/services/StripeSubscriptionSyncService';

let server: http.Server;
const testStripeAccountId: string = 'acct_50726F6D6574686575732058';
const fakeSetupIntentId = 'seti_50726F6D6574686575732058';

describe('Stripe Setup Intent API', function () {
  let stripeStub: Stripe;

  before(async function () {
    const app = await getApp();
    await new Promise((resolve) => {
      server = app.listen(3000, () => {
        console.log(`Test server is running on port 3000`);
        resolve(true);
      });
    });

    stripeStub = {
      setupIntents: {
        create: sinon.stub(),
        update: sinon.stub(),
        retrieve: sinon.stub(),
        cancel: sinon.stub(),
        confirm: sinon.stub(),
      },
    } as unknown as Stripe;

    const stripeServiceStub = sinon.createStubInstance(StripeService);
    stripeServiceStub.getStripe.returns(stripeStub);
    sinon
      .stub(StripeService, 'retrieveServiceInstance')
      .returns(stripeServiceStub as any);
  });

  after(() => {
    server.close();
    sinon.restore();
  });

  it('should create a new setup intent', async () => {
    const fakeSetupIntent: Partial<Stripe.SetupIntent> = {
      id: fakeSetupIntentId,
    };
    (stripeStub.setupIntents.create as sinon.SinonStub).resolves(
      fakeSetupIntent as Stripe.SetupIntent,
    );

    const response = await supertest(server)
      .post('/api/stripe/setupintent')
      .send({ customer: 'cus_123456' })
      .set('stripe-account', testStripeAccountId)
      .expect(201);

    expect(response.body.id).to.equal(fakeSetupIntentId);
  });

  it('should update a setup intent', async () => {
    const fakeUpdatedSetupIntent: Partial<Stripe.SetupIntent> = {
      id: fakeSetupIntentId,
      description: 'Updated description',
    };
    (stripeStub.setupIntents.update as sinon.SinonStub).resolves(
      fakeUpdatedSetupIntent as Stripe.SetupIntent,
    );

    const response = await supertest(server)
      .put(`/api/stripe/setupintent/${fakeSetupIntentId}`)
      .send({ description: 'Updated description' })
      .set('stripe-account', testStripeAccountId)
      .expect(200);

    expect(response.body.id).to.equal(fakeSetupIntentId);
    expect(response.body.description).to.equal('Updated description');
  });

  it('should retrieve a setup intent', async () => {
    const fakeSetupIntent: Partial<Stripe.SetupIntent> = {
      id: fakeSetupIntentId,
    };
    (stripeStub.setupIntents.retrieve as sinon.SinonStub).resolves(
      fakeSetupIntent as Stripe.SetupIntent,
    );

    const response = await supertest(server)
      .get(`/api/stripe/setupintent/${fakeSetupIntentId}`)
      .set('stripe-account', testStripeAccountId)
      .expect(200);

    expect(response.body.id).to.equal(fakeSetupIntentId);
  });

  it('should cancel a setup intent', async () => {
    const fakeCanceledSetupIntent: Partial<Stripe.SetupIntent> = {
      id: fakeSetupIntentId,
      status: 'canceled',
    };
    (stripeStub.setupIntents.cancel as sinon.SinonStub).resolves(
      fakeCanceledSetupIntent as Stripe.SetupIntent,
    );

    const response = await supertest(server)
      .delete(`/api/stripe/setupintent/${fakeSetupIntentId}`)
      .set('stripe-account', testStripeAccountId)
      .expect(200);

    expect(response.body.id).to.equal(fakeSetupIntentId);
    expect(response.body.status).to.equal('canceled');
  });

  it('should confirm a setup intent', async () => {
    const fakeConfirmedSetupIntent: Partial<Stripe.SetupIntent> = {
      id: fakeSetupIntentId,
      status: 'succeeded',
    };
    (stripeStub.setupIntents.confirm as sinon.SinonStub).resolves(
      fakeConfirmedSetupIntent as Stripe.SetupIntent,
    );

    const response = await supertest(server)
      .post(`/api/stripe/setupintent/${fakeSetupIntentId}/confirm`)
      .send({ payment_method: 'pm_123456' })
      .set('stripe-account', testStripeAccountId)
      .expect(200);

    expect(response.body.id).to.equal(fakeSetupIntentId);
    expect(response.body.status).to.equal('succeeded');
  });
});
