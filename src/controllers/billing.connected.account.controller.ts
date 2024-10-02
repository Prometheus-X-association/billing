import {Request, Response} from "express";
import {Logger} from "../libs/Logger";
import BillingConnectedAccountService from "../services/BillingConnectedAccountService";

const billingConnectedAccountService =
    BillingConnectedAccountService.retrieveServiceInstance();

export const getConnectedAccounts = async (req: Request, res: Response) => {
    try {
        const connectedAccounts = await billingConnectedAccountService.listConnectedAccounts();

        if (connectedAccounts) {
            return res.status(200).json(connectedAccounts);
        } else {
            return res.status(404).json({ message: 'Connected accounts not found.' });
        }
    } catch (error) {
        Logger.error({
            location: (error as Error).stack,
            message: `Error retrieving connected account: ${(error as Error).message}`,
        });
        return res.status(500).json({ message: (error as Error).message });
    }
};

export const getConnectedAccountById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const connectedAccount = await billingConnectedAccountService.getConnectedAccountById(id);

        if (connectedAccount) {
            return res.status(200).json(connectedAccount);
        } else {
            return res.status(404).json({ message: 'Connected account not found.' });
        }
    } catch (error) {
        Logger.error({
            location: (error as Error).stack,
            message: `Error retrieving connected account: ${(error as Error).message}`,
        });
        return res.status(500).json({ message: (error as Error).message });
    }
};

export const getConnectedAccountByParticipantId = async (req: Request, res: Response) => {
    try {
        const { participantId } = req.params;
        const connectedAccount = await billingConnectedAccountService.getConnectedAccountByParticipantId(participantId);

        if (connectedAccount) {
            return res.status(200).json(connectedAccount);
        } else {
            return res.status(404).json({ message: 'Connected account not found.' });
        }
    } catch (error) {
        Logger.error({
            location: (error as Error).stack,
            message: `Error retrieving connected account: ${(error as Error).message}`,
        });
        return res.status(500).json({ message: (error as Error).message });
    }
};

export const getConnectedAccountByConnectedAccountId = async (req: Request, res: Response) => {
    try {
        const { connectedAccountId } = req.params;
        const connectedAccount = await billingConnectedAccountService.getConnectedAccountByConnectedAccountId(connectedAccountId);

        if (connectedAccount) {
            return res.status(200).json(connectedAccount);
        } else {
            return res.status(404).json({ message: 'Connected account not found.' });
        }
    } catch (error) {
        Logger.error({
            location: (error as Error).stack,
            message: `Error retrieving connected account: ${(error as Error).message}`,
        });
        return res.status(500).json({ message: (error as Error).message });
    }
};