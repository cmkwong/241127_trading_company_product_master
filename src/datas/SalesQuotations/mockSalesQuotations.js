import { v4 as uuidv4 } from 'uuid';

const nowIso = () => new Date().toISOString();

export const salesCustomerOptions = [
  { id: 'cust-001', name: 'PetMates HK Limited' },
  { id: 'cust-002', name: 'Happy Paws Distribution Inc.' },
  { id: 'cust-003', name: 'Urban Pets Europe GmbH' },
];

export const salesCustomerAddressOptions = [
  {
    id: 'caddr-001',
    customer_id: 'cust-001',
    name: 'HK Warehouse - Tsuen Wan',
  },
  {
    id: 'caddr-002',
    customer_id: 'cust-001',
    name: 'Shenzhen Consolidation Center',
  },
  {
    id: 'caddr-003',
    customer_id: 'cust-002',
    name: 'Los Angeles Distribution Hub',
  },
  {
    id: 'caddr-004',
    customer_id: 'cust-003',
    name: 'Hamburg Retail Fulfillment',
  },
];

export const salesSupplierOptions = [
  { id: 'sup-001', name: 'Dongguan Everlaser' },
  { id: 'sup-002', name: 'Shenzhen MacroTech' },
  { id: 'sup-003', name: 'Foshan Metalworks' },
];

export const salesProductOptions = [
  { id: 'prod-001', name: 'Anti-Skid Pet Bowl' },
  { id: 'prod-002', name: 'Silicone Slow Feeder' },
  { id: 'prod-003', name: 'Collapsible Travel Bottle' },
];

export const salesServiceOptions = [
  { id: 'svc-001', name: 'Package Labeling' },
  { id: 'svc-002', name: 'Quality Inspection' },
  { id: 'svc-003', name: 'Drop Test Validation' },
];

export const salesCurrencyOptions = [
  { id: 'USD', name: 'USD' },
  { id: 'EUR', name: 'EUR' },
  { id: 'HKD', name: 'HKD' },
  { id: 'CNY', name: 'CNY' },
];

export const salesIncotermOptions = [
  { id: 'EXW', name: 'EXW' },
  { id: 'FOB', name: 'FOB' },
  { id: 'CIF', name: 'CIF' },
  { id: 'DAP', name: 'DAP' },
];

export const createEmptySalesQuotation = ({ id, customerId = '' } = {}) => {
  const nextId = id || uuidv4();
  const createdAt = nowIso();

  return {
    id: nextId,
    to_order: false,
    remark: '',
    customer_id: customerId,
    customer_address_id: '',
    created_at: createdAt,
    updated_at: createdAt,
    sales_shipping_details: [],
    sales_shipping_prices: [],
    sales_shipping_images: [],
    sales_product_details: [],
    sales_product_detail_images: [],
    sales_service_details: [],
    sales_service_detail_images: [],
  };
};

const quotationIdA = 'sq-2026-0001';
const quotationIdB = 'sq-2026-0002';

const shippingDetailIdA1 = 'ship-detail-0001';
const shippingDetailIdA2 = 'ship-detail-0002';
const productDetailIdA1 = 'prod-detail-0001';
const serviceDetailIdA1 = 'svc-detail-0001';

export const mockSalesQuotations = [
  {
    id: quotationIdA,
    to_order: false,
    remark: 'Customer requested mixed carton packing and fast lead-time.',
    customer_id: 'cust-001',
    customer_address_id: 'caddr-001',
    created_at: '2026-05-18T08:30:00.000Z',
    updated_at: '2026-05-20T14:10:00.000Z',
    sales_shipping_details: [
      {
        id: shippingDetailIdA1,
        sales_quotation_id: quotationIdA,
        customer_address_id: 'caddr-001',
        length: 54.5,
        width: 36,
        height: 42,
        qty: 120,
        weight: 310,
        details: 'Master carton shipment for launch batch.',
        remark: 'Internal: queue export docs one day earlier.',
      },
      {
        id: shippingDetailIdA2,
        sales_quotation_id: quotationIdA,
        customer_address_id: 'caddr-002',
        length: 42,
        width: 31.5,
        height: 29,
        qty: 80,
        weight: 170,
        details: 'Backup lot to CN consolidation location.',
        remark: 'Internal: fragile handling stickers needed.',
      },
    ],
    sales_shipping_prices: [
      {
        id: 'ship-price-0001',
        sales_shipping_detail_id: shippingDetailIdA1,
        supplier_id: 'sup-001',
        incoterms: 'FOB',
        currency_id: 'USD',
        price: 1450,
        details: 'Ocean freight incl. docs.',
        remark: 'Internal: request earliest carrier cutoff slot.',
        selected: true,
      },
      {
        id: 'ship-price-0002',
        sales_shipping_detail_id: shippingDetailIdA2,
        supplier_id: 'sup-003',
        incoterms: 'EXW',
        currency_id: 'USD',
        price: 680,
        details: 'Truck transfer to consolidation point.',
        remark: 'Internal: coordinate with CN warehouse gate schedule.',
        selected: false,
      },
    ],
    sales_shipping_images: [],
    sales_product_details: [
      {
        id: productDetailIdA1,
        sales_quotation_id: quotationIdA,
        product_id: 'prod-001',
        qty: 500,
        currency_id: 'USD',
        price: 2.65,
        details: 'Main item with anti-slip base upgrade.',
        remark: 'Internal: keep mold cavity traceability.',
      },
    ],
    sales_product_detail_images: [],
    sales_service_details: [
      {
        id: serviceDetailIdA1,
        sales_quotation_id: quotationIdA,
        supplier_id: 'sup-002',
        service_id: 'svc-002',
        qty: 1,
        currency_id: 'USD',
        price: 120,
        details: 'AQL inspection before loading.',
        remark: 'Internal: include random drop test photos.',
      },
    ],
    sales_service_detail_images: [],
  },
  {
    id: quotationIdB,
    to_order: true,
    remark: 'Second quotation approved and converted to order.',
    customer_id: 'cust-003',
    customer_address_id: 'caddr-004',
    created_at: '2026-05-10T10:00:00.000Z',
    updated_at: '2026-05-23T09:20:00.000Z',
    sales_shipping_details: [],
    sales_shipping_prices: [],
    sales_shipping_images: [],
    sales_product_details: [],
    sales_product_detail_images: [],
    sales_service_details: [],
    sales_service_detail_images: [],
  },
];
