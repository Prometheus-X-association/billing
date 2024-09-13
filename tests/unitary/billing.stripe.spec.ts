import { expect } from 'chai';
import sinon from 'sinon';
import Stripe from 'stripe';
import StripeService from '../../src/services/StripeSubscriptionService';

const email = 'test@example.com';
const customerId = 'test_customer_id';
describe('StripeService test cases', () => {
  let stripeStub: {
    customers: {
      create: sinon.SinonStub;
    };
  };

  before(() => {
    stripeStub = {
      customers: {
        create: sinon.stub().resolves({ id: customerId } as Stripe.Customer),
      },
    };

    sinon
      .stub(StripeService.prototype, 'getNewStripe' as any)
      .returns(stripeStub);
  });

  after(() => {
    sinon.restore();
  });

  it('should create a new customer and return the customer ID', async () => {
    const stripeService = StripeService.retrieveServiceInstance();
    const customer = await stripeService.connect(email);
    expect(customer).to.not.be.null;
    expect(
      stripeStub.customers.create.calledOnceWithExactly({
        email,
      }),
    ).to.be.true;
    if (customer) {
      expect(customer.id).to.equal(customerId);
    }
  });

  it('should return the same instance of StripeBridge (singleton)', () => {
    const instance1 = StripeService.retrieveServiceInstance();
    const instance2 = StripeService.retrieveServiceInstance();
    expect(instance1).to.equal(instance2);
  });
});
