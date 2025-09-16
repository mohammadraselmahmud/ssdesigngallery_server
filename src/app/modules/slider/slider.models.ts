import { model, Schema } from 'mongoose';
import { ISlider, ISliderModules } from './slider.interface';

const sliderSchema = new Schema<ISlider>(
  {
    sliderImage: {
      type: String,
      required: [true, 'Slider image must be required'],
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

const Slider = model<ISlider, ISliderModules>('Slider', sliderSchema);
export default Slider;
