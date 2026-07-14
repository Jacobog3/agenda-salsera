# Release and rollback policy

This policy applies to every production change from July 14, 2026 onward.

## Code releases

1. Work on a `codex/*` feature branch, never directly on `main`.
2. Keep commits focused and run at least `npm run typecheck`, `npm run lint`, and
   `npm run build` before a release candidate is merged.
3. Treat `main` as the production-ready branch.
4. After the production deployment is verified, create a semantic version tag:
   - minor release (`v0.2.0`) for a new capability;
   - patch release (`v0.2.1`) for a compatible fix;
   - major release (`v1.0.0`) for a deliberately breaking or stable milestone.
5. Roll back application code by promoting the last verified Vercel deployment or
   redeploying its tagged commit.

## Database schema

1. Make schema changes only through new files in `supabase/migrations/`.
2. Never edit a migration that has already been applied to production.
3. Prefer a forward corrective migration over a destructive down migration.
4. Keep application changes backward-compatible with the current production
   schema while a deployment is in progress.

## Production content

1. Run cleanup scripts in dry-run mode first and review the exact candidates.
2. Require explicit confirmation before using an `--apply` command.
3. Make update scripts idempotent and guard writes with expected current values.
4. Capture a restorable snapshot of affected records before future bulk or
   destructive updates. Do not commit production exports or secrets to Git.
5. A code rollback does not roll back Supabase content; restore content from its
   snapshot or apply a reviewed corrective script.

## External providers

Keep provider selection in environment configuration when practical. Provider
migrations must preserve the previous configuration until the replacement has
been measured and verified, so reverting does not require a code rewrite.

## Release checklist

- [ ] Scope reviewed with `git diff` and unrelated files excluded.
- [ ] Type checking passes.
- [ ] Lint passes.
- [ ] Production build passes.
- [ ] Database changes have a migration or reviewed dry-run/apply script.
- [ ] Mobile admin flow is checked when admin UI changes.
- [ ] Production deployment is verified before tagging.
- [ ] Release tag and notable changes are recorded.
