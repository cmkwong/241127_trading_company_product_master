import { sortByDisplayOrder } from '../../../../utils/arr';
import { objectUrlToDataUri } from '../../../../utils/objectUrlUtils';
import {
  normalizeReferenceTarget,
  resolveMediaUrl,
} from './masterControlUtils';

export const resolveMasterServiceImageRelationField = (
  serviceImagesSchema,
  serviceImageRows = [],
) => {
  const fields = serviceImagesSchema?.fields || {};
  for (const [fieldName, fieldSchema] of Object.entries(fields)) {
    const refTarget = normalizeReferenceTarget(fieldSchema);
    if (refTarget && refTarget.includes('master_services')) {
      return fieldName;
    }
  }

  if ((serviceImageRows || []).some((row) => row?.service_id !== undefined)) {
    return 'service_id';
  }

  if (
    (serviceImageRows || []).some((row) => row?.master_service_id !== undefined)
  ) {
    return 'master_service_id';
  }

  return 'service_id';
};

export const normalizePendingMasterServiceImages = (
  newList = [],
  imageSchemaFields = {},
) => {
  const hasSchema = Object.keys(imageSchemaFields).length > 0;

  return (Array.isArray(newList) ? newList : [])
    .filter((img) => !!img?.id)
    .map((img, index) => ({
      id: img.id,
      url: img.url,
      name: img.name,
      size: img.size,
      display_order:
        hasSchema && !('display_order' in imageSchemaFields)
          ? img.display_order
          : index + 1,
    }));
};

export const getDefaultMasterServiceImagesForService = ({
  serviceId,
  serviceImageRows = [],
  masterServiceImageRelationField,
}) => {
  return sortByDisplayOrder(
    (serviceImageRows || [])
      .filter(
        (img) =>
          String(img?.[masterServiceImageRelationField] || '').trim() ===
          String(serviceId || '').trim(),
      )
      .map((img) => ({
        id: img.id,
        url: resolveMediaUrl(
          img.image_url,
          'http://localhost:3001',
          img.base64_image,
        ),
        name: img.image_name,
        size: img.size,
        display_order: img.display_order,
        base64_image: img.base64_image,
      })),
  );
};

export const buildMasterServiceImageMutations = async ({
  pendingServiceImagesByServiceId,
  serviceImagesSchema,
  serviceImageRows,
  masterServiceImageRelationField,
}) => {
  const hasSchema = Object.keys(serviceImagesSchema?.fields || {}).length > 0;
  const imageSchemaFields = serviceImagesSchema?.fields || {};
  const base64Field =
    Object.keys(imageSchemaFields).find((fieldName) =>
      String(fieldName).toLowerCase().includes('base64'),
    ) || 'base64_image';

  const allDeleteRows = [];
  const allUpsertRows = [];

  const pendingEntries = Object.entries(pendingServiceImagesByServiceId || {});
  for (const [serviceId, nextListRaw] of pendingEntries) {
    const nextList = Array.isArray(nextListRaw) ? nextListRaw : [];
    const oldList = getDefaultMasterServiceImagesForService({
      serviceId,
      serviceImageRows,
      masterServiceImageRelationField,
    });

    const removedImages = oldList.filter(
      (oldImage) => !nextList.some((newImage) => newImage.id === oldImage.id),
    );

    removedImages.forEach((img) => {
      if (img?.id) {
        allDeleteRows.push({ id: img.id });
      }
    });

    const addedImageIds = new Set(
      nextList
        .filter((img) => !oldList.some((oldImg) => oldImg.id === img.id))
        .map((img) => img.id),
    );

    for (let index = 0; index < nextList.length; index += 1) {
      const img = nextList[index];
      if (!img?.id) continue;

      const payload = {
        id: img.id,
        [masterServiceImageRelationField]: serviceId,
      };

      if (!hasSchema || 'display_order' in imageSchemaFields) {
        payload.display_order = index + 1;
      }

      const isAdded = addedImageIds.has(img.id);
      if (isAdded) {
        const rawUrl = String(img?.url || '').trim();
        let base64Image = '';

        if (rawUrl.startsWith('data:')) {
          base64Image = rawUrl;
        } else if (rawUrl.startsWith('blob:')) {
          try {
            const response = await fetch(rawUrl);
            const blob = await response.blob();
            base64Image = await objectUrlToDataUri(blob);
          } catch (conversionError) {
            throw new Error(
              `Failed to convert image to base64 before save: ${conversionError?.message || 'unknown error'}`,
            );
          }
        } else if (String(img?.base64_image || '').startsWith('data:')) {
          base64Image = String(img.base64_image);
        }

        if (!base64Image) {
          throw new Error(
            'base64_image is required for newly added service images',
          );
        }

        payload[base64Field] = base64Image;

        if (!hasSchema || 'image_name' in imageSchemaFields) {
          payload.image_name = img.name;
        }

        if (
          (!hasSchema || 'size' in imageSchemaFields) &&
          img.size !== undefined
        ) {
          payload.size = img.size;
        }
      }

      allUpsertRows.push(payload);
    }
  }

  return {
    deleteRows: allDeleteRows,
    upsertRows: allUpsertRows,
  };
};

export const buildMasterServiceImagesRelatedDryRunPreview = ({
  imageDeleteRows = [],
  imageUpsertRows = [],
}) => {
  const hasImageDelete = imageDeleteRows.length > 0;
  const hasImageUpsert = imageUpsertRows.length > 0;

  let relatedMethod = 'POST';
  if (hasImageDelete && hasImageUpsert) {
    relatedMethod = 'POST + DELETE';
  } else if (hasImageDelete) {
    relatedMethod = 'DELETE';
  }

  return {
    hasRelatedChanges: hasImageDelete || hasImageUpsert,
    relatedPayload: {
      endpoint: 'http://localhost:3001/api/v1/trade_business/master/rows',
      method: relatedMethod,
      createOrUpdate: {
        master_service_images: imageUpsertRows,
      },
      delete: {
        master_service_images: imageDeleteRows,
      },
      payload: {
        data: {
          master_service_images: imageUpsertRows,
        },
      },
      deletePayload: {
        data: {
          master_service_images: imageDeleteRows,
        },
      },
      deleteRequest: {
        endpoint: 'http://localhost:3001/api/v1/trade_business/master/rows',
        method: 'DELETE',
        body: {
          data: {
            master_service_images: imageDeleteRows,
          },
        },
      },
    },
  };
};
