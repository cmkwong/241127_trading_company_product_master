import dagre from '@dagrejs/dagre';
import { convertCurrencyToBase } from '../../SalesQuotation/utils/quotationTotals';

const toSafe = (value) => String(value ?? '').trim();

const LINE_TYPES = [
  ['product', 'sales_product_details'],
  ['shipping', 'sales_shipping_details'],
  ['service', 'sales_service_details'],
];

const COST_CONFIG = [
  [
    'shipping',
    'shipping_costs',
    'sales_shipping_detail_id',
    'purchase_shipping_detail_id',
  ],
  [
    'product',
    'product_costs',
    'sales_product_detail_id',
    'purchase_product_detail_id',
  ],
  [
    'service',
    'service_costs',
    'sales_service_detail_id',
    'purchase_service_detail_id',
  ],
];

const NODE_WIDTH = 300;
const HEADER_H = 64;
const LINE_H = 28;

const nodeHeightOf = (node) =>
  HEADER_H + (node?.data?.lines?.length || 0) * LINE_H + 16;

const getLayoutedElements = (nodes, edges, direction = 'LR') => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({ rankdir: direction, nodesep: 60, ranksep: 90 });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, {
      width: NODE_WIDTH,
      height: nodeHeightOf(node),
    });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const positioned = dagreGraph.node(node.id);
    return {
      ...node,
      position: {
        x: positioned.x - NODE_WIDTH / 2,
        y: positioned.y - nodeHeightOf(node) / 2,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
};

export const buildDocumentFlowGraph = ({
  quotations = [],
  purchaseCosts = null,
  docType = [],
  productOptions = [],
  serviceOptions = [],
  baseCurrencyCode = '',
  exchangeRateMap = {},
  currencyCodeById = {},
} = {}) => {
  const salesQuotationId = toSafe(purchaseCosts?.sales_quotation_id);

  const docTypeNameById = new Map(
    (docType || []).map((d) => [toSafe(d.id), toSafe(d.name) || toSafe(d.id)]),
  );
  const productNameById = new Map(
    (productOptions || []).map((p) => [
      toSafe(p.id),
      toSafe(p.name || p.label) || toSafe(p.id),
    ]),
  );
  const serviceNameById = new Map(
    (serviceOptions || []).map((s) => [
      toSafe(s.id),
      toSafe(s.name || s.label) || toSafe(s.id),
    ]),
  );

  const salesDocsById = new Map();
  (quotations || []).forEach((q) => {
    const id = toSafe(q?.id);
    if (id) salesDocsById.set(id, q);
  });

  const salesLineIndex = new Map();
  (quotations || []).forEach((q) => {
    const docId = toSafe(q?.id);
    LINE_TYPES.forEach(([type, key]) => {
      (Array.isArray(q?.[key]) ? q[key] : []).forEach((line) => {
        const lineId = toSafe(line?.id);
        if (lineId) salesLineIndex.set(lineId, { docId, type, line });
      });
    });
  });

  const selectedShippingPriceByDocAndDetail = new Map();
  (quotations || []).forEach((q) => {
    const docId = toSafe(q?.id);
    const byDetail = new Map();
    (Array.isArray(q?.sales_shipping_prices)
      ? q.sales_shipping_prices
      : []
    ).forEach((priceRow) => {
      const detailId = toSafe(priceRow?.sales_shipping_detail_id);
      if (!detailId) return;
      const isSelected =
        priceRow?.selected === true ||
        priceRow?.selected === 1 ||
        priceRow?.selected === '1';
      const existing = byDetail.get(detailId);
      const existingSelected =
        existing?.selected === true ||
        existing?.selected === 1 ||
        existing?.selected === '1';
      if (!existing || (isSelected && !existingSelected)) {
        byDetail.set(detailId, priceRow);
      }
    });
    selectedShippingPriceByDocAndDetail.set(docId, byDetail);
  });

  const costRows = [];
  COST_CONFIG.forEach(([type, key, linkKey, idKey]) => {
    (Array.isArray(purchaseCosts?.[key]) ? purchaseCosts[key] : []).forEach(
      (row) => {
        costRows.push({
          ...row,
          _type: type,
          _linkKey: linkKey,
          _idKey: idKey,
        });
      },
    );
  });

  const includedSalesIds = new Set();
  const addSalesDoc = (id) => {
    id = toSafe(id);
    if (!id || includedSalesIds.has(id) || !salesDocsById.has(id)) return;
    includedSalesIds.add(id);
    const doc = salesDocsById.get(id);
    const parent = toSafe(doc?.base_entry);
    if (parent) addSalesDoc(parent);
    (quotations || []).forEach((q) => {
      if (toSafe(q?.base_entry) === id) addSalesDoc(toSafe(q?.id));
    });
  };
  addSalesDoc(salesQuotationId);
  costRows.forEach((row) => {
    const owner = salesLineIndex.get(toSafe(row?.[row._linkKey]));
    if (owner) addSalesDoc(owner.docId);
  });

  const buildLineLabel = (type, line) => {
    if (type === 'product') {
      return (
        productNameById.get(toSafe(line?.product_id)) ||
        toSafe(line?.override_product_name) ||
        toSafe(line?.details) ||
        'Product'
      );
    }
    if (type === 'service') {
      return serviceNameById.get(toSafe(line?.service_id)) || 'Service';
    }
    return toSafe(line?.details) || 'Shipping';
  };

  const resolveLinePrice = (doc, type, line) => {
    let rawPrice = null;
    let currencyId = '';
    if (type === 'shipping') {
      const priceRow = selectedShippingPriceByDocAndDetail
        .get(toSafe(doc?.id))
        ?.get(toSafe(line?.id));
      rawPrice = priceRow?.price ?? null;
      currencyId = toSafe(priceRow?.currency_id);
    } else {
      rawPrice = line?.price ?? null;
      currencyId = toSafe(line?.currency_id);
    }

    const rawCode = toSafe(
      (currencyCodeById && currencyCodeById[currencyId]) || currencyId,
    );
    const converted = convertCurrencyToBase(
      rawPrice,
      rawCode,
      baseCurrencyCode,
      exchangeRateMap,
    );
    const hasConversion = converted !== null && Number.isFinite(converted);
    const numeric = Number(rawPrice);

    return {
      price: hasConversion
        ? converted
        : Number.isFinite(numeric)
          ? numeric
          : undefined,
      currency: hasConversion
        ? toSafe(baseCurrencyCode).toUpperCase()
        : rawCode,
    };
  };

  const nodes = [];
  const edges = [];
  const salesLineageCountByPair = new Map();

  includedSalesIds.forEach((docId) => {
    const doc = salesDocsById.get(docId);
    const lines = [];
    LINE_TYPES.forEach(([type, key]) => {
      (Array.isArray(doc?.[key]) ? doc[key] : []).forEach((line) => {
        const { price, currency } = resolveLinePrice(doc, type, line);
        lines.push({
          id: toSafe(line?.id),
          type,
          label: buildLineLabel(type, line),
          qty: line?.qty,
          price,
          currency,
        });
      });
    });
    nodes.push({
      id: `sales:${docId}`,
      type: 'document',
      data: {
        kind: 'sales',
        label: docTypeNameById.get(toSafe(doc?.doc_type)) || 'Sales Document',
        status: toSafe(doc?.status),
        date: toSafe(doc?.created_at),
        lines,
      },
    });
  });

  includedSalesIds.forEach((docId) => {
    const doc = salesDocsById.get(docId);
    const baseEntry = toSafe(doc?.base_entry);
    if (!baseEntry || !includedSalesIds.has(baseEntry)) return;

    const pairKey = `${baseEntry}->${docId}`;
    LINE_TYPES.forEach(([type, key]) => {
      (Array.isArray(doc?.[key]) ? doc[key] : []).forEach((line) => {
        const baseLine = toSafe(line?.base_line);
        const lineId = toSafe(line?.id);
        if (!baseLine || !lineId) return;
        edges.push({
          id: `lineage:${docId}:${type}:${lineId}`,
          source: `sales:${baseEntry}`,
          sourceHandle: `out:${toSafe(line?.base_line_type) || type}:${baseLine}`,
          target: `sales:${docId}`,
          targetHandle: `in:${type}:${lineId}`,
          animated: true,
        });
        salesLineageCountByPair.set(
          pairKey,
          (salesLineageCountByPair.get(pairKey) || 0) + 1,
        );
      });
    });

    // Fallback: if this parent-child document pair has no line-level links,
    // connect document headers so relation is still visible.
    if ((salesLineageCountByPair.get(pairKey) || 0) === 0) {
      edges.push({
        id: `lineage-header:${baseEntry}:${docId}`,
        source: `sales:${baseEntry}`,
        sourceHandle: 'header-out',
        target: `sales:${docId}`,
        targetHandle: 'header-in',
        animated: true,
      });
    }
  });

  const prGroups = new Map();
  costRows.forEach((row) => {
    const prId = toSafe(row?.purchase_request_id);
    if (!prId) return;
    if (!prGroups.has(prId)) prGroups.set(prId, []);
    prGroups.get(prId).push(row);
  });

  prGroups.forEach((rows, prId) => {
    const lines = rows.map((row) => {
      const converted = convertCurrencyToBase(
        row?.price,
        row?.currency_code,
        baseCurrencyCode,
        exchangeRateMap,
      );
      const hasConversion = converted !== null && Number.isFinite(converted);
      return {
        id: toSafe(row?.[row._idKey]),
        type: row._type,
        label: toSafe(row?.item_label) || `${row._type} item`,
        qty: undefined,
        price: hasConversion ? converted : row?.price,
        currency: hasConversion
          ? toSafe(baseCurrencyCode).toUpperCase()
          : toSafe(row?.currency_code),
        supplier: toSafe(row?.supplier_name),
      };
    });
    nodes.push({
      id: `pr:${prId}`,
      type: 'document',
      data: {
        kind: 'purchase',
        label: 'Purchase Request',
        referenceId: prId,
        status: '',
        date: toSafe(rows[0]?.created_at),
        lines,
        _depth: -1,
      },
    });

    rows.forEach((row) => {
      const salesLineId = toSafe(row?.[row._linkKey]);
      const owner = salesLineIndex.get(salesLineId);
      if (!owner) return;
      edges.push({
        id: `cost:${prId}:${row._type}:${toSafe(row?.[row._idKey])}`,
        source: `pr:${prId}`,
        sourceHandle: `out:${row._type}:${toSafe(row?.[row._idKey])}`,
        target: `sales:${owner.docId}`,
        targetHandle: `in:${owner.type}:${salesLineId}`,
        animated: true,
      });
    });
  });

  const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
    nodes,
    edges,
  );

  return { nodes: layoutedNodes, edges: layoutedEdges };
};
