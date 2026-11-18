# Specification Review: Traceability, Gaps, and Inconsistencies

## Coverage result

- All SRS acceptance criteria AC-01 through AC-12 are covered by at least one planned implementation or verification task.
- The plan’s Phase 6 checks provide explicit verification for each acceptance criterion.
- Task 1.1 is the only task without an acceptance-criterion mapping; it is a bootstrap task tied only to NFR-05.
- NFR-05 is not independently acceptance-tested. The plan says to confirm it by checking the finished app against the out-of-scope section, but it does not define a separate test task.

## Requirements needing attention

1. **Closed-ticket comments conflict with the current application, not with the SRS/plan.** The SRS explicitly allows authorized comments on Closed tickets (section 2, BR-04, AC-07), and the plan repeats that rule. The current implementation documentation and `src/lib/tickets.ts` reject comments on Closed tickets. This is a behavior mismatch that must be resolved by a separate product decision; this exercise does not change it.
2. **The current repository differs from the plan’s file naming.** The plan refers to `middleware.ts`; this repository uses `src/proxy.ts`, consistent with its current Next.js setup. The plan should be read as architectural intent, not as permission to add a second redirect mechanism.
3. **Database setup is inconsistent between plan and repository.** The plan says to use `prisma migrate dev`, while the repository README and current setup use `npx prisma db push`; there is no migration directory in the repository. Choose one documented workflow before implementation work, without changing it as part of this exercise.
4. **The plan says Prisma enums and a `body` comment field, while the current schema uses string fields and `Comment.content`.** The SRS specifies allowed values and comment text behavior but does not require Prisma enum types or a field name. The existing schema/architecture should be treated as the current implementation constraint.
5. **Current verification does not represent the SRS closed-comment rule.** The repository’s verification script expects a Closed-ticket comment to return 400, which agrees with current code but contradicts AC-07 and the plan. It therefore cannot be treated as complete SRS acceptance evidence without reconciliation.

## Missing or underspecified verification

- Add an explicit scope/NFR-05 review task if the team requires every NFR to have a named task; otherwise retain Task 1.1 as the documented unlinked bootstrap task.
- AC-01 requires every ticket action to be unavailable while signed out, including list, create, view, edit, status, and comment. The plan’s Phase 6.1 covers this, but the current page proxy only concerns page paths; handler-level checks must remain authoritative.
- AC-12 requires persistence after sign-out/sign-in for all four mutation types. The plan includes this in 6.12; it is not demonstrated by the repository’s existing `scripts/verify.ts` alone.

## Scope decision

No new requirements were added. No application source files were modified. The artifacts preserve the SRS rules and call out conflicts rather than silently selecting a new behavior.
