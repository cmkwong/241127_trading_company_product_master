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
