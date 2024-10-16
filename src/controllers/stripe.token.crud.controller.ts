import {Request, Response} from "express";
import {Logger} from "../libs/Logger";
import stripeTokenService from "../services/StripeTokenService";

export const createToken = async (req: Request, res: Response) => {
    try {
        const stripeService =
            stripeTokenService.retrieveServiceInstance();
        const newAccountToken = await stripeService.createToken(req.body);

        if (newAccountToken) {
            return res.status(201).json(newAccountToken);
        } else {
            return res
                .status(500)
                .json({ message: 'Failed to create token.' });
        }
    } catch (error) {
        Logger.error({
            location: (error as Error).stack,
            message: `Error creating token: ${(error as Error).message}`,
        });
        return res.status(500).json({ message: (error as Error).message });
    }
};