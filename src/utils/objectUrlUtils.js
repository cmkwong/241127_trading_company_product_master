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
 * @returns {string|null} Object URL or null if conversion failed
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

    // Return the object URL (e.g., 'blob:https://example.com/uuid')
    return objectUrl;
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

  const objectUrl = dataUriToObjectUrl(base64Value, urlRegistry);
  if (!objectUrl) {
    return node;
  }

  return {
    ...node,
    [configEntry.url]: objectUrl,
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

      if (value && typeof value === 'object') {
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
