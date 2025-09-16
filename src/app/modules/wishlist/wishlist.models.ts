import { model, Schema, Types } from 'mongoose';
import { IWishlist, IWishlistModules } from './wishlist.interface';

const wishlistSchema = new Schema<IWishlist>(
  {
    userId: {
      type: Types.ObjectId,
      ref: 'User',
      required: true,
    },
    productId: {
      type: Types.ObjectId,
      ref: 'Product',
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const Wishlist = model<IWishlist, IWishlistModules>('Wishlist', wishlistSchema);
export default Wishlist;
