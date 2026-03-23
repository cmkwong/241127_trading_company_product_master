import { v4 as uuidv4 } from 'uuid';

export const processDefaultImages = (imgs) => {
  if (!Array.isArray(imgs)) return [];

  return imgs.map((image, index) => {
    if (typeof image === 'string') {
      const url = image;
      const nameFromUrl = url.split('/').pop();

      return {
        id: uuidv4(),
        url,
        name: nameFromUrl || `image-${index + 1}`,
        size: 0,
        type: 'image/*',
      };
    }

    if (image && typeof image === 'object') {
      const name =
        image.name || (image.url ? image.url.split('/').pop() : null);

      return {
        id: image.id || uuidv4(),
        url: image.url || '',
        name: name || `image-${index + 1}`,
        size: typeof image.size === 'number' ? image.size : 0,
        type: image.type || 'image/*',
        file: image.file,
      };
    }

    return {
      id: uuidv4(),
      url: '',
      name: `image-${index + 1}`,
      size: 0,
      type: 'image/*',
    };
  });
};

export const shouldReplaceImageList = (currentImages, incomingImages) => {
  if (incomingImages.length !== currentImages.length) {
    return true;
  }

  const currentById = new Map(currentImages.map((img) => [img.id, img]));
  const incomingById = new Map(incomingImages.map((img) => [img.id, img]));

  const hasMembershipDiff =
    currentById.size !== incomingById.size ||
    [...currentById.keys()].some((id) => !incomingById.has(id));

  if (hasMembershipDiff) {
    return true;
  }

  const hasContentDiff = incomingImages.some((img) => {
    const current = currentById.get(img.id);
    if (!current) return true;
    return (
      img.url !== current.url ||
      (img.file && current.file && img.file !== current.file)
    );
  });

  return hasContentDiff;
};
