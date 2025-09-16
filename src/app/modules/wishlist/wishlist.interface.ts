import { Model, ObjectId } from 'mongoose';

export interface IWishlist {
  userId: ObjectId;
  productId: ObjectId;
}

export type IWishlistModules = Model<IWishlist, Record<string, unknown>>;
