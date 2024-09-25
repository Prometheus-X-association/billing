import { Request, Response } from 'express';
import StripePersonCrudService from '../services/StripePersonCrudService';
import { Logger } from '../libs/Logger';

export const createPerson = async (req: Request, res: Response) => {
  const { accountId } = req.params;
  try {
    const stripePersonService =
      StripePersonCrudService.retrieveServiceInstance();
    const newPerson = await stripePersonService.createPerson(
      accountId,
      req.body,
    );

    if (newPerson) {
      return res.status(201).json(newPerson);
    } else {
      return res.status(500).json({ message: 'Failed to create person.' });
    }
  } catch (error) {
    const err = error as Error;
    Logger.error({
      location: err.stack,
      message: `Error creating person: ${err.message}`,
    });
    return res.status(500).json({ message: err.message });
  }
};

export const updatePerson = async (req: Request, res: Response) => {
  const { accountId, personId } = req.params;
  try {
    const stripePersonService =
      StripePersonCrudService.retrieveServiceInstance();
    const updatedPerson = await stripePersonService.updatePerson(
      accountId,
      personId,
      req.body,
    );

    if (updatedPerson) {
      return res.status(200).json(updatedPerson);
    } else {
      return res.status(404).json({ message: 'Person not found.' });
    }
  } catch (error) {
    const err = error as Error;
    Logger.error({
      location: err.stack,
      message: `Error updating person: ${err.message}`,
    });
    return res.status(500).json({ message: err.message });
  }
};

export const getPerson = async (req: Request, res: Response) => {
  const { accountId, personId } = req.params;
  try {
    const stripePersonService =
      StripePersonCrudService.retrieveServiceInstance();
    const person = await stripePersonService.getPerson(accountId, personId);

    if (person) {
      return res.status(200).json(person);
    } else {
      return res.status(404).json({ message: 'Person not found.' });
    }
  } catch (error) {
    const err = error as Error;
    Logger.error({
      location: err.stack,
      message: `Error retrieving person: ${err.message}`,
    });
    return res.status(500).json({ message: err.message });
  }
};

export const deletePerson = async (req: Request, res: Response) => {
  const { accountId, personId } = req.params;
  try {
    const stripePersonService =
      StripePersonCrudService.retrieveServiceInstance();
    const isDeleted = await stripePersonService.deletePerson(
      accountId,
      personId,
    );

    if (isDeleted) {
      return res.status(200).json({ message: 'Person deleted successfully.' });
    } else {
      return res
        .status(404)
        .json({ message: 'Person not found or could not be deleted.' });
    }
  } catch (error) {
    const err = error as Error;
    Logger.error({
      location: err.stack,
      message: `Error deleting person: ${err.message}`,
    });
    return res.status(500).json({ message: err.message });
  }
};
