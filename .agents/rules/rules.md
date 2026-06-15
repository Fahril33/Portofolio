---
trigger: always_on
---

## 1. ARCHITECTURE & MODULARITY
- Directory Structure: Feature-based (e.g., `src/features/auth`).
- Logic Separation: Isolate business logic from UI using custom hooks.
- File Size Limit: Max 150-200 lines per UI component. Split into sub-components if exceeded.

## 2. PATHING & IMPORTS
- Allowed: Strict relative paths (`../../components/Button`, `./utils`).
- Forbidden: Path aliases (`@/`, `~/`) in routing and component imports.

## 3. UI CODING STANDARDS
- Component Naming: Explicit and descriptive.
- Export Rules: Anonymous functions are strictly prohibited (`export default function() {}` = ERROR).
- Event Naming: Descriptive prefixes required (`handleSaveClick`, `onSubmitSuccess`).

## 4. TYPESCRIPT WRITING RULES & LOGIC
- Explicit Returns: All functions and React components must have explicit return types defined.
- Interface Preference: Prefer `interface` over `type` for object shape and props definitions.
- Strict Typing: `any` type is strictly prohibited. Use `unknown` or `Record<string, unknown>` for dynamic data.
- Exports: Always export interfaces/types that define component props or API responses.
- TS Directives: `//@ts-ignore` or `//@ts-expect-error` are forbidden unless strictly necessary and accompanied by a justification comment.
- State Mutations: 100% Immutability required for objects/arrays.
- Error Handling: `try...catch` required for async/await operations.