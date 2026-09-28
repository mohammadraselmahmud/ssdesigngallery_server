import Replicate from 'replicate';
import httpStatus from 'http-status';
import config from '../../config';
import AppError from '../../error/AppError';
import Subscription from '../subscription/subscription.models';
import { User } from '../user/user.models';
import { GeneratePreviewResponse } from './ai.interface';
import { GenerateVisitingCardInput } from './ai.validation';
import { buildVisitingCardPrompt, getOutputUrl } from './ai.utils';
import { assertAiGenerationEnabled } from '../contents/contents.service';

const replicate = new Replicate({ auth: config.replicate_api_key });
type ImageClient = Pick<Replicate, 'run'>;

export const generateVisitingCard = async (
  payload: GenerateVisitingCardInput,
  userId?: string,
  userRole?: string,
  client: ImageClient = replicate,
): Promise<GeneratePreviewResponse> => {
  if (!userId) {
    throw new AppError(
      httpStatus.UNAUTHORIZED,
      'User authentication required.',
    );
  }
  await assertAiGenerationEnabled();

  if (client === replicate && !config.replicate_api_key) {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'REPLICATE_API_TOKEN is not configured.',
    );
  }

  const unlimited = ['admin', 'sub_admin', 'super_admin'].includes(
    userRole || '',
  );
  const credit: GeneratePreviewResponse = { generatedUrl: '', unlimited };
  let subscriptionId: string | undefined;
  let freeSlotReserved = false;

  if (!unlimited) {
    const activeFilter = {
      user: userId,
      status: 'active',
      endDate: { $gt: new Date() },
      isDeleted: false,
    };
    // Reserve atomically so concurrent card requests cannot spend the same credit.
    const subscription = await Subscription.findOneAndUpdate(
      { ...activeFilter, remainingCredit: { $gt: 0 } },
      { $inc: { usedCredit: 1, remainingCredit: -1 } },
      { new: true },
    ).lean();

    if (subscription) {
      subscriptionId = subscription._id.toString();
      Object.assign(credit, {
        subscriptionId,
        totalCredit: subscription.totalCredit,
        usedCredit: subscription.usedCredit,
        remainingCredit: subscription.remainingCredit,
      });
    } else {
      if (await Subscription.exists(activeFilter)) {
        throw new AppError(
          httpStatus.FORBIDDEN,
          'Your subscription credit limit has been exhausted. Please renew or upgrade your plan.',
        );
      }
      const user = await User.findOneAndUpdate(
        {
          _id: userId,
          $or: [
            { freeAiImageCount: { $lt: 2 } },
            { freeAiImageCount: { $exists: false } },
          ],
        },
        { $inc: { freeAiImageCount: 1 } },
        { new: true, projection: { freeAiImageCount: 1 } },
      ).lean();
      if (!user) {
        throw new AppError(
          httpStatus.PAYMENT_REQUIRED,
          'You have used your 2 free AI images. Please subscribe to continue generating images.',
        );
      }
      freeSlotReserved = true;
      credit.freeAiImageCount = user.freeAiImageCount;
      credit.freeAiImageLimit = 2;
    }
  }

  try {
    const output = await client.run('prunaai/p-image-edit', {
      input: {
        images: [payload.demoImageUrl],
        prompt: buildVisitingCardPrompt(payload),
        aspect_ratio: 'match_input_image',
        // Reduce random variation between repeat edits; this does not lock pixels.
        seed: 42,
        turbo: false,
        no_op: false,
        disable_safety_checker: false,
      },
    });
    const generatedUrl = getOutputUrl(output);
    if (!/^https?:\/\//i.test(generatedUrl)) {
      throw new AppError(
        httpStatus.BAD_GATEWAY,
        'AI model did not return a valid image URL.',
      );
    }
    return { ...credit, generatedUrl };
  } catch (error) {
    // Failed generations must not consume a paid credit or a free image slot.
    if (subscriptionId) {
      await Subscription.updateOne(
        { _id: subscriptionId },
        { $inc: { usedCredit: -1, remainingCredit: 1 } },
      );
    } else if (freeSlotReserved) {
      await User.updateOne({ _id: userId }, { $inc: { freeAiImageCount: -1 } });
    }
    if (error instanceof AppError) throw error;
    throw new AppError(
      httpStatus.BAD_GATEWAY,
      'Failed to generate visiting card. Please try again.',
    );
  }
};
