import httpStatus from 'http-status';
import AppError from '../../error/AppError';

export const buildSsDesignPrompt = (category: string): string => {
  return `
Edit image 1 using the SS design from image 2.

Image 1 is the customer's real photo.
Image 2 is the exact selected "${category}" stainless-steel design reference.

Task:
Find the correct installation area for a ${category} in image 1 and realistically install the design from image 2 there.

Important requirements:
- Preserve image 1 and its original building, room, walls, floor, objects, people, background, camera angle and composition.
- Do not generate a new house, room, staircase, balcony or environment.
- Use image 2 as the design reference and preserve its pattern, structure, proportions and design identity as closely as possible.
- Automatically detect the correct installation area based on the selected category.
- Replace an existing similar structure only if necessary.
- Scale, rotate and perspective-transform the SS design so it fits the real opening or installation area accurately.
- Follow the real architectural boundaries and mounting points.
- Make the stainless steel photorealistic with natural metallic reflections, realistic thickness, joints and supports.
- Match the lighting, shadows, reflections and perspective of image 1.
- Respect foreground objects and natural occlusion.
- Do not place the design floating, outside the frame, oversized, undersized or in an unrelated area.
- Modify only the required installation area.

Final result:
Create one realistic photo showing how the selected ${category} design would look after professional installation in the customer's actual location.

The result must look like a real installed photograph, not a collage, overlay, sketch or separate 3D render.
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
