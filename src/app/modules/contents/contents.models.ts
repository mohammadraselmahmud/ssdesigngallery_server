import { model, Schema } from 'mongoose';

interface IContents {
  _id: string;
  isAiGenerationEnabled: boolean;
}

const contentsSchema = new Schema<IContents>(
  {
    _id: { type: String, default: 'global' },
    isAiGenerationEnabled: { type: Boolean, default: false, required: true },
  },
  { timestamps: true },
);

export const Contents = model<IContents>('Contents', contentsSchema);
