import { expect } from 'chai';
import sinon from 'sinon';
import Stripe from 'stripe';
import StripeService from '../../src/services/StripeService';

const email = 'test@example.com';
const customerId = 'test_customer_id';
describe('StripeService test cases', () => {
  let stripeStub: {
    customers: {
      create: sinon.SinonStub;
    };
  };

  beforeEach(() => {
    stripeStub = {
      customers: {
        create: sinon.stub().resolves({ id: customerId } as Stripe.Customer),
      },
    };

    sinon.stub(Stripe.prototype, 'constructor' as any).returns(stripeStub);
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should create a new customer and return the customer ID', async () => {
    const stripeService = StripeService.getInstance();
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

  it('should return the same instance of StripeBridge', () => {
    const instance1 = StripeService.getInstance();
    const instance2 = StripeService.getInstance();
    expect(instance1).to.equal(instance2);
  });
});
