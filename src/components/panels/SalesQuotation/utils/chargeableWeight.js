export const MIN_CHARGEABLE_WEIGHT_PER_CARTON = 12;
export const DEFAULT_VOLUMETRIC_DIVISOR = 6000;

export const toFiniteNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : NaN;
};

export const formatWeight = (value, fallback = '-') => {
  if (!Number.isFinite(value)) {
    return fallback;
  }

  return value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

export const computeMinimizedLengthPlusGirth = (
  lengthCm,
  widthCm,
  heightCm,
) => {
  const dimensions = [
    toFiniteNumber(lengthCm),
    toFiniteNumber(widthCm),
    toFiniteNumber(heightCm),
  ];

  const hasValidDimensions = dimensions.every(
    (value) => Number.isFinite(value) && value > 0,
  );

  if (!hasValidDimensions) {
    return NaN;
  }

  const [smallest, middle, largest] = [...dimensions].sort((a, b) => a - b);
  const girth = 2 * (smallest + middle);

  return largest + girth;
};

export const buildChargeableWeightSummaryFromDimensions = ({
  dimensions = [],
  volumetricDivisor,
  minChargeableWeightPerCarton,
}) => {
  const safeDivisor =
    Number.isFinite(toFiniteNumber(volumetricDivisor)) &&
    toFiniteNumber(volumetricDivisor) > 0
      ? toFiniteNumber(volumetricDivisor)
      : DEFAULT_VOLUMETRIC_DIVISOR;
  const safeMinChargeableWeight =
    Number.isFinite(toFiniteNumber(minChargeableWeightPerCarton)) &&
    toFiniteNumber(minChargeableWeightPerCarton) > 0
      ? toFiniteNumber(minChargeableWeightPerCarton)
      : MIN_CHARGEABLE_WEIGHT_PER_CARTON;

  const rows = Array.isArray(dimensions) ? dimensions : [];

  let grossTotalWeight = NaN;
  let volumeCubicMeter = NaN;
  let volumetricWeightTotal = NaN;
  let finalChargeableWeightSea = NaN;
  let finalChargeableWeightAir = NaN;
  let lengthPlusGirth = NaN;
  let totalQty = 0;

  for (const raw of rows) {
    const qtyValue = toFiniteNumber(raw?.qty);
    const weightValue = toFiniteNumber(raw?.weight);
    const lengthValue = toFiniteNumber(raw?.length);
    const widthValue = toFiniteNumber(raw?.width);
    const heightValue = toFiniteNumber(raw?.height);

    const hasQty = Number.isFinite(qtyValue) && qtyValue > 0;
    const hasWeight = Number.isFinite(weightValue) && weightValue >= 0;
    const hasVolume =
      Number.isFinite(lengthValue) &&
      Number.isFinite(widthValue) &&
      Number.isFinite(heightValue) &&
      lengthValue > 0 &&
      widthValue > 0 &&
      heightValue > 0;

    if (hasQty) totalQty += qtyValue;

    const volumetricWeightPerCarton = hasVolume
      ? (lengthValue * widthValue * heightValue) / safeDivisor
      : NaN;

    if (hasQty && hasWeight) {
      const gross = qtyValue * weightValue;
      grossTotalWeight = Number.isFinite(grossTotalWeight)
        ? grossTotalWeight + gross
        : gross;
    }

    if (hasQty && hasVolume) {
      const volume = (lengthValue * widthValue * heightValue * qtyValue) / 1000000;
      volumeCubicMeter = Number.isFinite(volumeCubicMeter)
        ? volumeCubicMeter + volume
        : volume;
    }

    if (hasQty && Number.isFinite(volumetricWeightPerCarton)) {
      const volumetricTotal = volumetricWeightPerCarton * qtyValue;
      volumetricWeightTotal = Number.isFinite(volumetricWeightTotal)
        ? volumetricWeightTotal + volumetricTotal
        : volumetricTotal;
    }

    const comparedWeightPerCarton =
      hasWeight || Number.isFinite(volumetricWeightPerCarton)
        ? Math.max(
            hasWeight ? weightValue : 0,
            Number.isFinite(volumetricWeightPerCarton)
              ? volumetricWeightPerCarton
              : 0,
          )
        : NaN;

    if (hasQty && Number.isFinite(comparedWeightPerCarton)) {
      const sea = Math.max(comparedWeightPerCarton, safeMinChargeableWeight) * qtyValue;
      const air = comparedWeightPerCarton * qtyValue;
      finalChargeableWeightSea = Number.isFinite(finalChargeableWeightSea)
        ? finalChargeableWeightSea + sea
        : sea;
      finalChargeableWeightAir = Number.isFinite(finalChargeableWeightAir)
        ? finalChargeableWeightAir + air
        : air;
    }

    const girth = computeMinimizedLengthPlusGirth(
      lengthValue,
      widthValue,
      heightValue,
    );
    if (
      Number.isFinite(girth) &&
      (!Number.isFinite(lengthPlusGirth) || girth > lengthPlusGirth)
    ) {
      lengthPlusGirth = girth;
    }
  }

  const chargeablePerCarton =
    totalQty > 0 && Number.isFinite(finalChargeableWeightSea)
      ? finalChargeableWeightSea / totalQty
      : NaN;

  return {
    grossTotalWeight,
    volumeCubicMeter,
    volumetricWeightPerCarton: NaN,
    volumetricWeightTotal,
    chargeablePerCarton,
    finalChargeableWeight: finalChargeableWeightSea,
    finalChargeableWeightSea,
    finalChargeableWeightAir,
    lengthPlusGirth,
    divisor: safeDivisor,
    minChargeableWeightPerCarton: safeMinChargeableWeight,
  };
};

export const buildChargeableWeightSummary = ({
  qty,
  weightPerCarton,
  lengthCm,
  widthCm,
  heightCm,
  volumetricDivisor,
  minChargeableWeightPerCarton,
}) =>
  buildChargeableWeightSummaryFromDimensions({
    dimensions: [
      {
        qty,
        weight: weightPerCarton,
        length: lengthCm,
        width: widthCm,
        height: heightCm,
      },
    ],
    volumetricDivisor,
    minChargeableWeightPerCarton,
  });

