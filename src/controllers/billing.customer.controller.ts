import {Request, Response} from "express";
import StripeConnectedAccountService from "../services/StripeConnectedAccountService";
import {Logger} from "../libs/Logger";
import BillingCustomerService from "../services/BillingCustomerService";

const billingCustomerService =
    BillingCustomerService.retrieveServiceInstance();

export const getCustomers = async (req: Request, res: Response) => {
    try {
        const customers = await billingCustomerService.listCustomers();

        if (customers) {
            return res.status(200).json(customers);
        } else {
            return res.status(404).json({ message: 'Customers not found.' });
        }
    } catch (error) {
        Logger.error({
            location: (error as Error).stack,
            message: `Error retrieving customers: ${(error as Error).message}`,
        });
        return res.status(500).json({ message: (error as Error).message });
    }
};

export const getCustomerById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const customer = await billingCustomerService.getCustomerById(id);

        if (customer) {
            return res.status(200).json(customer);
        } else {
            return res.status(404).json({ message: 'Customer not found.' });
        }
    } catch (error) {
        Logger.error({
            location: (error as Error).stack,
            message: `Error retrieving customer: ${(error as Error).message}`,
        });
        return res.status(500).json({ message: (error as Error).message });
    }
};

export const getCustomerByParticipantId = async (req: Request, res: Response) => {
    try {
        const { participantId } = req.params;
        const customer = await billingCustomerService.getCustomerByParticipantId(participantId);

        if (customer) {
            return res.status(200).json(customer);
        } else {
            return res.status(404).json({ message: 'Customer not found.' });
        }
    } catch (error) {
        Logger.error({
            location: (error as Error).stack,
            message: `Error retrieving customer: ${(error as Error).message}`,
        });
        return res.status(500).json({ message: (error as Error).message });
    }
};

export const getCustomerByCustomerId = async (req: Request, res: Response) => {
    try {
        const { customerId } = req.params;
        const customer = await billingCustomerService.getCustomerByCustomerId(customerId);

        if (customer) {
            return res.status(200).json(customer);
        } else {
            return res.status(404).json({ message: 'Customer not found.' });
        }
    } catch (error) {
        Logger.error({
            location: (error as Error).stack,
            message: `Error retrieving customer: ${(error as Error).message}`,
        });
        return res.status(500).json({ message: (error as Error).message });
    }
};