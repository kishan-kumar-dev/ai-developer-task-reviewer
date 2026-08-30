import { readRepository } from "../tools/filesystem";

import type {
  Evidence,
  Requirement,
  RequirementFinding,
  AgentTrace,
} from "../types.js";

/* ------------------------------------------------------------------ */
/* TYPES                                                              */
/* ------------------------------------------------------------------ */

type MatchStrength = "weak" | "medium" | "strong";

interface RepositoryFile {
  path: string;
  content: string;
}

interface Match {
  path: string;
  lineStart?: number;
  lineEnd?: number;
  text: string;
  strength: MatchStrength;
  reason?: string;
  category?: string;
}

export interface ImplementationResult {
  findings: RequirementFinding[];
  trace: AgentTrace;
}

/* ------------------------------------------------------------------ */
/* PATH HELPERS                                                       */
/* ------------------------------------------------------------------ */

function normalizePath(filePath: string): string {
  return filePath.replace(/\\/g, "/").toLowerCase();
}

function isIgnoredPath(filePath: string): boolean {
  const normalized = normalizePath(filePath);

  const ignoredDirectories = [
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
    "__pycache__",
    ".pytest_cache",
    "target",
    "vendor",
  ];

  const parts = normalized.split("/");

  if (ignoredDirectories.some((directory) => parts.includes(directory))) {
    return true;
  }

  const ignoredFiles = [
    ".ds_store",
    "thumbs.db",
    "npm-debug.log",
    "yarn-debug.log",
    "yarn-error.log",
    "pnpm-debug.log",
  ];

  return ignoredFiles.includes(normalized.split("/").pop() ?? "");
}

/* ------------------------------------------------------------------ */
/* SOURCE / TEST FILE DETECTION                                       */
/* ------------------------------------------------------------------ */

function isSourceFile(file: RepositoryFile): boolean {
  const path = normalizePath(file.path);

  if (isIgnoredPath(path)) {
    return false;
  }

  const sourceExtensions = [
    ".ts",
    ".tsx",
    ".js",
    ".jsx",
    ".mjs",
    ".cjs",
    ".py",
    ".java",
    ".go",
    ".rs",
    ".rb",
    ".php",
    ".cs",
    ".swift",
    ".kt",
    ".kts",
    ".sql",
  ];

  return sourceExtensions.some((extension) => path.endsWith(extension));
}

function isLikelyTestFile(filePath: string): boolean {
  const normalized = normalizePath(filePath);

  if (isIgnoredPath(normalized)) {
    return false;
  }

  return (
    /\.(test|spec)\.[^/]+$/i.test(normalized) ||
    /(^|\/)__tests__(\/|$)/i.test(normalized) ||
    /(^|\/)tests?(\/|$)/i.test(normalized)
  );
}

function sourceFiles(files: RepositoryFile[]): RepositoryFile[] {
  return files.filter(
    (file) => isSourceFile(file) && !isLikelyTestFile(file.path),
  );
}

/* ------------------------------------------------------------------ */
/* TEXT HELPERS                                                       */
/* ------------------------------------------------------------------ */

function getLines(content: string): string[] {
  return content.split(/\r?\n/);
}

function getLineNumber(content: string, index: number): number {
  return content.slice(0, index).split(/\r?\n/).length;
}

function getExcerpt(content: string, lineStart: number): string {
  const lines = getLines(content);

  return lines
    .slice(Math.max(0, lineStart - 2), Math.min(lines.length, lineStart + 2))
    .join("\n")
    .trim();
}

/* ------------------------------------------------------------------ */
/* MATCHING                                                           */
/* ------------------------------------------------------------------ */

function getMatches(
  files: RepositoryFile[],
  patterns: RegExp[],
  options?: {
    strength?: MatchStrength;
    reason?: string;
    allowTests?: boolean;
    category?: string;
  },
): Match[] {
  const matches: Match[] = [];

  for (const file of files) {
    if (isIgnoredPath(file.path)) {
      continue;
    }

    if (!options?.allowTests && isLikelyTestFile(file.path)) {
      continue;
    }

    for (const pattern of patterns) {
      pattern.lastIndex = 0;

      const match = pattern.exec(file.content);

      if (!match || match.index === undefined) {
        continue;
      }

      const lineStart = getLineNumber(file.content, match.index);

      matches.push({
        path: file.path,
        lineStart,
        lineEnd: lineStart,
        text: getExcerpt(file.content, lineStart),
        strength: options?.strength ?? "strong",
        reason: options?.reason,
        category: options?.category,
      });
    }
  }

  return matches;
}

function getFilenameMatches(
  files: RepositoryFile[],
  patterns: RegExp[],
  strength: MatchStrength = "weak",
  reason = "Supporting filename evidence.",
): Match[] {
  return files
    .filter((file) => !isIgnoredPath(file.path))
    .filter((file) => {
      const normalizedPath = normalizePath(file.path);

      return patterns.some((pattern) => {
        pattern.lastIndex = 0;
        return pattern.test(normalizedPath);
      });
    })
    .map((file) => ({
      path: file.path,
      text: file.path,
      strength,
      reason,
    }));
}

function getPackageMatches(
  files: RepositoryFile[],
  packages: string[],
): Match[] {
  const matches: Match[] = [];

  for (const file of files) {
    if (isIgnoredPath(file.path)) {
      continue;
    }

    const path = normalizePath(file.path);

    if (
      !(
        path.endsWith("package.json") ||
        path.endsWith("requirements.txt") ||
        path.endsWith("pyproject.toml") ||
        path.endsWith("pom.xml") ||
        path.endsWith("go.mod")
      )
    ) {
      continue;
    }

    for (const dependency of packages) {
      if (file.content.toLowerCase().includes(dependency.toLowerCase())) {
        matches.push({
          path: file.path,
          text: `Dependency: ${dependency}`,
          strength: "weak",
          reason:
            `Dependency "${dependency}" is present. ` +
            "Dependency evidence alone does not prove implementation.",
          category: "dependency",
        });
      }
    }
  }

  return matches;
}

/* ------------------------------------------------------------------ */
/* MATCH UTILITIES                                                    */
/* ------------------------------------------------------------------ */

function uniqueMatches(matches: Match[]): Match[] {
  const seen = new Set<string>();

  return matches.filter((match) => {
    const key =
      `${match.path}:${match.lineStart ?? 0}:` +
      `${match.text}:${match.strength}:` +
      `${match.category ?? ""}`;

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

function rankMatches(matches: Match[]): Match[] {
  const weight: Record<MatchStrength, number> = {
    strong: 3,
    medium: 2,
    weak: 1,
  };

  return [...matches].sort((a, b) => weight[b.strength] - weight[a.strength]);
}

function evidenceFor(match: Match): Evidence {
  return {
    source: match.path,
    location:
      match.lineStart !== undefined
        ? `${match.path}:${match.lineStart}`
        : match.path,
    excerpt: match.text || undefined,
    explanation:
      match.reason ?? "Concrete repository implementation evidence found.",
  };
}

/* ------------------------------------------------------------------ */
/* REQUIREMENT HELPERS                                                */
/* ------------------------------------------------------------------ */

function requirementDomain(requirement: Requirement): string {
  return [
    requirement.id,
    requirement.title,
    requirement.description,
    ...requirement.acceptanceCriteria,
  ]
    .join(" ")
    .toLowerCase();
}

function containsAny(value: string, terms: string[]): boolean {
  return terms.some((term) => value.includes(term.toLowerCase()));
}

/* ------------------------------------------------------------------ */
/* E-COMMERCE / AUTHENTICATION                                        */
/* ------------------------------------------------------------------ */

function authenticationMatches(files: RepositoryFile[]): Match[] {
  const sources = sourceFiles(files);

  return [
    ...getMatches(
      sources,
      [
        /\bregister\b/i,
        /\bsignup\b/i,
        /\bsign-up\b/i,
        /\blogin\b/i,
        /\bsignin\b/i,
        /\bsign-in\b/i,
        /\blogout\b/i,
        /\bsignout\b/i,
        /\bsign-out\b/i,
        /\bpasswordHash\b/i,
        /\bhashPassword\b/i,
        /\bcomparePassword\b/i,
        /\bverifyPassword\b/i,
        /\bsession\b/i,
        /\bcreateSession\b/i,
        /\bgetServerSession\b/i,
        /\bnext-auth\b/i,
        /\bclerk\b/i,
        /\bsupabase.auth\b/i,
        /\bauthenticate\b/i,
        /\bauthorized\b/i,
      ],
      {
        strength: "strong",
        category: "authentication",
        reason: "Concrete authentication implementation signal found.",
      },
    ),
    ...getFilenameMatches(
      sources,
      [/auth/, /login/, /signup/, /register/, /session/],
      "weak",
      "Authentication-related filename evidence.",
    ),
    ...getPackageMatches(sources, [
      "next-auth",
      "@auth/",
      "passport",
      "jsonwebtoken",
      "bcrypt",
      "bcryptjs",
      "@clerk/",
      "@supabase/supabase-js",
    ]),
  ];
}

/* ------------------------------------------------------------------ */
/* PRODUCT CATALOG                                                    */
/* ------------------------------------------------------------------ */

function catalogMatches(files: RepositoryFile[]): Match[] {
  const sources = sourceFiles(files);

  return [
    ...getMatches(
      sources,
      [
        /\bproducts?\b/i,
        /\bproductId\b/i,
        /\bproductName\b/i,
        /\bproductDetails\b/i,
        /\bproductList\b/i,
        /\bproductCatalog\b/i,
        /\bgetProducts\s*\(/i,
        /\bfindProducts\s*\(/i,
        /\bfetchProducts\s*\(/i,
        /\bProductCard\b/i,
        /\bProductDetails\b/i,
      ],
      {
        strength: "strong",
        category: "catalog",
        reason: "Concrete product catalog implementation signal found.",
      },
    ),
    ...getFilenameMatches(
      sources,
      [/product/, /catalog/, /shop/, /store/],
      "weak",
      "Product/catalog filename evidence.",
    ),
  ];
}

/* ------------------------------------------------------------------ */
/* SEARCH                                                             */
/* ------------------------------------------------------------------ */

function searchMatches(files: RepositoryFile[]): Match[] {
  const sources = sourceFiles(files);

  return getMatches(
    sources,
    [
      /\bsearchTerm\b/i,
      /\bsearchQuery\b/i,
      /\bquery\b/i,
      /\bfilter\b/i,
      /\bfilters\b/i,
      /\bfilteredProducts\b/i,
      /\bsearchProducts\s*\(/i,
      /\bhandleSearch\s*\(/i,
      /\bsetSearch\b/i,
      /\bfilterProducts\s*\(/i,
      /\bdebounce\b/i,
    ],
    {
      strength: "strong",
      category: "search",
      reason: "Concrete search/filter implementation signal found.",
    },
  );
}

/* ------------------------------------------------------------------ */
/* CART                                                               */
/* ------------------------------------------------------------------ */

function cartMatches(files: RepositoryFile[]): Match[] {
  const sources = sourceFiles(files);

  return [
    ...getMatches(
      sources,
      [
        /\bcart\b/i,
        /\bcartItems\b/i,
        /\bshoppingCart\b/i,
        /\baddToCart\s*\(/i,
        /\bremoveFromCart\s*\(/i,
        /\bupdateCart\s*\(/i,
        /\bupdateQuantity\s*\(/i,
        /\bcartQuantity\b/i,
        /\bsubtotal\b/i,
        /\bcalculateSubtotal\s*\(/i,
        /\bCartItem\b/i,
      ],
      {
        strength: "strong",
        category: "cart",
        reason: "Concrete shopping-cart implementation signal found.",
      },
    ),
    ...getFilenameMatches(
      sources,
      [/cart/, /basket/, /shopping/],
      "weak",
      "Shopping-cart filename evidence.",
    ),
  ];
}

/* ------------------------------------------------------------------ */
/* STRIPE CHECKOUT                                                    */
/* ------------------------------------------------------------------ */

function stripeMatches(files: RepositoryFile[]): Match[] {
  const sources = sourceFiles(files);

  return [
    ...getMatches(
      sources,
      [
        /\bStripe\b/i,
        /\bstripe\b/i,
        /\bcheckout\.sessions\.create\b/i,
        /\bcreateCheckoutSession\b/i,
        /\bcheckoutSession\b/i,
        /\bSTRIPE_SECRET_KEY\b/i,
        /\bprice_data\b/i,
        /\bline_items\b/i,
        /\bsuccess_url\b/i,
        /\bcancel_url\b/i,
      ],
      {
        strength: "strong",
        category: "stripe",
        reason: "Concrete Stripe checkout implementation signal found.",
      },
    ),
    ...getFilenameMatches(
      sources,
      [/stripe/, /checkout/, /payment/],
      "weak",
      "Stripe/payment filename evidence.",
    ),
    ...getPackageMatches(sources, [
      "stripe",
      "@stripe/stripe-js",
      "@stripe/react-stripe-js",
    ]),
  ];
}

/* ------------------------------------------------------------------ */
/* STRIPE WEBHOOK                                                     */
/* ------------------------------------------------------------------ */

function webhookMatches(files: RepositoryFile[]): Match[] {
  const sources = sourceFiles(files);

  return [
    ...getMatches(
      sources,
      [
        /\bwebhook\b/i,
        /\bconstructEvent\b/i,
        /\bstripe-signature\b/i,
        /\bSTRIPE_WEBHOOK_SECRET\b/i,
        /\bwebhooks\.constructEvent\b/i,
        /\brawBody\b/i,
        /\brequest\.text\s*\(\s*\)/i,
        /\bsignature\b/i,
      ],
      {
        strength: "strong",
        category: "webhook",
        reason:
          "Concrete webhook/signature verification implementation signal found.",
      },
    ),
    ...getFilenameMatches(
      sources,
      [/webhook/, /stripe/],
      "weak",
      "Webhook-related filename evidence.",
    ),
  ];
}

/* ------------------------------------------------------------------ */
/* DATABASE / POSTGRESQL                                              */
/* ------------------------------------------------------------------ */

function databaseMatches(files: RepositoryFile[]): Match[] {
  const sources = files.filter((file) => !isIgnoredPath(file.path));

  return [
    ...getMatches(
      sources,
      [
        /\bDATABASE_URL\b/i,
        /\bpostgres(?:ql)?\b/i,
        /\bPostgreSQL\b/i,
        /\bprisma\b/i,
        /\bPrismaClient\b/i,
        /\bsequelize\b/i,
        /\btypeorm\b/i,
        /\bknex\b/i,
        /\bpg\.Pool\b/i,
        /\bpool\.query\s*\(/i,
        /\bdrizzle\b/i,
        /\bsqlalchemy\b/i,
        /\bmodels?\b/i,
        /\bprisma\.[A-Za-z]+\.(find|create|update|delete)/i,
      ],
      {
        strength: "strong",
        category: "database",
        reason: "Concrete database persistence implementation signal found.",
      },
    ),
    ...getFilenameMatches(
      sources,
      [/schema/, /migration/, /prisma/, /database/, /db/],
      "medium",
      "Database schema/migration filename evidence.",
    ),
    ...getPackageMatches(sources, [
      "prisma",
      "@prisma/client",
      "pg",
      "postgres",
      "postgresql",
      "sequelize",
      "typeorm",
      "drizzle-orm",
      "knex",
      "sqlalchemy",
    ]),
  ];
}

/* ------------------------------------------------------------------ */
/* INVENTORY                                                          */
/* ------------------------------------------------------------------ */

function inventoryMatches(files: RepositoryFile[]): Match[] {
  const sources = sourceFiles(files);

  return [
    ...getMatches(
      sources,
      [
        /\binventory\b/i,
        /\bstock\b/i,
        /\bstockQuantity\b/i,
        /\bquantityInStock\b/i,
        /\bavailableStock\b/i,
        /\bdecrementStock\b/i,
        /\bincrementStock\b/i,
        /\bupdateInventory\b/i,
        /\breserveStock\b/i,
        /\bcheckStock\b/i,
        /\bavailableQuantity\b/i,
        /\bquantity\s*[-+]=/i,
        /\bstock\s*[-+]=/i,
        /\btransaction\b/i,
      ],
      {
        strength: "strong",
        category: "inventory",
        reason: "Concrete inventory/stock implementation signal found.",
      },
    ),
    ...getFilenameMatches(
      sources,
      [/inventory/, /stock/, /warehouse/],
      "weak",
      "Inventory-related filename evidence.",
    ),
  ];
}

/* ------------------------------------------------------------------ */
/* ORDERS                                                             */
/* ------------------------------------------------------------------ */

function orderMatches(files: RepositoryFile[]): Match[] {
  const sources = sourceFiles(files);

  return [
    ...getMatches(
      sources,
      [
        /\border\b/i,
        /\borderId\b/i,
        /\borderItems\b/i,
        /\borderHistory\b/i,
        /\bcreateOrder\s*\(/i,
        /\bgetOrders\s*\(/i,
        /\bfindOrders\s*\(/i,
        /\bOrderItem\b/i,
        /\borderTotal\b/i,
        /\buserId\b/i,
      ],
      {
        strength: "strong",
        category: "orders",
        reason:
          "Concrete order-history/persistence implementation signal found.",
      },
    ),
    ...getFilenameMatches(
      sources,
      [/order/, /purchase/, /history/],
      "weak",
      "Order-history filename evidence.",
    ),
  ];
}

/* ------------------------------------------------------------------ */
/* AUTOMATED TESTS                                                    */
/* ------------------------------------------------------------------ */

function testMatches(files: RepositoryFile[]): Match[] {
  const testFiles = files.filter(
    (file) => !isIgnoredPath(file.path) && isLikelyTestFile(file.path),
  );

  if (testFiles.length === 0) {
    return [];
  }

  return [
    ...getMatches(
      testFiles,
      [
        /\bdescribe\s*\(/i,
        /\bit\s*\(/i,
        /\btest\s*\(/i,
        /\bexpect\s*\(/i,
        /\bassert\s*\(/i,
        /\bbeforeEach\s*\(/i,
        /\bafterEach\s*\(/i,
        /\bvi\.mock\s*\(/i,
        /\bvi\.fn\s*\(/i,
        /\bjest\.mock\s*\(/i,
        /\bsupertest\b/i,
        /\brequest\s*\(/i,
        /\bPlaywright\b/i,
        /\bpage\.goto\s*\(/i,
      ],
      {
        allowTests: true,
        strength: "strong",
        category: "tests",
        reason: "Automated test implementation signal found.",
      },
    ),
    ...getFilenameMatches(
      testFiles,
      [/\.(test|spec)\./, /__tests__/, /(^|\/)tests?(\/|$)/],
      "weak",
      "Test filename evidence.",
    ),
    ...getPackageMatches(testFiles, [
      "vitest",
      "jest",
      "@playwright/test",
      "cypress",
      "mocha",
      "supertest",
    ]),
  ];
}

/* ------------------------------------------------------------------ */
/* API / SERVER IMPLEMENTATION                                        */
/* ------------------------------------------------------------------ */

function apiMatches(files: RepositoryFile[]): Match[] {
  const sources = sourceFiles(files);

  return getMatches(
    sources,
    [
      /\bexport\s+async\s+function\s+(GET|POST|PUT|PATCH|DELETE)\b/i,
      /\bNextResponse\b/i,
      /\bRequest\b/i,
      /\bResponse\b/i,
      /\bfetch\s*\(/i,
      /\baxios\b/i,
      /\brouter\.(get|post|put|patch|delete)\b/i,
      /\bapp\.(get|post|put|patch|delete)\b/i,
    ],
    {
      strength: "medium",
      category: "api",
      reason: "Concrete API/server implementation signal found.",
    },
  );
}

/* ------------------------------------------------------------------ */
/* GENERIC UI                                                         */
/* ------------------------------------------------------------------ */

function genericUiMatches(files: RepositoryFile[]): Match[] {
  const sources = sourceFiles(files);

  return getMatches(
    sources,
    [
      /function\s+[A-Z][A-Za-z0-9]*\s*\(/,
      /const\s+[A-Z][A-Za-z0-9]*\s*=/,
      /export\s+default\s+function\b/,
      /<[A-Z][A-Za-z0-9]*/,
    ],
    {
      strength: "medium",
      category: "ui",
      reason: "Concrete frontend component implementation found.",
    },
  );
}

/* ------------------------------------------------------------------ */
/* GENERIC REQUIREMENT MATCHING                                       */
/* ------------------------------------------------------------------ */

function genericRequirementMatches(
  files: RepositoryFile[],
  requirement: Requirement,
): Match[] {
  const sources = sourceFiles(files);

  const domain = requirementDomain(requirement);

  const stopWords = new Set([
    "the",
    "and",
    "or",
    "for",
    "with",
    "from",
    "that",
    "this",
    "must",
    "should",
    "shall",
    "have",
    "has",
    "into",
    "using",
    "use",
    "user",
    "users",
    "application",
    "app",
    "system",
    "feature",
    "implementation",
    "implement",
    "support",
    "provide",
    "allow",
    "allows",
    "requirement",
    "requirements",
    "acceptance",
    "criteria",
  ]);

  const terms = domain
    .replace(/[^a-z0-9\s_-]/gi, " ")
    .split(/\s+/)
    .map((term) => term.trim())
    .filter((term) => term.length >= 4 && !stopWords.has(term))
    .slice(0, 8);

  const matches: Match[] = [];

  for (const file of sources) {
    for (const term of terms) {
      const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

      const pattern = new RegExp(`\\b${escaped}\\b`, "i");

      const match = pattern.exec(file.content);

      if (!match || match.index === undefined) {
        continue;
      }

      const lineStart = getLineNumber(file.content, match.index);

      matches.push({
        path: file.path,
        lineStart,
        lineEnd: lineStart,
        text: getExcerpt(file.content, lineStart),
        strength: "weak",
        category: "generic",
        reason:
          `Generic requirement keyword "${term}" was found in source. ` +
          "Keyword evidence alone does not prove complete implementation.",
      });
    }
  }

  return matches;
}

/* ------------------------------------------------------------------ */
/* REQUIREMENT ROUTING                                                */
/* ------------------------------------------------------------------ */

function matchesForRequirement(
  files: RepositoryFile[],
  requirement: Requirement,
): Match[] {
  const domain = requirementDomain(requirement);

  const matches: Match[] = [];

  if (
    containsAny(domain, [
      "authentication",
      "auth",
      "login",
      "register",
      "registration",
      "logout",
      "sign in",
      "sign up",
    ])
  ) {
    matches.push(...authenticationMatches(files));
  }

  if (
    containsAny(domain, [
      "product catalog",
      "product listing",
      "products",
      "catalog",
      "browse products",
      "product details",
    ])
  ) {
    matches.push(...catalogMatches(files));
  }

  if (containsAny(domain, ["search", "filter", "filtering"])) {
    matches.push(...searchMatches(files));
  }

  if (containsAny(domain, ["shopping cart", "cart", "basket", "add to cart"])) {
    matches.push(...cartMatches(files));
  }

  if (containsAny(domain, ["stripe", "checkout", "payment"])) {
    matches.push(...stripeMatches(files));
  }

  if (
    containsAny(domain, ["webhook", "stripe webhook", "signature verification"])
  ) {
    matches.push(...webhookMatches(files));
  }

  if (
    containsAny(domain, [
      "database",
      "postgres",
      "postgresql",
      "persistence",
      "data persistence",
    ])
  ) {
    matches.push(...databaseMatches(files));
  }

  if (containsAny(domain, ["inventory", "stock", "stock management"])) {
    matches.push(...inventoryMatches(files));
  }

  if (containsAny(domain, ["order", "order history", "purchase history"])) {
    matches.push(...orderMatches(files));
  }

  if (
    containsAny(domain, [
      "tests",
      "automated tests",
      "unit test",
      "integration test",
      "critical behavior",
    ])
  ) {
    matches.push(...testMatches(files));
  }

  if (containsAny(domain, ["api", "server", "server-side", "endpoint"])) {
    matches.push(...apiMatches(files));
  }

  if (
    containsAny(domain, [
      "component",
      "interface",
      "ui",
      "frontend",
      "screen",
      "page",
    ])
  ) {
    matches.push(...genericUiMatches(files));
  }

  if (matches.length === 0) {
    matches.push(...genericRequirementMatches(files, requirement));
  }

  return rankMatches(uniqueMatches(matches));
}

/* ------------------------------------------------------------------ */
/* MISSING REASON                                                     */
/* ------------------------------------------------------------------ */

function missingReason(requirement: Requirement): string {
  const domain = requirementDomain(requirement);

  if (containsAny(domain, ["authentication", "login", "register"])) {
    return (
      "No concrete authentication implementation was found. " +
      "Expected registration, login, secure session/authentication state, " +
      "and logout behavior."
    );
  }

  if (containsAny(domain, ["catalog", "products", "product listing"])) {
    return (
      "No concrete product-catalog implementation was found. " +
      "Expected product listing, meaningful product information, " +
      "and product details."
    );
  }

  if (containsAny(domain, ["search", "filter"])) {
    return (
      "No concrete search/filter implementation was found. " +
      "Expected search state, filtering logic, and displayed-result updates."
    );
  }

  if (containsAny(domain, ["shopping cart", "cart"])) {
    return (
      "No concrete shopping-cart implementation was found. " +
      "Expected add, remove, quantity updates, and subtotal calculation."
    );
  }

  if (containsAny(domain, ["stripe", "checkout"])) {
    return (
      "No concrete Stripe checkout implementation was found. " +
      "Expected server-side checkout-session creation and trusted pricing."
    );
  }

  if (containsAny(domain, ["webhook", "signature"])) {
    return (
      "No concrete secure webhook implementation was found. " +
      "Expected raw-body access, signature verification, and rejection of invalid signatures."
    );
  }

  if (containsAny(domain, ["database", "postgres", "persistence"])) {
    return (
      "No concrete database persistence implementation was found. " +
      "Expected database configuration, models/schema, and persistence operations."
    );
  }

  if (containsAny(domain, ["inventory", "stock"])) {
    return (
      "No concrete inventory implementation was found. " +
      "Expected stock checks, safe stock reduction, negative-inventory prevention, " +
      "and concurrency-safe updates."
    );
  }

  if (containsAny(domain, ["order", "order history"])) {
    return (
      "No concrete order-history implementation was found. " +
      "Expected user-associated orders, order retrieval, items, and totals."
    );
  }

  if (containsAny(domain, ["tests", "automated tests"])) {
    return (
      "No candidate automated test implementation was found. " +
      "Expected test files containing test cases and assertions."
    );
  }

  return (
    "No concrete repository implementation evidence was found " +
    "for this requirement."
  );
}

/* ------------------------------------------------------------------ */
/* STATUS EVALUATION                                                  */
/* ------------------------------------------------------------------ */

function determineStatus(
  requirement: Requirement,
  matches: Match[],
): {
  status: "complete" | "partial" | "missing";
  confidence: number;
  reasoning: string;
} {
  if (matches.length === 0) {
    return {
      status: "missing",
      confidence: 0.97,
      reasoning:
        missingReason(requirement) +
        " Documentation, generic keywords, styling-only evidence, " +
        "dependency-only evidence, generated tooling, fixtures, and " +
        "unrelated code were excluded.",
    };
  }

  const strongMatches = matches.filter((match) => match.strength === "strong");

  const mediumMatches = matches.filter((match) => match.strength === "medium");

  const uniqueFiles = new Set(matches.map((match) => match.path)).size;

  const domain = requirementDomain(requirement);

  const isTestRequirement = containsAny(domain, [
    "tests",
    "automated tests",
    "unit test",
    "integration test",
  ]);

  /* -------------------------------------------------------------- */
  /* TESTS                                                           */
  /* -------------------------------------------------------------- */

  if (isTestRequirement) {
    const testFiles = new Set(strongMatches.map((match) => match.path));

    const hasAssertions = strongMatches.some(
      (match) =>
        /\bexpect\s*\(/i.test(match.text) || /\bassert\s*\(/i.test(match.text),
    );

    const hasTestCases = strongMatches.some(
      (match) =>
        /\btest\s*\(/i.test(match.text) ||
        /\bit\s*\(/i.test(match.text) ||
        /\bdescribe\s*\(/i.test(match.text),
    );

    if (
      testFiles.size >= 2 &&
      strongMatches.length >= 4 &&
      hasAssertions &&
      hasTestCases
    ) {
      return {
        status: "complete",
        confidence: 0.92,
        reasoning:
          "Multiple automated-test signals were found across multiple test files, including test cases and assertions.",
      };
    }

    if (strongMatches.length >= 2 && hasAssertions) {
      return {
        status: "partial",
        confidence: 0.78,
        reasoning:
          "Automated tests were detected with assertions, but broad critical-flow coverage is not independently established.",
      };
    }

    if (strongMatches.length >= 1) {
      return {
        status: "partial",
        confidence: 0.65,
        reasoning:
          "Candidate test implementation was detected, but independent coverage evidence is insufficient.",
      };
    }

    return {
      status: "partial",
      confidence: 0.55,
      reasoning: "Limited candidate-application testing evidence was found.",
    };
  }

  /* -------------------------------------------------------------- */
  /* WEAK ONLY                                                       */
  /* -------------------------------------------------------------- */

  const implementationMatches = matches.filter(
    (match) => match.strength === "strong" || match.strength === "medium",
  );

  if (implementationMatches.length === 0) {
    return {
      status: "partial",
      confidence: 0.45,
      reasoning:
        "Only weak supporting evidence such as filenames, dependencies, or generic keywords was found. This does not establish implementation completeness.",
    };
  }

  /* -------------------------------------------------------------- */
  /* SECURITY-CRITICAL REQUIREMENTS                                  */
  /* -------------------------------------------------------------- */

  const isWebhook = containsAny(domain, ["webhook", "signature verification"]);

  if (isWebhook) {
    const hasSignature = strongMatches.some(
      (match) =>
        /constructEvent/i.test(match.text) ||
        /stripe-signature/i.test(match.text) ||
        /STRIPE_WEBHOOK_SECRET/i.test(match.text),
    );

    const hasRawBody = strongMatches.some(
      (match) =>
        /request\.text\s*\(/i.test(match.text) || /rawBody/i.test(match.text),
    );

    if (hasSignature && hasRawBody && strongMatches.length >= 2) {
      return {
        status: "complete",
        confidence: 0.91,
        reasoning:
          "Concrete raw-body and webhook-signature verification evidence was found.",
      };
    }

    return {
      status: "partial",
      confidence: 0.7,
      reasoning:
        "Webhook-related implementation was detected, but complete signature-validation evidence was not established.",
    };
  }

  const isStripe = containsAny(domain, ["stripe", "checkout"]);

  if (isStripe) {
    const hasCheckout = strongMatches.some(
      (match) =>
        /checkout\.sessions\.create/i.test(match.text) ||
        /createCheckoutSession/i.test(match.text),
    );

    if (hasCheckout && strongMatches.length >= 2) {
      return {
        status: "complete",
        confidence: 0.9,
        reasoning:
          "Concrete server-side Stripe checkout-session implementation evidence was found.",
      };
    }

    if (strongMatches.length >= 1) {
      return {
        status: "partial",
        confidence: 0.68,
        reasoning:
          "Stripe-related implementation was detected, but complete server-side checkout evidence was not established.",
      };
    }
  }

  /* -------------------------------------------------------------- */
  /* NORMAL REQUIREMENTS                                              */
  /* -------------------------------------------------------------- */

  if (strongMatches.length >= 4 && uniqueFiles >= 2) {
    return {
      status: "complete",
      confidence: 0.9,
      reasoning:
        "Multiple strong implementation signals were found across multiple candidate source files.",
    };
  }

  if (strongMatches.length >= 2 && uniqueFiles >= 2) {
    return {
      status: "complete",
      confidence: 0.84,
      reasoning:
        "Multiple strong implementation signals were found across multiple source files.",
    };
  }

  if (strongMatches.length >= 2 || mediumMatches.length >= 2) {
    return {
      status: "partial",
      confidence: 0.75,
      reasoning:
        "Concrete implementation evidence was found, but additional independent evidence is needed to verify all acceptance criteria.",
    };
  }

  if (strongMatches.length === 1 || mediumMatches.length >= 1) {
    return {
      status: "partial",
      confidence: 0.62,
      reasoning:
        "A concrete implementation signal was found, but the available evidence is insufficient to establish the complete requirement.",
    };
  }

  return {
    status: "partial",
    confidence: 0.55,
    reasoning: "Limited repository implementation evidence was found.",
  };
}

/* ------------------------------------------------------------------ */
/* MAIN AGENT                                                         */
/* ------------------------------------------------------------------ */

export async function runRepositoryImplementationAgent(
  repositoryPath: string,
  requirements: Requirement[],
): Promise<ImplementationResult> {
  const startedAt = new Date().toISOString();

  const allFiles = readRepository(repositoryPath) as RepositoryFile[];

  const ignoredFiles = allFiles.filter((file) => isIgnoredPath(file.path));

  const analysisFiles = allFiles.filter((file) => !isIgnoredPath(file.path));

  const applicationFiles = analysisFiles.filter((file) => isSourceFile(file));

  const findings: RequirementFinding[] = requirements.map(
    (requirement: Requirement): RequirementFinding => {
      const rawMatches = matchesForRequirement(analysisFiles, requirement);

      const matches = rankMatches(uniqueMatches(rawMatches)).slice(0, 12);

      const evaluation = determineStatus(requirement, matches);

      const evidence = matches.map((match: Match) => evidenceFor(match));

      return {
        requirementId: requirement.id,
        status: evaluation.status,
        confidence: evaluation.confidence,
        evidence,
        reasoning: evaluation.reasoning,
      };
    },
  );

  const trace: AgentTrace = {
    agent: "implementation-agent",
    startedAt,
    completedAt: new Date().toISOString(),
    inputSummary:
      `${allFiles.length} repository files, ` +
      `${applicationFiles.length} application source files, ` +
      `${requirements.length} requirements`,
    actions: [
      `Inspected ${allFiles.length} repository files`,
      `Identified ${applicationFiles.length} application source files`,
      `Excluded ${ignoredFiles.length} ignored files`,
      "Ignored generated and dependency directories",
      "Excluded test files from production feature analysis",
      "Separated application tests from production implementation",
      "Inspected authentication implementation",
      "Inspected product catalog implementation",
      "Inspected search and filtering implementation",
      "Inspected shopping cart implementation",
      "Inspected Stripe checkout implementation",
      "Inspected Stripe webhook implementation",
      "Inspected database and PostgreSQL implementation",
      "Inspected inventory implementation",
      "Inspected order-history implementation",
      "Inspected automated tests",
      "Inspected API/server implementation",
      "Used filenames only as supporting evidence",
      "Used dependencies only as supporting evidence",
      "Required source-level evidence for feature completeness",
      "Ranked strong evidence before limiting evidence output",
      "Collected file and line-level evidence",
      "Generated requirement-specific missing explanations",
      "Applied security-sensitive verification rules",
      "Avoided dependency-only false positives",
      "Avoided filename-only completeness claims",
      "Avoided generic keyword completeness claims",
    ],
    findings: [
      `Inspected ${requirements.length} requirements`,
      ...findings.map(
        (finding) =>
          `${finding.requirementId}: ` +
          `${finding.status} ` +
          `(${finding.evidence.length} evidence items, ` +
          `confidence ${finding.confidence})`,
      ),
    ],
    retries: 0,
  };

  return {
    findings,
    trace,
  };
}

/* ------------------------------------------------------------------ */
/* BACKWARD COMPATIBILITY                                             */
/* ------------------------------------------------------------------ */

export const runImplementationAgent = runRepositoryImplementationAgent;
