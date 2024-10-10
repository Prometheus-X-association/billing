import { Request, Response } from 'express';
import StripeSessionCrudService from '../services/StripeSessionService';
import { Logger } from '../libs/Logger';

export const createSession = async (req: Request, res: Response) => {
    try {
        const stripeSessionCrudService = StripeSessionCrudService.retrieveServiceInstance();
        const newSession = await stripeSessionCrudService.createSession(req.body, {stripeAccount: req.headers['stripe-account'] as string});

        if (newSession) {
            return res.status(201).json(newSession);
        } else {
            return res.status(500).json({ message: 'Failed to create session.' });
        }
    } catch (error) {
        const err = error as Error;
        Logger.error({
            location: err.stack,
            message: `Error creating session: ${err.message}`,
        });
        return res.status(500).json({ message: err.message });
    }
};
