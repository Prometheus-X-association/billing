import supertest from 'supertest';
import { expect } from 'chai';
import { config } from '../../src/config/environment';
import { getApp } from '../../src/app';
import http from 'http';
import BillingProductService from '../../src/services/BillingProductService';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { Logger } from '../../src/libs/Logger';
import { encodeToBase64 } from '../../src/libs/base64';

const billingProductService = BillingProductService.retrieveServiceInstance();

let server: http.Server;
let mongoServer: MongoMemoryServer;
let product1Id: string;
let product2Id: string;

describe('Billing Product via API', function () {
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

    // Add sample products
    const product1 = await billingProductService.createProduct({
      participant: 'http://catalog.api.com/participant-1',
      stripeId: 'stripe-product-1',
      defaultPriceId: 'price-1',
      offer: 'offer-1'
    });
    product1Id = product1?._id as string;
    const product2 = await billingProductService.createProduct({
      participant: 'http://catalog.api.com/participant-1',
      stripeId: 'stripe-product-2',
      defaultPriceId: 'price-2',
      offer: 'offer-2'
    });
    product2Id = product2?._id as string;
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

  it('should list products by participant', async () => {
    const participant = encodeToBase64('http://catalog.api.com/participant-1');
    const response = await supertest(server).get(
      `/api/products/participant/${participant}`
    );
    expect(response.status).to.equal(200);
    expect(response.body).to.be.an('array').with.lengthOf(2);
  });

  it('should get product by ID', async () => {
    const product = await billingProductService.listProductsByParticipant('http://catalog.api.com/participant-1');
    if (!product || product.length === 0) {
      throw new Error('No products found for participant-1');
    }
    const productId = product[0]._id;
    const response = await supertest(server).get(
      `/api/products/${productId}`
    );
    expect(response.status).to.equal(200);
    expect(response.body).to.have.property('_id');
  });

  it('should create a new product', async () => {
    const newProduct = {
      participant: 'http://catalog.api.com/participant-2',
      stripeId: 'stripe-product-3',
      defaultPriceId: 'price-3',
      offer: 'offer-3'
    };
    const response = await supertest(server)
      .post('/api/products')
      .send(newProduct);
    expect(response.status).to.equal(201);
    expect(response.body).to.have.property('participant', newProduct.participant);
  });

  it('should add price to a product', async () => {
    const product = await billingProductService.listProductsByParticipant('http://catalog.api.com/participant-1');
    if (!product || product.length === 0) {
        throw new Error('No products found for participant-1');
      }
    const productId = product[0]._id;
    const newPrice = {
      stripeCustomerId: 'customer-1',
      stripeId: 'stripe-price-1'
    };
    const response = await supertest(server)
      .post(`/api/products/${productId}/price`)
      .send(newPrice);
    expect(response.status).to.equal(200);
    expect(response.body.prices).to.be.an('array');
    expect(response.body.prices).to.have.lengthOf(1);
    expect(response.body.prices[0]).to.have.property('stripeId', newPrice.stripeId);
  });

  it('should return 404 for non-existent product', async () => {
    const nonExistentId = '000000000000000000000000';
    const response = await supertest(server).get(
      `/api/products/${nonExistentId}`
    );
    expect(response.status).to.equal(404);
    expect(response.body).to.have.property('message', 'Product not found.');
  });
});