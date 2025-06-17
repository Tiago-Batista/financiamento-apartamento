// Utility functions for string manipulation

/**
 * Sanitizes a string to be safe for use as a filename.
 * Removes or replaces characters that are typically invalid in filenames
 * across common operating systems (Windows, macOS, Linux).
 * Also limits the length of the sanitized string.
 *
 * @param input The string to sanitize.
 * @param maxLength The maximum allowed length for the sanitized string (excluding extension). Default is 50.
 * @returns A sanitized string suitable for use in a filename.
 */
export const sanitizeFilename = (input: string | undefined, maxLength: number = 50): string => {
  if (!input) {
    return "Desconhecido";
  }

  // Remove leading/trailing whitespace
  let sanitized = input.trim();

  // Replace invalid characters with an underscore or remove them
  // Invalid chars: / \ : * ? " < > |
  // Also, control characters (ASCII 0-31) can be problematic.
  sanitized = sanitized.replace(/[\\/:*?"<>|\x00-\x1F]/g, '_');

  // Replace multiple underscores or spaces with a single underscore
  sanitized = sanitized.replace(/\s+/g, '_').replace(/__+/g, '_');
  
  // Remove leading/trailing underscores that might result from replacements
  sanitized = sanitized.replace(/^_+|_+$/g, '');

  // Truncate to maxLength if necessary
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
    // Ensure it doesn't end with an underscore after truncation if the original wasn't all underscores
    sanitized = sanitized.replace(/_+$/g, ''); 
  }
  
  // If, after all, the string is empty or only underscores (e.g., input was just "///"), return a default
  if (!sanitized || /^_+$/.test(sanitized)) {
    return "NomeInvalido";
  }

  return sanitized;
};

/**
 * Formats a date string or Date object into YYYY-MM-DD format.
 * Attempts to parse various common date formats.
 * @param dateInput The date string (e.g., "2023-10-25", "25/10/2023") or Date object.
 * @returns A string in YYYY-MM-DD format, or null if parsing fails.
 */
export const formatDateForFilename = (dateInput: string | Date | undefined): string | null => {
  if (!dateInput) return null;

  let dateObj: Date;

  if (dateInput instanceof Date) {
    dateObj = dateInput;
  } else {
    // Try to parse common formats
    // ISO format (YYYY-MM-DD) or with time
    if (/^\d{4}-\d{2}-\d{2}/.test(dateInput)) {
      dateObj = new Date(dateInput.split('T')[0] + 'T00:00:00'); // Normalize to local midnight
    } 
    // Brazilian format (DD/MM/YYYY)
    else if (/^\d{2}\/\d{2}\/\d{4}/.test(dateInput)) {
      const parts = dateInput.split('/');
      dateObj = new Date(parseInt(parts[2], 10), parseInt(parts[1], 10) - 1, parseInt(parts[0], 10));
    } 
    // Potentially other formats, or rely on Date constructor's flexibility (which can be risky)
    else {
      dateObj = new Date(dateInput);
    }
  }

  if (isNaN(dateObj.getTime())) {
    return null; // Invalid date
  }

  const year = dateObj.getFullYear();
  const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
  const day = dateObj.getDate().toString().padStart(2, '0');

  return `${year}-${month}-${day}`;
};
