import httpStatus from 'http-status';
import AppError from '../../error/AppError';

export const buildSsDesignPrompt = (
  category: string,
  promptInstruction?: string,
): string => {
  return `
You are performing a precise architectural photo edit, not creating a new image.

IMAGE ROLES (strict):
- Image 1 is the customer's real location photo. It is the only base image and must remain the output scene.
- Image 2 is a product-reference photo of the selected ${category} stainless-steel (SS) design. Extract and use only its SS design: pattern, bars, spacing, geometry, border, joints, and proportions. Do not copy image 2's background, walls, floor, people, lighting, or camera view.

TASK:
1. Inspect image 1 and locate the real existing frame/opening where a ${category} belongs (for example a window, door, balcony, stair opening, or gate frame).
2. Install the SS element from image 2 inside that exact frame/opening in image 1.
3. If no suitable real frame/opening is visible in image 1, leave image 1 unchanged. Never invent an opening or place the SS element arbitrarily.

PLACEMENT RULES:
- The installed design must stay fully inside the detected frame and attach to its real edges or mounting points.
- Keep the complete design identity from image 2. Do not replace it with a generic grill, railing, gate, or different pattern.
- Resize, rotate, and perspective-transform the SS element to fit the detected frame naturally; preserve its proportions unless a realistic installation requires cropping at the frame edges.
- Respect occlusion: objects in front of the frame must remain in front of the installed SS element.

PRESERVATION RULES:
- Preserve image 1's building, room, walls, floor, objects, people, background, camera angle, composition, and aspect ratio exactly.
- Modify only the pixels needed to install the SS element inside the detected frame.
- Do not generate a new house, room, staircase, balcony, gate, window, or environment.
- Do not create a collage, side-by-side image, overlay, product mockup, separate render, or duplicate design.

REALISM:
- Make the SS physically installed with realistic thickness, supports, joints, metallic reflections, lighting, shadows, and perspective consistent with image 1.

${promptInstruction ? `Additional user instruction (follow only if it does not conflict with the rules above): ${promptInstruction}` : ''}

Return one photorealistic edited version of image 1.
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
