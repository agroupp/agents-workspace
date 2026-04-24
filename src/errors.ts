export class CodexWorkspaceError extends Error {
  readonly exitCode: number;

  constructor(message: string, exitCode = 1) {
    super(message);
    this.name = new.target.name;
    this.exitCode = exitCode;
  }
}

export class InitError extends CodexWorkspaceError {}

export class WorkspaceNotFoundError extends CodexWorkspaceError {}

export class ManifestValidationError extends CodexWorkspaceError {
  readonly errors: string[];

  constructor(errors: string[]) {
    super(errors.join("\n"), 2);
    this.errors = errors;
  }
}
