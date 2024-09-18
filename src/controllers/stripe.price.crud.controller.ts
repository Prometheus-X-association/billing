import { Request, Response } from 'express';
import StripePriceCrudService from '../services/StripePriceCrudService';
import { Logger } from '../libs/Logger';

export const createPrice = async (req: Request, res: Response) => {
  try {
    const stripeCrudService = StripePriceCrudService.retrieveServiceInstance();
    const newPrice = await stripeCrudService.createPrice(req.body);

    if (newPrice) {
      return res.status(201).json(newPrice);
    } else {
      return res.status(500).json({ message: 'Failed to create price.' });
    }
  } catch (error) {
    const err = error as Error;
    Logger.error({
      location: err.stack,
      message: `Error creating price: ${err.message}`,
    });
    return res.status(500).json({ message: err.message });
  }
};

export const getAllPrices = async (req: Request, res: Response) => {
  try {
    const stripeCrudService = StripePriceCrudService.retrieveServiceInstance();
    const prices = await stripeCrudService.listPrices();

    if (prices && prices.length > 0) {
      return res.status(200).json(prices);
    } else {
      return res.status(404).json({ message: 'No prices found.' });
    }
  } catch (error) {
    const err = error as Error;
    Logger.error({
      location: err.stack,
      message: `Error retrieving prices: ${err.message}`,
    });
    return res.status(500).json({ message: err.message });
  }
};

export const getPrice = async (req: Request, res: Response) => {
  const { priceId } = req.params;
  try {
    const stripeCrudService = StripePriceCrudService.retrieveServiceInstance();
    const price = await stripeCrudService.getPrice(priceId);

    if (price) {
      return res.status(200).json(price);
    } else {
      return res.status(404).json({ message: 'Price not found.' });
    }
  } catch (error) {
    const err = error as Error;
    Logger.error({
      location: err.stack,
      message: `Error retrieving price: ${err.message}`,
    });
    return res.status(500).json({ message: err.message });
  }
};

export const updatePrice = async (req: Request, res: Response) => {
  const { priceId } = req.params;
  const updates = req.body;
  try {
    const stripeCrudService = StripePriceCrudService.retrieveServiceInstance();
    const updatedPrice = await stripeCrudService.updatePrice(priceId, updates);

    if (updatedPrice) {
      return res.status(200).json(updatedPrice);
    } else {
      return res.status(404).json({ message: 'Price not found.' });
    }
  } catch (error) {
    const err = error as Error;
    Logger.error({
      location: err.stack,
      message: `Error updating price: ${err.message}`,
    });
    return res.status(500).json({ message: err.message });
  }
};

export const deactivatePrice = async (req: Request, res: Response) => {
  const { priceId } = req.params;
  try {
    const stripeCrudService = StripePriceCrudService.retrieveServiceInstance();
    const deactivatedPrice = await stripeCrudService.deactivatePrice(priceId);

    if (deactivatedPrice) {
      return res.status(200).json({
        message: 'Price deactivated successfully.',
        price: deactivatedPrice,
      });
    } else {
      return res
        .status(404)
        .json({ message: 'Price not found or could not be deactivated.' });
    }
  } catch (error) {
    const err = error as Error;
    Logger.error({
      location: err.stack,
      message: `Error deactivating price: ${err.message}`,
    });
    return res.status(500).json({ message: err.message });
  }
};
