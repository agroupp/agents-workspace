export type TomlPrimitive = boolean | number | string;
export type TomlValue = TomlPrimitive | TomlArray | TomlTable;
export type TomlArray = TomlValue[];

export interface TomlTable {
  [key: string]: TomlValue;
}

export interface RunnerRegistration {
  name: string;
  runnerType: string;
  displayName: string;
  supportedKinds: string[];
  requiredCommands: string[];
  extraConfig: TomlTable;
}

export interface WorkspaceManifest {
  schemaVersion: string;
  workspaceName: string;
  workspaceDescription: string;
  projectRoots: string[];
  defaultRunner: string;
  runners: Record<string, RunnerRegistration>;
  sharedAssets: Record<string, string>;
  verificationDefaults: TomlTable;
  artifactDefaults: TomlTable;
  packagingDefaults: TomlTable;
  doctorChecks: Record<string, boolean>;
}

export interface DoctorReport {
  workspaceRoot: string;
  workspaceName: string;
  discoveredProjects: string[];
}

export interface InitOptions {
  targetPath: string;
  workspaceName?: string;
  workspaceDescription?: string;
  force: boolean;
}
