export type EvaluationCase = {
  id: string;
  title: string;
  task: string;
  expectedSignals: string[];
  challenging?: boolean;
};

export const evaluationCases: EvaluationCase[] = [
  {
    id: "case-01",
    title: "PDF Upload",
    task:
      "Build a file upload feature that allows users to upload PDF documents and view their upload history.",
    expectedSignals: [
      "validation",
      "security",
      "error handling",
      "storage",
      "testing",
    ],
  },

  {
    id: "case-02",
    title: "Stripe Subscriptions",
    task:
      "Add Stripe subscriptions to our Next.js SaaS application. Users should be able to upgrade, downgrade, and cancel their subscription.",
    expectedSignals: [
      "webhook",
      "authentication",
      "authorization",
      "payment",
      "error handling",
      "testing",
    ],
  },

  {
    id: "case-03",
    title: "Google Login",
    task:
      "Add Google login to our existing Next.js application.",
    expectedSignals: [
      "authentication",
      "callback",
      "security",
      "error handling",
      "testing",
    ],
  },

  {
    id: "case-04",
    title: "Search",
    task:
      "Add search functionality to the product catalog so users can search products by name.",
    expectedSignals: [
      "input",
      "validation",
      "performance",
      "empty",
      "testing",
    ],
  },

  {
    id: "case-05",
    title: "Email Notifications",
    task:
      "Send an email notification to users when their order is shipped.",
    expectedSignals: [
      "email",
      "failure",
      "retry",
      "duplicate",
      "testing",
    ],
  },

  {
    id: "case-06",
    title: "CSV Import",
    task:
      "Allow administrators to import customer records from a CSV file.",
    expectedSignals: [
      "validation",
      "duplicate",
      "error handling",
      "security",
      "testing",
    ],
  },

  {
    id: "case-07",
    title: "Password Reset",
    task:
      "Implement a password reset flow for users who forget their password.",
    expectedSignals: [
      "authentication",
      "token",
      "expiration",
      "security",
      "testing",
    ],
  },

  {
    id: "case-08",
    title: "Image Processing",
    task:
      "Allow users to upload profile images and automatically resize them.",
    expectedSignals: [
      "validation",
      "file",
      "size",
      "security",
      "error handling",
    ],
  },

  {
    id: "case-09",
    title: "Admin Dashboard",
    task:
      "Build an admin dashboard showing user registrations and activity statistics.",
    expectedSignals: [
      "authorization",
      "authentication",
      "data",
      "performance",
      "testing",
    ],
  },

  {
    id: "case-10",
    title: "Inventory Update",
    task:
      "Update product inventory automatically whenever an order is completed.",
    expectedSignals: [
      "transaction",
      "duplicate",
      "concurrency",
      "failure",
      "testing",
    ],
    challenging: true,
  },

  {
    id: "case-11",
    title: "API Rate Limiting",
    task:
      "Add rate limiting to the public API to prevent abuse.",
    expectedSignals: [
      "rate limit",
      "security",
      "authentication",
      "error",
      "testing",
    ],
  },

  {
    id: "case-12",
    title: "File Export",
    task:
      "Allow users to export their account data as a downloadable JSON file.",
    expectedSignals: [
      "authorization",
      "privacy",
      "validation",
      "security",
      "testing",
    ],
  },
];