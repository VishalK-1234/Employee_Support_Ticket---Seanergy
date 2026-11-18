export const CATEGORIES = [
  "Hardware",
  "Software",
  "Network",
  "Access",
  "Other",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const PRIORITIES = ["Low", "Medium", "High"] as const;
export type Priority = (typeof PRIORITIES)[number];

export const STATUSES = [
  "Open",
  "In Progress",
  "Resolved",
  "Closed",
] as const;
export type Status = (typeof STATUSES)[number];

export type Role = "employee" | "support";

export interface ValidationResult<T> {
  valid: boolean;
  value?: T;
  error?: string;
}

export function validateTitle(input: unknown): ValidationResult<string> {
  if (typeof input !== "string") {
    return { valid: false, error: "Title is required." };
  }
  const trimmed = input.trim();
  if (trimmed.length < 1) {
    return { valid: false, error: "Title is required and cannot be empty." };
  }
  if (trimmed.length > 100) {
    return {
      valid: false,
      error: "Title must not exceed 100 characters.",
    };
  }
  return { valid: true, value: trimmed };
}

export function validateDescription(input: unknown): ValidationResult<string> {
  if (typeof input !== "string") {
    return { valid: false, error: "Description is required." };
  }
  const trimmed = input.trim();
  if (trimmed.length < 1) {
    return {
      valid: false,
      error: "Description is required and cannot be empty.",
    };
  }
  return { valid: true, value: trimmed };
}

export function validateCategory(input: unknown): ValidationResult<Category> {
  if (typeof input !== "string" || !CATEGORIES.includes(input as Category)) {
    return {
      valid: false,
      error: `Category must be one of: ${CATEGORIES.join(", ")}.`,
    };
  }
  return { valid: true, value: input as Category };
}

export function validatePriority(input: unknown): ValidationResult<Priority> {
  if (typeof input !== "string" || !PRIORITIES.includes(input as Priority)) {
    return {
      valid: false,
      error: `Priority must be one of: ${PRIORITIES.join(", ")}.`,
    };
  }
  return { valid: true, value: input as Priority };
}

export function validateStatus(input: unknown): ValidationResult<Status> {
  if (typeof input !== "string" || !STATUSES.includes(input as Status)) {
    return {
      valid: false,
      error: `Status must be one of: ${STATUSES.join(", ")}.`,
    };
  }
  return { valid: true, value: input as Status };
}

export function validateComment(input: unknown): ValidationResult<string> {
  if (typeof input !== "string") {
    return { valid: false, error: "Comment content is required." };
  }
  const trimmed = input.trim();
  if (trimmed.length < 1) {
    return {
      valid: false,
      error: "Comment content is required and cannot be empty.",
    };
  }
  if (trimmed.length > 1000) {
    return {
      valid: false,
      error: "Comment content must not exceed 1000 characters.",
    };
  }
  return { valid: true, value: trimmed };
}
