import { Model } from 'mongoose';

export interface IAds {
  title: string;
  description?: string;
  image?: string;
  video?: string;
  link?: string;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  expiredAt?: Date | string | null;
  isDeleted?: boolean;
}

export type IAdsModules = Model<IAds, Record<string, unknown>>;
