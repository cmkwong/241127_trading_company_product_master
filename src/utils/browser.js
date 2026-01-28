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
  if (typeof dataUri !== 'string' || !dataUri.startsWith('data:')) {
    return null;
  }

  const [metadata, base64Payload] = dataUri.split(',');
  if (!metadata || !base64Payload) {
    return null;
  }

  try {
    const mimeMatch = metadata.match(/data:(.*);base64/);
    const mimeType = mimeMatch ? mimeMatch[1] : 'application/octet-stream';
    const binaryString = window.atob(base64Payload);
    const binaryLength = binaryString.length;
    const bytes = new Uint8Array(binaryLength);
    for (let index = 0; index < binaryLength; index += 1) {
      bytes[index] = binaryString.charCodeAt(index);
    }
    const blob = new Blob([bytes], { type: mimeType });
    const objectUrl = URL.createObjectURL(blob);
    urlRegistry.push(objectUrl);
    return objectUrl;
  } catch (error) {
    console.error('Failed to convert base64 payload', error);
    return null;
  }
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
export const processProductBase64 = (
  node,
  configKey,
  config,
  urlRegistry = [],
) => {
  if (Array.isArray(node)) {
    return node.map((child) =>
      processProductBase64(child, configKey, config, urlRegistry),
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
          processProductBase64(item, childKey, config, urlRegistry),
        );
        return {
          ...accumulator,
          [childKey]: processedArray,
        };
      }

      if (value && typeof value === 'object') {
        return {
          ...accumulator,
          [childKey]: processProductBase64(
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
