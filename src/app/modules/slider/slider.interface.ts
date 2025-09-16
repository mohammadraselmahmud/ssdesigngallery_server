import { Model } from 'mongoose';

export interface ISlider {
  sliderImage: string;
}

export type ISliderModules = Model<ISlider, Record<string, unknown>>;
