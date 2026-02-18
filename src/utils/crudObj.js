import { v4 as uuidv4 } from 'uuid';

/**
 * Helper function to navigate nested paths and apply an operation
 * @param {object} data - The data object to navigate
 * @param {string[]} pathParts - Array of path parts (e.g., ['product_customizations', 'product_customization_images'])
 * @param {function} operation - Function to apply at the target array (receives array, returns new array)
 * @param {number} depth - Current depth in recursion
 * @returns {object} Updated data object
 */
/**
 * Add new data to a specific table (array)
 * Automatically generates an ID if not provided
 * @param {object} data - The data object to update
 * @param {string} tableName - Name of the table/array to add to
 * @param {object} dataObject - Object containing fields to add
 * @returns {object} Updated data object
 */
export const addToTable = (data, tableName, dataObject) => {
  // Auto-generate ID if not provided
  const newItem = {
    ...dataObject,
    id: dataObject.id || uuidv4(),
  };

  if (!Array.isArray(data[tableName])) {
    console.warn(`${tableName} is not an array in data`);
    return data;
  }

  return {
    ...data,
    [tableName]: [...data[tableName], newItem],
  };
};

/**
 * Read/find items from a specific table (array) based on AND conditions
 * @param {object} data - The data object to read from
 * @param {string} tableName - Name of the table/array to read from, or 'root' to return root data
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

  // Check if current part exists and is an array
  if (!data || !Array.isArray(data[tableName])) {
    console.warn(`${tableName} is not an array in the data structure`);
    return null;
  }

  const targetArray = data[tableName];

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
 * @param {object} data - The data object to update
 * @param {string} tableName - Name of the table/array to update, or 'root' for root fields
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
      `No condition provided for updating ${tableName}. Condition is required for updates.`,
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
};

/**
 * Remove items from a specific table (array) based on AND conditions
 * @param {object} data - The data object to update
 * @param {string} tableName - Name of the table/array to remove from
 * @param {object} condition - AND conditions to filter items to remove (e.g., { id: 'xxx', type: 'abc' })
 * @returns {object} Updated data object
 */
export const removeFromTable = (data, tableName, condition) => {
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
};

/**
 * Recursively upsert items in a nested data structure
 * Processes arrays at any depth, upserting items based on their IDs
 * @param {object} data - The root data object
 * @param {object} nestedStructure - The nested structure to upsert (e.g., { product_customizations: [...] })
 * @returns {object} Updated data object
 *
 * Example usage:
 * upsertNestedData(pageData, {
 *   product_customizations: [
 *     {
 *       id: "1234",
 *       name: "testing changed",
 *       product_customization_images: [
 *         {
 *           id: "8798s7987s8df",
 *           customization_id: "sfa84ds5a4sd",
 *           image_name: "image22.png",
 *           image_url: "http://abc.com",
 *           display_order: 2
 *         }
 *       ]
 *     }
 *   ]
 * })
 */
export const upsertNestedData = (data, nestedStructure) => {
  let updatedData = { ...data };

  // Process each top-level key in the nested structure
  for (const [tableName, items] of Object.entries(nestedStructure)) {
    // If the value is not an array, treat it as a direct update
    // This allows mixed updates of direct fields and nested arrays
    if (!Array.isArray(items)) {
      updatedData[tableName] = items;
      continue;
    }

    // Ensure the table exists in data
    if (!Array.isArray(updatedData[tableName])) {
      console.warn(
        `${tableName} is not an array in data, initializing as empty array`,
      );
      updatedData[tableName] = [];
    }

    // Process each item in the array
    items.forEach((item) => {
      updatedData = upsertNestedItem(updatedData, tableName, item);
    });
  }

  return updatedData;
};

/**
 * Helper function to upsert a single item with nested children
 * @param {object} data - The root data object
 * @param {string} tableName - The table to upsert into
 * @param {object} item - The item to upsert (may contain nested arrays)
 * @returns {object} Updated data object
 */
const upsertNestedItem = (data, tableName, item) => {
  let updatedData = { ...data };

  // Handle deletion of top-level item
  if (item._delete === true) {
    if (!item.id) {
      console.warn('Delete operation requires an id field');
      return updatedData;
    }

    const index = updatedData[tableName].findIndex(
      (existingItem) => existingItem.id === item.id,
    );

    if (index !== -1) {
      updatedData[tableName] = [
        ...updatedData[tableName].slice(0, index),
        ...updatedData[tableName].slice(index + 1),
      ];
    }
    return updatedData;
  }

  // Separate the item's direct fields from nested arrays
  const { ...directFields } = item;
  const nestedArrays = {};
  const itemFields = {};

  // Identify nested arrays vs direct fields
  for (const [key, value] of Object.entries(directFields)) {
    if (Array.isArray(value)) {
      nestedArrays[key] = value;
    } else {
      itemFields[key] = value;
    }
  }

  // Auto-generate ID if not provided
  if (!itemFields.id) {
    itemFields.id = uuidv4();
  }

  // Find existing item
  const existingItemIndex = data[tableName].findIndex(
    (existingItem) => existingItem.id === itemFields.id,
  );

  if (existingItemIndex !== -1) {
    // Update existing item - merge direct fields only
    const existingItem = data[tableName][existingItemIndex];
    const mergedItem = { ...existingItem, ...itemFields };

    // Process nested arrays recursively
    for (const [nestedKey, nestedItems] of Object.entries(nestedArrays)) {
      // Ensure nested array exists in the item
      if (!Array.isArray(mergedItem[nestedKey])) {
        mergedItem[nestedKey] = [];
      } else {
        // Clone array to prevent mutation of the original data in products
        mergedItem[nestedKey] = [...mergedItem[nestedKey]];
      }

      // Process each nested item
      nestedItems.forEach((nestedItem) => {
        // Auto-generate ID for nested item if not provided
        if (!nestedItem.id) {
          nestedItem.id = uuidv4();
        }

        const nestedItemIndex = mergedItem[nestedKey].findIndex(
          (existing) => existing.id === nestedItem.id,
        );

        if (nestedItem._delete === true) {
          // Handle deletion of nested item
          if (nestedItemIndex !== -1) {
            mergedItem[nestedKey].splice(nestedItemIndex, 1);
          }
        } else {
          if (nestedItemIndex !== -1) {
            // Update existing nested item
            mergedItem[nestedKey][nestedItemIndex] = {
              ...mergedItem[nestedKey][nestedItemIndex],
              ...nestedItem,
            };
          } else {
            // Add new nested item
            mergedItem[nestedKey].push(nestedItem);
          }
        }
      });
    }

    // Update the item in the array
    updatedData[tableName] = [
      ...data[tableName].slice(0, existingItemIndex),
      mergedItem,
      ...data[tableName].slice(existingItemIndex + 1),
    ];
  } else {
    // Add new item
    const newItem = { ...itemFields };

    // Process nested arrays for new item
    for (const [nestedKey, nestedItems] of Object.entries(nestedArrays)) {
      // Filter out items marked for deletion immediately for new items
      const validItems = nestedItems.filter((i) => i._delete !== true);

      newItem[nestedKey] = validItems.map((nestedItem) => ({
        ...nestedItem,
        id: nestedItem.id || uuidv4(),
      }));
    }

    updatedData[tableName] = [...data[tableName], newItem];
  }

  return updatedData;
};
