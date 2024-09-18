import supertest from 'supertest';
import { expect } from 'chai';
import { config } from '../../src/config/environment';
import http from 'http';
import StripePriceCrudService from '../../src/services/StripePriceCrudService';
import { getApp } from '../../src/app';
import { _logYellow } from '../utils/utils';

const stripePriceService = StripePriceCrudService.retrieveServiceInstance();

let server: http.Server;

const productId1 = 'prod_test_1';
let testPrice1: string | undefined;

const ensureProductExists = async (productId: string) => {
  try {
    const product = await stripePriceService
      .getStripe()
      ?.products.retrieve(productId);
    return product?.id;
  } catch (error: any) {
    if (error.raw?.type === 'invalid_request_error') {
      const product = await stripePriceService.getStripe()?.products.create({
        id: productId,
        name: `Test Product for ${productId}`,
      });
      return product?.id;
    }
    throw error;
  }
};

const ensurePriceExists = async (productId: string) => {
  const price = await stripePriceService.getStripe()?.prices.create({
    unit_amount: 1000,
    currency: 'usd',
    recurring: { interval: 'month' },
    product: productId,
  });
  return price?.id;
};

describe('Stripe Price CRUD API', function () {
  const title = this.title;
  before(async function () {
    _logYellow(`- ${title} running...`);

    await ensureProductExists(productId1);
    testPrice1 = await ensurePriceExists(productId1);
    const app = await getApp();
    await new Promise((resolve) => {
      const { port } = config;
      server = app.listen(port, () => {
        console.log(`Test server is running on port ${port}`);
        resolve(true);
      });
    });
  });

  after(async () => {
    server.close();
  });

  it('should create a new price', async () => {
    const response = await supertest(server)
      .post('/api/stripe/prices')
      .send({
        unit_amount: 2000,
        currency: 'usd',
        recurring: { interval: 'month' },
        product: productId1,
      });
    expect(response.status).to.equal(201);
    expect(response.body).to.have.property('id');
    expect(response.body).to.have.property('product', productId1);
    testPrice1 = response.body.id;
  });

  it('should retrieve all prices', async () => {
    const response = await supertest(server).get('/api/stripe/prices');
    expect(response.status).to.equal(200);
    expect(response.body).to.be.an('array');
    const price = response.body.find((p: any) => p.id === testPrice1);
    expect(price).to.exist;
  });

  it('should retrieve a price by ID', async () => {
    const response = await supertest(server).get(
      `/api/stripe/prices/${testPrice1}`,
    );
    expect(response.status).to.equal(200);
    expect(response.body).to.have.property('id', testPrice1);
    expect(response.body).to.have.property('product', productId1);
  });

  it('should update an existing price', async () => {
    const response = await supertest(server)
      .put(`/api/stripe/prices/${testPrice1}`)
      .send({
        metadata: { key: 'value' },
      });
    expect(response.status).to.equal(200);
    expect(response.body).to.have.property('id', testPrice1);
    expect(response.body).to.have.property('metadata').eql({ key: 'value' });
  });

  it('should deactivate a price', async () => {
    const response = await supertest(server).delete(
      `/api/stripe/prices/${testPrice1}`,
    );
    expect(response.status).to.equal(200);
    expect(response.body).to.have.property(
      'message',
      'Price deactivated successfully.',
    );
  });

  it('should return 404 for non-existent price', async () => {
    const response = await supertest(server).get(
      '/api/stripe/prices/non_existent_id',
    );
    expect(response.status).to.equal(404);
    expect(response.body).to.have.property('message', 'Price not found.');
  });
});
