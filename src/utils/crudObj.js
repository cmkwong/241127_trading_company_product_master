import { v4 as uuidv4 } from 'uuid';

/**
 * Helper function to navigate nested paths and apply an operation
 * @param {object} data - The data object to navigate
 * @param {string[]} pathParts - Array of path parts (e.g., ['product_customizations', 'product_customization_images'])
 * @param {function} operation - Function to apply at the target array (receives array, returns new array)
 * @param {number} depth - Current depth in recursion
 * @returns {object} Updated data object
 */
export const navigateAndUpdate = (data, pathParts, operation, depth = 0) => {
  const currentPart = pathParts[depth];

  if (!Array.isArray(data[currentPart])) {
    console.warn(`${currentPart} is not an array in the data structure`);
    return data;
  }

  // If this is the last part, apply the operation
  if (depth === pathParts.length - 1) {
    return {
      ...data,
      [currentPart]: operation(data[currentPart]),
    };
  }

  // Otherwise, recurse deeper into each item
  const updatedArray = data[currentPart].map((item) =>
    navigateAndUpdate(item, pathParts, operation, depth + 1),
  );

  return {
    ...data,
    [currentPart]: updatedArray,
  };
};

/**
 * Add new data to a specific table (array)
 * Supports nested paths using dot notation (e.g., 'product_customizations.product_customization_images')
 * Automatically generates an ID if not provided
 * @param {object} data - The data object to update
 * @param {string} tableName - Name of the table/array to add to. Use dot notation for nested arrays.
 * @param {object} dataObject - Object containing fields to add
 * @returns {object} Updated data object
 */
export const addToTable = (data, tableName, dataObject) => {
  // Split path for nested navigation
  const pathParts = tableName.split('.');

  // Auto-generate ID if not provided
  const newItem = {
    ...dataObject,
    id: dataObject.id || uuidv4(),
  };

  // Handle simple (non-nested) path
  if (pathParts.length === 1) {
    if (!Array.isArray(data[tableName])) {
      console.warn(`${tableName} is not an array in data`);
      return data;
    }

    return {
      ...data,
      [tableName]: [...data[tableName], newItem],
    };
  }

  // Handle nested path
  const operation = (arr) => [...arr, newItem];
  return navigateAndUpdate(data, pathParts, operation);
};

/**
 * Read/find items from a specific table (array) based on AND conditions
 * Supports nested paths using dot notation (e.g., 'product_customizations.product_customization_images')
 * @param {object} data - The data object to read from
 * @param {string} tableName - Name of the table/array to read from, or 'root' to return root data. Use dot notation for nested arrays.
 * @param {object} [condition] - Optional AND conditions to filter items (e.g., { id: 'xxx', type: 'abc' }). If not provided, returns all items.
 * @returns {Array|object|null} Returns array of matching items, single item if only one match, or null if not found
 */
export const readFromTable = (data, tableName, condition = null) => {
  // Handle 'root' explicitly for reading root-level data
  if (tableName === 'root') {
    // If condition is provided, check if root data matches
    if (condition) {
      const matches = Object.keys(condition).every(
        (key) => data[key] === condition[key],
      );
      return matches ? data : null;
    }
    return data;
  }

  // Split path for nested navigation
  const pathParts = tableName.split('.');

  // Navigate to the target array
  let targetArray = data;
  for (const part of pathParts) {
    if (!targetArray || !Array.isArray(targetArray[part])) {
      console.warn(`${part} is not an array in the data structure`);
      return null;
    }
    targetArray = targetArray[part];
  }

  // If no condition, return all items
  if (!condition) {
    return targetArray;
  }

  // Filter items that match ALL conditions (AND logic)
  const matchingItems = targetArray.filter((item) => {
    return Object.keys(condition).every((key) => item[key] === condition[key]);
  });

  // Return single item if only one match, array if multiple, null if none
  if (matchingItems.length === 0) return null;
  if (matchingItems.length === 1) return matchingItems[0];
  return matchingItems;
};

/**
 * Update data in a specific table (array) with optional AND conditions
 * Supports nested paths using dot notation (e.g., 'product_customizations.product_customization_images')
 * @param {object} data - The data object to update
 * @param {string} tableName - Name of the table/array to update, or 'root' for root fields. Use dot notation for nested arrays.
 * @param {object} dataObject - Object containing fields to update
 * @param {object} [condition] - Optional AND conditions to filter items (e.g., { id: 'xxx', type: 'abc' })
 * @returns {object} Updated data object
 */
export const updateTable = (data, tableName, dataObject, condition = null) => {
  // Handle 'root' explicitly for updating root-level fields
  if (tableName === 'root') {
    return {
      ...data,
      ...dataObject,
    };
  }

  // Split path for nested navigation
  const pathParts = tableName.split('.');

  // Handle simple (non-nested) path
  if (pathParts.length === 1) {
    // If tableName is not an array field, update root level fields
    if (!Array.isArray(data[tableName])) {
      return {
        ...data,
        ...dataObject,
      };
    }

    // If no condition, cannot update - use addToTable instead
    if (!condition) {
      console.warn(
        `No condition provided for updating ${tableName}. Use addToTable to add new items.`,
      );
      return data;
    }

    // Update items that match ALL conditions (AND logic)
    const updatedArray = data[tableName].map((item) => {
      // Check if item matches ALL conditions
      const matches = Object.keys(condition).every(
        (key) => item[key] === condition[key],
      );

      if (matches) {
        return { ...item, ...dataObject };
      }
      return item;
    });

    return {
      ...data,
      [tableName]: updatedArray,
    };
  }

  // Handle nested path
  if (!condition) {
    console.warn(
      `No condition provided for updating nested path ${tableName}. Condition is required for nested updates.`,
    );
    return data;
  }

  // Define operation to update matching items
  const operation = (arr) =>
    arr.map((item) => {
      const matches = Object.keys(condition).every(
        (key) => item[key] === condition[key],
      );
      if (matches) {
        return { ...item, ...dataObject };
      }
      return item;
    });

  return navigateAndUpdate(data, pathParts, operation);
};

/**
 * Remove items from a specific table (array) based on AND conditions
 * Supports nested paths using dot notation (e.g., 'product_customizations.product_customization_images')
 * @param {object} data - The data object to update
 * @param {string} tableName - Name of the table/array to remove from. Use dot notation for nested arrays.
 * @param {object} condition - AND conditions to filter items to remove (e.g., { id: 'xxx', type: 'abc' })
 * @returns {object} Updated data object
 */
export const removeFromTable = (data, tableName, condition) => {
  // Split path for nested navigation
  const pathParts = tableName.split('.');

  // Handle simple (non-nested) path
  if (pathParts.length === 1) {
    if (!Array.isArray(data[tableName])) {
      console.warn(`${tableName} is not an array in data`);
      return data;
    }

    // Filter out items that match ALL conditions (AND logic)
    const filteredArray = data[tableName].filter((item) => {
      const matches = Object.keys(condition).every(
        (key) => item[key] === condition[key],
      );
      // Keep items that DON'T match (remove those that do)
      return !matches;
    });

    return {
      ...data,
      [tableName]: filteredArray,
    };
  }

  // Handle nested path
  const operation = (arr) =>
    arr.filter((item) => {
      const matches = Object.keys(condition).every(
        (key) => item[key] === condition[key],
      );
      return !matches;
    });

  return navigateAndUpdate(data, pathParts, operation);
};
