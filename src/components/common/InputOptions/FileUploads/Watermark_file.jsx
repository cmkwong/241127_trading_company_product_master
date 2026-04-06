import { useCallback, useRef } from 'react';

const useWatermarkFile = ({
  watermarkImagePath = '/assets/watermark_v1.png',
} = {}) => {
  const watermarkImageCacheRef = useRef(null);

  const loadImageElement = useCallback(async (src) => {
    if (!src) return null;

    return new Promise((resolve, reject) => {
      const image = new Image();
      image.crossOrigin = 'anonymous';
      image.onload = () => resolve(image);
      image.onerror = (error) => reject(error);
      image.src = src;
    });
  }, []);

  const getWatermarkImage = useCallback(async () => {
    if (watermarkImageCacheRef.current) {
      return watermarkImageCacheRef.current;
    }

    const loaded = await loadImageElement(watermarkImagePath);
    watermarkImageCacheRef.current = loaded;
    return loaded;
  }, [loadImageElement, watermarkImagePath]);

  const addWatermarkToImageBlob = useCallback(
    async (sourceBlob) => {
      if (!sourceBlob || !String(sourceBlob.type || '').startsWith('image/')) {
        return sourceBlob;
      }

      const objectUrl = URL.createObjectURL(sourceBlob);

      try {
        const [sourceImage, watermarkImage] = await Promise.all([
          loadImageElement(objectUrl),
          getWatermarkImage(),
        ]);

        const canvas = document.createElement('canvas');
        const width = Number(
          sourceImage.naturalWidth || sourceImage.width || 0,
        );
        const height = Number(
          sourceImage.naturalHeight || sourceImage.height || 0,
        );

        if (!width || !height) {
          return sourceBlob;
        }

        canvas.width = width;
        canvas.height = height;

        const context = canvas.getContext('2d');
        if (!context) {
          return sourceBlob;
        }

        context.drawImage(sourceImage, 0, 0, width, height);

        const watermarkBase = Math.max(1, Math.round(height / 15));
        const wmNaturalWidth = Number(
          watermarkImage.naturalWidth || watermarkImage.width || 1,
        );
        const wmNaturalHeight = Number(
          watermarkImage.naturalHeight || watermarkImage.height || 1,
        );
        const wmRatio = wmNaturalWidth / wmNaturalHeight;
        const wmHeight = watermarkBase;
        const wmWidth = Math.max(1, Math.round(wmHeight * wmRatio));
        const x = Math.max(0, width - wmWidth);
        const y = Math.max(0, height - wmHeight);

        context.drawImage(watermarkImage, x, y, wmWidth, wmHeight);

        const outputType = String(sourceBlob.type || '').startsWith('image/')
          ? sourceBlob.type
          : 'image/png';

        const watermarkedBlob = await new Promise((resolve) => {
          canvas.toBlob(
            (blob) => resolve(blob || sourceBlob),
            outputType,
            outputType.includes('jpeg') || outputType.includes('jpg')
              ? 0.92
              : undefined,
          );
        });

        return watermarkedBlob || sourceBlob;
      } catch (error) {
        console.error('Failed to apply watermark:', error);
        return sourceBlob;
      } finally {
        URL.revokeObjectURL(objectUrl);
      }
    },
    [getWatermarkImage, loadImageElement],
  );

  return {
    addWatermarkToImageBlob,
  };
};

export default useWatermarkFile;
