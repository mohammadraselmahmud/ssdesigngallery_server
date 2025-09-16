import httpStatus from 'http-status';
import { ISlider } from './slider.interface';
import Slider from './slider.models';
import AppError from '../../error/AppError';
import QueryBuilder from '../../class/builder/QueryBuilder';

const createSlider = async (payload: ISlider) => {
  const result = await Slider.create(payload);
  if (!result) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Failed to create slider');
  }
  return result;
};

const getAllSlider = async (query: Record<string, any>) => {
  const sliderModel = new QueryBuilder(Slider.find(), query)
    .search([''])
    .filter()
    .sort()
    .fields();

  const data = await sliderModel.modelQuery;
  const meta = await sliderModel.countTotal();

  return {
    data,
    meta,
  };
};

const getSliderById = async (id: string) => {
  const result = await Slider.findById(id);
  if (!result) {
    throw new Error('Slider not found!');
  }
  return result;
};

const updateSlider = async (id: string, payload: Partial<ISlider>) => {
  const result = await Slider.findByIdAndUpdate(id, payload, { new: true });
  if (!result) {
    throw new Error('Failed to update Slider');
  }
  return result;
};

const deleteSlider = async (id: string) => {
  const result = await Slider.findByIdAndDelete(id);
  if (!result) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Failed to delete slider');
  }
  return result;
};

export const sliderService = {
  createSlider,
  getAllSlider,
  getSliderById,
  updateSlider,
  deleteSlider,
};
