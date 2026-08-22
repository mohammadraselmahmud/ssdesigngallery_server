import sharp from 'sharp';

export async function processAndResizeImage(
  base64String: string,
): Promise<string> {
  const base64Data = base64String.replace(/^data:image\/\w+;base64,/, '');
  const buffer = Buffer.from(base64Data, 'base64');

  const resizedBuffer = await sharp(buffer)
    .resize(1024, 1024, { fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 85 })
    .toBuffer();

  return `data:image/jpeg;base64,${resizedBuffer.toString('base64')}`;
}
