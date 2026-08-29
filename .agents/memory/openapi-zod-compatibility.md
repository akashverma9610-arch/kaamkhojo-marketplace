---
name: OpenAPI Zod compatibility
description: Orval integer schemas can emit zod.int, which is incompatible with the workspace's installed Zod runtime.
---

Use OpenAPI `number` for API numeric fields when generating schemas in this workspace unless the Zod/Orval compatibility is upgraded together.

**Why:** The current generated Zod package resolves to a runtime without `zod.int()`, so integer fields make the shared library typecheck fail after codegen.

**How to apply:** If integer semantics are important, update the workspace Zod/Orval setup as one compatibility change; otherwise use `number` in the contract and keep boundary validation explicit where needed.