# Project Agent Instructions

## General Rules

- **'PRAGMA journal_mode = DELETE;' IS DELIBERATE, DO NOT MODIFY.**
- **Do not modify any documents in the .agents directory.** Require the operator to make manual changes to the documentation provided in the .agents directory. You may propose changes to the documentation provided in the .agents directory but you are not allowed to write to the documentation directly.
- **No Unsolicited Builds or Repository-Wide Linting**:
  - NEVER run full project builds (`npm run build`, `pnpm run build`, `tsc`, `vite build`) or workspace lint sweeps (`npm run lint`, `eslint .`) unless explicitly directed to do so by the operator.
  - Rely on targeted code inspection, language server feedback, and the active development server (HMR). Do not run whole-codebase verification steps after routine file edits.
- Follow existing project conventions and architecture.
- Do not introduce unnecessary dependencies.
- Preserve backward compatibility unless explicitly authorized.
- When interacting with Cloudflare, use the cf CLI unless the project has a Wrangler configuration file.

## Specialized Instructions

Before executing any request, perform a **Domain Assessment**:
1. Identify all applicable domains involved in the task:
   - Python operations/scripts → `.agents/python.md`
   - General REST API usage, conventions, verification protocol → `.agents/api.md`
   - REST API table CRUD operations, query filters, and relations → `.agents/api-tables.md`
   - Specialized endpoints (user auth, sessions, custom workflows) → Inspect `api/index.js`
   - UI, styling, layout, or frontend components → `.agents/design.md`
2. **Cross-Domain Requirement**: If more than one domain is touched (e.g., frontend code that calls REST endpoints, or Python scripts consuming APIs), you **MUST** read and consult all corresponding references before writing code.
3. Apply each document's rules strictly to its respective subsystem (do not bleed frontend rules into backend or vice versa).
4. Specialized instructions supplement these general rules but do not automatically override them. If an actual conflict exists within the applicable scope, stop and report the conflict rather than arbitrarily choosing one.