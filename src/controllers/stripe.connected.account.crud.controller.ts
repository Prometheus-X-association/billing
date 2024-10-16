import { Request, Response } from 'express';
import StripeConnectedAccountService from '../services/StripeConnectedAccountService';
import { Logger } from '../libs/Logger';

export const createConnectedAccount = async (req: Request, res: Response) => {
  try {
    const stripeService =
      StripeConnectedAccountService.retrieveServiceInstance();
    const newAccount = await stripeService.createConnectedAccount(req.body);

    if (newAccount) {
      return res.status(201).json(newAccount);
    } else {
      return res
        .status(500)
        .json({ message: 'Failed to create connected account.' });
    }
  } catch (error) {
    Logger.error({
      location: (error as Error).stack,
      message: `Error creating connected account: ${(error as Error).message}`,
    });
    return res.status(500).json({ message: (error as Error).message });
  }
};

export const updateConnectedAccount = async (req: Request, res: Response) => {
  const { accountId } = req.params;
  try {
    const stripeService =
      StripeConnectedAccountService.retrieveServiceInstance();
    const updatedAccount = await stripeService.updateConnectedAccount(
      accountId,
      req.body,
    );

    if (updatedAccount) {
      return res.status(200).json(updatedAccount);
    } else {
      return res.status(404).json({ message: 'Connected account not found.' });
    }
  } catch (error) {
    Logger.error({
      location: (error as Error).stack,
      message: `Error updating connected account: ${(error as Error).message}`,
    });
    return res.status(500).json({ message: (error as Error).message });
  }
};

export const getConnectedAccount = async (req: Request, res: Response) => {
  const { accountId } = req.params;
  try {
    const stripeService =
      StripeConnectedAccountService.retrieveServiceInstance();
    const account = await stripeService.getConnectedAccount(accountId);

    if (account) {
      return res.status(200).json(account);
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

export const deleteConnectedAccount = async (req: Request, res: Response) => {
  const { accountId } = req.params;
  try {
    const stripeService =
      StripeConnectedAccountService.retrieveServiceInstance();
    const isDeleted = await stripeService.deleteConnectedAccount(accountId);

    if (isDeleted) {
      return res
        .status(200)
        .json({ message: 'Connected account deleted successfully.' });
    } else {
      return res.status(404).json({
        message: 'Connected account not found or could not be deleted.',
      });
    }
  } catch (error) {
    Logger.error({
      location: (error as Error).stack,
      message: `Error deleting connected account: ${(error as Error).message}`,
    });
    return res.status(500).json({ message: (error as Error).message });
  }
};

export const createLoginLink = async (req: Request, res: Response) => {
  const { accountId } = req.params;
  try {
    const stripeService =
      StripeConnectedAccountService.retrieveServiceInstance();
    const loginLink = await stripeService.createLoginLink(accountId);

    if (loginLink) {
      return res.status(200).json(loginLink);
    } else {
      return res
        .status(404)
        .json({ message: 'Failed to create login link for the account.' });
    }
  } catch (error) {
    Logger.error({
      location: (error as Error).stack,
      message: `Error creating login link: ${(error as Error).message}`,
    });
    return res.status(500).json({ message: (error as Error).message });
  }
};

export const createAccountLink = async (req: Request, res: Response) => {
  const { accountId } = req.params;
  try {
    const stripeService =
      StripeConnectedAccountService.retrieveServiceInstance();
    req.body.account = accountId;
    const accountLink = await stripeService.createAccountLinks(req.body);
    if (accountLink) {
      return res.status(200).json(accountLink);
    } else {
      return res
        .status(404)
        .json({ message: 'Failed to create account link for the account.' });
    }
  } catch (error) {
    Logger.error({
      location: (error as Error).stack,
      message: `Error creating account link: ${(error as Error).message}`,
    });
    return res.status(500).json({ message: (error as Error).message });
  }
}
