import { Schema, model, Document } from 'mongoose';

interface IPrice extends Document {
    stripeId: string;
    customerId: string;
}

export interface IProductOfferMap extends Document {
    stripeId: string;
    participantId: string;
    offerId: string;
    prices?: [IPrice]
    defaultPriceId: string;
}

const ProductOfferMapSchema = new Schema<IProductOfferMap>({
    stripeId: { type: String, required: true, unique: true },
    defaultPriceId: { type: String, required: true, unique: true },
    offerId: { type: String, required: true, unique: true },
    participantId: { type: String, required: true },
    prices: [
        {
            stripeId: { type: String, required: true, unique: true },
            customerId: { type: String, required: true, unique: true },
        }
    ]
});

const ProductOfferMap = model<IProductOfferMap>(
    'ProductOfferMap',
    ProductOfferMapSchema,
);

export default ProductOfferMap;
