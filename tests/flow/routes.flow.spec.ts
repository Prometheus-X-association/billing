import supertest from 'supertest';
import { expect } from 'chai';
import { config } from '../../src/config/environment';
import { getApp } from '../../src/app';
import http from 'http';
import { _logYellow, _logGreen, _logObject } from '../utils/utils';
import BillingSubscriptionService from '../../src/services/BillingSubscriptionService';
import BillingSubscriptionSyncService from '../../src/services/BillingSubscriptionSyncService';

const billingSubscriptionService =
    BillingSubscriptionService.retrieveServiceInstance();

let server: http.Server;
describe('Billing flow                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      via API', function () {
    const title = this.title;
    before(async function () {
        _logYellow(`- ${title} running...`);

        billingSubscriptionService.addSubscription([
            {
                _id: '_id_1',
                isActive: true,
                participantId: 'participant-1',
                subscriptionType: 'limitDate',
                resourceId: 'resource-1',
                details: {
                    limitDate: new Date('2024-12-31'),
                    startDate: new Date('2023-01-01'),
                    endDate: new Date('2024-12-31'),
                },
            },
            {
                _id: '_id_2',
                isActive: true,
                participantId: 'participant-1',
                subscriptionType: 'usageCount',
                resourceIds: ['resource-2', 'resource-3'],
                details: {
                    usageCount: 10,
                    startDate: new Date('2023-01-01'),
                    endDate: new Date('2024-12-31'),
                },
            },
            {
                _id: '_id_3',
                isActive: true,
                participantId: 'participant-1',
                subscriptionType: 'payAmount',
                resourceId: 'resource-4',
                details: {
                    payAmount: 100,
                    startDate: new Date('2023-01-01'),
                    endDate: new Date('2024-12-31'),
                },
            },
        ]);
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
        // Ensure to disconnect BillingSubscriptionSyncService started by the server
        await (
            await BillingSubscriptionSyncService.retrieveServiceInstance()
        ).disconnect();
        server.close();
    });

    //create connected account
    it('should create a connected account', async () => {
        _logYellow('\n- Create connected account');
        const participantId = 'participant-1';
        const response = await supertest(server).post(
            `/api/subscriptions/for/participant/${participantId}`,
        );
        _logGreen('Response:');
        _logObject(response.body);
        expect(response.status).to.equal(200);
        expect(response.body).to.be.an('array').with.lengthOf(3);
    });
    //link participant connected account
    //add product offer and price

    //add customer
    //add price
    //add subscription

    //trigger payment
});
