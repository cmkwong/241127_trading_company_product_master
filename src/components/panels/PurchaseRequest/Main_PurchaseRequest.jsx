import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { usePurchaseRequestContext } from '../../../store/PurchaseRequestContext';
import {
  getEntityRecord,
  useEntityField,
  useEntityRows,
} from '../../../store/GeneralContext';
import DeleteBtn from '../../common/Buttons/DeleteBtn';
import Main_Dropdown from '../../common/InputOptions/Dropdown/Main_Dropdown';
import PurchaseRequestSavePageContainer from './Container/PurchaseRequestSavePageContainer';
import PurchaseRequestSidebar from './AllPurchaseRequestList/PurchaseRequestSidebar';
import PurchaseRequestBasicInfo, {
  STATUS_OPTIONS,
} from './PurchaseBasicInfo/PurchaseRequestBasicInfo';
import PurchaseRequestShippingDetails from './ShippingDetails/PurchaseRequestShippingDetails';
import PurchaseRequestProductDetails from './ProductDetails/PurchaseRequestProductDetails';
import PurchaseRequestServiceDetails from './ServiceDetails/PurchaseRequestServiceDetails';
import {
  buildBaseCurrencyOptions,
  buildCurrencyCodeById,
  buildExchangeRateMap,
  buildNormalizedCurrencies,
  computeQuotationTotals,
  formatMoney,
  getLatestExchangeRateRow,
  toSafeString,
} from '../SalesQuotation/utils/quotationTotals';
import { getProductDisplayName } from '../../../store/productNameUtils';
import { buildApInvoiceDocumentA4Html } from '../APInvoice/utils/apInvoicePrint';
import styles from './Main_PurchaseRequest.module.css';

const FILE_SERVER_BASE_URL = 'http://localhost:3001';
const PURCHASE_ENTITY_KEY = 'purchase_requests';

const toArray = (value) => (Array.isArray(value) ? value : []);

const newId = () => {
  if (
    typeof crypto !== 'undefined' &&
    typeof crypto.randomUUID === 'function'
  ) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const buildAddressPreview = (address) => {
  const detail = toSafeString(address?.address_detail);
  if (detail) {
    return detail;
  }

  const parts = [
    address?.address,
    address?.address_line1,
    address?.address_1,
    address?.address_line2,
    address?.line1,
    address?.address_line3,
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

  return toSafeString(address?.name || address?.label || 'Address unavailable');
};

const getCustomerDisplayLabel = (customer) => {
  const firstCustomerName = toArray(customer?.customer_names)
    .map((row) => toSafeString(row?.name))
    .find(Boolean);

  return toSafeString(
    customer?.customer_display_name ||
      customer?.display_name ||
      customer?.customer_name ||
      customer?.name ||
      firstCustomerName ||
      customer?.customer_code ||
      customer?.label,
  );
};

const resolveFileUrl = (url) => {
  const normalized = toSafeString(url);
  if (!normalized) {
    return '';
  }

  if (/^(blob:|data:|https?:\/\/)/i.test(normalized)) {
    return normalized;
  }

  if (normalized.startsWith('/')) {
    return `${FILE_SERVER_BASE_URL}${normalized}`;
  }

  return `${FILE_SERVER_BASE_URL}/${normalized}`;
};

const getProductCategoryLabel = (product, categoryNameById = new Map()) => {
  const firstNestedCategory = toArray(product?.product_categories).find((row) =>
    toSafeString(row?.category_name || row?.name || row?.category_id),
  );

  const nestedCategoryId = toSafeString(firstNestedCategory?.category_id);
  const mappedCategoryName =
    categoryNameById.get(nestedCategoryId) ||
    categoryNameById.get(toSafeString(product?.category_id));

  return toSafeString(
    product?.category_name ||
      product?.product_category_name ||
      firstNestedCategory?.category_name ||
      firstNestedCategory?.name ||
      mappedCategoryName ||
      firstNestedCategory?.category_id,
  );
};

const getProductAlibabaIdValue = (product) => {
  const firstNestedAlibaba = toArray(product?.product_alibaba_ids).find((row) =>
    toSafeString(row?.value || row?.alibaba_id || row?.id),
  );

  return toSafeString(
    product?.alibaba_id_value ||
      product?.alibaba_id ||
      firstNestedAlibaba?.value ||
      firstNestedAlibaba?.alibaba_id,
  );
};

const flattenSalesShippingPrices = (quotation) => {
  const directRows = toArray(quotation?.sales_shipping_prices);
  if (directRows.length > 0) {
    return directRows;
  }

  return toArray(quotation?.sales_shipping_details).flatMap((detailRow) =>
    toArray(detailRow?.sales_shipping_prices),
  );
};

const resolveSelectedShippingPrice = (shippingDetail) => {
  const prices = toArray(shippingDetail?.sales_shipping_prices);
  if (prices.length === 0) return null;
  return prices.find((row) => row?.selected) || prices[0];
};

const normalizeQuotationForTotals = (quotation) => ({
  ...quotation,
  sales_shipping_prices: flattenSalesShippingPrices(quotation),
  sales_product_details: toArray(quotation?.sales_product_details),
  sales_service_details: toArray(quotation?.sales_service_details),
});

const toFiniteNumber = (value) => {
  if (value === '' || value === null || value === undefined) {
    return NaN;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : NaN;
};

const isTruthyFlag = (value, defaultWhenMissing = true) => {
  if (value === undefined || value === null || value === '') {
    return defaultWhenMissing;
  }

  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'number') {
    return value !== 0;
  }

  const normalized = toSafeString(value).toLowerCase();
  return !['false', '0', 'no', 'n', 'off'].includes(normalized);
};

const Main_PurchaseRequest = () => {
  const navigate = useNavigate();
  const { purchase_request_id } = useParams();
  const {
    rows,
    selectedId,
    error,
    setError,
    notice,
    isLoading,
    isDeleting,
    suppliers,
    products,
    services,
    masterCategories,
    masterSupplierTypes,
    currencies,
    salesQuotations,
    customers,
    exchangeRateRows,
    handleSelectRow,
    handleCreate,
    patchSelectedPurchaseRequest,
    getPurchaseRequestDryRunData,
    handleSave,
    handleDelete,
    refreshSuppliers,
    refreshSalesQuotations,
    refreshAll,
  } = usePurchaseRequestContext();
  const currentPurchaseRequestId = useEntityField(PURCHASE_ENTITY_KEY, 'id');
  const supplierId = useEntityField(PURCHASE_ENTITY_KEY, 'supplier_id');
  const supplierAddressId = useEntityField(
    PURCHASE_ENTITY_KEY,
    'supplier_address_id',
  );
  const salesQuotationId = useEntityField(
    PURCHASE_ENTITY_KEY,
    'sales_quotation_id',
  );
  const purchaseStatus = useEntityField(PURCHASE_ENTITY_KEY, 'status');
  const purchaseRemark = useEntityField(PURCHASE_ENTITY_KEY, 'remark');
  const shippingDetailRows = useEntityRows(
    PURCHASE_ENTITY_KEY,
    'purchase_shipping_details',
  );
  const productDetailRows = useEntityRows(
    PURCHASE_ENTITY_KEY,
    'purchase_product_details',
  );
  const serviceDetailRows = useEntityRows(
    PURCHASE_ENTITY_KEY,
    'purchase_service_details',
  );
  const hasActivePurchaseRequest = Boolean(
    toSafeString(currentPurchaseRequestId),
  );

  useEffect(() => {
    const routeId = toSafeString(purchase_request_id);
    if (!routeId) return;
    if (toSafeString(selectedId) === routeId) return;

    const exists = toArray(rows).some(
      (row) => toSafeString(row?.id) === routeId,
    );

    if (exists) {
      handleSelectRow(routeId);
      return;
    }

    refreshAll(routeId);
  }, [purchase_request_id, selectedId, rows, handleSelectRow, refreshAll]);

  const [sidebarSearch, setSidebarSearch] = useState('');
  const [baseCurrencyCode, setBaseCurrencyCode] = useState('HKD');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewHtml, setPreviewHtml] = useState('');
  const [isPreparingPreview, setIsPreparingPreview] = useState(false);

  const previewIframeRef = useRef(null);

  const supplierTypeNameById = useMemo(() => {
    const map = new Map();
    toArray(masterSupplierTypes).forEach((item) => {
      const id = toSafeString(item?.id);
      if (!id) return;
      map.set(id, toSafeString(item?.name || item?.label || id));
    });
    return map;
  }, [masterSupplierTypes]);

  const supplierSuggestionOptions = useMemo(
    () =>
      toArray(suppliers).map((item) => {
        const typeNames = toArray(item?.supplier_types)
          .map((typeRow) => {
            const typeId = toSafeString(
              typeRow?.supplier_type_id || typeRow?.category_id,
            );
            return supplierTypeNameById.get(typeId) || '';
          })
          .filter(Boolean);

        const supplierTypeName =
          typeNames.join(', ') || toSafeString(item?.supplier_type_name);

        return {
          id: toSafeString(item?.id),
          name: toSafeString(
            item?.supplier_display_name ||
              item?.display_name ||
              item?.supplier_name ||
              item?.name ||
              item?.id,
          ),
          supplier_code: toSafeString(item?.supplier_code || item?.code),
          supplier_type_name: supplierTypeName,
          supplier_addresses: toArray(item?.supplier_addresses),
          searchText: [
            item?.supplier_display_name,
            item?.display_name,
            item?.supplier_name,
            item?.name,
            supplierTypeName,
            item?.supplier_code,
            item?.id,
          ]
            .map((value) => toSafeString(value))
            .filter(Boolean)
            .join(' '),
        };
      }),
    [suppliers, supplierTypeNameById],
  );

  const supplierNameById = useMemo(() => {
    const map = new Map();
    supplierSuggestionOptions.forEach((item) => {
      if (!item.id) return;
      map.set(item.id, item.name || item.id);
    });
    return map;
  }, [supplierSuggestionOptions]);

  const selectedSupplierAddresses = useMemo(() => {
    const selectedSupplierId = toSafeString(supplierId);
    if (!selectedSupplierId) return [];

    const supplier = supplierSuggestionOptions.find(
      (item) => item.id === selectedSupplierId,
    );

    return toArray(supplier?.supplier_addresses);
  }, [supplierId, supplierSuggestionOptions]);

  const supplierAddressSuggestionOptions = useMemo(
    () =>
      selectedSupplierAddresses.map((address) => ({
        id: toSafeString(address?.id),
        name: buildAddressPreview(address),
        supplier_id: toSafeString(address?.supplier_id),
        address_detail: buildAddressPreview(address),
        searchText: [
          address?.id,
          address?.name,
          address?.address,
          address?.address_line1,
          address?.address_line2,
          address?.address_line3,
          address?.address_1,
          address?.line1,
          address?.address_2,
          address?.line2,
          address?.city,
          address?.state,
          address?.country,
          address?.postal_code,
          address?.zip_code,
          buildAddressPreview(address),
        ]
          .map((value) => toSafeString(value))
          .filter(Boolean)
          .join(' '),
      })),
    [selectedSupplierAddresses],
  );

  const categoryNameById = useMemo(() => {
    const map = new Map();

    toArray(masterCategories).forEach((item) => {
      const id = toSafeString(item?.id);
      if (!id) return;

      const label = toSafeString(item?.name || item?.category_name || id);
      map.set(id, label);
    });

    return map;
  }, [masterCategories]);

  const productSuggestionOptions = useMemo(
    () =>
      toArray(products).map((item) => {
        const id = toSafeString(item?.id);
        const name = getProductDisplayName(item);
        const categoryName = getProductCategoryLabel(item, categoryNameById);
        const alibabaIdValue = getProductAlibabaIdValue(item);
        const nestedNames = toArray(item?.product_names)
          .map((row) => toSafeString(row?.name))
          .filter(Boolean);

        return {
          id,
          name,
          icon_url: toSafeString(
            item?.icon_url || toArray(item?.product_images)?.[0]?.image_url,
          ),
          category_name: categoryName,
          alibaba_id_value: alibabaIdValue,
          searchText: [
            id,
            name,
            item?.name,
            item?.product_name,
            ...nestedNames,
            categoryName,
            alibabaIdValue,
          ]
            .map((value) => toSafeString(value))
            .filter(Boolean)
            .join(' '),
        };
      }),
    [categoryNameById, products],
  );

  const serviceSuggestionOptions = useMemo(
    () =>
      toArray(services).map((item) => ({
        id: toSafeString(item?.id),
        name: toSafeString(item?.name || item?.service_name || item?.id),
        searchText: [item?.id, item?.name, item?.service_name]
          .map((value) => toSafeString(value))
          .filter(Boolean)
          .join(' '),
      })),
    [services],
  );

  const normalizedCurrencies = useMemo(
    () => buildNormalizedCurrencies(currencies),
    [currencies],
  );

  const currencyCodeById = useMemo(
    () => buildCurrencyCodeById(normalizedCurrencies),
    [normalizedCurrencies],
  );

  const currencyDropdownOptions = useMemo(
    () =>
      normalizedCurrencies.map((currency) => ({
        id: currency.id,
        name: currency.name
          ? `${currency.code} - ${currency.name}`
          : currency.code,
      })),
    [normalizedCurrencies],
  );

  const baseCurrencyOptions = useMemo(
    () => buildBaseCurrencyOptions(normalizedCurrencies),
    [normalizedCurrencies],
  );

  useEffect(() => {
    if (baseCurrencyOptions.length === 0) {
      if (baseCurrencyCode !== 'HKD') {
        setBaseCurrencyCode('HKD');
      }
      return;
    }

    const exists = baseCurrencyOptions.some(
      (item) => toSafeString(item?.id) === toSafeString(baseCurrencyCode),
    );

    if (!exists) {
      setBaseCurrencyCode(toSafeString(baseCurrencyOptions[0]?.id) || 'HKD');
    }
  }, [baseCurrencyCode, baseCurrencyOptions]);

  const customerNameById = useMemo(() => {
    const map = new Map();

    toArray(customers).forEach((item) => {
      const id = toSafeString(item?.id);
      if (!id) return;

      const name = getCustomerDisplayLabel(item);

      map.set(id, name || 'Unknown customer');
    });

    return map;
  }, [customers]);

  const latestExchangeRateRow = useMemo(
    () => getLatestExchangeRateRow(exchangeRateRows),
    [exchangeRateRows],
  );

  const exchangeRateMap = useMemo(
    () => buildExchangeRateMap(latestExchangeRateRow || {}),
    [latestExchangeRateRow],
  );

  const purchaseTotalsSummary = useMemo(() => {
    const targetCode = toSafeString(baseCurrencyCode).toUpperCase() || 'HKD';

    const convertToBaseCurrency = (rawAmount, currencyId) => {
      const amount = toFiniteNumber(rawAmount);
      if (!Number.isFinite(amount)) {
        return null;
      }

      const sourceCode = toSafeString(
        currencyCodeById[toSafeString(currencyId)],
      ).toUpperCase();

      if (!sourceCode) {
        return null;
      }

      const sourceRate = Number(exchangeRateMap?.[sourceCode]);
      const targetRate = Number(exchangeRateMap?.[targetCode]);

      if (
        !Number.isFinite(sourceRate) ||
        sourceRate <= 0 ||
        !Number.isFinite(targetRate) ||
        targetRate <= 0
      ) {
        return null;
      }

      return (amount / sourceRate) * targetRate;
    };

    const summarizeRows = (rows, getRowAmount, getCurrencyId) => {
      return toArray(rows).reduce(
        (acc, row) => {
          const converted = convertToBaseCurrency(
            getRowAmount(row),
            getCurrencyId(row),
          );

          if (!Number.isFinite(converted)) {
            return {
              ...acc,
              missingCount: acc.missingCount + 1,
            };
          }

          return {
            total: acc.total + converted,
            missingCount: acc.missingCount,
          };
        },
        { total: 0, missingCount: 0 },
      );
    };

    const rowAmountByQuantity = (row, qtyValue) => {
      const price = toFiniteNumber(row?.price);
      if (!Number.isFinite(price)) {
        return NaN;
      }

      const qty = toFiniteNumber(qtyValue);
      return (Number.isFinite(qty) ? qty : 1) * price;
    };

    const shippingRows = toArray(shippingDetailRows);
    const productRows = toArray(productDetailRows);
    const serviceRows = toArray(serviceDetailRows);

    const shippingSummary = summarizeRows(
      shippingRows,
      (row) => toFiniteNumber(row?.price),
      (row) => row?.currency_id,
    );

    const productSummary = summarizeRows(
      productRows,
      (row) => rowAmountByQuantity(row, row?.qty ?? row?.quantity),
      (row) => row?.currency_id,
    );

    const serviceSummary = summarizeRows(
      serviceRows,
      (row) => rowAmountByQuantity(row, row?.qty ?? row?.quantity),
      (row) => row?.currency_id,
    );

    const totalCostPrice =
      shippingSummary.total + productSummary.total + serviceSummary.total;

    return {
      baseCurrencyCode: targetCode,
      shippingTotal: shippingSummary.total,
      productTotal: productSummary.total,
      serviceTotal: serviceSummary.total,
      totalCostPrice,
      missingCount:
        shippingSummary.missingCount +
        productSummary.missingCount +
        serviceSummary.missingCount,
    };
  }, [
    baseCurrencyCode,
    currencyCodeById,
    exchangeRateMap,
    shippingDetailRows,
    productDetailRows,
    serviceDetailRows,
  ]);

  const salesQuotationTotalUsdById = useMemo(() => {
    const map = new Map();

    toArray(salesQuotations).forEach((quotation) => {
      const quotationId = toSafeString(quotation?.id);
      if (!quotationId) return;

      const totals = computeQuotationTotals(
        normalizeQuotationForTotals(quotation),
        {
          baseCurrencyCode: 'USD',
          currencyCodeById,
          exchangeRateMap,
        },
      );

      map.set(quotationId, Number(totals?.grandTotal || 0));
    });

    return map;
  }, [currencyCodeById, exchangeRateMap, salesQuotations]);

  const salesQuotationSuggestionOptions = useMemo(
    () =>
      toArray(salesQuotations).map((quotation) => {
        const id = toSafeString(quotation?.id);
        const customerName =
          customerNameById.get(toSafeString(quotation?.customer_id)) ||
          'Unknown customer';
        const totalUsd = salesQuotationTotalUsdById.get(id) || 0;

        return {
          id,
          name: `${id} | ${customerName} | USD ${formatMoney(totalUsd)}`,
          customer_name: customerName,
          total_usd: totalUsd,
          searchText: [
            quotation?.id,
            customerName,
            quotation?.customer_id,
            quotation?.remark,
            formatMoney(totalUsd),
          ]
            .map((value) => toSafeString(value))
            .filter(Boolean)
            .join(' '),
        };
      }),
    [customerNameById, salesQuotationTotalUsdById, salesQuotations],
  );

  const selectedSupplierOption = useMemo(
    () =>
      supplierSuggestionOptions.find(
        (item) => item.id === toSafeString(supplierId),
      ) || null,
    [supplierId, supplierSuggestionOptions],
  );

  const selectedSupplierAddressOption = useMemo(
    () =>
      supplierAddressSuggestionOptions.find(
        (item) => item.id === toSafeString(supplierAddressId),
      ) || null,
    [supplierAddressId, supplierAddressSuggestionOptions],
  );

  const selectedSalesQuotationOption = useMemo(
    () =>
      salesQuotationSuggestionOptions.find(
        (item) => item.id === toSafeString(salesQuotationId),
      ) || null,
    [salesQuotationId, salesQuotationSuggestionOptions],
  );

  const selectedSalesQuotation = useMemo(
    () =>
      toArray(salesQuotations).find(
        (item) => item.id === toSafeString(salesQuotationId),
      ) || null,
    [salesQuotationId, salesQuotations],
  );

  const productNameById = useMemo(() => {
    const map = new Map();
    productSuggestionOptions.forEach((item) => {
      const id = toSafeString(item?.id);
      if (!id) return;
      map.set(id, toSafeString(item?.name) || id);
    });
    return map;
  }, [productSuggestionOptions]);

  const serviceNameById = useMemo(() => {
    const map = new Map();
    serviceSuggestionOptions.forEach((item) => {
      const id = toSafeString(item?.id);
      if (!id) return;
      map.set(id, toSafeString(item?.name) || id);
    });
    return map;
  }, [serviceSuggestionOptions]);

  const apInvoicePreviewRows = useMemo(() => {
    const buildAmount = (priceValue, qtyValue = 1) => {
      const price = toFiniteNumber(priceValue);
      if (!Number.isFinite(price)) {
        return '';
      }

      const qty = toFiniteNumber(qtyValue);
      const safeQty = Number.isFinite(qty) ? qty : 1;
      return safeQty * price;
    };

    const shippingRows = toArray(shippingDetailRows)
      .filter((row) => isTruthyFlag(row?.api_selected, true))
      .map((row, index) => ({
        id: toSafeString(row?.id) || newId(),
        ap_invoice_type: 'SHIPPING',
        description:
          toSafeString(row?.address_text) || `Shipping Detail ${index + 1}`,
        amount: buildAmount(row?.price, 1),
        currency_id: toSafeString(row?.currency_id),
        details: toSafeString(row?.details),
        remark: toSafeString(row?.remark),
      }));

    const productRows = toArray(productDetailRows)
      .filter((row) => isTruthyFlag(row?.api_selected, true))
      .map((row, index) => {
        const productId = toSafeString(row?.product_id);
        return {
          id: toSafeString(row?.id) || newId(),
          ap_invoice_type: 'PRODUCT',
          description:
            productNameById.get(productId) ||
            productId ||
            `Product ${index + 1}`,
          amount: buildAmount(row?.price, row?.qty ?? row?.quantity),
          currency_id: toSafeString(row?.currency_id),
          details: toSafeString(row?.details),
          remark: toSafeString(row?.remark),
        };
      });

    const serviceRows = toArray(serviceDetailRows)
      .filter((row) => isTruthyFlag(row?.api_selected, true))
      .map((row, index) => {
        const serviceId = toSafeString(row?.service_id);
        return {
          id: toSafeString(row?.id) || newId(),
          ap_invoice_type: 'SERVICE',
          description:
            serviceNameById.get(serviceId) ||
            serviceId ||
            `Service ${index + 1}`,
          amount: buildAmount(row?.price, row?.qty ?? row?.quantity),
          currency_id: toSafeString(row?.currency_id),
          details: toSafeString(row?.details),
          remark: toSafeString(row?.remark),
        };
      });

    return [...shippingRows, ...productRows, ...serviceRows];
  }, [
    productDetailRows,
    serviceDetailRows,
    shippingDetailRows,
    productNameById,
    serviceNameById,
  ]);

  const supplierAddressNameById = useMemo(() => {
    const map = new Map();
    supplierAddressSuggestionOptions.forEach((item) => {
      const id = toSafeString(item?.id);
      if (!id) return;
      map.set(id, toSafeString(item?.name) || 'Address unavailable');
    });
    return map;
  }, [supplierAddressSuggestionOptions]);

  const customerAddressNameById = useMemo(() => {
    const map = new Map();
    toArray(customers).forEach((customer) => {
      toArray(customer?.customer_addresses).forEach((address) => {
        const id = toSafeString(address?.id);
        if (!id) return;
        map.set(id, buildAddressPreview(address) || id);
      });
    });
    return map;
  }, [customers]);

  const shippingQuotationSuggestionOptions = useMemo(
    () =>
      toArray(selectedSalesQuotation?.sales_shipping_details).map(
        (detail, index) => {
          const detailId = toSafeString(detail?.id) || `shipping-${index + 1}`;
          const customerAddressId = toSafeString(
            detail?.customer_address_id || detail?.supplier_address_id,
          );
          const addressText =
            toSafeString(detail?.address_text) ||
            customerAddressNameById.get(customerAddressId) ||
            supplierAddressNameById.get(customerAddressId) ||
            '';
          const quantity = detail?.quantity ?? detail?.qty ?? '';
          const selectedPrice = resolveSelectedShippingPrice(detail);
          const currencyId = toSafeString(
            selectedPrice?.cost_currency_id ||
              selectedPrice?.currency_id ||
              detail?.cost_currency_id ||
              detail?.currency_id,
          );
          const price =
            selectedPrice?.cost_price !== undefined &&
            selectedPrice?.cost_price !== null
              ? selectedPrice.cost_price
              : selectedPrice?.price !== undefined &&
                  selectedPrice?.price !== null
                ? selectedPrice.price
                : detail?.cost_price !== undefined &&
                    detail?.cost_price !== null
                  ? detail.cost_price
                  : detail?.price;

          return {
            id: detailId,
            name: `${index + 1}. ${addressText || 'Shipping Address'}${
              quantity !== '' ? ` | Qty ${quantity}` : ''
            }`,
            details: toSafeString(detail?.details),
            address_text: addressText,
            currency_id: currencyId,
            price,
            sourceRow: detail,
            searchText: [
              detailId,
              addressText,
              customerAddressId,
              currencyId,
              price,
              selectedPrice?.cost_currency_id,
              selectedPrice?.cost_price,
              detail?.details,
              detail?.remark,
              detail?.length,
              detail?.width,
              detail?.height,
              quantity,
              detail?.weight,
            ]
              .map((value) => toSafeString(value))
              .filter(Boolean)
              .join(' '),
          };
        },
      ),
    [
      selectedSalesQuotation?.sales_shipping_details,
      customerAddressNameById,
      supplierAddressNameById,
    ],
  );

  const productQuotationSuggestionOptions = useMemo(
    () =>
      toArray(selectedSalesQuotation?.sales_product_details).map(
        (detail, index) => {
          const detailId = toSafeString(detail?.id) || `product-${index + 1}`;
          const productId = toSafeString(detail?.product_id);
          const productName = productNameById.get(productId) || productId;
          const quantity = detail?.qty ?? detail?.quantity ?? '';

          return {
            id: detailId,
            name: `${index + 1}. ${productName || 'Product'}${
              quantity !== '' ? ` | Qty ${quantity}` : ''
            }`,
            details: toSafeString(detail?.details),
            sourceRow: detail,
            searchText: [
              detailId,
              productName,
              productId,
              detail?.details,
              detail?.remark,
              detail?.cost_currency_id,
              detail?.cost_price,
              detail?.currency_id,
              detail?.price,
              quantity,
            ]
              .map((value) => toSafeString(value))
              .filter(Boolean)
              .join(' '),
          };
        },
      ),
    [productNameById, selectedSalesQuotation?.sales_product_details],
  );

  const serviceQuotationSuggestionOptions = useMemo(
    () =>
      toArray(selectedSalesQuotation?.sales_service_details).map(
        (detail, index) => {
          const detailId = toSafeString(detail?.id) || `service-${index + 1}`;
          const serviceId = toSafeString(detail?.service_id);
          const serviceName = serviceNameById.get(serviceId) || serviceId;
          const quantity = detail?.qty ?? detail?.quantity ?? '';

          return {
            id: detailId,
            name: `${index + 1}. ${serviceName || 'Service'}${
              quantity !== '' ? ` | Qty ${quantity}` : ''
            }`,
            details: toSafeString(detail?.details),
            sourceRow: detail,
            searchText: [
              detailId,
              serviceName,
              serviceId,
              detail?.supplier_id,
              detail?.details,
              detail?.remark,
              detail?.cost_currency_id,
              detail?.cost_price,
              detail?.currency_id,
              detail?.price,
              quantity,
            ]
              .map((value) => toSafeString(value))
              .filter(Boolean)
              .join(' '),
          };
        },
      ),
    [selectedSalesQuotation?.sales_service_details, serviceNameById],
  );

  const setHeaderField = useCallback(
    (key, value) => {
      patchSelectedPurchaseRequest({
        [key]: value,
      });
    },
    [patchSelectedPurchaseRequest],
  );

  const setDetailFieldById = useCallback(
    (detailKey, rowId, field, value) => {
      const normalizedRowId = toSafeString(rowId);
      if (!normalizedRowId) return;

      patchSelectedPurchaseRequest((prev) => {
        const base = prev && typeof prev === 'object' ? prev : {};
        const nextRows = toArray(base?.[detailKey]).map((row) => {
          if (toSafeString(row?.id) !== normalizedRowId) {
            return row;
          }

          return {
            ...row,
            [field]: value,
          };
        });

        return {
          ...base,
          [detailKey]: nextRows,
        };
      });
    },
    [patchSelectedPurchaseRequest],
  );

  const appendDetailRow = useCallback(
    (detailKey, rowFactory) => {
      patchSelectedPurchaseRequest((prev) => {
        const base = prev && typeof prev === 'object' ? prev : {};
        const ensuredId = toSafeString(base?.id) || newId();
        const baseWithId =
          toSafeString(base?.id) === ensuredId
            ? base
            : { ...base, id: ensuredId };
        const list = toArray(base[detailKey]).map((row) => ({ ...row }));
        list.push(rowFactory(baseWithId));
        return {
          ...baseWithId,
          [detailKey]: list,
        };
      });
    },
    [patchSelectedPurchaseRequest],
  );

  const removeDetailRow = useCallback(
    (detailKey, rowId) => {
      const normalizedRowId = toSafeString(rowId);
      if (!normalizedRowId) return;

      patchSelectedPurchaseRequest((prev) => {
        const base = prev && typeof prev === 'object' ? prev : {};
        const list = toArray(base[detailKey]).filter(
          (row) => toSafeString(row?.id) !== normalizedRowId,
        );

        return {
          ...base,
          [detailKey]: list,
        };
      });
    },
    [patchSelectedPurchaseRequest],
  );

  const buildDefaultUploadFiles = useCallback((files, nameField, urlField) => {
    return toArray(files)
      .filter((file) => !file?._delete)
      .slice()
      .sort(
        (a, b) => Number(a?.display_order || 0) - Number(b?.display_order || 0),
      )
      .map((file) => ({
        id: file?.id,
        name: file?.[nameField],
        url: file?.[urlField],
        display_order: file?.display_order,
      }));
  }, []);

  const handleNestedFilesChange = useCallback(
    (
      detailKey,
      rowId,
      fileKey,
      oldFiles,
      newFiles,
      { nameField, urlField },
    ) => {
      const normalizedRowId = toSafeString(rowId);
      if (!normalizedRowId) return;

      const oldList = toArray(oldFiles);
      const newList = toArray(newFiles);

      const removedFiles = oldList.filter(
        (oldItem) =>
          !newList.some(
            (newItem) =>
              toSafeString(newItem?.id) === toSafeString(oldItem?.id),
          ),
      );

      const addedFiles = newList.filter(
        (newItem) =>
          !oldList.some(
            (oldItem) =>
              toSafeString(oldItem?.id) === toSafeString(newItem?.id),
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
        return;
      }

      const addedIds = new Set(
        addedFiles.map((item) => toSafeString(item?.id)),
      );

      const oldFileById = new Map(
        oldList
          .map((item) => [toSafeString(item?.id), item])
          .filter(([id]) => id),
      );

      const nextFiles = [
        ...removedFiles
          .map((item) => ({ id: item?.id, _delete: true }))
          .filter((item) => toSafeString(item?.id)),
        ...newList.map((item, fileIndex) => {
          const normalizedItemId = toSafeString(item?.id);
          const existingFile = oldFileById.get(normalizedItemId);
          const isAddedFile = addedIds.has(normalizedItemId);

          const resolvedName =
            item?.name || existingFile?.name || existingFile?.[nameField] || '';
          const resolvedUrl =
            item?.url || existingFile?.url || existingFile?.[urlField] || '';

          return {
            id: item?.id || newId(),
            display_order: fileIndex + 1,
            ...(isAddedFile || resolvedName
              ? {
                  [nameField]: resolvedName,
                }
              : {}),
            ...(isAddedFile || resolvedUrl
              ? {
                  [urlField]: resolvedUrl,
                }
              : {}),
          };
        }),
      ];

      setDetailFieldById(detailKey, normalizedRowId, fileKey, nextFiles);
    },
    [setDetailFieldById],
  );

  const filteredRows = useMemo(() => {
    const query = toSafeString(sidebarSearch).toLowerCase();
    if (!query) return rows;

    return toArray(rows).filter((row) => {
      const supplierName =
        supplierNameById.get(toSafeString(row?.supplier_id)) ||
        toSafeString(row?.supplier_id);

      const summary = [
        row?.id,
        row?.remark,
        supplierName,
        row?.supplier_id,
        row?.sales_quotation_id,
      ]
        .map((value) => toSafeString(value).toLowerCase())
        .filter(Boolean)
        .join(' ');

      return summary.includes(query);
    });
  }, [rows, sidebarSearch, supplierNameById]);

  const getSidebarItemTitle = useCallback(
    (row) => {
      const supplierName =
        supplierNameById.get(toSafeString(row?.supplier_id)) ||
        'Unknown supplier';
      return supplierName;
    },
    [supplierNameById],
  );

  const getSidebarItemRows = useCallback(
    (row) => [
      {
        label: 'Purchase ID:',
        value: toSafeString(row?.id),
      },
      {
        label: 'Sales Quotation:',
        value: toSafeString(row?.sales_quotation_id) || '-',
      },
      {
        label: 'Status:',
        value: (() => {
          const statusId = toSafeString(row?.status) || 'draft';
          const option = STATUS_OPTIONS.find((opt) => opt.id === statusId);
          return option?.name || statusId;
        })(),
        color: (() => {
          const statusId = toSafeString(row?.status) || 'draft';
          return STATUS_OPTIONS.find((opt) => opt.id === statusId)?.color;
        })(),
      },
      {
        label: 'Details:',
        value: `S:${toArray(row?.purchase_shipping_details).length} / P:${
          toArray(row?.purchase_product_details).length
        } / V:${toArray(row?.purchase_service_details).length}`,
      },
    ],
    [],
  );

  const handleSupplierInputChange = useCallback(
    (nextValue) => {
      if (!toSafeString(nextValue)) {
        patchSelectedPurchaseRequest((prev) => ({
          ...(prev && typeof prev === 'object' ? prev : {}),
          supplier_id: '',
          supplier_address_id: '',
        }));
      }
    },
    [patchSelectedPurchaseRequest],
  );

  const handleSupplierSelect = useCallback(
    (suggestion) => {
      const nextSupplierId = toSafeString(suggestion?.id);

      patchSelectedPurchaseRequest((prev) => {
        const base = prev && typeof prev === 'object' ? prev : {};
        const hasAddress = toArray(suggestion?.supplier_addresses).some(
          (address) =>
            toSafeString(address?.id) ===
            toSafeString(base?.supplier_address_id),
        );

        return {
          ...base,
          supplier_id: nextSupplierId,
          supplier_address_id: hasAddress
            ? toSafeString(base?.supplier_address_id)
            : '',
        };
      });
    },
    [patchSelectedPurchaseRequest],
  );

  const handleSupplierAddressInputChange = useCallback(
    (nextValue) => {
      if (!toSafeString(nextValue)) {
        setHeaderField('supplier_address_id', '');
      }
    },
    [setHeaderField],
  );

  const handleSalesQuotationInputChange = useCallback(
    (nextValue) => {
      if (!toSafeString(nextValue)) {
        setHeaderField('sales_quotation_id', '');
      }
    },
    [setHeaderField],
  );

  const handleAddShippingDetail = useCallback(() => {
    appendDetailRow('purchase_shipping_details', (header) => ({
      id: newId(),
      purchase_request_id: header.id,
      sales_shipping_detail_id: '',
      address_text: '',
      length: '',
      width: '',
      height: '',
      quantity: '',
      weight: '',
      currency_id: '',
      price: '',
      api_selected: true,
      details: '',
      remark: '',
      purchase_shipping_images: [],
      purchase_shipping_files: [],
    }));
  }, [appendDetailRow]);

  const handleAddProductDetail = useCallback(() => {
    appendDetailRow('purchase_product_details', (header) => ({
      id: newId(),
      purchase_request_id: header.id,
      sales_product_detail_id: '',
      product_id: '',
      qty: '',
      currency_id: '',
      price: '',
      api_selected: true,
      details: '',
      remark: '',
      purchase_product_images: [],
      purchase_product_files: [],
    }));
  }, [appendDetailRow]);

  const handleAddServiceDetail = useCallback(() => {
    appendDetailRow('purchase_service_details', (header) => ({
      id: newId(),
      purchase_request_id: header.id,
      supplier_id: toSafeString(header?.supplier_id),
      sales_service_detail_id: '',
      service_id: '',
      qty: '',
      currency_id: '',
      price: '',
      api_selected: true,
      details: '',
      remark: '',
      purchase_service_images: [],
      purchase_service_files: [],
    }));
  }, [appendDetailRow]);

  const handleSelectShippingFromQuotation = useCallback(
    (suggestion, targetRow) => {
      const sourceRow = suggestion?.sourceRow;
      if (!sourceRow) return;

      const targetRowId = toSafeString(targetRow?.id);
      if (targetRowId) {
        patchSelectedPurchaseRequest((prev) => {
          const base = prev && typeof prev === 'object' ? prev : {};
          return {
            ...base,
            purchase_shipping_details: toArray(
              base?.purchase_shipping_details,
            ).map((row) => {
              if (toSafeString(row?.id) !== targetRowId) return row;
              return {
                ...row,
                sales_shipping_detail_id: toSafeString(sourceRow?.id),
                address_text:
                  toSafeString(suggestion?.address_text) ||
                  toSafeString(sourceRow?.address_text),
                length: sourceRow?.length ?? '',
                width: sourceRow?.width ?? '',
                height: sourceRow?.height ?? '',
                quantity: sourceRow?.quantity ?? sourceRow?.qty ?? '',
                weight: sourceRow?.weight ?? '',
                currency_id: toSafeString(suggestion?.currency_id),
                price: suggestion?.price ?? '',
                api_selected: row?.api_selected ?? true,
                details: toSafeString(sourceRow?.details),
                remark: toSafeString(sourceRow?.remark),
              };
            }),
          };
        });
        return;
      }

      appendDetailRow('purchase_shipping_details', (header) => ({
        id: newId(),
        purchase_request_id: header.id,
        sales_shipping_detail_id: toSafeString(sourceRow?.id),
        address_text:
          toSafeString(suggestion?.address_text) ||
          toSafeString(sourceRow?.address_text),
        length: sourceRow?.length ?? '',
        width: sourceRow?.width ?? '',
        height: sourceRow?.height ?? '',
        quantity: sourceRow?.quantity ?? sourceRow?.qty ?? '',
        weight: sourceRow?.weight ?? '',
        currency_id: toSafeString(suggestion?.currency_id),
        price: suggestion?.price ?? '',
        api_selected: true,
        details: toSafeString(sourceRow?.details),
        remark: toSafeString(sourceRow?.remark),
        purchase_shipping_images: [],
        purchase_shipping_files: [],
      }));
    },
    [appendDetailRow, patchSelectedPurchaseRequest],
  );

  const handleSelectProductFromQuotation = useCallback(
    (suggestion, targetRow) => {
      const sourceRow = suggestion?.sourceRow;
      if (!sourceRow) return;

      const targetRowId = toSafeString(targetRow?.id);
      if (targetRowId) {
        patchSelectedPurchaseRequest((prev) => {
          const base = prev && typeof prev === 'object' ? prev : {};
          return {
            ...base,
            purchase_product_details: toArray(
              base?.purchase_product_details,
            ).map((row) => {
              if (toSafeString(row?.id) !== targetRowId) return row;
              return {
                ...row,
                sales_product_detail_id: toSafeString(sourceRow?.id),
                product_id: toSafeString(sourceRow?.product_id),
                qty: sourceRow?.qty ?? sourceRow?.quantity ?? '',
                currency_id: toSafeString(
                  sourceRow?.cost_currency_id || sourceRow?.currency_id,
                ),
                price:
                  sourceRow?.cost_price !== undefined &&
                  sourceRow?.cost_price !== null
                    ? sourceRow.cost_price
                    : (sourceRow?.price ?? ''),
                api_selected: row?.api_selected ?? true,
                details: toSafeString(sourceRow?.details),
                remark: toSafeString(sourceRow?.remark),
              };
            }),
          };
        });
        return;
      }

      appendDetailRow('purchase_product_details', (header) => ({
        id: newId(),
        purchase_request_id: header.id,
        sales_product_detail_id: toSafeString(sourceRow?.id),
        product_id: toSafeString(sourceRow?.product_id),
        qty: sourceRow?.qty ?? sourceRow?.quantity ?? '',
        currency_id: toSafeString(
          sourceRow?.cost_currency_id || sourceRow?.currency_id,
        ),
        price:
          sourceRow?.cost_price !== undefined && sourceRow?.cost_price !== null
            ? sourceRow.cost_price
            : (sourceRow?.price ?? ''),
        api_selected: true,
        details: toSafeString(sourceRow?.details),
        remark: toSafeString(sourceRow?.remark),
        purchase_product_images: [],
        purchase_product_files: [],
      }));
    },
    [appendDetailRow, patchSelectedPurchaseRequest],
  );

  const handleSelectServiceFromQuotation = useCallback(
    (suggestion, targetRow) => {
      const sourceRow = suggestion?.sourceRow;
      if (!sourceRow) return;

      const targetRowId = toSafeString(targetRow?.id);
      if (targetRowId) {
        patchSelectedPurchaseRequest((prev) => {
          const base = prev && typeof prev === 'object' ? prev : {};
          return {
            ...base,
            purchase_service_details: toArray(
              base?.purchase_service_details,
            ).map((row) => {
              if (toSafeString(row?.id) !== targetRowId) return row;
              return {
                ...row,
                supplier_id: toSafeString(
                  sourceRow?.supplier_id || base?.supplier_id,
                ),
                sales_service_detail_id: toSafeString(sourceRow?.id),
                service_id: toSafeString(sourceRow?.service_id),
                qty: sourceRow?.qty ?? sourceRow?.quantity ?? '',
                currency_id: toSafeString(
                  sourceRow?.cost_currency_id || sourceRow?.currency_id,
                ),
                price:
                  sourceRow?.cost_price !== undefined &&
                  sourceRow?.cost_price !== null
                    ? sourceRow.cost_price
                    : (sourceRow?.price ?? ''),
                api_selected: row?.api_selected ?? true,
                details: toSafeString(sourceRow?.details),
                remark: toSafeString(sourceRow?.remark),
              };
            }),
          };
        });
        return;
      }

      appendDetailRow('purchase_service_details', (header) => ({
        id: newId(),
        purchase_request_id: header.id,
        supplier_id: toSafeString(
          sourceRow?.supplier_id || header?.supplier_id,
        ),
        sales_service_detail_id: toSafeString(sourceRow?.id),
        service_id: toSafeString(sourceRow?.service_id),
        qty: sourceRow?.qty ?? sourceRow?.quantity ?? '',
        currency_id: toSafeString(
          sourceRow?.cost_currency_id || sourceRow?.currency_id,
        ),
        price:
          sourceRow?.cost_price !== undefined && sourceRow?.cost_price !== null
            ? sourceRow.cost_price
            : (sourceRow?.price ?? ''),
        api_selected: true,
        details: toSafeString(sourceRow?.details),
        remark: toSafeString(sourceRow?.remark),
        purchase_service_images: [],
        purchase_service_files: [],
      }));
    },
    [appendDetailRow, patchSelectedPurchaseRequest],
  );

  const handlePreviewApInvoice = useCallback(() => {
    const currentPurchaseRequest = getEntityRecord(PURCHASE_ENTITY_KEY);
    if (!currentPurchaseRequest || isPreparingPreview) {
      return;
    }

    try {
      setIsPreparingPreview(true);

      if (apInvoicePreviewRows.length === 0) {
        setError(
          'No rows are selected for AP invoice preview. Tick AP Invoice on at least one row.',
        );
        return;
      }

      const draftId = toSafeString(currentPurchaseRequest?.id);
      const previewInvoice = {
        id: draftId || newId(),
        purchase_request_id: draftId,
        supplier_id: toSafeString(currentPurchaseRequest?.supplier_id),
        supplier_address_id: toSafeString(
          currentPurchaseRequest?.supplier_address_id,
        ),
        invoice_ref: '',
        invoice_date: '',
        due_date: '',
        remark: toSafeString(currentPurchaseRequest?.remark),
        ap_invoice_row_details: apInvoicePreviewRows,
      };

      const nextPurchaseRequests = [
        {
          ...currentPurchaseRequest,
          id: draftId,
        },
        ...toArray(rows).filter((row) => toSafeString(row?.id) !== draftId),
      ];

      const html = buildApInvoiceDocumentA4Html({
        invoice: previewInvoice,
        supplierOptions: suppliers,
        purchaseRequests: nextPurchaseRequests,
        currencies,
        invoiceTypes: [
          { code: 'SHIPPING', description: 'Shipping' },
          { code: 'PRODUCT', description: 'Product' },
          { code: 'SERVICE', description: 'Service' },
        ],
        baseCurrencyCode,
        currencyCodeById,
        exchangeRateMap,
      });

      setPreviewHtml(html);
      setIsPreviewOpen(true);
    } catch (err) {
      console.error(err);
      setError(err?.message || 'Failed to prepare AP invoice preview.');
    } finally {
      setIsPreparingPreview(false);
    }
  }, [
    apInvoicePreviewRows,
    baseCurrencyCode,
    currencies,
    currencyCodeById,
    exchangeRateMap,
    isPreparingPreview,
    rows,
    setError,
    suppliers,
  ]);

  const handlePrintFromPreview = useCallback(() => {
    const iframeWindow = previewIframeRef.current?.contentWindow;
    if (!iframeWindow) {
      setError('Preview is not ready yet. Please try again.');
      return;
    }

    iframeWindow.focus();
    iframeWindow.print();
  }, [setError]);

  const handleClosePreview = useCallback(() => {
    setIsPreviewOpen(false);
  }, []);

  return (
    <PurchaseRequestSavePageContainer
      onSave={handleSave}
      dryRunAction={getPurchaseRequestDryRunData}
      saveButtonText="Save Purchase Request"
      successMessage="Purchase request saved successfully!"
      onCreate={() => {
        handleCreate();
        navigate('/purchase_request', { replace: true });
      }}
      createButtonText="Add Purchase Request"
      showCreateButton
      onPrint={handlePreviewApInvoice}
      isPrinting={isPreparingPreview}
      showPrintButton
      leftBottomAction={
        <DeleteBtn
          text={isDeleting ? 'Deleting...' : 'Delete Purchase Request'}
          onClick={async () => {
            await handleDelete();
            navigate('/purchase_request', { replace: true });
          }}
          disabled={!toSafeString(selectedId) || isDeleting}
          title="Delete selected purchase request"
          ariaLabel="Delete selected purchase request"
        />
      }
    >
      <div className={styles.page}>
        <PurchaseRequestSidebar
          rows={filteredRows}
          selectedId={selectedId}
          searchValue={sidebarSearch}
          onSearchChange={setSidebarSearch}
          onSelectRow={(row) => {
            handleSelectRow(row);
            navigate(`/purchase_request/${toSafeString(row?.id || row)}`, {
              replace: true,
            });
          }}
          getItemTitle={getSidebarItemTitle}
          getItemRows={getSidebarItemRows}
        />

        <section className={styles.editor}>
          <div className={styles.editorHeader}>
            <h2 className={styles.editorTitle}>Purchase Request Editor</h2>
          </div>

          {error ? <div className={styles.error}>{error}</div> : null}
          {notice ? <div className={styles.notice}>{notice}</div> : null}

          {!hasActivePurchaseRequest ? (
            <div className={styles.emptyEditor}>
              {isLoading
                ? 'Loading purchase requests...'
                : 'Select a purchase request or create a new one.'}
            </div>
          ) : (
            <>
              <div className={styles.currencySummaryBar}>
                <div className={styles.baseCurrencyPicker}>
                  <span className={styles.baseCurrencyLabel}>
                    Base Currency
                  </span>
                  <Main_Dropdown
                    defaultOptions={baseCurrencyOptions}
                    defaultSelectedOption={baseCurrencyCode}
                    onChange={(ov, nv) =>
                      setBaseCurrencyCode(
                        toSafeString(nv).toUpperCase() || 'HKD',
                      )
                    }
                    size="S"
                  />
                  <span className={styles.rateMetaText}>
                    Rate Date:{' '}
                    {toSafeString(latestExchangeRateRow?.Date) || '-'}
                  </span>
                </div>

                <div className={styles.totalsSummaryGrid}>
                  <div className={styles.totalCard}>
                    <span className={styles.totalLabel}>
                      Shipping Row Total
                    </span>
                    <span className={styles.totalValue}>
                      {purchaseTotalsSummary.baseCurrencyCode}{' '}
                      {formatMoney(purchaseTotalsSummary.shippingTotal)}
                    </span>
                  </div>
                  <div className={styles.totalCard}>
                    <span className={styles.totalLabel}>Product Row Total</span>
                    <span className={styles.totalValue}>
                      {purchaseTotalsSummary.baseCurrencyCode}{' '}
                      {formatMoney(purchaseTotalsSummary.productTotal)}
                    </span>
                  </div>
                  <div className={styles.totalCard}>
                    <span className={styles.totalLabel}>Service Row Total</span>
                    <span className={styles.totalValue}>
                      {purchaseTotalsSummary.baseCurrencyCode}{' '}
                      {formatMoney(purchaseTotalsSummary.serviceTotal)}
                    </span>
                  </div>
                  <div
                    className={`${styles.totalCard} ${styles.totalCardHighlight}`}
                  >
                    <span className={styles.totalLabel}>Total Cost Price</span>
                    <span className={styles.totalValueStrong}>
                      {purchaseTotalsSummary.baseCurrencyCode}{' '}
                      {formatMoney(purchaseTotalsSummary.totalCostPrice)}
                    </span>
                  </div>
                </div>

                {purchaseTotalsSummary.missingCount > 0 ? (
                  <div className={styles.totalWarningText}>
                    Total skipped {purchaseTotalsSummary.missingCount} row(s)
                    due to missing price, currency, or exchange rate.
                  </div>
                ) : null}
              </div>

              <PurchaseRequestBasicInfo
                draft={{
                  id: currentPurchaseRequestId,
                  status: purchaseStatus,
                  remark: purchaseRemark,
                }}
                supplierSuggestionOptions={supplierSuggestionOptions}
                selectedSupplierOption={selectedSupplierOption}
                supplierAddressSuggestionOptions={
                  supplierAddressSuggestionOptions
                }
                selectedSupplierAddressOption={selectedSupplierAddressOption}
                salesQuotationSuggestionOptions={
                  salesQuotationSuggestionOptions
                }
                selectedSalesQuotationOption={selectedSalesQuotationOption}
                onFetchSupplierSuggestions={refreshSuppliers}
                onFetchSalesQuotationSuggestions={refreshSalesQuotations}
                onIdChange={(value) => setHeaderField('id', value)}
                onSupplierInputChange={handleSupplierInputChange}
                onSupplierSelect={handleSupplierSelect}
                onSupplierAddressInputChange={handleSupplierAddressInputChange}
                onSupplierAddressSelect={(suggestion) =>
                  setHeaderField(
                    'supplier_address_id',
                    toSafeString(suggestion?.id),
                  )
                }
                onSalesQuotationInputChange={handleSalesQuotationInputChange}
                onSalesQuotationSelect={(suggestion) =>
                  setHeaderField(
                    'sales_quotation_id',
                    toSafeString(suggestion?.id),
                  )
                }
                onStatusChange={(value) => setHeaderField('status', value)}
                onRemarkChange={(value) => setHeaderField('remark', value)}
              />

              <PurchaseRequestShippingDetails
                rows={shippingDetailRows}
                currencyDropdownOptions={currencyDropdownOptions}
                fileUrlBase={FILE_SERVER_BASE_URL}
                quotationSuggestionOptions={shippingQuotationSuggestionOptions}
                onQuotationSuggestionSelect={handleSelectShippingFromQuotation}
                onAdd={handleAddShippingDetail}
                onSetField={(rowId, field, value) =>
                  setDetailFieldById(
                    'purchase_shipping_details',
                    rowId,
                    field,
                    value,
                  )
                }
                onRemove={(rowId) =>
                  removeDetailRow('purchase_shipping_details', rowId)
                }
                buildDefaultUploadFiles={buildDefaultUploadFiles}
                onImageFilesChange={(rowId, oldFiles, newFiles) =>
                  handleNestedFilesChange(
                    'purchase_shipping_details',
                    rowId,
                    'purchase_shipping_images',
                    oldFiles,
                    newFiles,
                    { nameField: 'image_name', urlField: 'image_url' },
                  )
                }
                onFilesChange={(rowId, oldFiles, newFiles) =>
                  handleNestedFilesChange(
                    'purchase_shipping_details',
                    rowId,
                    'purchase_shipping_files',
                    oldFiles,
                    newFiles,
                    { nameField: 'file_name', urlField: 'file_url' },
                  )
                }
              />

              <PurchaseRequestProductDetails
                rows={productDetailRows}
                productSuggestionOptions={productSuggestionOptions}
                currencyDropdownOptions={currencyDropdownOptions}
                fileUrlBase={FILE_SERVER_BASE_URL}
                quotationSuggestionOptions={productQuotationSuggestionOptions}
                onQuotationSuggestionSelect={handleSelectProductFromQuotation}
                onAdd={handleAddProductDetail}
                onSetField={(rowId, field, value) =>
                  setDetailFieldById(
                    'purchase_product_details',
                    rowId,
                    field,
                    value,
                  )
                }
                onRemove={(rowId) =>
                  removeDetailRow('purchase_product_details', rowId)
                }
                buildDefaultUploadFiles={buildDefaultUploadFiles}
                onImageFilesChange={(rowId, oldFiles, newFiles) =>
                  handleNestedFilesChange(
                    'purchase_product_details',
                    rowId,
                    'purchase_product_images',
                    oldFiles,
                    newFiles,
                    { nameField: 'image_name', urlField: 'image_url' },
                  )
                }
                onFilesChange={(rowId, oldFiles, newFiles) =>
                  handleNestedFilesChange(
                    'purchase_product_details',
                    rowId,
                    'purchase_product_files',
                    oldFiles,
                    newFiles,
                    { nameField: 'file_name', urlField: 'file_url' },
                  )
                }
                resolveFileUrl={resolveFileUrl}
              />

              <PurchaseRequestServiceDetails
                rows={serviceDetailRows}
                serviceSuggestionOptions={serviceSuggestionOptions}
                currencyDropdownOptions={currencyDropdownOptions}
                fileUrlBase={FILE_SERVER_BASE_URL}
                quotationSuggestionOptions={serviceQuotationSuggestionOptions}
                onQuotationSuggestionSelect={handleSelectServiceFromQuotation}
                onAdd={handleAddServiceDetail}
                onSetField={(rowId, field, value) =>
                  setDetailFieldById(
                    'purchase_service_details',
                    rowId,
                    field,
                    value,
                  )
                }
                onRemove={(rowId) =>
                  removeDetailRow('purchase_service_details', rowId)
                }
                buildDefaultUploadFiles={buildDefaultUploadFiles}
                onImageFilesChange={(rowId, oldFiles, newFiles) =>
                  handleNestedFilesChange(
                    'purchase_service_details',
                    rowId,
                    'purchase_service_images',
                    oldFiles,
                    newFiles,
                    { nameField: 'image_name', urlField: 'image_url' },
                  )
                }
                onFilesChange={(rowId, oldFiles, newFiles) =>
                  handleNestedFilesChange(
                    'purchase_service_details',
                    rowId,
                    'purchase_service_files',
                    oldFiles,
                    newFiles,
                    { nameField: 'file_name', urlField: 'file_url' },
                  )
                }
              />
            </>
          )}
        </section>
      </div>

      {isPreviewOpen ? (
        <div
          className={styles.previewModalBackdrop}
          onClick={handleClosePreview}
        >
          <div
            className={styles.previewModalWindow}
            onClick={(event) => event.stopPropagation()}
          >
            <div className={styles.previewModalHeader}>
              <div className={styles.previewModalTitle}>
                AP Invoice Preview (From Purchase Request)
              </div>
              <div className={styles.previewModalActions}>
                <button
                  type="button"
                  className={styles.previewActionBtn}
                  onClick={handlePrintFromPreview}
                >
                  Print / Save PDF
                </button>
                <button
                  type="button"
                  className={styles.previewCloseBtn}
                  onClick={handleClosePreview}
                >
                  Close
                </button>
              </div>
            </div>

            <div className={styles.previewFrameWrap}>
              <iframe
                ref={previewIframeRef}
                title="Purchase Request AP Invoice Preview"
                className={styles.previewFrame}
                srcDoc={previewHtml}
              />
            </div>
          </div>
        </div>
      ) : null}
    </PurchaseRequestSavePageContainer>
  );
};

export default Main_PurchaseRequest;
