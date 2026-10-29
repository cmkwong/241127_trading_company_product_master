import PropTypes from 'prop-types';
import Main_TextField from '../../../common/InputOptions/TextField/Main_TextField';
import {
  buildChargeableWeightSummary,
  buildChargeableWeightSummaryFromDimensions,
  formatWeight,
} from '../utils/chargeableWeight';
import styles from './Sub_ChargeableWeightPanel.module.css';

const Sub_ChargeableWeightPanel = ({
  qty,
  weightPerCarton,
  lengthCm,
  widthCm,
  heightCm,
  divisor,
  minChargeableWeightPerCarton,
  onDivisorChange,
  onMinChargeableWeightChange,
  title = 'Chargeable Weight',
  className = '',
  dimensions = [],
  children,
}) => {
  const hasDimensions = Array.isArray(dimensions) && dimensions.length > 0;
  const summary = hasDimensions
    ? buildChargeableWeightSummaryFromDimensions({
        dimensions,
        volumetricDivisor: divisor,
        minChargeableWeightPerCarton,
      })
    : buildChargeableWeightSummary({
        qty,
        weightPerCarton,
        lengthCm,
        widthCm,
        heightCm,
        volumetricDivisor: divisor,
        minChargeableWeightPerCarton,
      });

  const isDivisorEditable = typeof onDivisorChange === 'function';
  const isMinWeightEditable = typeof onMinChargeableWeightChange === 'function';

  return (
    <div className={`${styles.chargeablePanel} ${className}`.trim()}>
      <div className={styles.chargeableTitle}>{title}</div>
      <div className={styles.chargeableControls}>
        <div className={styles.chargeableControlItem}>
          <span className={styles.chargeableControlLabel}>Divisor</span>
          <Main_TextField
            className={styles.chargeableControlInput}
            type="number"
            defaultValue={String(summary.divisor)}
            disabled={!isDivisorEditable}
            onChange={(ov, nv) => onDivisorChange?.(nv)}
          />
        </div>

        <div className={styles.chargeableControlItem}>
          <span className={styles.chargeableControlLabel}>
            Min Weight / Carton (kg)
          </span>
          <Main_TextField
            className={styles.chargeableControlInput}
            type="number"
            defaultValue={String(summary.minChargeableWeightPerCarton)}
            disabled={!isMinWeightEditable}
            onChange={(ov, nv) => onMinChargeableWeightChange?.(nv)}
          />
        </div>
      </div>

      <div className={styles.chargeableMeta}>
        Formula: max(Gross per carton, Volumetric per carton, Min per carton) x
        Qty
      </div>

      <div className={styles.chargeableGrid}>
        <div className={styles.chargeableItem}>
          <span className={styles.chargeableLabel}>Gross Total</span>
          <span className={styles.chargeableValue}>
            {formatWeight(summary.grossTotalWeight)} kg
          </span>
        </div>

        <div className={styles.chargeableItem}>
          <span className={styles.chargeableLabel}>Volume</span>
          <span className={styles.chargeableValue}>
            {formatWeight(summary.volumeCubicMeter)} m3
          </span>
        </div>

        <div className={styles.chargeableItem}>
          <span className={styles.chargeableLabel}>Volumetric Total</span>
          <span className={styles.chargeableValue}>
            {formatWeight(summary.volumetricWeightTotal)} kg
          </span>
        </div>

        <div className={styles.chargeableItem}>
          <span className={styles.chargeableLabel}>Per Carton (with Min)</span>
          <span className={styles.chargeableValue}>
            {formatWeight(summary.chargeablePerCarton)} kg
          </span>
        </div>

        <div className={styles.chargeableItem}>
          <span className={styles.chargeableLabel}>Length + Girth</span>
          <span className={styles.chargeableValue}>
            {formatWeight(summary.lengthPlusGirth)} cm
          </span>
        </div>

        <div
          className={`${styles.chargeableItemStrong} ${styles.chargeableItemStrongHalf}`}
        >
          <span className={styles.chargeableLabel}>Final Chargeable (Sea)</span>
          <span className={styles.chargeableValueStrong}>
            {formatWeight(summary.finalChargeableWeightSea)} kg
          </span>
        </div>

        <div
          className={`${styles.chargeableItemStrong} ${styles.chargeableItemStrongHalf}`}
        >
          <span className={styles.chargeableLabel}>
            Final Chargeable (Air / Delivery Express)
          </span>
          <span className={styles.chargeableValueStrong}>
            {formatWeight(summary.finalChargeableWeightAir)} kg
          </span>
        </div>
      </div>

      {hasDimensions ? (
        <div className={styles.dimensionBreakdown}>
          {dimensions.map((dimension, index) => {
            const length = Number(dimension?.length);
            const width = Number(dimension?.width);
            const height = Number(dimension?.height);
            const qtyValue = Number(dimension?.qty);
            const weightValue = Number(dimension?.weight);
            const dimText = [length, width, height]
              .map((value) => (Number.isFinite(value) ? value : '-'))
              .join(' x ');
            const weightText = Number.isFinite(weightValue)
              ? `${weightValue} kg`
              : '-';
            return (
              <div className={styles.dimensionBreakdownRow} key={dimension?.id || index}>
                <span className={styles.dimensionBreakdownDims}>
                  {Number.isFinite(length) || Number.isFinite(width) || Number.isFinite(height)
                    ? `${dimText} cm`
                    : 'No size'}
                </span>
                <span className={styles.dimensionBreakdownMeta}>
                  {Number.isFinite(qtyValue) ? `Qty ${qtyValue}` : ''} / {weightText}
                </span>
              </div>
            );
          })}
        </div>
      ) : null}

      {children}
    </div>
  );
};

Sub_ChargeableWeightPanel.propTypes = {
  qty: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  weightPerCarton: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  lengthCm: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  widthCm: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  heightCm: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  divisor: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  minChargeableWeightPerCarton: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.string,
  ]),
  onDivisorChange: PropTypes.func,
  onMinChargeableWeightChange: PropTypes.func,
  title: PropTypes.string,
  className: PropTypes.string,
  dimensions: PropTypes.arrayOf(PropTypes.object),
  children: PropTypes.node,
};

export default Sub_ChargeableWeightPanel;
