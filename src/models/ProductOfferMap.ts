import { Schema, model, Document } from 'mongoose';

interface IPrice extends Document {
    stripeId: string;
    stripeCustomerId: string;
}

export interface IProductOfferMap extends Document {
    stripeId: string;
    participant: string;
    offer: string;
    prices?: [IPrice]
    defaultPriceId: string;
}

const ProductOfferMapSchema = new Schema<IProductOfferMap>({
    stripeId: { type: String, required: true, unique: true },
    defaultPriceId: { type: String, required: true, unique: true },
    offer: { type: String, required: true, unique: true },
    participant: { type: String, required: true },
    prices: [
        {
            stripeId: { type: String, required: true, unique: true },
            stripeCustomerId: { type: String, required: true },
        }
    ]
});

const ProductOfferMap = model<IProductOfferMap>(
    'ProductOfferMap',
    ProductOfferMapSchema,
);

export default ProductOfferMap;
