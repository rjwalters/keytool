/**
 * String manipulation utility library
 * Provides functions for converting between different string cases and formats
 */

import { isFqdn } from "./regex";

// Types
type StringTransformer = (s: string) => string | undefined;

/**
 * Configuration for string transformations
 */
interface StringConfig {
  minorWords?: Set<string>;
  maxLength?: number;
  preserveCase?: boolean;
}

const DEFAULT_MINOR_WORDS = new Set([
  "a",
  "an",
  "the",
  "and",
  "but",
  "or",
  "for",
  "nor",
  "in",
  "on",
  "at",
  "to",
  "of",
  "up",
  "as",
  "by",
]);

/**
 * Splits a string into tokens based on camelCase, PascalCase, snake_case, and spaces
 */
export function tokenize(s: string): string[] | undefined {
  if (!s?.trim()) {
    console.warn("tokenize() called with empty or invalid string");
    return undefined;
  }

  // Handle camelCase and PascalCase
  const withSpaces = s
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/([A-Z])([A-Z][a-z])/g, "$1 $2");

  // Handle snake_case and multiple spaces
  return withSpaces
    .toLowerCase()
    .split(/[_\s]+/)
    .filter(Boolean); // Remove empty strings
}

/**
 * Converts a string to title case, properly handling edge cases and common exceptions
 */
export function toTitleCase(
  str: string,
  config: StringConfig = { minorWords: DEFAULT_MINOR_WORDS },
): string | undefined {
  if (!str?.trim()) {
    console.warn("toTitleCase() called with empty or invalid string");
    return undefined;
  }

  const words = str.split(/(?<=[-\s])|(?=[-\s])/);
  const minorWords = config.minorWords ?? DEFAULT_MINOR_WORDS;

  return words
    .map((word, index) => {
      const trimmed = word.trim();

      if (!trimmed || word === "-") return word;

      if (index === 0 || index === words.length - 1) {
        return capitalizeWord(trimmed, config.preserveCase);
      }

      return minorWords.has(trimmed.toLowerCase())
        ? trimmed.toLowerCase()
        : capitalizeWord(trimmed, config.preserveCase);
    })
    .join("");
}

/**
 * Converts a string to snake_case
 */
export function toSnakeCase(s: string): string | undefined {
  const tokens = tokenize(s);
  if (!tokens) return undefined;
  return tokens.join("_");
}

/**
 * Converts a string to camelCase
 */
export function toCamelCase(s: string): string | undefined {
  const titleCased = toTitleCase(s);
  if (!titleCased) return undefined;
  return (
    titleCased.charAt(0).toLowerCase() + titleCased.slice(1).replace(/\s+/g, "")
  );
}

/**
 * Converts a string to Title Case with spaces
 */
export function toTitle(s: string): string | undefined {
  const tokens = tokenize(s);
  if (!tokens) return undefined;
  return tokens.map((token) => capitalizeWord(token)).join(" ");
}

/**
 * Replaces regular spaces with non-breaking spaces
 */
export function nbsp(s: string): string | undefined {
  if (!s) {
    console.warn("nbsp() called with empty or invalid string");
    return undefined;
  }
  return s.replace(/[\u0020]/g, "\u00A0");
}

/**
 * Normalizes a URL by adding http:// protocol if missing
 */
export function normalizeUrl(s: string): string | undefined {
  if (!s?.trim()) {
    console.warn("normalizeUrl() called with empty or invalid string");
    return undefined;
  }

  const trimmed = s.trim();
  return isFqdn(trimmed) ? `http://${trimmed}` : trimmed;
}

/**
 * Truncates a title to a maximum length, preserving whole words
 */
export function truncateTitle(
  title: string,
  maxLength: number = 50,
  suffix: string = "...",
): string {
  if (!title || maxLength <= 0) return "";
  if (title.length <= maxLength) return title;

  const words = title.split(/\s+/);
  let result = "";

  for (const word of words) {
    const nextLength = result.length + word.length + 1; // +1 for space
    if (nextLength > maxLength - suffix.length) {
      return result.trim() + suffix;
    }
    result += word + " ";
  }

  return result.trim();
}

/**
 * Helper function to capitalize a word
 */
function capitalizeWord(word: string, preserveCase: boolean = false): string {
  if (!word) return word;
  if (preserveCase) {
    return word.charAt(0).toUpperCase() + word.slice(1);
  }
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}
