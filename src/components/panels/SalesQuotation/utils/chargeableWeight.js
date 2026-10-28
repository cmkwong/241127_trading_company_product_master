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

export const buildChargeableWeightSummary = ({
  qty,
  weightPerCarton,
  lengthCm,
  widthCm,
  heightCm,
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
  const qtyValue = toFiniteNumber(qty);
  const weightValue = toFiniteNumber(weightPerCarton);
  const lengthValue = toFiniteNumber(lengthCm);
  const widthValue = toFiniteNumber(widthCm);
  const heightValue = toFiniteNumber(heightCm);

  const hasQty = Number.isFinite(qtyValue) && qtyValue > 0;
  const hasWeightPerCarton = Number.isFinite(weightValue) && weightValue >= 0;
  const hasVolumeInputs =
    Number.isFinite(lengthValue) &&
    Number.isFinite(widthValue) &&
    Number.isFinite(heightValue) &&
    lengthValue > 0 &&
    widthValue > 0 &&
    heightValue > 0;

  const grossTotalWeight =
    hasQty && hasWeightPerCarton ? qtyValue * weightValue : NaN;
  const volumeCubicMeter =
    hasQty && hasVolumeInputs
      ? (lengthValue * widthValue * heightValue * qtyValue) / 1000000
      : NaN;
  const volumetricWeightPerCarton = hasVolumeInputs
    ? (lengthValue * widthValue * heightValue) / safeDivisor
    : NaN;
  const volumetricWeightTotal =
    hasQty && Number.isFinite(volumetricWeightPerCarton)
      ? volumetricWeightPerCarton * qtyValue
      : NaN;
  const lengthPlusGirth = computeMinimizedLengthPlusGirth(
    lengthValue,
    widthValue,
    heightValue,
  );

  const comparedWeightPerCarton =
    hasWeightPerCarton || Number.isFinite(volumetricWeightPerCarton)
      ? Math.max(
          hasWeightPerCarton ? weightValue : 0,
          Number.isFinite(volumetricWeightPerCarton)
            ? volumetricWeightPerCarton
            : 0,
        )
      : NaN;

  const chargeablePerCarton =
    hasQty && Number.isFinite(comparedWeightPerCarton)
      ? Math.max(comparedWeightPerCarton, safeMinChargeableWeight)
      : NaN;

  const finalChargeableWeightSea =
    hasQty && Number.isFinite(chargeablePerCarton)
      ? chargeablePerCarton * qtyValue
      : NaN;

  const finalChargeableWeightAir =
    hasQty && Number.isFinite(comparedWeightPerCarton)
      ? comparedWeightPerCarton * qtyValue
      : NaN;

  return {
    grossTotalWeight,
    volumeCubicMeter,
    volumetricWeightPerCarton,
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
