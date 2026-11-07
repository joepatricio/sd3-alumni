# REST API Proper Usage

- **Primary Reference**
  - Always consult `.agents/api.md` before implementing, modifying, debugging, or integrating with the project's REST API.
  - Treat `.agents/api.md` as the primary reference for API conventions, verification protocol, canonical lookup rules, and discrepancy reporting.
  - Do not assume undocumented API behavior.

- **Specialized Endpoints (Auth, Sessions & Custom Logic)**
  - Specialized endpoints (such as authentication, session verification, user registration, and custom non-table business logic) are intentionally not documented in markdown.
  - Agents **must inspect `api/index.js` directly** as the source of truth to trace route handlers, parameters, payload schemas, and response shapes.

- **Table CRUD Operations & Query Syntax**
  - Standard table and entity CRUD operations utilize the project's query parser (`api/queryParser.js`).
  - Consult **`.agents/table-api.md`** for query parameters (`_where`, `_include`, `_sort`, `_order`, `_page`, `_per_page`), filtering operators, relation hydration rules, and concrete request/response examples.

- **Verification Protocol (HTTP-First Testing & Code Introspection)**
  - **Runtime & Contract Verification**: When verifying or testing API endpoints, response shapes, and query syntax, always execute HTTP requests against the live running API server (e.g., using `curl.exe` or lightweight HTTP test scripts).
  - **No Direct Database Probing**: Do not bypass the REST layer to query data directly via SQLite drivers (`better-sqlite3`, raw `.db` files). Raw database queries bypass middleware, authentication, relational hydration, default projections, and JSON serialization, producing misleading representations of what the API actually serves.
  - **Code Introspection Permitted**: Agents are fully permitted and encouraged to read backend source code (e.g., `api/index.js`, `api/queryParser.js`, `prisma/schema.prisma`) to trace route logic, schemas, and parser rules. Code examination must serve understanding and implementation, while behavioral verification remains over HTTP.

- **Canonical Lookup & Status Verification**
  - **No Inferred Statuses**: Never assume, extrapolate, or invent status names, category values, or enum-like literals (e.g., `userStatus`, `contentStatus`, `profileStatus`, `eventStatus`) from UI strings, variable names, or legacy code comments.
  - **Ground Truth for Lookups**: Statuses and category names are relational database entities. When constructing queries with relational filters (such as `_where={"userStatus":{"statusName":{"notIn":[...]}}}`), agents must verify exact values against the live lookup endpoints (e.g., `GET /api/userStatuses`, `GET /api/contentStatuses`).
  - **Strict Filter Fidelity**: When the operator or specification supplies an explicit set of filter conditions (e.g., `"Not Banned, Deactivated, or Pending"`), agents must restrict their query payloads strictly to those specified values without embellishing or re-introducing deprecated/stale statuses found elsewhere in legacy code.
  - **Differentiating Active Contracts from Legacy Residue**: If an identifier or status string appears in frontend/backend code (e.g., `disabledUsers`) but is absent from the database lookup table or Prisma schema, treat it as obsolete legacy code—do not propagate it to API requests, query parameters, or documentation.

- **Documentation Synchronization**
  - Whenever an implementation changes the REST API's behavior, `.agents/api.md` and/or `.agents/table-api.md` must be updated to reflect the changes. Coordinate these changes with your operator.
  - Ensure documentation accurately describes the implemented API, including affected endpoints, request parameters, response structures, status codes, and error handling.
  - Do not consider API-related implementation work complete until the corresponding documentation has been reviewed and updated.

- **Discrepancy Reporting**
  - Compare the documented API behavior against the actual implementation whenever working on relevant API functionality.
  - Report any inconsistencies between documentation and the implemented REST API.
  - Clearly identify:
    1. The affected endpoint or functionality.
    2. The documented behavior.
    3. The observed implementation behavior.
    4. The potential implications of the discrepancy.
  - Do not independently decide whether the implementation or documentation should take precedence when they conflict.
  - Require the operator to make an explicit judgement call on how the discrepancy should be resolved.
  - Do not silently modify documentation to legitimize unexpected implementation behavior, or modify implementation to match potentially outdated documentation, without operator direction.