/**
 * Utility for consistent debug logging
 * Only logs when in development mode (Vite/React)
 */

// Check if we are in development mode
// import.meta.env.DEV is standard in Vite
const IS_DEV = typeof import.meta !== 'undefined' && import.meta.env 
  ? import.meta.env.DEV 
  : process.env.NODE_ENV === 'development';

// In-memory log history storage
const MAX_LOGS = 1000;
const logHistory = [];

/**
 * Logs a debug message to the console with a timestamp and component tag.
 * Only outputs logs when in development environment.
 * Also saves logs to memory for export.
 * 
 * @param {string} tag - The name of the component or module emitting the log
 * @param {string} message - The message to log
 * @param {any} [data] - Optional data object to inspect
 * @param {'log'|'warn'|'error'|'info'} [level='log'] - Console level to use
 */
export const debugLog = (tag, message, data, level = 'log') => {
  if (!IS_DEV) return;

  const timestamp = new Date().toLocaleTimeString();
  const isoTimestamp = new Date().toISOString();
  const prefix = `[${timestamp}] [${tag}] ${message}`;
  const logFn = console[level] || console.log;

  // Add to in-memory history
  try {
    const logEntry = {
      timestamp: isoTimestamp,
      tag,
      message,
      level,
      // Safely stringify data for storage to avoid reference issues or circular structures later
      data: data !== undefined ? JSON.parse(JSON.stringify(data, getCircularReplacer())) : undefined
    };
    
    logHistory.push(logEntry);
    if (logHistory.length > MAX_LOGS) {
      logHistory.shift();
    }
  } catch (err) {
    console.warn('Failed to store log in history', err);
  }

  // If data is provided, log it nicely
  if (data !== undefined) {
    // Check if we can use grouping for cleaner output in browser console
    if (typeof console.groupCollapsed === 'function') {
      console.groupCollapsed(prefix);
      logFn(data);
      console.trace('Stack trace'); // Optional: helps find where the log came from
      console.groupEnd();
    } else {
      logFn(prefix, data);
    }
  } else {
    logFn(prefix);
  }
};

/**
 * Downloads the accumulated logs as a text file.
 * Useful for sharing debug info with AI assistants.
 */
export const downloadLogs = () => {
  if (logHistory.length === 0) {
    console.warn('No logs to download.');
    return;
  }

  const logContent = logHistory.map(entry => {
    let entryStr = `[${entry.timestamp}] [${entry.level.toUpperCase()}] [${entry.tag}] ${entry.message}`;
    if (entry.data !== undefined) {
      entryStr += `\nData:\n${JSON.stringify(entry.data, null, 2)}`;
    }
    return entryStr;
  }).join('\n\n----------------------------------------\n\n');

  const blob = new Blob([logContent], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `debug_logs_${new Date().toISOString().replace(/[:.]/g, '-')}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  console.log(`Downloaded ${logHistory.length} logs.`);
};

// Helper to handle circular references in JSON
const getCircularReplacer = () => {
  const seen = new WeakSet();
  return (key, value) => {
    if (typeof value === "object" && value !== null) {
      if (seen.has(value)) {
        return "[Circular]";
      }
      seen.add(value);
    }
    return value;
  };
};

// Expose download function to the window object for easy access from console
if (typeof window !== 'undefined') {
  window.downloadDebugLogs = downloadLogs;
  console.log('Debug logging enabled. Run window.downloadDebugLogs() to save logs to a file.');
}
