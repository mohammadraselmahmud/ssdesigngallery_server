import httpStatus from 'http-status';
import AppError from '../../error/AppError';

export const buildSsDesignPrompt = (
  category: string,
  promptInstruction?: string,
): string => {
  return `
Edit image 1 only. Return one photorealistic edited version of image 1, never image 2.

Image 1 is the customer's construction/location photo and is the locked base scene.
Image 2 is only the selected stainless-steel ${category} design reference.

Find the real, unfinished ${category} opening in image 1: use the opening bounded by its existing left and right pillars/frame, top lintel/frame, and bottom threshold/floor. Install one complete ${category} in that exact opening.

The installed ${category} must fill and connect to that opening's real mounting edges: stretch from the left edge to the right edge and from the top frame to the bottom frame as a real installed ${category} would. Perspective-transform it to the camera angle of image 1. Do not place the design beside, in front of, above, below, or elsewhere in the construction photo.

Copy only image 2's exact SS design identity: its pattern, bars, spacing, geometry, outer border, joints, and proportions. Do not use image 2's background or camera view. Do not replace it with a generic ${category} or a different pattern.

Keep every part of image 1 unchanged except the pixels inside and immediately at the mounting edges of the detected opening. Preserve its building, walls, floor, objects, people, composition, and aspect ratio. Keep foreground objects in front of the installed ${category}. Add realistic SS thickness, hinges/supports where appropriate, shadows, reflections, and lighting that match image 1.

If image 1 has no clear real ${category} opening, return image 1 unchanged. Never invent an opening, a new building, or a separate/pasted product image.

${promptInstruction ? `Additional user instruction (follow only when it does not conflict with the placement and preservation rules above): ${promptInstruction}` : ''}
`.trim();
};
export const getOutputUrl = (output: unknown): string => {
  const value = Array.isArray(output) ? output[0] : output;

  if (typeof value === 'string') {
    return value;
  }

  if (value && typeof value === 'object') {
    if ('url' in value) {
      const url = (value as any).url;

      if (typeof url === 'function') {
        return String(url.call(value));
      }

      if (typeof url === 'string') {
        return url;
      }
    }

    if (typeof value.toString === 'function') {
      const str = value.toString();

      if (str && str !== '[object Object]') {
        return str;
      }
    }
  }

  throw new AppError(
    httpStatus.INTERNAL_SERVER_ERROR,
    'AI model did not return an image URL.',
  );
};
