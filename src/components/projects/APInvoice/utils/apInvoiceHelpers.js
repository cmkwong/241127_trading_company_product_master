import { processChangesWithBase64 } from '../../../../utils/objectUrlUtils';

export const AP_API_BASE =
  'http://localhost:3001/api/v1/trade_business/ap/data';
export const PURCHASE_API_BASE =
  'http://localhost:3001/api/v1/trade_business/purchase/data';
export const SUPPLIERS_API_BASE =
  'http://localhost:3001/api/v1/trade_business/suppliers/data/list';
export const MASTER_API_BASE =
  'http://localhost:3001/api/v1/trade_business/master';
export const FILE_SERVER_BASE_URL = 'http://localhost:3001';

export const AP_FILE_MAPPINGS = {
  ap_invoice_row_detail_images: { url: 'image_url', base64: 'base64_image' },
  ap_invoice_row_detail_files: { url: 'file_url', base64: 'base64_file' },
};

export const toSafeString = (value) => String(value || '').trim();
export const toArray = (value) => (Array.isArray(value) ? value : []);

export const toNumberOrEmpty = (value) => {
  if (value === '' || value === null || value === undefined) return '';
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : value;
};

export const toNullableId = (value) => {
  const normalized = toSafeString(value);
  return normalized || null;
};

export const extractRowsFromResponse = (response, tableName) => {
  if (Array.isArray(response?.structuredData?.data?.[tableName])) {
    return response.structuredData.data[tableName];
  }
  if (Array.isArray(response?.data?.[tableName])) {
    return response.data[tableName];
  }
  if (Array.isArray(response?.[tableName])) {
    return response[tableName];
  }
  if (Array.isArray(response?.data?.results)) {
    return response.data.results;
  }
  if (Array.isArray(response?.results)) {
    return response.results;
  }
  if (Array.isArray(response?.data)) {
    return response.data;
  }
  if (Array.isArray(response)) {
    return response;
  }
  return [];
};

export const newId = () => {
  if (
    typeof crypto !== 'undefined' &&
    typeof crypto.randomUUID === 'function'
  ) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

export const createNewApInvoice = () => ({
  id: newId(),
  supplier_id: '',
  purchase_request_id: '',
  supplier_address_id: '',
  invoice_ref: '',
  invoice_date: '',
  due_date: '',
  remark: '',
  ap_invoice_row_details: [],
});

export const getSupplierDisplayName = (supplier) => {
  return toSafeString(
    supplier?.supplier_display_name ||
      supplier?.display_name ||
      supplier?.supplier_name ||
      supplier?.name ||
      supplier?.id,
  );
};

export const getSupplierAddressPreview = (address) => {
  const detail = toSafeString(address?.address_detail);
  if (detail) return detail;

  const parts = [
    address?.address,
    address?.address_1,
    address?.line1,
    address?.address_2,
    address?.line2,
    address?.city,
    address?.state || address?.province,
    address?.country,
    address?.postal_code || address?.zip_code,
  ]
    .map((value) => toSafeString(value))
    .filter(Boolean);

  if (parts.length > 0) {
    return parts.join(', ');
  }

  return toSafeString(address?.name || address?.label || address?.id);
};

export const stripAuditTimestamps = (value) => {
  if (Array.isArray(value)) {
    return value.map((item) => stripAuditTimestamps(item));
  }

  if (!value || typeof value !== 'object') {
    return value;
  }

  return Object.entries(value).reduce((acc, [key, nestedValue]) => {
    if (key === 'created_at' || key === 'updated_at') {
      return acc;
    }

    acc[key] = stripAuditTimestamps(nestedValue);
    return acc;
  }, {});
};

export const buildDefaultUploadFiles = (
  files,
  nameField,
  urlField,
  fileUrlBase = '',
) => {
  const base = String(fileUrlBase || '')
    .trim()
    .replace(/\/+$/, '');

  const resolveUrl = (rawUrl) => {
    const normalized = toSafeString(rawUrl);
    if (!normalized) return '';
    if (/^(blob:|data:|https?:\/\/)/i.test(normalized)) {
      return normalized;
    }

    if (!base) {
      return normalized;
    }

    return `${base}/${normalized.replace(/^\/+/, '')}`;
  };

  return toArray(files)
    .slice()
    .sort(
      (a, b) => Number(a?.display_order || 0) - Number(b?.display_order || 0),
    )
    .map((file) => ({
      id: file?.id,
      name: file?.[nameField],
      url: resolveUrl(file?.[urlField]),
      display_order: file?.display_order,
    }));
};

export const buildFileDiffPayload = (oldFiles, newFiles, fieldMap) => {
  const oldList = toArray(oldFiles);
  const newList = toArray(newFiles);

  const removedFiles = oldList.filter(
    (oldItem) =>
      !newList.some(
        (newItem) => toSafeString(newItem?.id) === toSafeString(oldItem?.id),
      ),
  );
  const addedFiles = newList.filter(
    (newItem) =>
      !oldList.some(
        (oldItem) => toSafeString(oldItem?.id) === toSafeString(newItem?.id),
      ),
  );

  const sameLength = oldList.length === newList.length;
  const sameOrder =
    sameLength &&
    oldList.every(
      (item, index) =>
        toSafeString(item?.id) === toSafeString(newList[index]?.id),
    );

  if (removedFiles.length === 0 && addedFiles.length === 0 && sameOrder) {
    return null;
  }

  const addedIds = new Set(addedFiles.map((item) => toSafeString(item?.id)));

  return [
    ...removedFiles
      .map((item) => ({ id: item?.id, _delete: true }))
      .filter((item) => toSafeString(item?.id)),
    ...newList.map((item, fileIndex) => ({
      id: item?.id || newId(),
      display_order: fileIndex + 1,
      ...(addedIds.has(toSafeString(item?.id))
        ? {
            [fieldMap.nameField]: item?.name,
            [fieldMap.urlField]: item?.url,
            [fieldMap.descriptionField]: item?.description,
            [fieldMap.typeField]: item?.type,
          }
        : {}),
    })),
  ];
};

export const buildPayloadFromWorking = (workingInput) => {
  const working = workingInput || createNewApInvoice();

  return stripAuditTimestamps({
    ...working,
    supplier_address_id: toNullableId(working?.supplier_address_id),
    ap_invoice_row_details: toArray(working?.ap_invoice_row_details).map(
      (detailRow) => ({
        ...detailRow,
        ap_invoice_id:
          toSafeString(detailRow?.ap_invoice_id) || toSafeString(working?.id),
        currency_id: toNullableId(detailRow?.currency_id),
        ap_invoice_type: toSafeString(detailRow?.ap_invoice_type),
        ap_invoice_row_detail_images: toArray(
          detailRow?.ap_invoice_row_detail_images,
        ),
        ap_invoice_row_detail_files: toArray(
          detailRow?.ap_invoice_row_detail_files,
        ),
      }),
    ),
  });
};

export const buildPayloadWithBase64 = async (workingInput) => {
  const normalizedPayload = buildPayloadFromWorking(workingInput);
  return processChangesWithBase64(normalizedPayload, AP_FILE_MAPPINGS);
};
