import Replicate from 'replicate';
import httpStatus from 'http-status';
import config from '../../config';
import AppError from '../../error/AppError';
import Subscription from '../subscription/subscription.models';
// import { GeneratePreviewResponse } from './ai.interface';
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
) => {
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
  const credit = { generatedUrl: '', unlimited };
  let subscriptionId: string | undefined;

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
    // Failed generations must not consume a paid credit.
    if (subscriptionId) {
      await Subscription.updateOne(
        { _id: subscriptionId },
        { $inc: { usedCredit: -1, remainingCredit: 1 } },
      );
    }
    if (error instanceof AppError) throw error;
    throw new AppError(
      httpStatus.BAD_GATEWAY,
      'Failed to generate visiting card. Please try again.',
    );
  }
};
