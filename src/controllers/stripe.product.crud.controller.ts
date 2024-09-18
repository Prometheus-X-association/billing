import { Request, Response } from 'express';
import StripeProductCrudService from '../services/StripeProductCrudService';
import { Logger } from '../libs/Logger';

export const createProduct = async (req: Request, res: Response) => {
  try {
    const stripeCrudService =
      StripeProductCrudService.retrieveServiceInstance();
    const newProduct = await stripeCrudService.createProduct(req.body);

    if (newProduct) {
      return res.status(201).json(newProduct);
    } else {
      return res.status(500).json({ message: 'Failed to create product.' });
    }
  } catch (error) {
    const err = error as Error;
    Logger.error({
      location: err.stack,
      message: `Error creating product: ${err.message}`,
    });
    return res.status(500).json({ message: err.message });
  }
};

export const getAllProducts = async (req: Request, res: Response) => {
  try {
    const stripeCrudService =
      StripeProductCrudService.retrieveServiceInstance();
    const products = await stripeCrudService.listProducts();

    if (products && products.length > 0) {
      return res.status(200).json(products);
    } else {
      return res.status(404).json({ message: 'No products found.' });
    }
  } catch (error) {
    const err = error as Error;
    Logger.error({
      location: err.stack,
      message: `Error retrieving products: ${err.message}`,
    });
    return res.status(500).json({ message: err.message });
  }
};

export const getProduct = async (req: Request, res: Response) => {
  const { productId } = req.params;
  try {
    const stripeCrudService =
      StripeProductCrudService.retrieveServiceInstance();
    const product = await stripeCrudService.getProduct(productId);

    if (product) {
      return res.status(200).json(product);
    } else {
      return res.status(404).json({ message: 'Product not found.' });
    }
  } catch (error) {
    const err = error as Error;
    Logger.error({
      location: err.stack,
      message: `Error retrieving product: ${err.message}`,
    });
    return res.status(500).json({ message: err.message });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  const { productId } = req.params;
  const updates = req.body;
  try {
    const stripeCrudService =
      StripeProductCrudService.retrieveServiceInstance();
    const updatedProduct = await stripeCrudService.updateProduct(
      productId,
      updates,
    );

    if (updatedProduct) {
      return res.status(200).json(updatedProduct);
    } else {
      return res.status(404).json({ message: 'Product not found.' });
    }
  } catch (error) {
    const err = error as Error;
    Logger.error({
      location: err.stack,
      message: `Error updating product: ${err.message}`,
    });
    return res.status(500).json({ message: err.message });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  const { productId } = req.params;
  try {
    const stripeCrudService =
      StripeProductCrudService.retrieveServiceInstance();
    const isDeleted = await stripeCrudService.deleteProduct(productId);

    if (isDeleted) {
      return res.status(200).json({ message: 'Product deleted successfully.' });
    } else {
      return res
        .status(404)
        .json({ message: 'Product not found or could not be deleted.' });
    }
  } catch (error) {
    const err = error as Error;
    Logger.error({
      location: err.stack,
      message: `Error deleting product: ${err.message}`,
    });
    return res.status(500).json({ message: err.message });
  }
};
