import { existsSync, readFileSync, statSync } from "node:fs";
import { dirname, isAbsolute, resolve } from "node:path";
import {
  BUILTIN_RUNNER_TYPE,
  REQUIRED_ARTIFACT_DEFAULT_FIELDS,
  REQUIRED_DOCTOR_CHECK_FIELDS,
  REQUIRED_PACKAGING_DEFAULT_FIELDS,
  REQUIRED_RUNNER_FIELDS,
  REQUIRED_SHARED_ASSET_FIELDS,
  REQUIRED_VERIFICATION_DEFAULT_FIELDS,
  REQUIRED_WORKSPACE_FIELDS,
  SUPPORTED_PROJECT_KINDS,
  SUPPORTED_SCHEMA_VERSION,
  WORKSPACE_MANIFEST_FILENAME,
} from "./constants.ts";
import { ManifestValidationError, WorkspaceNotFoundError } from "./errors.ts";
import {
  parseTomlDocument,
  renderTomlArray,
  renderTomlString,
  renderTomlValue,
} from "./toml.ts";
import type { RunnerRegistration, TomlTable, TomlValue, WorkspaceManifest } from "./types.ts";

const supportedProjectKinds = new Set<string>(SUPPORTED_PROJECT_KINDS);

export function findWorkspaceRoot(startPath: string): string {
  const startingPoint = resolve(startPath);
  let currentDirectory = startingPoint;

  if (existsSync(startingPoint) && statSync(startingPoint).isFile()) {
    currentDirectory = dirname(startingPoint);
  }

  while (true) {
    const manifestPath = resolve(currentDirectory, WORKSPACE_MANIFEST_FILENAME);
    if (existsSync(manifestPath) && statSync(manifestPath).isFile()) {
      return currentDirectory;
    }

    const parentDirectory = dirname(currentDirectory);
    if (parentDirectory === currentDirectory) {
      break;
    }
    currentDirectory = parentDirectory;
  }

  throw new WorkspaceNotFoundError(
    `Could not find ${WORKSPACE_MANIFEST_FILENAME} from ${startingPoint}.`,
  );
}

export function loadWorkspaceManifest(workspaceRoot: string): WorkspaceManifest {
  const manifestPath = resolve(workspaceRoot, WORKSPACE_MANIFEST_FILENAME);
  if (!existsSync(manifestPath)) {
    throw new WorkspaceNotFoundError(
      `Could not find ${WORKSPACE_MANIFEST_FILENAME} at ${workspaceRoot}.`,
    );
  }

  try {
    const manifestText = readFileSync(manifestPath, "utf8");
    return validateWorkspaceManifest(parseTomlDocument(manifestText));
  } catch (error) {
    if (error instanceof WorkspaceNotFoundError || error instanceof ManifestValidationError) {
      throw error;
    }

    const message = error instanceof Error ? error.message : String(error);
    throw new ManifestValidationError([
      `${WORKSPACE_MANIFEST_FILENAME} could not be loaded: ${message}`,
    ]);
  }
}

export function buildDefaultManifest(options: {
  workspaceName: string;
  workspaceDescription: string;
}): WorkspaceManifest {
  return {
    schemaVersion: SUPPORTED_SCHEMA_VERSION,
    workspaceName: options.workspaceName,
    workspaceDescription: options.workspaceDescription,
    projectRoots: ["projects"],
    defaultRunner: "codex",
    runners: {
      codex: {
        name: "codex",
        runnerType: BUILTIN_RUNNER_TYPE,
        displayName: "CodexRunner",
        supportedKinds: [...SUPPORTED_PROJECT_KINDS],
        requiredCommands: [],
        extraConfig: {},
      },
    },
    sharedAssets: {
      agents_file: "AGENTS.md",
      agent_memory: ".agents/SNAPSHOT.md",
      agent_rules_dir: ".agents/rules",
      agent_skills_dir: ".agents/skills",
      workspace_skills_dir: "skills",
      workspace_scripts_dir: "scripts",
      workspace_tests_dir: "tests",
    },
    verificationDefaults: {
      smoke_mode: "preflight-first",
      require_clean_doctor: true,
    },
    artifactDefaults: {
      human_summary_required: true,
      retention_policy: "workspace_defined",
    },
    packagingDefaults: {
      package_format: "oci",
      packaging_mode: "project_kind_dependent",
    },
    doctorChecks: {
      validate_shared_assets: true,
      validate_project_roots: true,
      validate_runner_registration: true,
    },
  };
}

export function renderWorkspaceManifest(manifest: WorkspaceManifest): string {
  const lines: string[] = [
    `schema_version = ${renderTomlString(manifest.schemaVersion)}`,
    `workspace_name = ${renderTomlString(manifest.workspaceName)}`,
    `workspace_description = ${renderTomlString(manifest.workspaceDescription)}`,
    `project_roots = ${renderTomlArray(manifest.projectRoots)}`,
    `default_runner = ${renderTomlString(manifest.defaultRunner)}`,
    "",
    "[shared_assets]",
    ...Object.entries(manifest.sharedAssets).map(
      ([key, value]) => `${key} = ${renderTomlString(value)}`,
    ),
    "",
    "[verification_defaults]",
    ...renderTableValues(manifest.verificationDefaults),
    "",
    "[artifact_defaults]",
    ...renderTableValues(manifest.artifactDefaults),
    "",
    "[packaging_defaults]",
    ...renderTableValues(manifest.packagingDefaults),
    "",
    "[doctor_checks]",
    ...Object.entries(manifest.doctorChecks).map(
      ([key, value]) => `${key} = ${renderTomlValue(value)}`,
    ),
  ];

  for (const [runnerName, runner] of Object.entries(manifest.runners)) {
    lines.push(
      "",
      `[runners.${runnerName}]`,
      `runner_type = ${renderTomlString(runner.runnerType)}`,
      `display_name = ${renderTomlString(runner.displayName)}`,
      `supported_kinds = ${renderTomlArray(runner.supportedKinds)}`,
      `required_commands = ${renderTomlArray(runner.requiredCommands)}`,
    );

    for (const [key, value] of Object.entries(runner.extraConfig)) {
      lines.push(`${key} = ${renderTomlValue(value)}`);
    }
  }

  return `${lines.join("\n")}\n`;
}

export function validateWorkspaceManifest(rawData: TomlTable): WorkspaceManifest {
  const errors: string[] = [];

  for (const fieldName of REQUIRED_WORKSPACE_FIELDS) {
    if (!(fieldName in rawData)) {
      errors.push(
        `${WORKSPACE_MANIFEST_FILENAME} is missing required field '${fieldName}'.`,
      );
    }
  }

  if (errors.length > 0) {
    throw new ManifestValidationError(errors);
  }

  const schemaVersion = asNonEmptyString(
    rawData.schema_version,
    "schema_version",
    errors,
    true,
  );
  const workspaceName = asNonEmptyString(
    rawData.workspace_name,
    "workspace_name",
    errors,
  );
  const workspaceDescription = asNonEmptyString(
    rawData.workspace_description,
    "workspace_description",
    errors,
  );
  const projectRoots = asStringArray(rawData.project_roots, "project_roots", errors);
  const defaultRunner = asNonEmptyString(
    rawData.default_runner,
    "default_runner",
    errors,
  );
  const sharedAssets = asTable(rawData.shared_assets, "shared_assets", errors);
  const runnersTable = asTable(rawData.runners, "runners", errors);
  const verificationDefaults = asTable(
    rawData.verification_defaults,
    "verification_defaults",
    errors,
  );
  const artifactDefaults = asTable(
    rawData.artifact_defaults,
    "artifact_defaults",
    errors,
  );
  const packagingDefaults = asTable(
    rawData.packaging_defaults,
    "packaging_defaults",
    errors,
  );
  const doctorChecks = asBooleanTable(rawData.doctor_checks, "doctor_checks", errors);

  if (schemaVersion !== SUPPORTED_SCHEMA_VERSION) {
    errors.push(
      `schema_version must be '${SUPPORTED_SCHEMA_VERSION}', received '${schemaVersion}'.`,
    );
  }

  const validatedSharedAssets: Record<string, string> = {};
  for (const fieldName of REQUIRED_SHARED_ASSET_FIELDS) {
    validatedSharedAssets[fieldName] = asRelativeString(
      sharedAssets[fieldName],
      `shared_assets.${fieldName}`,
      errors,
    );
  }

  validateRequiredTableFields(
    verificationDefaults,
    REQUIRED_VERIFICATION_DEFAULT_FIELDS,
    "verification_defaults",
    errors,
  );
  validateRequiredTableFields(
    artifactDefaults,
    REQUIRED_ARTIFACT_DEFAULT_FIELDS,
    "artifact_defaults",
    errors,
  );
  validateRequiredTableFields(
    packagingDefaults,
    REQUIRED_PACKAGING_DEFAULT_FIELDS,
    "packaging_defaults",
    errors,
  );
  validateRequiredTableFields(
    doctorChecks,
    REQUIRED_DOCTOR_CHECK_FIELDS,
    "doctor_checks",
    errors,
  );

  const validatedRunners: Record<string, RunnerRegistration> = {};
  const runnerEntries = Object.entries(runnersTable);
  if (runnerEntries.length === 0) {
    errors.push("runners must contain at least one runner registration.");
  }

  for (const [runnerName, runnerValue] of runnerEntries) {
    const runnerTable = asTable(runnerValue, `runners.${runnerName}`, errors);
    validateRequiredTableFields(
      runnerTable,
      REQUIRED_RUNNER_FIELDS,
      `runners.${runnerName}`,
      errors,
    );

    const runnerType = asNonEmptyString(
      runnerTable.runner_type,
      `runners.${runnerName}.runner_type`,
      errors,
    );
    const displayName = asNonEmptyString(
      runnerTable.display_name,
      `runners.${runnerName}.display_name`,
      errors,
    );
    const supportedKinds = asStringArray(
      runnerTable.supported_kinds,
      `runners.${runnerName}.supported_kinds`,
      errors,
    );
    const requiredCommands = asStringArray(
      runnerTable.required_commands,
      `runners.${runnerName}.required_commands`,
      errors,
    );

    for (const kind of supportedKinds) {
      if (!supportedProjectKinds.has(kind)) {
        errors.push(
          `runners.${runnerName}.supported_kinds includes unsupported kind '${kind}'.`,
        );
      }
    }

    const extraConfig: TomlTable = {};
    for (const [key, value] of Object.entries(runnerTable)) {
      if (!REQUIRED_RUNNER_FIELDS.includes(key as (typeof REQUIRED_RUNNER_FIELDS)[number])) {
        extraConfig[key] = value;
      }
    }

    validatedRunners[runnerName] = {
      name: runnerName,
      runnerType,
      displayName,
      supportedKinds,
      requiredCommands,
      extraConfig,
    };
  }

  if (!(defaultRunner in validatedRunners)) {
    errors.push(
      `default_runner '${defaultRunner}' does not match any registered runner.`,
    );
  }

  if (errors.length > 0) {
    throw new ManifestValidationError(errors);
  }

  return {
    schemaVersion,
    workspaceName,
    workspaceDescription,
    projectRoots,
    defaultRunner,
    runners: validatedRunners,
    sharedAssets: validatedSharedAssets,
    verificationDefaults,
    artifactDefaults,
    packagingDefaults,
    doctorChecks,
  };
}

function renderTableValues(table: TomlTable): string[] {
  return Object.entries(table).map(([key, value]) => `${key} = ${renderTomlValue(value)}`);
}

function validateRequiredTableFields(
  table: Record<string, TomlValue> | Record<string, boolean>,
  requiredFields: readonly string[],
  tableName: string,
  errors: string[],
): void {
  for (const fieldName of requiredFields) {
    if (!(fieldName in table)) {
      errors.push(`${tableName} is missing required field '${fieldName}'.`);
    }
  }
}

function asTable(value: TomlValue | undefined, fieldName: string, errors: string[]): TomlTable {
  if (!isPlainTable(value)) {
    errors.push(`${fieldName} must be a TOML table.`);
    return {};
  }
  return value;
}

function asBooleanTable(
  value: TomlValue | undefined,
  fieldName: string,
  errors: string[],
): Record<string, boolean> {
  const table = asTable(value, fieldName, errors);
  const validatedTable: Record<string, boolean> = {};

  for (const [key, childValue] of Object.entries(table)) {
    if (typeof childValue !== "boolean") {
      errors.push(`${fieldName}.${key} must be a boolean.`);
      continue;
    }
    validatedTable[key] = childValue;
  }

  return validatedTable;
}

function asNonEmptyString(
  value: TomlValue | undefined,
  fieldName: string,
  errors: string[],
  allowNumber = false,
): string {
  if (allowNumber && typeof value === "number") {
    return String(value);
  }
  if (typeof value !== "string" || value.trim() === "") {
    errors.push(`${fieldName} must be a non-empty string.`);
    return "";
  }
  return value;
}

function asRelativeString(
  value: TomlValue | undefined,
  fieldName: string,
  errors: string[],
): string {
  const normalizedValue = asNonEmptyString(value, fieldName, errors);
  if (normalizedValue && isAbsolute(normalizedValue)) {
    errors.push(`${fieldName} must use a workspace-relative path.`);
  }
  return normalizedValue;
}

function asStringArray(
  value: TomlValue | undefined,
  fieldName: string,
  errors: string[],
): string[] {
  if (!Array.isArray(value)) {
    errors.push(`${fieldName} must be a list of strings.`);
    return [];
  }

  const validatedItems: string[] = [];
  for (const item of value) {
    if (typeof item !== "string" || item.trim() === "") {
      errors.push(`${fieldName} must contain only non-empty strings.`);
      continue;
    }
    validatedItems.push(item);
  }
  return validatedItems;
}

function isPlainTable(value: TomlValue | undefined): value is TomlTable {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
