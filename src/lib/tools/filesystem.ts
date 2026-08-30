import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";

export interface RepositoryFile {
  path: string;
  content: string;
}

const IGNORED_DIRECTORIES = new Set([
  ".git",
  ".trunk",
  "node_modules",
  ".next",
  "dist",
  "build",
  "coverage",
  ".turbo",
  ".cache",
  ".vercel",
  "out",
]);

const IGNORED_FILES = new Set([
  ".ds_store",
  "thumbs.db",
  "npm-debug.log",
  "yarn-debug.log",
  "yarn-error.log",
  "pnpm-debug.log",
]);

function shouldIgnore(relativePath: string): boolean {
  const normalized = relativePath.replace(/\\/g, "/").toLowerCase();

  const parts = normalized.split("/");

  if (parts.some((part) => IGNORED_DIRECTORIES.has(part))) {
    return true;
  }

  const basename = parts[parts.length - 1];

  return IGNORED_FILES.has(basename);
}

function walkDirectory(
  root: string,
  current: string,
  results: RepositoryFile[],
): void {
  const entries = fs.readdirSync(current, {
    withFileTypes: true,
  });

  for (const entry of entries) {
    const absolutePath = path.join(current, entry.name);

    const relativePath = path.relative(root, absolutePath);

    if (shouldIgnore(relativePath)) {
      continue;
    }

    if (entry.isDirectory()) {
      walkDirectory(root, absolutePath, results);

      continue;
    }

    if (!entry.isFile()) {
      continue;
    }

    try {
      const content = fs.readFileSync(absolutePath, "utf8");

      results.push({
        path: relativePath.replace(/\\/g, "/"),
        content,
      });
    } catch {
      // Ignore binary/unreadable files.
    }
  }
}

/* ------------------------------------------------------------------ */
/* GitHub URL support                                                   */
/* ------------------------------------------------------------------ */

function isGitHubRepositoryUrl(value: string): boolean {
  try {
    const url = new URL(value);

    if (url.protocol !== "https:" && url.protocol !== "http:") {
      return false;
    }

    return url.hostname === "github.com" || url.hostname === "www.github.com";
  } catch {
    return false;
  }
}

function normalizeGitHubUrl(repositoryUrl: string): string {
  const url = new URL(repositoryUrl);

  const parts = url.pathname.split("/").filter(Boolean);

  if (parts.length < 2) {
    throw new Error(
      "Invalid GitHub repository URL. Expected https://github.com/owner/repository.",
    );
  }

  const owner = parts[0];
  const repository = parts[1].replace(/\.git$/, "");

  if (!owner || !repository) {
    throw new Error(
      "Invalid GitHub repository URL. Expected https://github.com/owner/repository.",
    );
  }

  return `https://github.com/${owner}/${repository}.git`;
}

function cloneGitHubRepository(repositoryUrl: string): {
  repositoryPath: string;
  cleanup: () => void;
} {
  const normalizedUrl = normalizeGitHubUrl(repositoryUrl);

  const temporaryRoot = fs.mkdtempSync(
    path.join(os.tmpdir(), "agentic-review-"),
  );

  const repositoryDirectory = path.join(temporaryRoot, "repository");

  try {
    execFileSync(
      "git",
      [
        "clone",
        "--depth",
        "1",
        "--single-branch",
        normalizedUrl,
        repositoryDirectory,
      ],
      {
        stdio: "pipe",
        encoding: "utf8",
        windowsHide: true,
      },
    );

    return {
      repositoryPath: repositoryDirectory,

      cleanup: () => {
        try {
          fs.rmSync(temporaryRoot, {
            recursive: true,
            force: true,
          });
        } catch {
          // Ignore cleanup errors.
        }
      },
    };
  } catch (error: unknown) {
    try {
      fs.rmSync(temporaryRoot, {
        recursive: true,
        force: true,
      });
    } catch {
      // Ignore cleanup errors.
    }

    const details =
      error && typeof error === "object" && "stderr" in error
        ? String((error as { stderr?: unknown }).stderr ?? "").trim()
        : "";

    throw new Error(
      details
        ? `Unable to clone GitHub repository: ${details}`
        : `Unable to clone GitHub repository: ${repositoryUrl}`,
    );
  }
}

/* ------------------------------------------------------------------ */
/* Repository reader                                                    */
/* ------------------------------------------------------------------ */

export function readRepository(repositoryPath: string): RepositoryFile[] {
  const input = repositoryPath.trim();

  if (!input) {
    throw new Error("Repository path cannot be empty.");
  }

  /*
   * Remote GitHub repository
   *
   * Example:
   * https://github.com/kishan-kumar-dev/topspeech-health-assignment
   */

  if (isGitHubRepositoryUrl(input)) {
    const cloned = cloneGitHubRepository(input);

    try {
      const results: RepositoryFile[] = [];

      walkDirectory(cloned.repositoryPath, cloned.repositoryPath, results);

      return results;
    } finally {
      cloned.cleanup();
    }
  }

  /*
   * Local filesystem repository
   */

  const absoluteRoot = path.resolve(input);

  if (!fs.existsSync(absoluteRoot)) {
    throw new Error(`Repository path does not exist: ${absoluteRoot}`);
  }

  const stat = fs.statSync(absoluteRoot);

  if (!stat.isDirectory()) {
    throw new Error(`Repository path is not a directory: ${absoluteRoot}`);
  }

  const results: RepositoryFile[] = [];

  walkDirectory(absoluteRoot, absoluteRoot, results);

  return results;
}
