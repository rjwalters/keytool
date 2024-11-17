/**
 * String validation and manipulation utilities
 */

// Types for validation functions
type ValidationFn = (value: string) => boolean;

/**
 * Validates an email address
 * @example isEmail("user@example.com") // true
 */
export const isEmail: ValidationFn = (value: string): boolean => {
  if (!value?.trim()) return false;
  return !!value
    .trim()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/g,
    );
};

/**
 * Validates a URL with optional protocol
 * @example isUrl("example.com") // true
 */
export const isUrl: ValidationFn = (value: string): boolean => {
  if (!value?.trim()) return false;
  return !!value
    .trim()
    .match(
      /^(?:https?:\/\/)?(?:[\p{L}\p{N}-]+\.)+[\p{L}\p{N}-]+(?:[^\s]*?)$/gu,
    );
};

/**
 * Validates a fully qualified domain name
 * @example isFqdn("example.com") // true
 */
export const isFqdn: ValidationFn = (value: string): boolean => {
  if (!value?.trim()) return false;
  return !!value
    .trim()
    .match(
      /^[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_+.~#?&//=]*)$/g,
    );
};

/**
 * Validates a person's name, including international characters
 * @example isName("John O'Doe") // true
 */
export const isName: ValidationFn = (value: string): boolean => {
  if (!value?.trim()) return false;
  return !!value
    .trim()
    .match(
      /^([a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð'-]+\.?,? ?\xA0?)*[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð'-]+\.?$/gu,
    );
};

/**
 * Validates a Twitter handle
 * @example isTwitterHandle("@username") // true
 */
export const isTwitterHandle: ValidationFn = (value: string): boolean => {
  if (!value?.trim()) return false;
  return !!value.trim().match(/^@?(\w){1,15}$/g);
};

/**
 * Validates a LinkedIn handle
 * @example isLinkedInHandle("john-doe") // true
 */
export const isLinkedInHandle: ValidationFn = (value: string): boolean => {
  if (!value?.trim()) return false;
  return !!value.trim().match(/^[\w\-_À-ÿ%]+$/g);
};

/**
 * Validates a LinkedIn URL
 * @example isLinkedInUrl("https://www.linkedin.com/in/johndoe") // true
 */
export const isLinkedInUrl: ValidationFn = (value: string): boolean => {
  if (!value?.trim()) return false;
  return !!value
    .trim()
    .match(/^https:\/\/www\.linkedin\.com\/[-a-zA-Z0-9()@:%_+.~#?&/=]*$/g);
};

/**
 * Validates a filename
 * @example isValidFilename("document.pdf") // true
 */
export const isValidFilename: ValidationFn = (value: string): boolean => {
  if (!value?.trim()) return false;
  return !!value.match(
    /^(?!(?:CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])$)[^\f\t\n\v\r/\\:*?\"<>|]+[^\f\t\n\v\r/\\:*?\"<>|\ .]$/gi,
  );
};

// Re-export all validation functions as a namespace
export const validate = {
  isEmail,
  isUrl,
  isFqdn,
  isName,
  isTwitterHandle,
  isLinkedInHandle,
  isLinkedInUrl,
  isValidFilename,
};

// Export common regex patterns
export const patterns = {
  email:
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/g,
  simpleEmail: /([\w-\.]+)@([\w-]+\.)+[\w-]{2,4}/,
  url: /^(?:https?:\/\/)?(?:[\p{L}\p{N}-]+\.)+[\p{L}\p{N}-]+(?:[^\s]*?)$/gu,
  fqdn: /^[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_+.~#?&//=]*)$/g,
};

// Export everything as default as well
export default {
  isEmail,
  isUrl,
  isFqdn,
  isName,
  isTwitterHandle,
  isLinkedInHandle,
  isLinkedInUrl,
  isValidFilename,
  validate,
  patterns,
};
