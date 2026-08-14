import { useCallback, useEffect, useMemo, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import EditableDataTable from '../../../common/Table/EditableDataTable';
import { useProductContext } from '../../../../store/ProductContext';
import { useMasterContext } from '../../../../store/MasterContext';
import {
  getVariantTypeId,
  getCapacityLabel,
  getCostComboKey,
} from '../ProductCosts/productCostsUtils';
import styles from './PriceByVariantsTable.module.css';

const PriceByVariantsTable = () => {
  const { pageData, upsertProductPageData } = useProductContext();
  const { fetchMasterData, currencies } = useMasterContext();

  const [masterColors, setMasterColors] = useState([]);
  const [masterSizes, setMasterSizes] = useState([]);
  const [masterCapacities, setMasterCapacities] = useState([]);

  const refreshMasters = useCallback(async () => {
    const [colors, sizes, capacities] = await Promise.all([
      fetchMasterData('master_color_types'),
      fetchMasterData('master_size_types'),
      fetchMasterData('master_capacity_types'),
    ]);

    setMasterColors(Array.isArray(colors) ? colors : []);
    setMasterSizes(Array.isArray(sizes) ? sizes : []);
    setMasterCapacities(Array.isArray(capacities) ? capacities : []);
  }, [fetchMasterData]);

  useEffect(() => {
    refreshMasters();
  }, [refreshMasters]);

  const productId = pageData?.id || null;

  const variantColors = useMemo(
    () => (pageData?.product_varient_colors || []).filter((r) => !r?._delete),
    [pageData?.product_varient_colors],
  );
  const variantSizes = useMemo(
    () => (pageData?.product_varient_sizes || []).filter((r) => !r?._delete),
    [pageData?.product_varient_sizes],
  );
  const variantCapacities = useMemo(
    () =>
      (pageData?.product_varient_capacities || []).filter((r) => !r?._delete),
    [pageData?.product_varient_capacities],
  );
  const productCosts = useMemo(
    () => (pageData?.product_costs || []).filter((r) => !r?._delete),
    [pageData?.product_costs],
  );

  const colorTypeMap = useMemo(
    () =>
      masterColors.reduce((acc, item) => {
        acc[item.id] = item;
        return acc;
      }, {}),
    [masterColors],
  );
  const sizeTypeMap = useMemo(
    () =>
      masterSizes.reduce((acc, item) => {
        acc[item.id] = item;
        return acc;
      }, {}),
    [masterSizes],
  );
  const capacityTypeMap = useMemo(
    () =>
      masterCapacities.reduce((acc, item) => {
        acc[item.id] = item;
        return acc;
      }, {}),
    [masterCapacities],
  );

  const currencyLabelMap = useMemo(
    () =>
      (currencies || []).reduce((acc, currency) => {
        acc[currency.id] =
          currency?.code || currency?.name || currency?.label || currency?.id;
        return acc;
      }, {}),
    [currencies],
  );

  const getColorDisplayName = useCallback(
    (variantRow) => {
      const typeId = getVariantTypeId(variantRow, 'color');
      return (
        colorTypeMap[typeId]?.name ||
        variantRow?.color_name ||
        variantRow?.name ||
        ''
      );
    },
    [colorTypeMap],
  );

  const colorOrderMap = useMemo(
    () =>
      masterColors.reduce((acc, item, index) => {
        acc[item.id] = index;
        return acc;
      }, {}),
    [masterColors],
  );
  const sizeOrderMap = useMemo(
    () =>
      masterSizes.reduce((acc, item, index) => {
        acc[item.id] = index;
        return acc;
      }, {}),
    [masterSizes],
  );
  const capacityOrderMap = useMemo(
    () =>
      masterCapacities.reduce((acc, item, index) => {
        acc[item.id] = index;
        return acc;
      }, {}),
    [masterCapacities],
  );

  const selectedColorVariants = useMemo(
    () =>
      [...variantColors]
        .filter((row) => !!getVariantTypeId(row, 'color'))
        .sort((a, b) => {
          const aId = getVariantTypeId(a, 'color');
          const bId = getVariantTypeId(b, 'color');
          return (
            (colorOrderMap[aId] ?? Number.MAX_SAFE_INTEGER) -
            (colorOrderMap[bId] ?? Number.MAX_SAFE_INTEGER)
          );
        }),
    [variantColors, colorOrderMap],
  );
  const selectedCapacityVariants = useMemo(
    () =>
      [...variantCapacities]
        .filter((row) => !!getVariantTypeId(row, 'capacity'))
        .sort((a, b) => {
          const aId = getVariantTypeId(a, 'capacity');
          const bId = getVariantTypeId(b, 'capacity');
          return (
            (capacityOrderMap[aId] ?? Number.MAX_SAFE_INTEGER) -
            (capacityOrderMap[bId] ?? Number.MAX_SAFE_INTEGER)
          );
        }),
    [variantCapacities, capacityOrderMap],
  );
  const selectedSizeVariants = useMemo(
    () =>
      [...variantSizes]
        .filter((row) => !!getVariantTypeId(row, 'size'))
        .sort((a, b) => {
          const aId = getVariantTypeId(a, 'size');
          const bId = getVariantTypeId(b, 'size');
          return (
            (sizeOrderMap[aId] ?? Number.MAX_SAFE_INTEGER) -
            (sizeOrderMap[bId] ?? Number.MAX_SAFE_INTEGER)
          );
        }),
    [variantSizes, sizeOrderMap],
  );

  const costMapByCombo = useMemo(() => {
    const map = new Map();
    productCosts.forEach((cost) => {
      const key = getCostComboKey(
        cost.product_varient_color_id,
        cost.product_varient_capacity_id,
        cost.product_varient_size_id,
      );
      map.set(key, cost);
    });
    return map;
  }, [productCosts]);

  const gridRows = useMemo(() => {
    const hasAnySelection =
      selectedColorVariants.length > 0 ||
      selectedCapacityVariants.length > 0 ||
      selectedSizeVariants.length > 0;

    if (!hasAnySelection) {
      return [];
    }

    const colorAxis =
      selectedColorVariants.length > 0 ? selectedColorVariants : [null];
    const capacityAxis =
      selectedCapacityVariants.length > 0 ? selectedCapacityVariants : [null];
    const sizeAxis =
      selectedSizeVariants.length > 0 ? selectedSizeVariants : [null];

    const rows = [];
    colorAxis.forEach((colorVar) => {
      capacityAxis.forEach((capacityVar) => {
        sizeAxis.forEach((sizeVar) => {
          const comboKey = getCostComboKey(
            colorVar?.id,
            capacityVar?.id,
            sizeVar?.id,
          );
          const found = costMapByCombo.get(comboKey);

          rows.push({
            id: found?.id || comboKey,
            comboKey,
            product_varient_color_id: colorVar?.id || null,
            product_varient_capacity_id: capacityVar?.id || null,
            product_varient_size_id: sizeVar?.id || null,
            colorLabel: colorVar ? getColorDisplayName(colorVar) : '-',
            capacityLabel: capacityVar
              ? getCapacityLabel(
                  capacityTypeMap[getVariantTypeId(capacityVar, 'capacity')],
                )
              : '-',
            sizeLabel: sizeVar
              ? sizeTypeMap[getVariantTypeId(sizeVar, 'size')]?.name
              : '-',
            sales_price: found?.sales_price ?? '',
            sales_currency_id: found?.sales_currency_id ?? '',
          });
        });
      });
    });

    return rows;
  }, [
    selectedColorVariants,
    selectedCapacityVariants,
    selectedSizeVariants,
    costMapByCombo,
    getColorDisplayName,
    capacityTypeMap,
    sizeTypeMap,
  ]);

  const handleSalesFieldChange = useCallback(
    (row, field, value) => {
      const existing = productCosts.find((cost) => {
        return (
          cost.product_varient_color_id === row.product_varient_color_id &&
          cost.product_varient_capacity_id ===
            row.product_varient_capacity_id &&
          cost.product_varient_size_id === row.product_varient_size_id
        );
      });

      const targetId = existing?.id || uuidv4();

      upsertProductPageData({
        product_costs: [
          {
            id: targetId,
            product_id: productId,
            product_varient_size_id: row.product_varient_size_id,
            product_varient_color_id: row.product_varient_color_id,
            product_varient_capacity_id: row.product_varient_capacity_id,
            sales_price:
              field === 'sales_price'
                ? value
                : (existing?.sales_price ?? row.sales_price ?? ''),
            sales_currency_id:
              field === 'sales_currency_id'
                ? value
                : (existing?.sales_currency_id ?? row.sales_currency_id ?? ''),
          },
        ],
      });
    },
    [productCosts, upsertProductPageData, productId],
  );

  const columns = useMemo(
    () => [
      {
        key: 'color',
        label: 'Color',
        sortType: 'string',
        getSortValue: (row) => row.colorLabel || '',
        renderCell: (row) => row.colorLabel || '-',
      },
      {
        key: 'capacity',
        label: 'Capacity',
        sortType: 'string',
        getSortValue: (row) => row.capacityLabel || '',
        renderCell: (row) => row.capacityLabel || '-',
      },
      {
        key: 'size',
        label: 'Size',
        sortType: 'string',
        getSortValue: (row) => row.sizeLabel || '',
        renderCell: (row) => row.sizeLabel || '-',
      },
      {
        key: 'sales_currency_id',
        label: 'Sales Currency',
        sortType: 'string',
        getSortValue: (row) => currencyLabelMap[row.sales_currency_id] || '',
        fillField: 'sales_currency_id',
        renderCell: (row, { rowIndex, wrapWithFill }) =>
          wrapWithFill(
            <select
              className={styles.cellInput}
              value={row.sales_currency_id || ''}
              onChange={(e) =>
                handleSalesFieldChange(row, 'sales_currency_id', e.target.value)
              }
            >
              <option value="">Select currency</option>
              {(currencies || []).map((currency) => (
                <option key={currency.id} value={currency.id}>
                  {currency?.code || currency?.name || currency?.id}
                </option>
              ))}
            </select>,
            'sales_currency_id',
            rowIndex,
            row.sales_currency_id || '',
          ),
      },
      {
        key: 'sales_price',
        label: 'Sales Price',
        sortType: 'number',
        fillField: 'sales_price',
        renderCell: (row, { rowIndex, wrapWithFill }) =>
          wrapWithFill(
            <input
              className={styles.cellInput}
              value={row.sales_price}
              onChange={(e) =>
                handleSalesFieldChange(row, 'sales_price', e.target.value)
              }
              placeholder="Enter value"
            />,
            'sales_price',
            rowIndex,
            row.sales_price,
          ),
      },
    ],
    [currencyLabelMap, currencies, handleSalesFieldChange],
  );

  return (
    <EditableDataTable
      rows={gridRows}
      columns={columns}
      rowKey="id"
      emptyMessage="Select at least one variant (Color / Capacity / Size)."
      onFillCellChange={(row, field, value) =>
        handleSalesFieldChange(row, field, value)
      }
    />
  );
};

export default PriceByVariantsTable;
