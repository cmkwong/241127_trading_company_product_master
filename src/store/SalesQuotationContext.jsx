import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { apiDelete, apiGet, apiPatch, apiPost } from '../utils/crud';
import {
  buildNestedChangedData,
  canProceedWithRecordSwitch,
  cleanupNestedInternalFlags,
  ensureContextAvailable,
  getEffectiveComparisonKeys,
  validateNestedDataObject,
} from '../utils/contextDataUtils';
import { upsertNestedData } from '../utils/crudObj';
import { processChangesWithBase64 } from '../utils/objectUrlUtils';
import { useAuthContext } from './AuthContext';
import { useGeneralContext } from './GeneralContext';
import { useMasterContext } from './MasterContext';

export const SalesQuotationContext = createContext();

const SALES_API_BASE = 'http://localhost:3001/api/v1/trade_business/sales';
const CUSTOMERS_API_BASE =
  'http://localhost:3001/api/v1/trade_business/customers';
const SUPPLIERS_API_BASE =
  'http://localhost:3001/api/v1/trade_business/suppliers';
const PRODUCTS_API_BASE =
  'http://localhost:3001/api/v1/trade_business/products';
const MASTER_API_BASE = 'http://localhost:3001/api/v1/trade_business/master';

const SALES_TABLE_NAME = 'sales_quotations';

const DEFAULT_QUOTATION_FILE_MAPPINGS = {
  sales_shipping_images: { url: 'image_url', base64: 'base64_image' },
  sales_product_detail_images: { url: 'image_url', base64: 'base64_image' },
  sales_service_detail_images: { url: 'image_url', base64: 'base64_image' },
};

const SALES_CHILD_TABLE_RENEST_CONFIG = [
  {
    rootChildKey: 'sales_shipping_prices',
    detailKey: 'sales_shipping_details',
    parentField: 'sales_shipping_detail_id',
    nestedChildKey: 'sales_shipping_prices',
  },
  {
    rootChildKey: 'sales_shipping_images',
    detailKey: 'sales_shipping_details',
    parentField: 'sales_shipping_detail_id',
    nestedChildKey: 'sales_shipping_images',
  },
  {
    rootChildKey: 'sales_product_detail_images',
    detailKey: 'sales_product_details',
    parentField: 'sales_product_detail_id',
    nestedChildKey: 'sales_product_detail_images',
  },
  {
    rootChildKey: 'sales_service_detail_images',
    detailKey: 'sales_service_details',
    parentField: 'sales_service_detail_id',
    nestedChildKey: 'sales_service_detail_images',
  },
];

const FALLBACK_INCOTERM_OPTIONS = [
  { id: 'EXW', name: 'EXW' },
  { id: 'FOB', name: 'FOB' },
  { id: 'CIF', name: 'CIF' },
  { id: 'DAP', name: 'DAP' },
];

const toSafeString = (value) => String(value || '').trim();

const toIsoNow = () => new Date().toISOString();

const deepClone = (value) => JSON.parse(JSON.stringify(value));

const toArray = (value) => (Array.isArray(value) ? value : []);

const flattenNestedRows = (
  parentRows = [],
  childKey,
  parentIdField,
  fallbackParentIdField,
) => {
  const rows = [];

  toArray(parentRows).forEach((parent) => {
    const parentId = toSafeString(parent?.id);
    toArray(parent?.[childKey]).forEach((child) => {
      if (!child || typeof child !== 'object') {
        return;
      }

      rows.push({
        ...child,
        [parentIdField]:
          toSafeString(child?.[parentIdField]) ||
          toSafeString(child?.[fallbackParentIdField]) ||
          parentId,
      });
    });
  });

  return rows;
};

const extractRowsFromResponse = (response, tableName) => {
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

const pickFirstLabel = (record, keys = []) => {
  for (const key of keys) {
    const value = toSafeString(record?.[key]);
    if (value) {
      return value;
    }
  }
  return '';
};

const pickNestedName = (record, nestedKeys = []) => {
  for (const key of nestedKeys) {
    const rows = toArray(record?.[key]);
    for (const row of rows) {
      const label = pickFirstLabel(row, [
        'name',
        'customer_name',
        'display_name',
        'full_name',
        'value',
        'remark',
        'label',
      ]);
      if (label) {
        return label;
      }
    }
  }
  return '';
};

const toOption = (id, label) => {
  const normalizedId = toSafeString(id);
  if (!normalizedId) {
    return null;
  }

  return {
    id: normalizedId,
    name: toSafeString(label) || normalizedId,
  };
};

const formatLabelWithCode = (label, code) => {
  const normalizedLabel = toSafeString(label);
  const normalizedCode = toSafeString(code);

  if (normalizedLabel && normalizedCode) {
    if (normalizedLabel.toLowerCase() === normalizedCode.toLowerCase()) {
      return normalizedLabel;
    }

    return `${normalizedLabel} (${normalizedCode})`;
  }

  return normalizedLabel || normalizedCode;
};

const normalizeSalesQuotation = (row = {}) => {
  const now = toIsoNow();
  const shippingDetails = toArray(row?.sales_shipping_details);
  const productDetails = toArray(row?.sales_product_details);
  const serviceDetails = toArray(row?.sales_service_details);

  const shippingPrices =
    toArray(row?.sales_shipping_prices).length > 0
      ? toArray(row?.sales_shipping_prices)
      : flattenNestedRows(
          shippingDetails,
          'sales_shipping_prices',
          'sales_shipping_detail_id',
          'shipping_detail_id',
        );

  const shippingImages =
    toArray(row?.sales_shipping_images).length > 0
      ? toArray(row?.sales_shipping_images)
      : flattenNestedRows(
          shippingDetails,
          'sales_shipping_images',
          'sales_shipping_detail_id',
          'shipping_detail_id',
        );

  const productImages =
    toArray(row?.sales_product_detail_images).length > 0
      ? toArray(row?.sales_product_detail_images)
      : flattenNestedRows(
          productDetails,
          'sales_product_detail_images',
          'sales_product_detail_id',
          'product_detail_id',
        );

  const serviceImages =
    toArray(row?.sales_service_detail_images).length > 0
      ? toArray(row?.sales_service_detail_images)
      : flattenNestedRows(
          serviceDetails,
          'sales_service_detail_images',
          'sales_service_detail_id',
          'service_detail_id',
        );

  return {
    id: toSafeString(row?.id),
    to_order: Boolean(row?.to_order),
    remark: toSafeString(row?.remark),
    customer_id: toSafeString(row?.customer_id),
    customer_address_id: toSafeString(row?.customer_address_id),
    created_at: toSafeString(row?.created_at) || now,
    updated_at:
      toSafeString(row?.updated_at) || toSafeString(row?.created_at) || now,
    sales_shipping_details: shippingDetails,
    sales_shipping_prices: shippingPrices,
    sales_shipping_images: shippingImages,
    sales_product_details: productDetails,
    sales_product_detail_images: productImages,
    sales_service_details: serviceDetails,
    sales_service_detail_images: serviceImages,
  };
};

const buildOriginalMap = (rows = []) => {
  return rows.reduce((acc, row) => {
    const id = toSafeString(row?.id);
    if (!id) {
      return acc;
    }

    acc[id] = deepClone(row);
    return acc;
  }, {});
};

const sortByUpdatedDesc = (rows = []) => {
  return [...rows].sort((a, b) => {
    const aTime = new Date(a?.updated_at || a?.created_at || 0).getTime();
    const bTime = new Date(b?.updated_at || b?.created_at || 0).getTime();
    return bTime - aTime;
  });
};

const buildChildParentLookup = (sourceRows = [], rootChildKey, parentField) => {
  const lookup = new Map();

  toArray(sourceRows).forEach((sourceRow) => {
    toArray(sourceRow?.[rootChildKey]).forEach((childRow) => {
      const childId = toSafeString(childRow?.id);
      const parentId = toSafeString(childRow?.[parentField]);
      if (childId && parentId && !lookup.has(childId)) {
        lookup.set(childId, parentId);
      }
    });
  });

  return lookup;
};

const renestSalesQuotationRowForApi = (row = {}, fallbackRows = []) => {
  const nextRow = deepClone(row);

  SALES_CHILD_TABLE_RENEST_CONFIG.forEach((config) => {
    const rootRows = toArray(nextRow?.[config.rootChildKey]);
    if (rootRows.length === 0) {
      return;
    }

    const details = toArray(nextRow?.[config.detailKey]).map((detail) => ({
      ...detail,
    }));
    const detailIndexById = new Map();

    details.forEach((detail, index) => {
      const detailId = toSafeString(detail?.id);
      if (detailId) {
        detailIndexById.set(detailId, index);
      }
    });

    const childParentLookup = buildChildParentLookup(
      [row, ...toArray(fallbackRows)],
      config.rootChildKey,
      config.parentField,
    );

    rootRows.forEach((childRow) => {
      const nextChildRow = { ...childRow };
      const childId = toSafeString(nextChildRow?.id);
      const parentId =
        toSafeString(nextChildRow?.[config.parentField]) ||
        (childId ? childParentLookup.get(childId) : '');

      if (!parentId) {
        return;
      }

      nextChildRow[config.parentField] = parentId;

      let detailIndex = detailIndexById.get(parentId);
      if (detailIndex === undefined) {
        details.push({ id: parentId });
        detailIndex = details.length - 1;
        detailIndexById.set(parentId, detailIndex);
      }

      const detailRow = details[detailIndex] || { id: parentId };
      const nestedRows = toArray(detailRow?.[config.nestedChildKey]);
      details[detailIndex] = {
        ...detailRow,
        [config.nestedChildKey]: [...nestedRows, nextChildRow],
      };
    });

    nextRow[config.detailKey] = details;
    delete nextRow[config.rootChildKey];
  });

  return nextRow;
};

const renestSalesPayloadForApi = (
  payload,
  { currentRow = null, originalRow = null } = {},
) => {
  if (!payload || typeof payload !== 'object') {
    return payload;
  }

  const salesRows = toArray(payload?.sales_quotations);
  if (salesRows.length === 0) {
    return payload;
  }

  const fallbackRows = [currentRow, originalRow].filter(Boolean);

  return {
    ...payload,
    sales_quotations: salesRows.map((row) =>
      renestSalesQuotationRowForApi(row, fallbackRows),
    ),
  };
};

export const SalesQuotationContext_Provider = ({ children }) => {
  const { token } = useAuthContext();
  const { fileMappings } = useGeneralContext();
  const { services, currencies, incoterms, category, supplierType } =
    useMasterContext();

  const [quotations, setQuotations] = useState([]);
  const [originalQuotationMap, setOriginalQuotationMap] = useState({});
  const [selectedQuotationId, setSelectedQuotationId] = useState(null);
  const [isSalesQuotationsLoading, setIsSalesQuotationsLoading] =
    useState(false);
  const [customerOptions, setCustomerOptions] = useState([]);
  const [customerAddressOptions, setCustomerAddressOptions] = useState([]);
  const [supplierOptions, setSupplierOptions] = useState([]);
  const [productOptions, setProductOptions] = useState([]);
  const [saveError, setSaveError] = useState('');

  const salesFetchSeqRef = useRef(0);
  const optionsFetchSeqRef = useRef(0);

  const quotationBase64Config = useMemo(() => {
    return {
      ...DEFAULT_QUOTATION_FILE_MAPPINGS,
      ...(fileMappings || {}),
    };
  }, [fileMappings]);

  const selectedQuotation = useMemo(() => {
    return quotations.find((item) => item.id === selectedQuotationId) || null;
  }, [quotations, selectedQuotationId]);

  const pageData = useMemo(() => selectedQuotation || {}, [selectedQuotation]);
  const originalPageData = useMemo(() => {
    const id = toSafeString(selectedQuotation?.id);
    if (!id) {
      return {};
    }

    return originalQuotationMap[id] || {};
  }, [selectedQuotation, originalQuotationMap]);

  const effectiveComparisonKeys = useCallback(() => {
    return getEffectiveComparisonKeys({
      comparisonKeys: [],
      pageData,
    });
  }, [pageData]);

  const getChangedData = useCallback(() => {
    return buildNestedChangedData({
      pageData,
      originalPageData,
      comparisonKeys: effectiveComparisonKeys(),
      rootTableName: SALES_TABLE_NAME,
      base64Config: {},
    });
  }, [pageData, originalPageData, effectiveComparisonKeys]);

  const cleanupQuotationFlags = useCallback((value) => {
    return cleanupNestedInternalFlags(value);
  }, []);

  const isDataUnchanged = useCallback(() => {
    return getChangedData() === null;
  }, [getChangedData]);

  const refreshSalesQuotationList = useCallback(async () => {
    if (!token) {
      setQuotations([]);
      setOriginalQuotationMap({});
      setSelectedQuotationId(null);
      return [];
    }

    const fetchSequence = ++salesFetchSeqRef.current;
    setIsSalesQuotationsLoading(true);

    try {
      const response = await apiGet(`${SALES_API_BASE}/data`, { token });
      const rows = extractRowsFromResponse(response, SALES_TABLE_NAME)
        .map(normalizeSalesQuotation)
        .filter((row) => toSafeString(row?.id));
      const sortedRows = sortByUpdatedDesc(rows);

      if (fetchSequence !== salesFetchSeqRef.current) {
        return [];
      }

      setQuotations(sortedRows);
      setOriginalQuotationMap(buildOriginalMap(sortedRows));
      setSelectedQuotationId((previousId) => {
        const previousExists = sortedRows.some((row) => row.id === previousId);
        if (previousExists) {
          return previousId;
        }
        return sortedRows[0]?.id || null;
      });

      return sortedRows;
    } catch (error) {
      console.error('Failed to fetch sales quotations:', error);

      if (fetchSequence === salesFetchSeqRef.current) {
        setQuotations([]);
        setOriginalQuotationMap({});
        setSelectedQuotationId(null);
      }

      return [];
    } finally {
      if (fetchSequence === salesFetchSeqRef.current) {
        setIsSalesQuotationsLoading(false);
      }
    }
  }, [token]);

  const fetchSuppliersList = useCallback(async () => {
    try {
      return await apiPost(
        `${SUPPLIERS_API_BASE}/data/list`,
        {
          fields: {
            suppliers: ['id', 'name', 'supplier_code'],
            supplier_names: ['id', 'supplier_id', 'name'],
            supplier_types: ['id', 'supplier_id', 'supplier_type_id'],
          },
        },
        { token },
      );
    } catch {
      return apiPost(`${SUPPLIERS_API_BASE}/data/list`, {}, { token });
    }
  }, [token]);

  const fetchProductsList = useCallback(async () => {
    try {
      return await apiPost(
        `${PRODUCTS_API_BASE}/data/list`,
        {
          fields: {
            products: ['id', 'remark', 'hs_code', 'product_index', 'icon_url'],
            product_names: ['id', 'product_id', 'name'],
            product_categories: ['id', 'product_id', 'category_id'],
            product_alibaba_ids: ['id', 'product_id', 'value'],
          },
        },
        { token },
      );
    } catch {
      return apiPost(`${PRODUCTS_API_BASE}/data/list`, {}, { token });
    }
  }, [token]);

  const fetchMasterCustomerTypes = useCallback(async () => {
    try {
      return await apiGet(`${MASTER_API_BASE}/rows`, {
        token,
        params: { tableName: 'master_customer_types' },
      });
    } catch {
      try {
        return await apiGet(`${MASTER_API_BASE}/master_customer_types`, {
          token,
        });
      } catch {
        return null;
      }
    }
  }, [token]);

  const refreshReferenceOptions = useCallback(async () => {
    if (!token) {
      setCustomerOptions([]);
      setCustomerAddressOptions([]);
      setSupplierOptions([]);
      setProductOptions([]);
      return;
    }

    const fetchSequence = ++optionsFetchSeqRef.current;

    const [customerResult, supplierResult, productResult, customerTypeResult] =
      await Promise.allSettled([
        apiGet(`${CUSTOMERS_API_BASE}/data`, { token }),
        fetchSuppliersList(),
        fetchProductsList(),
        fetchMasterCustomerTypes(),
      ]);

    if (fetchSequence !== optionsFetchSeqRef.current) {
      return;
    }

    const customerResponse =
      customerResult.status === 'fulfilled' ? customerResult.value : null;
    const supplierResponse =
      supplierResult.status === 'fulfilled' ? supplierResult.value : null;
    const productResponse =
      productResult.status === 'fulfilled' ? productResult.value : null;
    const masterCustomerTypeResponse =
      customerTypeResult.status === 'fulfilled'
        ? customerTypeResult.value
        : null;

    const customerRows = extractRowsFromResponse(customerResponse, 'customers');
    const customerAddressRows = extractRowsFromResponse(
      customerResponse,
      'customer_addresses',
    );
    const customerTypeRows = extractRowsFromResponse(
      customerResponse,
      'customer_types',
    );
    const masterCustomerTypeRows = [
      ...extractRowsFromResponse(
        masterCustomerTypeResponse,
        'master_customer_types',
      ),
      ...extractRowsFromResponse(customerResponse, 'master_customer_types'),
    ].reduce((acc, row) => {
      const id = toSafeString(row?.id);
      if (!id) {
        return acc;
      }

      if (acc.some((existing) => toSafeString(existing?.id) === id)) {
        return acc;
      }

      acc.push(row);
      return acc;
    }, []);

    const customerCategoryLabelById = new Map(
      toArray(category).map((item) => [
        toSafeString(item?.id),
        pickFirstLabel(item, ['name', 'label', 'id']),
      ]),
    );
    const customerCategoryCodeById = new Map(
      toArray(category).map((item) => [
        toSafeString(item?.id),
        pickFirstLabel(item, ['code', 'category_code', 'id']),
      ]),
    );
    const customerTypeLabelById = new Map(
      toArray(masterCustomerTypeRows).map((item) => [
        toSafeString(item?.id),
        pickFirstLabel(item, ['name', 'label', 'value', 'id']),
      ]),
    );
    const customerTypeCodeById = new Map(
      toArray(masterCustomerTypeRows).map((item) => [
        toSafeString(item?.id),
        pickFirstLabel(item, ['code', 'customer_type_code', 'id']),
      ]),
    );

    const normalizedCustomerOptions = customerRows
      .map((customer) => {
        const id = toSafeString(customer?.id);
        const customerName =
          pickNestedName(customer, ['customer_names']) ||
          pickFirstLabel(customer, [
            'customer_display_name',
            'display_name',
            'customer_name',
            'name',
          ]) ||
          pickFirstLabel(customer, ['customer_code', 'code']);
        const label =
          customerName || pickFirstLabel(customer, ['customer_code', 'code']);

        const typeRows = [
          ...toArray(customer?.customer_types),
          ...customerTypeRows.filter(
            (row) => toSafeString(row?.customer_id) === id,
          ),
        ];
        const typeNames = typeRows
          .map((typeRow) => {
            const explicitLabel = pickFirstLabel(typeRow, [
              'name',
              'label',
              'value',
              'type_name',
            ]);
            const explicitCode = pickFirstLabel(typeRow, [
              'code',
              'customer_type_code',
              'type_code',
              'short_code',
            ]);

            if (explicitLabel || explicitCode) {
              return formatLabelWithCode(explicitLabel, explicitCode);
            }

            if (explicitLabel) {
              return explicitLabel;
            }

            const typeId = toSafeString(
              typeRow?.customer_type_id ||
                typeRow?.category_id ||
                typeRow?.type_id ||
                typeRow?.id,
            );
            const fallbackLabel =
              customerTypeLabelById.get(typeId) ||
              customerCategoryLabelById.get(typeId) ||
              typeId;
            const fallbackCode =
              customerTypeCodeById.get(typeId) ||
              customerCategoryCodeById.get(typeId);

            return formatLabelWithCode(fallbackLabel, fallbackCode);
          })
          .filter(Boolean)
          .filter((value, index, array) => array.indexOf(value) === index);

        const option = toOption(id, label);
        if (!option) {
          return null;
        }

        return {
          ...option,
          customer_display_name: customerName || option.name,
          customer_type_name: typeNames.join(', '),
        };
      })
      .filter(Boolean);

    const addressSource =
      customerAddressRows.length > 0
        ? customerAddressRows
        : customerRows.flatMap((customer) => {
            return toArray(customer?.customer_addresses).map((address) => ({
              ...address,
              customer_id:
                toSafeString(address?.customer_id) ||
                toSafeString(customer?.id),
            }));
          });

    const normalizedAddressOptions = addressSource
      .map((address) => {
        const id = toSafeString(address?.id);
        if (!id) {
          return null;
        }

        const customerId = toSafeString(address?.customer_id);
        const label = pickFirstLabel(address, [
          'name',
          'value',
          'address',
          'details',
          'remark',
        ]);

        const addressParts = [
          pickFirstLabel(address, ['address']),
          pickFirstLabel(address, ['line1', 'line_1']),
          pickFirstLabel(address, ['line2', 'line_2']),
          pickFirstLabel(address, ['city']),
          pickFirstLabel(address, ['state', 'province']),
          pickFirstLabel(address, ['country']),
          pickFirstLabel(address, ['postal_code', 'zip_code']),
          pickFirstLabel(address, ['details', 'remark']),
        ]
          .map((value) => toSafeString(value))
          .filter(Boolean);

        const uniqueAddressParts = [...new Set(addressParts)];

        return {
          id,
          customer_id: customerId,
          name: label || id,
          address_detail: uniqueAddressParts.join(', '),
        };
      })
      .filter(Boolean);

    const supplierRows = extractRowsFromResponse(supplierResponse, 'suppliers');
    const supplierTypeRows = extractRowsFromResponse(
      supplierResponse,
      'supplier_types',
    );
    const supplierTypeLabelById = new Map(
      toArray(supplierType).map((item) => [
        toSafeString(item?.id),
        pickFirstLabel(item, ['name', 'label', 'id']),
      ]),
    );
    const categoryLabelLookupById = new Map(
      toArray(category).map((item) => [
        toSafeString(item?.id),
        pickFirstLabel(item, ['name', 'label', 'id']),
      ]),
    );
    const normalizedSupplierOptions = supplierRows
      .map((supplier) => {
        const id = toSafeString(supplier?.id);
        const name =
          pickFirstLabel(supplier, ['name']) ||
          pickNestedName(supplier, ['supplier_names']) ||
          pickFirstLabel(supplier, ['supplier_code', 'code']);
        const code = pickFirstLabel(supplier, ['supplier_code', 'code']);
        const typeIds = [
          ...toArray(supplier?.supplier_types),
          ...supplierTypeRows.filter(
            (item) => toSafeString(item?.supplier_id) === id,
          ),
        ]
          .map((item) =>
            toSafeString(item?.supplier_type_id || item?.category_id),
          )
          .filter(Boolean);
        const typeNames = typeIds
          .map(
            (typeId) =>
              supplierTypeLabelById.get(typeId) ||
              categoryLabelLookupById.get(typeId) ||
              typeId,
          )
          .filter(Boolean);

        if (!id || !name) {
          return null;
        }

        return {
          id,
          name,
          supplier_code: code,
          supplier_type_name: typeNames.join(', '),
          searchText: [name, typeNames.join(' '), code]
            .filter(Boolean)
            .join(' '),
        };
      })
      .filter(Boolean);

    const productRows = extractRowsFromResponse(productResponse, 'products');
    const productNameRows = [
      ...extractRowsFromResponse(productResponse, 'product_names'),
      ...productRows.flatMap((product) =>
        toArray(product?.product_names).map((relation) => ({
          ...relation,
          product_id: relation?.product_id || product?.id,
        })),
      ),
    ];
    const productCategoryRows = [
      ...extractRowsFromResponse(productResponse, 'product_categories'),
      ...productRows.flatMap((product) =>
        toArray(product?.product_categories).map((relation) => ({
          ...relation,
          product_id: relation?.product_id || product?.id,
        })),
      ),
    ];
    const productAlibabaRows = [
      ...extractRowsFromResponse(productResponse, 'product_alibaba_ids'),
      ...productRows.flatMap((product) =>
        toArray(product?.product_alibaba_ids).map((relation) => ({
          ...relation,
          product_id: relation?.product_id || product?.id,
        })),
      ),
    ];
    const categoryLabelById = new Map(
      toArray(category).map((item) => [
        toSafeString(item?.id),
        pickFirstLabel(item, ['label', 'name', 'id']),
      ]),
    );
    const primaryProductNameById = new Map();
    const categoryNamesByProductId = new Map();
    const alibabaValueByProductId = new Map();

    productNameRows.forEach((nameRow) => {
      const productId = toSafeString(nameRow?.product_id);
      const name = pickFirstLabel(nameRow, ['name', 'value', 'label']);
      if (productId && name && !primaryProductNameById.has(productId)) {
        primaryProductNameById.set(productId, name);
      }
    });

    productCategoryRows.forEach((categoryRow) => {
      const productId = toSafeString(categoryRow?.product_id);
      const categoryId = toSafeString(categoryRow?.category_id);
      const categoryLabel = categoryLabelById.get(categoryId) || categoryId;
      if (!productId || !categoryLabel) {
        return;
      }

      const existing = categoryNamesByProductId.get(productId) || [];
      if (!existing.includes(categoryLabel)) {
        categoryNamesByProductId.set(productId, [...existing, categoryLabel]);
      }
    });

    productAlibabaRows.forEach((alibabaRow) => {
      const productId = toSafeString(alibabaRow?.product_id);
      const value = pickFirstLabel(alibabaRow, ['value', 'name', 'label']);
      if (productId && value && !alibabaValueByProductId.has(productId)) {
        alibabaValueByProductId.set(productId, value);
      }
    });

    const normalizedProductOptions = productRows
      .map((product) => {
        const id = toSafeString(product?.id);
        const name =
          primaryProductNameById.get(id) ||
          pickNestedName(product, ['product_names']) ||
          pickFirstLabel(product, [
            'name',
            'remark',
            'product_index',
            'hs_code',
          ]);
        const categoryNames = categoryNamesByProductId.get(id) || [];
        const alibabaIdValue = alibabaValueByProductId.get(id) || '';

        if (!id || !name) {
          return null;
        }

        return {
          id,
          name,
          icon_url: toSafeString(product?.icon_url),
          category_name: categoryNames.join(', '),
          alibaba_id_value: alibabaIdValue,
          searchText: [name, categoryNames.join(' '), alibabaIdValue]
            .filter(Boolean)
            .join(' '),
        };
      })
      .filter(Boolean);

    setCustomerOptions(normalizedCustomerOptions);
    setCustomerAddressOptions(normalizedAddressOptions);
    setSupplierOptions(normalizedSupplierOptions);
    setProductOptions(normalizedProductOptions);
  }, [
    category,
    fetchMasterCustomerTypes,
    fetchProductsList,
    fetchSuppliersList,
    supplierType,
    token,
  ]);

  useEffect(() => {
    if (!token) {
      setQuotations([]);
      setOriginalQuotationMap({});
      setSelectedQuotationId(null);
      setCustomerOptions([]);
      setCustomerAddressOptions([]);
      setSupplierOptions([]);
      setProductOptions([]);
      setSaveError('');
      return;
    }

    refreshSalesQuotationList();
    refreshReferenceOptions();
  }, [token, refreshSalesQuotationList, refreshReferenceOptions]);

  const upsertSalesQuotationPageData = useCallback(
    (nestedData = {}) => {
      const targetId = toSafeString(selectedQuotationId);
      if (!targetId) {
        return;
      }

      if (
        !validateNestedDataObject(
          nestedData,
          'upsertSalesQuotationPageData requires an object argument',
        )
      ) {
        return;
      }

      setQuotations((previousRows) =>
        previousRows.map((row) => {
          if (toSafeString(row?.id) !== targetId) {
            return row;
          }

          const upsertedRow = upsertNestedData(row, nestedData);
          const replacedArrayRow = Object.entries(nestedData || {}).reduce(
            (acc, [key, value]) => {
              if (Array.isArray(value)) {
                acc[key] = value;
              }
              return acc;
            },
            { ...upsertedRow },
          );

          return {
            ...replacedArrayRow,
            updated_at: toIsoNow(),
          };
        }),
      );
      setSaveError('');
    },
    [selectedQuotationId],
  );

  const patchSelectedQuotation = useCallback(
    (patch = {}) => {
      upsertSalesQuotationPageData(patch);
    },
    [upsertSalesQuotationPageData],
  );

  const discardSelectedQuotationUnsavedChanges = useCallback(() => {
    const targetId = toSafeString(selectedQuotation?.id);
    if (!targetId) {
      return;
    }

    const originalSnapshot = originalQuotationMap?.[targetId];
    if (!originalSnapshot) {
      return;
    }

    const normalizedOriginal = normalizeSalesQuotation(originalSnapshot);

    setQuotations((previousRows) =>
      previousRows.map((row) =>
        toSafeString(row?.id) === targetId
          ? deepClone(normalizedOriginal)
          : row,
      ),
    );
    setSaveError('');
  }, [selectedQuotation, originalQuotationMap]);

  const saveSelectedQuotation = useCallback(async () => {
    const targetId = toSafeString(selectedQuotation?.id);
    if (!token) {
      throw new Error('Missing auth token. Please log in again.');
    }

    if (!targetId) {
      throw new Error('No sales quotation selected to save.');
    }

    setSaveError('');

    try {
      const changesResult = getChangedData();

      if (!changesResult) {
        return selectedQuotation;
      }

      const { changes, deletions } = changesResult;
      const cleanedPageData = cleanupQuotationFlags(selectedQuotation);
      const normalizedChanges = renestSalesPayloadForApi(changes, {
        currentRow: selectedQuotation,
        originalRow: originalPageData,
      });
      const normalizedDeletions = renestSalesPayloadForApi(deletions, {
        currentRow: selectedQuotation,
        originalRow: originalPageData,
      });

      if (normalizedDeletions) {
        try {
          await apiDelete(`${SALES_API_BASE}/data/ids`, {
            token,
            body: { data: normalizedDeletions },
          });
        } catch {
          await apiDelete(`${SALES_API_BASE}/data`, {
            token,
            body: { data: normalizedDeletions },
          });
        }
      }

      if (normalizedChanges) {
        // Process base64 fields in changes before sending to server (e.g., blob URLs -> data URIs for images)
        const processedChanges = await processChangesWithBase64(
          normalizedChanges,
          quotationBase64Config,
        );

        await apiPatch(
          `${SALES_API_BASE}/data/ids`,
          { data: processedChanges },
          { token },
        );
      }

      const normalizedSavedRow = normalizeSalesQuotation(cleanedPageData);

      setQuotations((previousRows) =>
        previousRows.map((row) =>
          toSafeString(row?.id) === targetId ? normalizedSavedRow : row,
        ),
      );
      setOriginalQuotationMap((previousMap) => ({
        ...previousMap,
        [targetId]: deepClone(normalizedSavedRow),
      }));

      return normalizedSavedRow;
    } catch (error) {
      setSaveError(error?.message || 'Failed to save sales quotation');
      throw error;
    }
  }, [
    selectedQuotation,
    originalPageData,
    token,
    getChangedData,
    cleanupQuotationFlags,
    quotationBase64Config,
  ]);

  const createSalesQuotation = useCallback(async () => {
    if (!token) {
      return null;
    }

    const canCreate = canProceedWithRecordSwitch({
      hasRecordId: !!selectedQuotation?.id,
      isDataUnchanged: isDataUnchanged(),
      message:
        'You have unsaved changes. Click OK to discard them and create a new sales quotation.',
    });

    if (!canCreate) {
      return null;
    }

    discardSelectedQuotationUnsavedChanges();

    const newPayload = {
      to_order: false,
      remark: '',
    };

    const response = await apiPost(
      `${SALES_API_BASE}/data`,
      {
        data: {
          sales_quotations: [newPayload],
        },
      },
      { token },
    );

    const createdRows = extractRowsFromResponse(response, SALES_TABLE_NAME)
      .map(normalizeSalesQuotation)
      .filter((row) => toSafeString(row?.id));

    if (createdRows.length > 0) {
      const createdRow = createdRows[0];

      setQuotations((previousRows) => {
        const withoutDuplicate = previousRows.filter(
          (row) => row.id !== createdRow.id,
        );
        return [createdRow, ...withoutDuplicate];
      });
      setOriginalQuotationMap((previousMap) => ({
        ...previousMap,
        [createdRow.id]: deepClone(createdRow),
      }));
      setSelectedQuotationId(createdRow.id);

      return createdRow;
    }

    const refreshedRows = await refreshSalesQuotationList();
    return refreshedRows[0] || null;
  }, [
    discardSelectedQuotationUnsavedChanges,
    isDataUnchanged,
    refreshSalesQuotationList,
    selectedQuotation,
    token,
  ]);

  const deleteSalesQuotation = useCallback(
    async (quotationId) => {
      const targetId = toSafeString(quotationId || selectedQuotationId);
      if (!targetId || !token) {
        return false;
      }

      const requestBody = {
        data: {
          sales_quotations: [{ id: targetId }],
        },
      };

      try {
        await apiDelete(`${SALES_API_BASE}/data/ids`, {
          token,
          body: requestBody,
        });
      } catch {
        await apiDelete(`${SALES_API_BASE}/data`, {
          token,
          body: requestBody,
        });
      }

      setQuotations((previousRows) => {
        const nextRows = previousRows.filter((row) => row.id !== targetId);

        setSelectedQuotationId((previousId) => {
          if (previousId !== targetId) {
            return previousId;
          }
          return nextRows[0]?.id || null;
        });

        return nextRows;
      });

      setOriginalQuotationMap((previousMap) => {
        const nextMap = { ...previousMap };
        delete nextMap[targetId];
        return nextMap;
      });

      return true;
    },
    [selectedQuotationId, token],
  );

  const selectSalesQuotation = useCallback(
    (id) => {
      const nextId = toSafeString(id);
      if (!nextId) {
        return false;
      }

      if (nextId === toSafeString(selectedQuotation?.id)) {
        return true;
      }

      const canSwitch = canProceedWithRecordSwitch({
        hasRecordId: !!selectedQuotation?.id,
        isDataUnchanged: isDataUnchanged(),
      });

      if (!canSwitch) {
        return false;
      }

      discardSelectedQuotationUnsavedChanges();

      setSelectedQuotationId(nextId);
      return true;
    },
    [
      discardSelectedQuotationUnsavedChanges,
      isDataUnchanged,
      selectedQuotation,
    ],
  );

  const getSalesQuotationDryRunData = useCallback(async () => {
    const changesResult = getChangedData();
    const preview = {
      endpoint: `${SALES_API_BASE}/data/ids`,
      method: 'PATCH + DELETE',
      create: {},
      update: {},
      delete: {},
    };

    if (!changesResult) {
      return {
        ...preview,
        message: 'No changes detected',
      };
    }

    const normalizedChanges = renestSalesPayloadForApi(changesResult?.changes, {
      currentRow: selectedQuotation,
      originalRow: originalPageData,
    });
    const normalizedDeletions = renestSalesPayloadForApi(
      changesResult?.deletions,
      {
        currentRow: selectedQuotation,
        originalRow: originalPageData,
      },
    );
    const processedChanges = normalizedChanges
      ? await processChangesWithBase64(normalizedChanges, quotationBase64Config)
      : null;

    return {
      ...preview,
      payload: {
        changes: processedChanges,
        deletions: normalizedDeletions,
      },
    };
  }, [
    getChangedData,
    selectedQuotation,
    originalPageData,
    quotationBase64Config,
  ]);

  const serviceOptions = useMemo(() => {
    return toArray(services)
      .map((item) =>
        toOption(
          item?.id,
          pickFirstLabel(item, ['service_name', 'name', 'label', 'id']),
        ),
      )
      .filter(Boolean);
  }, [services]);

  const currencyOptions = useMemo(() => {
    return toArray(currencies)
      .map((item) => {
        const id = toSafeString(item?.id);
        const code = toSafeString(item?.code).toUpperCase();
        const name = pickFirstLabel(item, ['name', 'label']);

        if (!id || !code) {
          return null;
        }

        return {
          id,
          code,
          name:
            name && name.toLowerCase() !== code.toLowerCase()
              ? `${code} - ${name}`
              : code,
        };
      })
      .filter(Boolean);
  }, [currencies]);

  const incotermOptions = useMemo(() => {
    const mappedOptions = toArray(incoterms)
      .map((item) => {
        const code = pickFirstLabel(item, ['code', 'name', 'label', 'id']);
        const name = pickFirstLabel(item, ['name', 'code', 'label', 'id']);

        return toOption(code, name);
      })
      .filter(Boolean);

    if (mappedOptions.length > 0) {
      return mappedOptions;
    }

    return FALLBACK_INCOTERM_OPTIONS;
  }, [incoterms]);

  const contextValue = {
    quotations,
    selectedQuotationId,
    setSelectedQuotationId,
    selectedQuotation,
    pageData,
    isSalesQuotationsLoading,
    customerOptions,
    customerAddressOptions,
    supplierOptions,
    productOptions,
    serviceOptions,
    currencyOptions,
    incotermOptions,
    saveError,
    isDataUnchanged,
    getChangedData,
    refreshSalesQuotationList,
    refreshReferenceOptions,
    patchSelectedQuotation,
    upsertSalesQuotationPageData,
    saveSelectedQuotation,
    createSalesQuotation,
    deleteSalesQuotation,
    selectSalesQuotation,
    getSalesQuotationDryRunData,
  };

  return (
    <SalesQuotationContext.Provider value={contextValue}>
      {children}
    </SalesQuotationContext.Provider>
  );
};

export const useSalesQuotationContext = () => {
  const context = useContext(SalesQuotationContext);
  return ensureContextAvailable(
    context,
    'useSalesQuotationContext',
    'SalesQuotationContext_Provider',
  );
};
