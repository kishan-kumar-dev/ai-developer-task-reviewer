import type { Requirement, ReviewInput, AgentTrace } from "../types";

import { createLLMProvider } from "../llm/provider";

export interface TaskResearchResult {
  requirements: Requirement[];
  trace: AgentTrace;
}

/* ------------------------------------------------------------------ */
/* Requirement helpers                                                */
/* ------------------------------------------------------------------ */

function extractRequirements(task: string): Requirement[] {
  const text = task.toLowerCase();

  const requirements: Requirement[] = [];

  const add = (
    id: string,
    title: string,
    description: string,
    priority: Requirement["priority"],
    acceptanceCriteria: string[],
  ) => {
    if (!requirements.some((item) => item.id === id)) {
      requirements.push({
        id,
        title,
        description,
        priority,
        acceptanceCriteria,
      });
    }
  };

  /* --------------------------------------------------------------- */
  /* Authentication                                                  */
  /* --------------------------------------------------------------- */

  if (
    text.includes("registration") ||
    text.includes("register") ||
    text.includes("login") ||
    text.includes("authentication") ||
    text.includes("sign in")
  ) {
    add(
      "REQ-AUTH",
      "User authentication",
      "Users must be able to register and authenticate securely.",
      "high",
      [
        "Registration exists",
        "Login exists",
        "Authentication state is maintained securely",
        "Logout exists when required",
      ],
    );
  }

  /* --------------------------------------------------------------- */
  /* Product / catalog                                               */
  /* --------------------------------------------------------------- */

  if (
    text.includes("product catalog") ||
    text.includes("catalog") ||
    text.includes("product listing") ||
    text.includes("products")
  ) {
    add(
      "REQ-CATALOG",
      "Product catalog",
      "Users must be able to browse products.",
      "high",
      [
        "Product listing exists",
        "Products contain meaningful product information",
        "Product details can be viewed",
      ],
    );
  }

  /* --------------------------------------------------------------- */
  /* Search                                                          */
  /* --------------------------------------------------------------- */

  if (
    text.includes("search") ||
    text.includes("category filtering") ||
    text.includes("category filter") ||
    text.includes("filtering")
  ) {
    add(
      "REQ-SEARCH",
      "Search and filtering",
      "Users must be able to search and filter available content.",
      "high",
      [
        "Search functionality exists",
        "Search affects displayed results",
        "Filtering exists when required",
      ],
    );
  }

  /* --------------------------------------------------------------- */
  /* Shopping cart                                                   */
  /* --------------------------------------------------------------- */

  if (
    text.includes("shopping cart") ||
    text.includes("cart") ||
    text.includes("add to cart")
  ) {
    add(
      "REQ-CART",
      "Shopping cart",
      "Users must be able to manage products in a shopping cart.",
      "high",
      [
        "Products can be added to the cart",
        "Cart quantities can be changed",
        "Products can be removed",
        "Cart subtotal is calculated",
      ],
    );
  }

  /* --------------------------------------------------------------- */
  /* Stripe                                                          */
  /* --------------------------------------------------------------- */

  if (
    text.includes("stripe checkout") ||
    text.includes("stripe") ||
    text.includes("checkout")
  ) {
    add(
      "REQ-STRIPE",
      "Stripe checkout",
      "The application must provide a secure server-side Stripe checkout flow.",
      "critical",
      [
        "Stripe checkout session is created",
        "Checkout uses trusted server-side pricing",
        "Successful checkout has a confirmation flow",
      ],
    );
  }

  /* --------------------------------------------------------------- */
  /* Webhooks                                                        */
  /* --------------------------------------------------------------- */

  if (text.includes("webhook") || text.includes("stripe webhook")) {
    add(
      "REQ-WEBHOOK",
      "Secure webhook handling",
      "Webhook events must be authenticated before processing.",
      "critical",
      [
        "Raw webhook payload is available",
        "Webhook signature is verified",
        "Invalid signatures are rejected",
      ],
    );
  }

  /* --------------------------------------------------------------- */
  /* Database                                                        */
  /* --------------------------------------------------------------- */

  if (
    text.includes("postgresql") ||
    text.includes("postgres") ||
    text.includes("database")
  ) {
    add(
      "REQ-DATABASE",
      "Database persistence",
      "Application data must be persisted in the required database.",
      "high",
      [
        "Database connection is configured",
        "Required entities are modeled",
        "Application data can be persisted",
      ],
    );
  }

  /* --------------------------------------------------------------- */
  /* Inventory                                                       */
  /* --------------------------------------------------------------- */

  if (text.includes("inventory") || text.includes("stock")) {
    add(
      "REQ-INVENTORY",
      "Inventory management",
      "Product inventory must be checked and safely updated.",
      "critical",
      [
        "Stock is checked before purchase",
        "Stock is reduced after successful purchase",
        "Negative inventory is prevented",
        "Concurrent inventory updates are handled safely",
      ],
    );
  }

  /* --------------------------------------------------------------- */
  /* Orders                                                          */
  /* --------------------------------------------------------------- */

  if (
    text.includes("order history") ||
    text.includes("order") ||
    text.includes("orders")
  ) {
    add(
      "REQ-ORDERS",
      "Order history",
      "Authenticated users must be able to view their previous orders.",
      "medium",
      [
        "Orders are associated with users",
        "Order history can be viewed",
        "Order items and totals are displayed",
      ],
    );
  }

  /* --------------------------------------------------------------- */
  /* Automated tests                                                 */
  /* --------------------------------------------------------------- */

  if (
    text.includes("tests") ||
    text.includes("automated tests") ||
    text.includes("test coverage")
  ) {
    add(
      "REQ-TESTS",
      "Automated tests",
      "Critical application behavior must be covered by automated tests.",
      "high",
      [
        "Critical application behavior is tested",
        "Important user flows are tested",
        "Tests can be executed reliably",
      ],
    );
  }

  /* =============================================================== */
  /* TOPSPEECH / SPEECH THERAPY REQUIREMENTS                         */
  /* =============================================================== */

  const isSpeechTherapyTask =
    text.includes("speech therapy") ||
    text.includes("rhotacism") ||
    text.includes("pronunciation") ||
    text.includes("speech exercises");

  /* --------------------------------------------------------------- */
  /* Structured speech therapy exercises                             */
  /* --------------------------------------------------------------- */

  if (
    isSpeechTherapyTask ||
    text.includes("structured speech") ||
    text.includes("speech exercise") ||
    text.includes("exercise")
  ) {
    add(
      "REQ-EXERCISES",
      "Structured speech therapy exercises",
      "The application must provide structured speech therapy exercises designed for the rhotacism program.",
      "critical",
      [
        "Speech therapy exercises are available",
        "Exercises are organized into a structured learning flow",
        "Exercises contain clear instructions",
        "Users can complete an exercise",
      ],
    );
  }

  /* --------------------------------------------------------------- */
  /* Lesson cards                                                     */
  /* --------------------------------------------------------------- */

  if (
    isSpeechTherapyTask ||
    text.includes("lesson") ||
    text.includes("lesson cards")
  ) {
    add(
      "REQ-LESSONS",
      "Lesson cards",
      "The application must provide lesson cards that organize the speech therapy program into understandable learning units.",
      "high",
      [
        "Lesson cards are displayed",
        "Lessons contain meaningful content",
        "Users can access individual lessons",
        "Lesson progression is understandable",
      ],
    );
  }

  /* --------------------------------------------------------------- */
  /* Pronunciation practice                                           */
  /* --------------------------------------------------------------- */

  if (
    isSpeechTherapyTask ||
    text.includes("pronunciation practice") ||
    text.includes("pronunciation")
  ) {
    add(
      "REQ-PRONUNCIATION",
      "Pronunciation practice",
      "Users must be able to practice pronunciation as part of the rhotacism therapy program.",
      "critical",
      [
        "Pronunciation practice is available",
        "Users receive clear pronunciation instructions",
        "Practice can be completed from the UI",
        "The experience is appropriate for speech therapy practice",
      ],
    );
  }

  /* --------------------------------------------------------------- */
  /* Progress tracking                                                */
  /* --------------------------------------------------------------- */

  if (
    isSpeechTherapyTask ||
    text.includes("progress tracking") ||
    text.includes("progress")
  ) {
    add(
      "REQ-PROGRESS",
      "Progress tracking",
      "The application must track and communicate the user's therapy progress.",
      "high",
      [
        "User progress is represented in the UI",
        "Completed exercises or lessons can be reflected in progress",
        "Progress information is understandable to the user",
      ],
    );
  }

  /* --------------------------------------------------------------- */
  /* XP rewards                                                       */
  /* --------------------------------------------------------------- */

  if (
    isSpeechTherapyTask ||
    text.includes("xp") ||
    text.includes("experience points") ||
    text.includes("rewards")
  ) {
    add(
      "REQ-XP",
      "XP reward system",
      "The application must provide XP rewards to encourage completion of speech therapy activities.",
      "medium",
      [
        "XP is represented in the application",
        "Users can earn XP through relevant activities",
        "XP progression is visible to the user",
      ],
    );
  }

  /* --------------------------------------------------------------- */
  /* Streak rewards                                                   */
  /* --------------------------------------------------------------- */

  if (
    isSpeechTherapyTask ||
    text.includes("streak") ||
    text.includes("daily streak")
  ) {
    add(
      "REQ-STREAK",
      "Streak rewards",
      "The application must provide streak-based rewards or progress to encourage consistent practice.",
      "medium",
      [
        "A streak is represented in the UI",
        "Completing relevant activities can contribute to a streak",
        "Current streak information is visible",
      ],
    );
  }

  /* --------------------------------------------------------------- */
  /* Responsive mobile-first UI                                      */
  /* --------------------------------------------------------------- */

  if (
    text.includes("responsive") ||
    text.includes("mobile-first") ||
    text.includes("mobile first") ||
    isSpeechTherapyTask
  ) {
    add(
      "REQ-RESPONSIVE",
      "Responsive mobile-first interface",
      "The application must provide a responsive mobile-first user interface suitable for speech therapy practice on phones and larger screens.",
      "high",
      [
        "The interface works on mobile screen sizes",
        "The interface adapts to larger screens",
        "Interactive controls remain usable on small screens",
        "Content does not overflow horizontally",
      ],
    );
  }

  /* --------------------------------------------------------------- */
  /* PWA support                                                       */
  /* --------------------------------------------------------------- */

  if (
    text.includes("pwa") ||
    text.includes("progressive web app") ||
    text.includes("offline")
  ) {
    add(
      "REQ-PWA",
      "Progressive Web App support",
      "The application must support installation and PWA behavior using the required Vite PWA tooling.",
      "critical",
      [
        "PWA configuration exists",
        "A web app manifest is provided",
        "The application can be installed as a PWA",
        "Required service-worker/PWA configuration exists",
      ],
    );
  }

  /* --------------------------------------------------------------- */
  /* Offline support                                                  */
  /* --------------------------------------------------------------- */

  if (
    text.includes("offline") ||
    text.includes("offline support") ||
    text.includes("pwa")
  ) {
    add(
      "REQ-OFFLINE",
      "Offline support",
      "The application must provide offline-capable behavior appropriate for the PWA prototype.",
      "high",
      [
        "Application assets can be cached",
        "The application can load in an offline-capable state after installation/caching",
        "Offline behavior does not break the core application shell",
      ],
    );
  }

  /* --------------------------------------------------------------- */
  /* Engaging user experience                                         */
  /* --------------------------------------------------------------- */

  if (
    text.includes("engaging") ||
    text.includes("user experience") ||
    text.includes("engaging user experience") ||
    isSpeechTherapyTask
  ) {
    add(
      "REQ-UX",
      "Engaging user experience",
      "The application must provide an engaging and motivating user experience suitable for a speech therapy learning program.",
      "high",
      [
        "The UI provides clear visual hierarchy",
        "User actions provide understandable feedback",
        "Therapy activities feel engaging and approachable",
        "Progress or rewards reinforce continued practice",
      ],
    );
  }

  /* --------------------------------------------------------------- */
  /* Framer Motion                                                    */
  /* --------------------------------------------------------------- */

  if (
    text.includes("framer motion") ||
    text.includes("animation") ||
    text.includes("animated")
  ) {
    add(
      "REQ-ANIMATION",
      "Motion and interaction feedback",
      "The application must use Framer Motion for appropriate animations and interaction feedback.",
      "medium",
      [
        "Framer Motion is configured as a dependency",
        "Relevant UI interactions use motion or animation",
        "Animations do not prevent normal interaction",
      ],
    );
  }

  /* --------------------------------------------------------------- */
  /* React + Vite                                                     */
  /* --------------------------------------------------------------- */

  if (text.includes("react") || text.includes("vite")) {
    add(
      "REQ-STACK",
      "React and Vite implementation",
      "The application must use React with Vite as the frontend application stack.",
      "high",
      [
        "React is used by the application",
        "Vite is used as the build/development tool",
        "The project has a valid Vite application configuration",
      ],
    );
  }

  /* --------------------------------------------------------------- */
  /* Tailwind CSS                                                     */
  /* --------------------------------------------------------------- */

  if (text.includes("tailwind") || text.includes("tailwind css")) {
    add(
      "REQ-TAILWIND",
      "Tailwind CSS styling",
      "The application must use Tailwind CSS for the primary UI styling.",
      "high",
      [
        "Tailwind CSS is configured",
        "Application components use Tailwind utility classes",
        "Responsive styling is implemented with the configured CSS system",
      ],
    );
  }

  return requirements;
}

/* ------------------------------------------------------------------ */
/* LLM validation                                                     */
/* ------------------------------------------------------------------ */

function validateRequirements(value: unknown): Requirement[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter(
      (item): item is Record<string, unknown> =>
        Boolean(item) && typeof item === "object",
    )
    .filter(
      (item) =>
        typeof item.id === "string" &&
        typeof item.title === "string" &&
        typeof item.description === "string" &&
        Array.isArray(item.acceptanceCriteria),
    )
    .map((item, index) => ({
      id: String(item.id).trim() || `REQ-${String(index + 1).padStart(3, "0")}`,

      title: String(item.title).trim(),

      description: String(item.description).trim(),

      priority:
        item.priority === "critical" ||
        item.priority === "high" ||
        item.priority === "medium" ||
        item.priority === "low"
          ? item.priority
          : "medium",

      acceptanceCriteria: (item.acceptanceCriteria as unknown[])
        .filter(
          (criterion): criterion is string =>
            typeof criterion === "string" && criterion.trim().length > 0,
        )
        .map((criterion) => criterion.trim()),
    }));
}

/* ------------------------------------------------------------------ */
/* Main Research Agent                                                */
/* ------------------------------------------------------------------ */

export async function runTaskResearchAgent(
  input: ReviewInput,
): Promise<TaskResearchResult> {
  const startedAt = new Date().toISOString();

  const deterministicRequirements = extractRequirements(input.task);

  let llmRequirements: Requirement[] = [];

  try {
    const llm = createLLMProvider();

    const response = await llm.complete({
      system: `
You are a software task requirement extraction agent.

Extract concrete, testable requirements from the developer task.

Return ONLY valid JSON:

{
  "requirements": [
    {
      "id": "REQ-001",
      "title": "Short title",
      "description": "Concrete implementation requirement",
      "priority": "critical|high|medium|low",
      "acceptanceCriteria": [
        "Concrete criterion"
      ]
    }
  ]
}

Rules:

- Extract every important functional requirement.
- Extract important technical requirements.
- Extract UX and responsive requirements.
- Extract PWA/offline requirements when mentioned.
- Extract framework/library requirements when explicitly requested.
- Each requirement must be independently testable.
- Do not inspect the repository.
- Do not claim implementation exists.
- Do not return markdown.
- Preserve security-sensitive requirements.
- Do not merge unrelated requirements into one requirement.
`,
      user: input.task,
    });

    const cleaned = response
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    const parsed: unknown = JSON.parse(cleaned);

    if (parsed && typeof parsed === "object" && "requirements" in parsed) {
      llmRequirements = validateRequirements(
        (
          parsed as {
            requirements: unknown;
          }
        ).requirements,
      );
    }
  } catch {
    llmRequirements = [];
  }

  /*
   * Deterministic extraction is intentionally preferred.
   *
   * This makes the demo/review stable even when:
   * - Gemini quota is unavailable
   * - the LLM returns invalid JSON
   * - the LLM provider is unavailable
   *
   * LLM requirements are used when deterministic extraction
   * cannot identify anything.
   */

  const requirements =
    deterministicRequirements.length > 0
      ? deterministicRequirements
      : llmRequirements;

  return {
    requirements,

    trace: {
      agent: "task-research-agent",

      startedAt,

      completedAt: new Date().toISOString(),

      inputSummary: input.task.slice(0, 500),

      actions: [
        "Read developer task",
        "Performed deterministic requirement extraction",
        "Attempted structured LLM extraction",
        "Validated structured LLM output",
        "Selected stable requirements",
      ],

      findings: [
        `Extracted ${requirements.length} requirements.`,
        `Deterministic requirements: ${deterministicRequirements.length}.`,
        `LLM requirements: ${llmRequirements.length}.`,
        `Requirement extraction completed without repository inspection.`,
      ],

      retries: 0,
    },
  };
}
