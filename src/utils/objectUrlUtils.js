/**
 * Revoke object URLs to free memory
 * @param {string[]} urls - Array of object URLs to revoke
 */
export const releaseObjectUrls = (urls) => {
  urls.forEach((url) => {
    try {
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to revoke object URL', error);
    }
  });
};

/**
 * Convert base64 data URI to blob object URL
 * @param {string} dataUri - Base64 data URI string
 * @param {string[]} urlRegistry - Array to track created URLs for cleanup
 * @returns {Object|null} Object containing url, size, type or null if conversion failed
 */
export const dataUriToObjectUrl = (dataUri, urlRegistry = []) => {
  // Validate input: ensure it's a string and starts with 'data:' scheme
  if (typeof dataUri !== 'string' || !dataUri.startsWith('data:')) {
    return null;
  }

  // Split data URI into metadata (e.g., 'data:image/png;base64') and the actual base64 payload
  const [metadata, base64Payload] = dataUri.split(',');
  // Validate that both parts exist
  if (!metadata || !base64Payload) {
    return null;
  }

  try {
    // Extract MIME type from metadata using regex (e.g., 'image/png' from 'data:image/png;base64')
    const mimeMatch = metadata.match(/data:(.*);base64/);
    // Use extracted MIME type, or default to 'application/octet-stream' if not found
    const mimeType = mimeMatch ? mimeMatch[1] : 'application/octet-stream';

    // Decode base64 string into binary string using browser's atob function
    const binaryString = window.atob(base64Payload);

    // Get the length of the binary string for creating typed array
    const binaryLength = binaryString.length;

    // Create a typed array (Uint8Array) to hold the binary data
    const bytes = new Uint8Array(binaryLength);

    // Convert each character in binary string to its byte value
    for (let index = 0; index < binaryLength; index += 1) {
      bytes[index] = binaryString.charCodeAt(index);
    }

    // Create a Blob object from the byte array with the proper MIME type
    const blob = new Blob([bytes], { type: mimeType });

    // Create an object URL that points to the Blob in memory
    const objectUrl = URL.createObjectURL(blob);

    // Track the created URL in the registry for later cleanup
    urlRegistry.push(objectUrl);

    // Return the object URL and size
    return {
      url: objectUrl,
      size: binaryLength,
      type: mimeType,
    };
  } catch (error) {
    // Log any errors during conversion and return null
    console.error('Failed to convert base64 payload', error);
    return null;
  }
};

/**
 * Convert blob/file object to base64 data URI
 * @param {Blob|File} blob - Blob or File object to convert
 * @returns {Promise<string>} Promise that resolves to base64 data URI string
 */
export const objectUrlToDataUri = (blob) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve(reader.result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

/**
 * Apply base64 config to a single node
 * @param {Object} node - Node to process
 * @param {string} configKey - Key to lookup in config
 * @param {Object} config - Configuration mapping
 * @param {string[]} urlRegistry - Array to track created URLs
 * @returns {Object} Processed node with object URLs
 */
const applyBase64Config = (node, configKey, config, urlRegistry) => {
  if (!node || typeof node !== 'object') {
    return node;
  }

  const configEntry = config[configKey];
  if (!configEntry) {
    return node;
  }

  const base64Value = node[configEntry.base64];
  if (typeof base64Value !== 'string') {
    return node;
  }

  const {
    url: objectUrl,
    size,
    type,
  } = dataUriToObjectUrl(base64Value, urlRegistry) || {};

  if (!objectUrl) {
    return node;
  }

  return {
    ...node,
    [configEntry.url]: objectUrl,
    _file_size: size,
    _file_type: type,
  };
};

/**
 * Recursively process nodes and convert base64 to object URLs
 * @param {Object|Array} node - Node or array to process
 * @param {string} configKey - Current config key
 * @param {Object} config - Configuration mapping
 * @param {string[]} urlRegistry - Array to track created URLs
 * @returns {Object|Array} Processed node/array with object URLs
 */
export const recursiveProcess_base64_to_objectUrl = (
  node,
  configKey,
  config,
  urlRegistry = [],
) => {
  if (Array.isArray(node)) {
    return node.map((child) =>
      recursiveProcess_base64_to_objectUrl(
        child,
        configKey,
        config,
        urlRegistry,
      ),
    );
  }

  if (!node || typeof node !== 'object') {
    return node;
  }

  let processedNode = applyBase64Config(node, configKey, config, urlRegistry);

  processedNode = Object.entries(processedNode).reduce(
    (accumulator, [childKey, value]) => {
      if (Array.isArray(value)) {
        const processedArray = value.map((item) =>
          recursiveProcess_base64_to_objectUrl(
            item,
            childKey,
            config,
            urlRegistry,
          ),
        );
        return {
          ...accumulator,
          [childKey]: processedArray,
        };
      }

      // Only process objects if they correspond to a key in our config or if we want deep traversal
      // To prevent infinite recursion and processing unnecessary objects, we can check if the key is potentially relevant
      // or strictly rely on the config structure.
      // For now, let's just make sure we don't process nulls or non-objects (already checked above)
      // AND importantly, don't re-process the key we just added (the URL key).
      // But the URL key value is string, so it won't pass typeof === object.

      // The real issue might be cyclic references or just deep structures.
      // Let's add a check to only recurse if the value is an array or a plain object.
      if (value && typeof value === 'object' && value.constructor === Object) {
        return {
          ...accumulator,
          [childKey]: recursiveProcess_base64_to_objectUrl(
            value,
            childKey,
            config,
            urlRegistry,
          ),
        };
      }

      return {
        ...accumulator,
        [childKey]: value,
      };
    },
    { ...processedNode },
  );

  return processedNode;
};

/**
 * Get file size (and type) from a blob URL.
 * Fetches the blob data from the URL to determine properties.
 *
 * @param {string} blobUrl - The object URL to inspect (e.g. blob:http://localhost...)
 * @returns {Promise<{size: number, type: string}>} Promise resolving to object with size in bytes and MIME type.
 *                                                  Returns {size: 0, type: ''} on error.
 */
export const getBlobInfoFromUrl = async (blobUrl) => {
  if (!blobUrl) return { size: 0, type: '' };

  try {
    const response = await fetch(blobUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch blob: ${response.statusText}`);
    }
    const blob = await response.blob();
    return {
      size: blob.size,
      type: blob.type,
    };
  } catch (error) {
    console.warn(`Error getting blob info for ${blobUrl}:`, error);
    return { size: 0, type: '' };
  }
};

/**
 * Recursively process changes object and convert blob URLs to base64 strings
 * based on the provided configuration.
 * @param {Object} data - The changes object or nested object
 * @param {Object} config - Configuration mapping table names to url/base64 keys
 * @returns {Promise<Object>} Processed object with base64 strings
 */
export const processChangesWithBase64 = async (data, config) => {
  // If data is array, process each item
  if (Array.isArray(data)) {
    return Promise.all(
      data.map((item) => processChangesWithBase64(item, config)),
    );
  }

  // If data is primitive or null, return as is
  if (!data || typeof data !== 'object') {
    return data;
  }

  // Process object
  const processed = { ...data };

  // Iterate over all keys in the object
  for (const key of Object.keys(processed)) {
    const value = processed[key];

    // If the key matches a configured table (e.g., 'products', 'product_images')
    if (config[key]) {
      // It must be an array of records for that table
      if (Array.isArray(value)) {
        const tableConfig = config[key];
        processed[key] = await Promise.all(
          value.map(async (item) => {
            let itemProcessed = { ...item };

            // 1. Check if this record has a field configured as a URL
            if (
              tableConfig.url &&
              itemProcessed[tableConfig.url] &&
              typeof itemProcessed[tableConfig.url] === 'string' &&
              itemProcessed[tableConfig.url].startsWith('blob:')
            ) {
              try {
                const blobUrl = itemProcessed[tableConfig.url];
                const response = await fetch(blobUrl);
                const blob = await response.blob();
                const base64 = await objectUrlToDataUri(blob);
                // Remove the data URL prefix (e.g. "data:image/png;base64,") if needed??
                // No, usually "data:..." is kept.
                // The user sample shows "data:image/png;base64,..." in base64_image.

                itemProcessed[tableConfig.base64] = base64;
                // Remove the URL field to avoid sending local blob URL to server
                delete itemProcessed[tableConfig.url];

                // Remove _file_size and _file_type unless explicitly requested to keep
                delete itemProcessed._file_size;
                delete itemProcessed._file_type;
              } catch (error) {
                console.error(
                  `Failed to convert blob URL to base64 for ${key}:`,
                  error,
                );
              }
            }

            // 2. Recursively process looking for nested tables
            return processChangesWithBase64(itemProcessed, config);
          }),
        );
      } else {
        // If not an array but matches config key? Should be array usually.
        // Recurse anyway just in case structure differs.
        processed[key] = await processChangesWithBase64(value, config);
      }
    } else {
      // Key is not a table name, so just recurse into value if it's an object/array
      processed[key] = await processChangesWithBase64(value, config);
    }
  }

  return processed;
};
