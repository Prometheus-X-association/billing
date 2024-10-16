import { Request, Response } from 'express';
import StripeCustomerCrudService from '../services/StripeCustomerCrudService';
import { Logger } from '../libs/Logger';

export const createCustomer = async (req: Request, res: Response) => {
  try {
    const stripeCrudService =
      StripeCustomerCrudService.retrieveServiceInstance();
    const newCustomer = await stripeCrudService.createCustomer(req.body, {
      stripeAccount: req.headers['stripe-account'] as string,
    });

    if (newCustomer) {
      return res.status(201).json(newCustomer);
    } else {
      return res.status(500).json({ message: 'Failed to create customer.' });
    }
  } catch (error) {
    const err = error as Error;
    Logger.error({
      location: err.stack,
      message: `Error creating customer: ${err.message}`,
    });
    return res.status(500).json({ message: err.message });
  }
};

export const getAllCustomers = async (req: Request, res: Response) => {
  try {
    const stripeCrudService =
      StripeCustomerCrudService.retrieveServiceInstance();
    const customers = await stripeCrudService.listCustomers({stripeAccount: req.headers['stripe-account'] as string});

    if (customers && customers.length > 0) {
      return res.status(200).json(customers);
    } else {
      return res.status(404).json({ message: 'No customers found.' });
    }
  } catch (error) {
    const err = error as Error;
    Logger.error({
      location: err.stack,
      message: `Error retrieving customers: ${err.message}`,
    });
    return res.status(500).json({ message: err.message });
  }
};

export const getCustomer = async (req: Request, res: Response) => {
  const { customerId } = req.params;
  try {
    const stripeCrudService =
      StripeCustomerCrudService.retrieveServiceInstance();
    const customer = await stripeCrudService.getCustomer(customerId, {stripeAccount: req.headers['stripe-account'] as string});

    if (customer) {
      return res.status(200).json(customer);
    } else {
      return res.status(404).json({ message: 'Customer not found.' });
    }
  } catch (error) {
    const err = error as Error;
    Logger.error({
      location: err.stack,
      message: `Error retrieving customer: ${err.message}`,
    });
    return res.status(500).json({ message: err.message });
  }
};

export const updateCustomer = async (req: Request, res: Response) => {
  const { customerId } = req.params;
  const updates = req.body;
  try {
    const stripeCrudService =
      StripeCustomerCrudService.retrieveServiceInstance();
    const updatedCustomer = await stripeCrudService.updateCustomer(
      customerId,
      updates,
      {stripeAccount: req.headers['stripe-account'] as string},
    );

    if (updatedCustomer) {
      return res.status(200).json(updatedCustomer);
    } else {
      return res.status(404).json({ message: 'Customer not found.' });
    }
  } catch (error) {
    const err = error as Error;
    Logger.error({
      location: err.stack,
      message: `Error updating customer: ${err.message}`,
    });
    return res.status(500).json({ message: err.message });
  }
};

export const deleteCustomer = async (req: Request, res: Response) => {
  const { customerId } = req.params;
  try {
    const stripeCrudService =
      StripeCustomerCrudService.retrieveServiceInstance();
    const isDeleted = await stripeCrudService.deleteCustomer(customerId, {stripeAccount: req.headers['stripe-account'] as string});

    if (isDeleted) {
      return res
        .status(200)
        .json({ message: 'Customer deleted successfully.' });
    } else {
      return res
        .status(404)
        .json({ message: 'Customer not found or could not be deleted.' });
    }
  } catch (error) {
    const err = error as Error;
    Logger.error({
      location: err.stack,
      message: `Error deleting customer: ${err.message}`,
    });
    return res.status(500).json({ message: err.message });
  }
};
