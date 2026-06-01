/**
 * Normalize API payload to a table-shaped object.
 * Supports:
 * 1) { structuredData: { data: { [tableName]: [...] } } }
 * 2) direct array response
 * 3) direct object response
 */
export const normalizeStructuredTableResponse = (response, tableName) => {
  if (response?.structuredData?.data?.[tableName]) {
    return response.structuredData.data;
  }

  if (Array.isArray(response)) {
    return { [tableName]: response };
  }

  return response;
};

/**
 * Build nested change/deletion payload by comparing current page data
 * against an original snapshot.
 */
export const buildNestedChangedData = ({
  pageData,
  originalPageData,
  comparisonKeys,
  rootTableName,
  base64Config,
}) => {
  const currentPageData = pageData || {};

  // New row / not persisted yet
  if (!currentPageData.id) {
    return { changes: { [rootTableName]: [currentPageData] } };
  }

  // Missing or mismatched baseline => treat as full change
  if (!originalPageData || originalPageData.id !== currentPageData.id) {
    return { changes: { [rootTableName]: [currentPageData] } };
  }

  const cleanPageData = { ...currentPageData };
  delete cleanPageData._objUrl;

  const getDiff = (
    current,
    original,
    keysToCompare,
    tableName = rootTableName,
  ) => {
    const diff = current.id ? { id: current.id } : {};
    const deletions = current.id ? { id: current.id } : {};

    let hasChanges = false;
    let hasDeletions = false;

    if (current._base64_changed) {
      const config = base64Config?.[tableName];
      if (config && config.url) {
        diff[config.url] = current[config.url];
        hasChanges = true;
      }
    }

    for (const key of keysToCompare) {
      if (key === '_base64_changed' || key === '_objUrl') continue;
      if (current[key] === undefined && original[key] === undefined) continue;

      if (Array.isArray(current[key])) {
        const currentArr = current[key];
        const originalArr = Array.isArray(original[key]) ? original[key] : [];

        const arrayChanges = [];
        const arrayDeletions = [];

        originalArr.forEach((origItem) => {
          if (
            origItem.id &&
            !currentArr.some((currItem) => currItem.id === origItem.id)
          ) {
            arrayDeletions.push({ id: origItem.id });
            hasDeletions = true;
          }
        });

        currentArr.forEach((item) => {
          if (!item.id) {
            arrayChanges.push(item);
            hasChanges = true;
            return;
          }

          const originalItem = originalArr.find((i) => i.id === item.id);
          if (!originalItem) {
            arrayChanges.push(item);
            hasChanges = true;
          } else {
            const itemKeys = Object.keys(item);
            const { diff: itemDiff, deletions: itemDel } = getDiff(
              item,
              originalItem,
              itemKeys,
              key,
            );

            if (Object.keys(itemDiff).length > 1) {
              arrayChanges.push(itemDiff);
              hasChanges = true;
            }

            if (Object.keys(itemDel).length > 1) {
              arrayDeletions.push(itemDel);
              hasDeletions = true;
            }
          }
        });

        if (arrayChanges.length > 0) {
          diff[key] = arrayChanges;
        }
        if (arrayDeletions.length > 0) {
          deletions[key] = arrayDeletions;
        }
      } else if (
        typeof current[key] === 'object' &&
        current[key] !== null &&
        key !== '_objUrl' &&
        key !== '_base64_changed'
      ) {
        if (typeof original[key] !== 'object' || original[key] === null) {
          diff[key] = current[key];
          hasChanges = true;
        } else if (
          JSON.stringify(current[key]) !== JSON.stringify(original[key])
        ) {
          diff[key] = current[key];
          hasChanges = true;
        }
      } else if (current[key] !== original[key]) {
        diff[key] = current[key];
        hasChanges = true;
      }
    }

    return {
      diff: hasChanges ? diff : diff.id ? { id: diff.id } : {},
      deletions: hasDeletions
        ? deletions
        : deletions.id
          ? { id: deletions.id }
          : {},
    };
  };

  const { diff: rootDiff, deletions: rootDel } = getDiff(
    cleanPageData,
    originalPageData,
    comparisonKeys,
    rootTableName,
  );

  const result = {};
  let hasResult = false;

  if (Object.keys(rootDiff).length > 1) {
    result.changes = { [rootTableName]: [rootDiff] };
    hasResult = true;
  }

  if (Object.keys(rootDel).length > 1) {
    result.deletions = { [rootTableName]: [rootDel] };
    hasResult = true;
  }

  return hasResult ? result : null;
};

/**
 * Remove internal flags recursively from nested objects/arrays.
 */
export const cleanupNestedInternalFlags = (
  obj,
  flagsToRemove = ['_base64_changed'],
) => {
  if (!obj || typeof obj !== 'object') return obj;

  if (Array.isArray(obj)) {
    return obj.map((item) => cleanupNestedInternalFlags(item, flagsToRemove));
  }

  const newObj = { ...obj };
  flagsToRemove.forEach((flag) => {
    delete newObj[flag];
  });

  Object.keys(newObj).forEach((key) => {
    if (typeof newObj[key] === 'object' && newObj[key] !== null) {
      newObj[key] = cleanupNestedInternalFlags(newObj[key], flagsToRemove);
    }
  });

  return newObj;
};

/**
 * Shared guard for switching to another record when unsaved changes exist.
 */
export const canProceedWithRecordSwitch = ({
  hasRecordId,
  isDataUnchanged,
  message = 'You have unsaved changes. Do you want to continue without saving?',
}) => {
  if (!hasRecordId || isDataUnchanged) {
    return true;
  }

  return window.confirm(message);
};

/**
 * Shared guard + discard helper for switching records/modules.
 * If unsaved changes exist and user confirms, `onDiscard` will run before proceeding.
 */
export const canProceedAndDiscardUnsavedChanges = ({
  hasRecordId,
  isDataUnchanged,
  onDiscard,
  message = 'You have unsaved changes. Do you want to continue without saving?',
}) => {
  const canProceed = canProceedWithRecordSwitch({
    hasRecordId,
    isDataUnchanged,
    message,
  });

  if (!canProceed) {
    return false;
  }

  if (hasRecordId && !isDataUnchanged && typeof onDiscard === 'function') {
    onDiscard();
  }

  return true;
};

/**
 * Return comparison keys from server when available; otherwise derive from pageData.
 */
export const getEffectiveComparisonKeys = ({
  comparisonKeys = [],
  pageData,
}) => {
  if (Array.isArray(comparisonKeys) && comparisonKeys.length > 0) {
    return comparisonKeys;
  }

  return Object.keys(pageData || {}).filter(
    (key) => key !== '_objUrl' && key !== '_base64_changed',
  );
};

/**
 * Validate nested upsert payloads.
 */
export const validateNestedDataObject = (
  nestedData,
  errorMessage = 'Upsert data requires an object argument',
) => {
  const isValid = typeof nestedData === 'object' && nestedData !== null;
  if (!isValid) {
    console.error(errorMessage);
  }
  return isValid;
};

/**
 * Upsert an entity into a keyed list inside state.
 */
export const mergeEntityIntoStateList = ({
  prevState,
  listKey,
  entity,
  idKey = 'id',
}) => {
  const currentList = prevState?.[listKey] || [];
  const updatedList = [...currentList];

  const existingIndex = updatedList.findIndex(
    (item) => item?.[idKey] === entity?.[idKey],
  );

  if (existingIndex !== -1) {
    updatedList[existingIndex] = entity;
  } else {
    updatedList.push(entity);
  }

  return {
    ...prevState,
    [listKey]: updatedList,
  };
};

/**
 * Generate next segmented code with format like S0000-0001.
 */
export const generateNextSegmentedCode = ({
  items = [],
  getCode,
  prefix = 'S',
  segmentLength = 4,
}) => {
  const codePrefix = String(prefix || '').toUpperCase();
  const escapedPrefix = codePrefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const codeRegex = new RegExp(
    `^${escapedPrefix}(\\d{${segmentLength}})-(\\d{${segmentLength}})$`,
  );

  const maxCounter = (Array.isArray(items) ? items : []).reduce(
    (maxValue, item) => {
      const rawCode = typeof getCode === 'function' ? getCode(item) : '';
      const code = String(rawCode || '')
        .trim()
        .toUpperCase();
      const match = code.match(codeRegex);

      if (!match) return maxValue;

      const high = Number(match[1]);
      const low = Number(match[2]);
      if (Number.isNaN(high) || Number.isNaN(low)) return maxValue;

      const base = 10 ** segmentLength;
      const counter = high * base + low;
      return Math.max(maxValue, counter);
    },
    0,
  );

  const base = 10 ** segmentLength;
  const nextCounter = maxCounter + 1;
  const highPart = Math.floor(nextCounter / base)
    .toString()
    .padStart(segmentLength, '0');
  const lowPart = (nextCounter % base).toString().padStart(segmentLength, '0');

  return `${codePrefix}${highPart}-${lowPart}`;
};

/**
 * Shared context guard for custom hooks.
 */
export const ensureContextAvailable = (context, hookName, providerName) => {
  if (!context) {
    throw new Error(`${hookName} must be used within a ${providerName}`);
  }

  return context;
};
