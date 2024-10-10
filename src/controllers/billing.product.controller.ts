import {Request, Response} from "express";
import {Logger} from "../libs/Logger";
import BillingProductService from "../services/BillingProductService";

const billingProductService =
    BillingProductService.retrieveServiceInstance();

export const listProductsByParticipant = async (req: Request, res: Response) => {
    try {
        const { participant } = req.params;
        const products = await billingProductService.listProductsByParticipant(participant);

        if (products) {
            return res.status(200).json(products);
        } else {
            return res.status(404).json({ message: 'Products not found.' });
        }
    } catch (error) {
        Logger.error({
            location: (error as Error).stack,
            message: `Error retrieving products: ${(error as Error).message}`,
        });
        return res.status(500).json({ message: (error as Error).message });
    }
};

export const getProductById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const product = await billingProductService.getProductById(id);

        if (product) {
            return res.status(200).json(product);
        } else {
            return res.status(404).json({ message: 'Product not found.' });
        }
    } catch (error) {
        Logger.error({
            location: (error as Error).stack,
            message: `Error retrieving product: ${(error as Error).message}`,
        });
        return res.status(500).json({ message: (error as Error).message });
    }
};

export const createProduct = async (req: Request, res: Response) => {
    try {
        const { participant, stripeId, defaultPriceId, offer } = req.body;
        const product = await billingProductService.createProduct({participant, stripeId, defaultPriceId, offer});

        if (product) {
            return res.status(201).json(product);
        } else {
            return res.status(404).json({ message: 'Product not found.' });
        }
    } catch (error) {
        Logger.error({
            location: (error as Error).stack,
            message: `Error retrieving product: ${(error as Error).message}`,
        });
        return res.status(500).json({ message: (error as Error).message });
    }
};

export const addPrice = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { stripeCustomerId, stripeId } = req.body;
        const product = await billingProductService.addPrice({
            id,
            stripeCustomerId,
            stripeId
        });

        if (product) {
            return res.status(200).json(product);
        } else {
            return res.status(404).json({ message: 'Product not found.' });
        }
    } catch (error) {
        Logger.error({
            location: (error as Error).stack,
            message: `Error retrieving product: ${(error as Error).message}`,
        });
        return res.status(500).json({ message: (error as Error).message });
    }
};