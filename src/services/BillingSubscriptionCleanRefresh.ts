import { Logger } from '../libs/Logger';
import SubscriptionModel from '../models/SubscriptionModel';
import BillingSubscriptionSyncService from './BillingSubscriptionSyncService';
import cron from 'node-cron';

interface BillingSubscriptionCleanRefreshConfig {
  cronSchedule: string;
}

export class BillingSubscriptionCleanRefresh {
  private config: BillingSubscriptionCleanRefreshConfig;
  private billingSync: BillingSubscriptionSyncService;
  private cronJob: cron.ScheduledTask | null = null;

  constructor(
    config: Partial<BillingSubscriptionCleanRefreshConfig> = {},
    billingSync: BillingSubscriptionSyncService,
  ) {
    this.config = {
      // Default: midnight every day
      cronSchedule: '0 0 * * *',
      ...config,
    };
    this.billingSync = billingSync;
  }

  private async updateExpiredSubscriptions(): Promise<void> {
    const currentDate = new Date();

    await SubscriptionModel.updateMany(
      {
        isActive: true,
        subscriptionType: 'payAmount',
        'details.endDate': { $lt: currentDate },
      },
      { $set: { isActive: false } },
    );

    await SubscriptionModel.updateMany(
      {
        isActive: true,
        subscriptionType: 'usageCount',
        $or: [
          { 'details.endDate': { $lt: currentDate } },
          { 'details.usageCount': 0 },
        ],
      },
      { $set: { isActive: false } },
    );

    await SubscriptionModel.updateMany(
      {
        isActive: true,
        subscriptionType: 'limitDate',
        $or: [
          { 'details.endDate': { $lt: currentDate } },
          { 'details.limitDate': { $lt: currentDate } },
        ],
      },
      { $set: { isActive: false } },
    );

    await this.billingSync.refresh();
  }

  public async start(): Promise<void> {
    Logger.log({
      message: `Starting BillingSubscriptionCleanRefresh service with schedule: ${this.config.cronSchedule}`,
    });
    this.cronJob = cron.schedule(this.config.cronSchedule, async () => {
      Logger.log({
        message: 'Running scheduled subscription update and clean',
      });
      try {
        await this.updateExpiredSubscriptions();
        Logger.log({
          message: 'Subscription update and clean completed successfully',
        });
      } catch (error) {
        const err = error as Error;
        Logger.error({
          location: err.stack,
          message: `Error during subscription update and clean: ${err.message}`,
        });
      }
    });
  }

  public stop(): void {
    if (this.cronJob) {
      this.cronJob.stop();
    }
  }
}
