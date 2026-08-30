---
name: OpenAPI Zod compatibility
description: Orval-generated server Zod schemas must stay compatible with this workspace's installed runtime and Node globals.
---

Use OpenAPI `number` for API numeric fields when generating schemas in this workspace unless the Zod/Orval compatibility is upgraded together. For multipart uploads, avoid OpenAPI `format: binary` in shared server contracts unless the Node package explicitly provides File/Blob globals; model stored photo references as strings and validate incoming files at the Express boundary.

**Why:** The current generated Zod package resolves to a runtime without `zod.int()`, and its Node TypeScript/runtime context does not provide browser File/Blob globals. Either shape can break shared codegen even when the browser client itself supports it.

**How to apply:** If integer semantics or browser-native multipart types are important, update the workspace Zod/Orval/server setup as one compatibility change; otherwise use neutral OpenAPI types and keep semantic/file validation explicit at the API boundary.