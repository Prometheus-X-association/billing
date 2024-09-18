import supertest from 'supertest';
import { expect } from 'chai';
import { config } from '../../src/config/environment';
import http from 'http';
import { getApp } from '../../src/app';
import { _logYellow } from '../utils/utils';

let server: http.Server;
let testProduct1: string | undefined;

describe('Stripe Product CRUD API', function () {
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
  });

  after(async () => {
    server.close();
  });

  it('should create a new product', async () => {
    const response = await supertest(server).post('/api/stripe/products').send({
      name: 'New Test Product',
      description: 'A test product',
    });
    expect(response.status).to.equal(201);
    expect(response.body).to.have.property('id');
    expect(response.body).to.have.property('name', 'New Test Product');
    testProduct1 = response.body.id;
  });

  it('should retrieve all products', async () => {
    const response = await supertest(server).get('/api/stripe/products');
    expect(response.status).to.equal(200);
    expect(response.body).to.be.an('array');
    const product = response.body.find((p: any) => p.id === testProduct1);
    expect(product).to.exist;
  });

  it('should retrieve a product by ID', async () => {
    const response = await supertest(server).get(
      `/api/stripe/products/${testProduct1}`,
    );
    expect(response.status).to.equal(200);
    expect(response.body).to.have.property('id', testProduct1);
    expect(response.body).to.have.property('name');
  });

  it('should update an existing product', async () => {
    const response = await supertest(server)
      .put(`/api/stripe/products/${testProduct1}`)
      .send({
        name: 'Updated Test Product',
        description: 'An updated description',
      });
    expect(response.status).to.equal(200);
    expect(response.body).to.have.property('id', testProduct1);
    expect(response.body).to.have.property('name', 'Updated Test Product');
  });

  it('should deactivate a product', async () => {
    const response = await supertest(server).delete(
      `/api/stripe/products/${testProduct1}`,
    );
    expect(response.status).to.equal(200);
    expect(response.body).to.have.property(
      'message',
      'Product deleted successfully.',
    );
  });

  it('should return 404 for non-existent product', async () => {
    const response = await supertest(server).get(
      '/api/stripe/products/non_existent_id',
    );
    expect(response.status).to.equal(404);
    expect(response.body).to.have.property('message', 'Product not found.');
  });
});
