import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Main_InputContainer from '../../../common/InputOptions/InputContainer/Main_InputContainer';
import { useMasterContext } from '../../../../store/MasterContext';
import { useProductContext } from '../../../../store/ProductContext';
import ColorRowsSection from './ColorRowsSection';
import VariantCheckboxSection from './VariantCheckboxSection';
import CostsTable from './CostsTable';
import {
  truthy,
  getVariantTypeId,
  getCapacityLabel,
  normalizeLower,
  getCostComboKey,
} from './productCostsUtils';
import { sortByDisplayOrder } from '../../../../utils/arr';
import styles from './Main_ProductCosts.module.css';

const Main_ProductCosts = () => {
  const { pageData, upsertProductPageData } = useProductContext();
  const { fetchMasterData, updateMasterTableData, currencies } =
    useMasterContext();

  const [masterColors, setMasterColors] = useState([]);
  const [masterSizes, setMasterSizes] = useState([]);
  const [masterCapacities, setMasterCapacities] = useState([]);

  const isSyncingRef = useRef(false);

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

  const selectedSizeTypeIds = useMemo(
    () =>
      variantSizes
        .map((r) => getVariantTypeId(r, 'size'))
        .filter((v) => v !== null),
    [variantSizes],
  );
  const selectedCapacityTypeIds = useMemo(
    () =>
      variantCapacities
        .map((r) => getVariantTypeId(r, 'capacity'))
        .filter((v) => v !== null),
    [variantCapacities],
  );

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

  const visibleSizeOptions = useMemo(() => {
    const selected = new Set(selectedSizeTypeIds);
    return masterSizes.filter(
      (item) => truthy(item.default_display_cb) || selected.has(item.id),
    );
  }, [masterSizes, selectedSizeTypeIds]);

  const visibleCapacityOptions = useMemo(() => {
    const selected = new Set(selectedCapacityTypeIds);
    return masterCapacities.filter(
      (item) => truthy(item.default_display_cb) || selected.has(item.id),
    );
  }, [masterCapacities, selectedCapacityTypeIds]);

  const [colorDraftByVariantId, setColorDraftByVariantId] = useState({});

  const colorSuggestionNames = useMemo(
    () => masterColors.map((c) => c.name).filter(Boolean),
    [masterColors],
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

  const getColorImageRecord = useCallback((variantRow) => {
    const images = variantRow?.product_varient_color_images;
    if (!Array.isArray(images) || images.length === 0) {
      return null;
    }

    const available = images.filter((item) => !item?._delete);
    if (available.length === 0) {
      return null;
    }

    return sortByDisplayOrder(available)[0] || null;
  }, []);

  useEffect(() => {
    setColorDraftByVariantId((prev) => {
      const next = {};
      variantColors.forEach((row) => {
        next[row.id] = prev[row.id] ?? getColorDisplayName(row);
      });
      return next;
    });
  }, [variantColors, getColorDisplayName]);

  const handleAddColorRow = useCallback(() => {
    const id = uuidv4();
    upsertProductPageData({
      product_varient_colors: [
        {
          id,
          product_id: productId,
        },
      ],
    });
    setColorDraftByVariantId((prev) => ({ ...prev, [id]: '' }));
  }, [upsertProductPageData, productId]);

  const handleRemoveColorRow = useCallback(
    (variantId) => {
      upsertProductPageData({
        product_varient_colors: [{ id: variantId, _delete: true }],
        product_costs: productCosts
          .filter((cost) => cost.product_varient_color_id === variantId)
          .map((cost) => ({ id: cost.id, _delete: true })),
      });

      setColorDraftByVariantId((prev) => {
        const copy = { ...prev };
        delete copy[variantId];
        return copy;
      });
    },
    [upsertProductPageData, productCosts],
  );

  const resolveColorTypeByName = useCallback(
    (name) => {
      const normalized = normalizeLower(name);
      if (!normalized) return null;
      return (
        masterColors.find((c) => normalizeLower(c.name) === normalized) || null
      );
    },
    [masterColors],
  );

  const commitColorDraft = useCallback(
    async (variantId) => {
      const rawName = colorDraftByVariantId[variantId] || '';
      const name = rawName.trim();
      if (!name) return;

      let targetMaster = resolveColorTypeByName(name);

      if (!targetMaster) {
        const newId = uuidv4();
        await updateMasterTableData('master_color_types', {
          id: newId,
          name,
          default_display_cb: true,
        });
        await refreshMasters();
        targetMaster = { id: newId, name };
      }

      upsertProductPageData({
        product_varient_colors: [
          {
            id: variantId,
            product_id: productId,
            color_type_id: targetMaster.id,
            color_name: targetMaster.name,
          },
        ],
      });

      setColorDraftByVariantId((prev) => ({
        ...prev,
        [variantId]: targetMaster.name,
      }));
    },
    [
      colorDraftByVariantId,
      resolveColorTypeByName,
      updateMasterTableData,
      refreshMasters,
      upsertProductPageData,
      productId,
    ],
  );

  const handleColorImageFileChange = useCallback(
    (variantRow, file) => {
      if (!variantRow?.id || !file) return;

      const objectUrl = URL.createObjectURL(file);
      const existingImage = getColorImageRecord(variantRow);

      upsertProductPageData({
        product_varient_colors: [
          {
            id: variantRow.id,
            product_varient_color_images: [
              {
                id: existingImage?.id || uuidv4(),
                product_varient_color_id: variantRow.id,
                image_url: objectUrl,
                image_name: file.name,
                display_order: existingImage?.display_order ?? 1,
              },
            ],
          },
        ],
      });
    },
    [upsertProductPageData, getColorImageRecord],
  );

  const handleToggleSize = useCallback(
    (typeId, checked) => {
      const matched = variantSizes.find(
        (row) => getVariantTypeId(row, 'size') === typeId,
      );

      if (checked && !matched) {
        upsertProductPageData({
          product_varient_sizes: [
            {
              id: uuidv4(),
              product_id: productId,
              size_type_id: typeId,
            },
          ],
        });
        return;
      }

      if (!checked && matched?.id) {
        upsertProductPageData({
          product_varient_sizes: [{ id: matched.id, _delete: true }],
          product_costs: productCosts
            .filter((cost) => cost.product_varient_size_id === matched.id)
            .map((cost) => ({ id: cost.id, _delete: true })),
        });
      }
    },
    [variantSizes, upsertProductPageData, productId, productCosts],
  );

  const handleToggleCapacity = useCallback(
    (typeId, checked) => {
      const matched = variantCapacities.find(
        (row) => getVariantTypeId(row, 'capacity') === typeId,
      );

      if (checked && !matched) {
        upsertProductPageData({
          product_varient_capacities: [
            {
              id: uuidv4(),
              product_id: productId,
              capacity_type_id: typeId,
            },
          ],
        });
        return;
      }

      if (!checked && matched?.id) {
        upsertProductPageData({
          product_varient_capacities: [{ id: matched.id, _delete: true }],
          product_costs: productCosts
            .filter((cost) => cost.product_varient_capacity_id === matched.id)
            .map((cost) => ({ id: cost.id, _delete: true })),
        });
      }
    },
    [variantCapacities, upsertProductPageData, productId, productCosts],
  );

  const handleAddNewSize = useCallback(async () => {
    const name = window.prompt('Add new size name (e.g. M, XXL):');
    if (!name || !name.trim()) return;

    const normalizedName = normalizeLower(name);
    const latestSizesRaw = await fetchMasterData('master_size_types');
    const latestSizes = Array.isArray(latestSizesRaw) ? latestSizesRaw : [];
    setMasterSizes(latestSizes);

    let targetSize = latestSizes.find(
      (item) => normalizeLower(item?.name) === normalizedName,
    );

    if (!targetSize) {
      const newId = uuidv4();
      await updateMasterTableData('master_size_types', {
        id: newId,
        name: name.trim(),
        description: `${name.trim()} size`,
        default_display_cb: false,
      });

      targetSize = { id: newId, name: name.trim() };
      setMasterSizes((prev) => [...prev, targetSize]);
    }

    const alreadySelected = variantSizes.some(
      (row) => getVariantTypeId(row, 'size') === targetSize.id,
    );
    if (alreadySelected) return;

    upsertProductPageData({
      product_varient_sizes: [
        {
          id: uuidv4(),
          product_id: productId,
          size_type_id: targetSize.id,
        },
      ],
    });
  }, [
    fetchMasterData,
    updateMasterTableData,
    upsertProductPageData,
    productId,
    variantSizes,
  ]);

  const handleAddNewCapacity = useCallback(async () => {
    const input = window.prompt('Add new capacity (e.g. 750 mL):');
    if (!input || !input.trim()) return;

    const parts = input.trim().split(/\s+/);
    const unit = parts.length > 1 ? parts[parts.length - 1] : '';
    const valueRaw = parts.slice(0, parts.length > 1 ? -1 : 1).join('');
    const numeric = Number(valueRaw);
    const value = Number.isNaN(numeric) ? valueRaw : numeric;

    const normalizedInput = normalizeLower(input);
    const latestCapacitiesRaw = await fetchMasterData('master_capacity_types');
    const latestCapacities = Array.isArray(latestCapacitiesRaw)
      ? latestCapacitiesRaw
      : [];
    setMasterCapacities(latestCapacities);

    const normalizedUnit = normalizeLower(unit);
    const targetCapacityByText = latestCapacities.find(
      (item) => normalizeLower(getCapacityLabel(item)) === normalizedInput,
    );

    const targetCapacityByValueUnit = latestCapacities.find((item) => {
      const itemUnit = normalizeLower(item?.unit);
      if (itemUnit !== normalizedUnit) return false;

      const itemValue = item?.value;
      if (typeof value === 'number') {
        return Number(itemValue) === value;
      }

      return normalizeLower(itemValue) === normalizeLower(value);
    });

    let targetCapacity = targetCapacityByText || targetCapacityByValueUnit;

    if (!targetCapacity) {
      const newId = uuidv4();
      await updateMasterTableData('master_capacity_types', {
        id: newId,
        value,
        unit,
        description: `${input.trim()} capacity`,
        default_display_cb: false,
      });

      targetCapacity = { id: newId, value, unit };
      setMasterCapacities((prev) => [...prev, targetCapacity]);
    }

    const alreadySelected = variantCapacities.some(
      (row) => getVariantTypeId(row, 'capacity') === targetCapacity.id,
    );
    if (alreadySelected) return;

    upsertProductPageData({
      product_varient_capacities: [
        {
          id: uuidv4(),
          product_id: productId,
          capacity_type_id: targetCapacity.id,
        },
      ],
    });
  }, [
    fetchMasterData,
    updateMasterTableData,
    upsertProductPageData,
    productId,
    variantCapacities,
  ]);

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
            colorTypeId: colorVar ? getVariantTypeId(colorVar, 'color') : null,
            capacityTypeId: capacityVar
              ? getVariantTypeId(capacityVar, 'capacity')
              : null,
            sizeTypeId: sizeVar ? getVariantTypeId(sizeVar, 'size') : null,
            unit_cost: found?.unit_cost ?? '',
            stock_qty: found?.stock_qty ?? 0,
            min_order_qty: found?.min_order_qty ?? 1,
            currency_id: found?.currency_id ?? '',
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
  ]);

  useEffect(() => {
    if (isSyncingRef.current) return;
    if (gridRows.length === 0 && productCosts.length === 0) return;

    const targetKeys = new Set(gridRows.map((row) => row.comboKey));
    const existingKeys = new Set(
      productCosts.map((cost) =>
        getCostComboKey(
          cost.product_varient_color_id,
          cost.product_varient_capacity_id,
          cost.product_varient_size_id,
        ),
      ),
    );

    const additions = gridRows
      .filter((row) => !existingKeys.has(row.comboKey))
      .map((row) => ({
        id: uuidv4(),
        product_id: productId,
        product_varient_size_id: row.product_varient_size_id || null,
        product_varient_color_id: row.product_varient_color_id || null,
        product_varient_capacity_id: row.product_varient_capacity_id || null,
        unit_cost: '',
        stock_qty: 0,
        currency_id: '',
        min_order_qty: 1,
      }));

    const deletions = productCosts
      .filter((cost) => {
        const key = getCostComboKey(
          cost.product_varient_color_id,
          cost.product_varient_capacity_id,
          cost.product_varient_size_id,
        );
        return !targetKeys.has(key);
      })
      .map((cost) => ({ id: cost.id, _delete: true }));

    if (additions.length === 0 && deletions.length === 0) return;

    isSyncingRef.current = true;
    upsertProductPageData({
      product_costs: [...additions, ...deletions],
    });

    setTimeout(() => {
      isSyncingRef.current = false;
    }, 0);
  }, [gridRows, productCosts, upsertProductPageData, productId]);

  const handleCostFieldChange = useCallback(
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
            unit_cost:
              field === 'unit_cost'
                ? value
                : (existing?.unit_cost ?? row.unit_cost),
            stock_qty:
              field === 'stock_qty'
                ? Number(value) || 0
                : Number(existing?.stock_qty ?? row.stock_qty) || 0,
            min_order_qty:
              field === 'min_order_qty'
                ? Number(value) || 0
                : Number(existing?.min_order_qty ?? row.min_order_qty) || 0,
            currency_id:
              field === 'currency_id'
                ? value
                : (existing?.currency_id ?? row.currency_id ?? ''),
          },
        ],
      });
    },
    [productCosts, upsertProductPageData, productId],
  );

  return (
    <Main_InputContainer label="Product Costs">
      <div className={styles.container}>
        <ColorRowsSection
          variantColors={variantColors}
          getColorImageRecord={getColorImageRecord}
          colorSuggestionNames={colorSuggestionNames}
          colorDraftByVariantId={colorDraftByVariantId}
          getColorDisplayName={getColorDisplayName}
          setColorDraftByVariantId={setColorDraftByVariantId}
          commitColorDraft={commitColorDraft}
          handleColorImageFileChange={handleColorImageFileChange}
          handleRemoveColorRow={handleRemoveColorRow}
          handleAddColorRow={handleAddColorRow}
        />

        <VariantCheckboxSection
          title="Capacity"
          options={visibleCapacityOptions}
          selectedIds={selectedCapacityTypeIds}
          getLabel={getCapacityLabel}
          onToggle={handleToggleCapacity}
          onAddNew={handleAddNewCapacity}
        />

        <VariantCheckboxSection
          title="Size"
          options={visibleSizeOptions}
          selectedIds={selectedSizeTypeIds}
          getLabel={(item) => item.name}
          onToggle={handleToggleSize}
          onAddNew={handleAddNewSize}
        />

        <CostsTable
          gridRows={gridRows}
          colorTypeMap={colorTypeMap}
          capacityTypeMap={capacityTypeMap}
          sizeTypeMap={sizeTypeMap}
          currencyOptions={currencies}
          onCostFieldChange={handleCostFieldChange}
        />
      </div>
    </Main_InputContainer>
  );
};

export default Main_ProductCosts;
