import type { TomlArray, TomlTable, TomlValue } from "./types.ts";

export function parseTomlDocument(text: string): TomlTable {
  const root: TomlTable = {};
  let currentTable = root;
  const lines = text.replace(/\r\n/g, "\n").split("\n");

  lines.forEach((rawLine, lineIndex) => {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) {
      return;
    }

    if (line.startsWith("[") && line.endsWith("]")) {
      const tablePath = line.slice(1, -1).trim();
      if (!tablePath) {
        throw new Error(`Invalid TOML table declaration on line ${lineIndex + 1}.`);
      }
      currentTable = ensureTable(root, tablePath.split("."), lineIndex + 1);
      return;
    }

    const separatorIndex = line.indexOf("=");
    if (separatorIndex === -1) {
      throw new Error(`Invalid TOML assignment on line ${lineIndex + 1}.`);
    }

    const key = line.slice(0, separatorIndex).trim();
    const valueText = line.slice(separatorIndex + 1).trim();
    if (!key) {
      throw new Error(`Missing key on line ${lineIndex + 1}.`);
    }

    currentTable[key] = parseTomlValue(valueText, lineIndex + 1);
  });

  return root;
}

export function renderTomlString(value: string): string {
  const escaped = value.replaceAll("\\", "\\\\").replaceAll('"', '\\"');
  return `"${escaped}"`;
}

export function renderTomlValue(value: TomlValue): string {
  if (typeof value === "boolean") {
    return value ? "true" : "false";
  }

  if (typeof value === "number") {
    return String(value);
  }

  if (typeof value === "string") {
    return renderTomlString(value);
  }

  if (Array.isArray(value)) {
    return renderTomlArray(value);
  }

  throw new Error("Nested TOML tables must be rendered by section.");
}

export function renderTomlArray(values: readonly TomlValue[]): string {
  return `[${values.map((value) => renderTomlValue(value)).join(", ")}]`;
}

function ensureTable(root: TomlTable, pathSegments: string[], lineNumber: number): TomlTable {
  let currentTable = root;

  for (const segment of pathSegments) {
    if (!segment) {
      throw new Error(`Invalid TOML table path on line ${lineNumber}.`);
    }

    const currentValue = currentTable[segment];
    if (currentValue === undefined) {
      const nextTable: TomlTable = {};
      currentTable[segment] = nextTable;
      currentTable = nextTable;
      continue;
    }

    if (!isTomlTable(currentValue)) {
      throw new Error(
        `Cannot redefine non-table value as table on line ${lineNumber}.`,
      );
    }
    currentTable = currentValue;
  }

  return currentTable;
}

function parseTomlValue(valueText: string, lineNumber: number): TomlValue {
  if (valueText.startsWith('"') && valueText.endsWith('"')) {
    return valueText
      .slice(1, -1)
      .replaceAll('\\"', '"')
      .replaceAll("\\\\", "\\");
  }

  if (valueText === "true" || valueText === "false") {
    return valueText === "true";
  }

  if (/^-?\d+$/.test(valueText)) {
    return Number.parseInt(valueText, 10);
  }

  if (valueText.startsWith("[") && valueText.endsWith("]")) {
    return parseTomlArray(valueText, lineNumber);
  }

  throw new Error(`Unsupported TOML value on line ${lineNumber}: ${valueText}`);
}

function parseTomlArray(valueText: string, lineNumber: number): TomlArray {
  const innerValue = valueText.slice(1, -1).trim();
  if (!innerValue) {
    return [];
  }

  const items: string[] = [];
  let currentItem = "";
  let inString = false;
  let escaped = false;

  for (const character of innerValue) {
    if (escaped) {
      currentItem += character;
      escaped = false;
      continue;
    }

    if (character === "\\") {
      currentItem += character;
      escaped = true;
      continue;
    }

    if (character === '"') {
      currentItem += character;
      inString = !inString;
      continue;
    }

    if (character === "," && !inString) {
      items.push(currentItem.trim());
      currentItem = "";
      continue;
    }

    currentItem += character;
  }

  if (inString) {
    throw new Error(`Unterminated TOML string in array on line ${lineNumber}.`);
  }

  items.push(currentItem.trim());
  return items.map((item) => parseTomlValue(item, lineNumber));
}

function isTomlTable(value: TomlValue): value is TomlTable {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
