export const WORKSPACE_MANIFEST_FILENAME = "codex.workspace.toml";
export const PROJECT_MANIFEST_FILENAME = "codex.project.toml";
export const SUPPORTED_SCHEMA_VERSION = "1";
export const SUPPORTED_PROJECT_KINDS = [
  "skill-pack",
  "scheduled-job",
  "service",
] as const;
export const BUILTIN_RUNNER_TYPE = "builtin.codex";

export const REQUIRED_WORKSPACE_FIELDS = [
  "schema_version",
  "workspace_name",
  "workspace_description",
  "project_roots",
  "default_runner",
  "runners",
  "shared_assets",
  "verification_defaults",
  "artifact_defaults",
  "packaging_defaults",
  "doctor_checks",
] as const;

export const REQUIRED_SHARED_ASSET_FIELDS = [
  "agents_file",
  "agent_memory",
  "agent_rules_dir",
  "agent_skills_dir",
  "workspace_skills_dir",
  "workspace_scripts_dir",
  "workspace_tests_dir",
] as const;

export const REQUIRED_RUNNER_FIELDS = [
  "runner_type",
  "display_name",
  "supported_kinds",
  "required_commands",
] as const;

export const REQUIRED_VERIFICATION_DEFAULT_FIELDS = [
  "smoke_mode",
  "require_clean_doctor",
] as const;

export const REQUIRED_ARTIFACT_DEFAULT_FIELDS = [
  "human_summary_required",
  "retention_policy",
] as const;

export const REQUIRED_PACKAGING_DEFAULT_FIELDS = [
  "package_format",
  "packaging_mode",
] as const;

export const REQUIRED_DOCTOR_CHECK_FIELDS = [
  "validate_shared_assets",
  "validate_project_roots",
  "validate_runner_registration",
] as const;
