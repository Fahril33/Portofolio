---
description: 
---

## 1. PRE-EXECUTION (ANALYSIS)
- Read Context: Analyze target files and dependencies before code generation. Zero assumptions.
- Scope Constraint: Modify only requested files/lines. Out-of-scope refactoring is strictly prohibited.

## 2. EXECUTION (STEP-BY-STEP)
- Task Division: Break complex requests into smaller logical sub-tasks.
- Gatekeeping: Complete one sub-task, report status, and halt execution until user confirmation.

## 3. RUNNING VALIDATION & VERIFICATION
- Static Validation: Before marking a task complete, verify type correctness. Output `pnpm tsc --noEmit` or linter commands for the user to validate if internal checks are unavailable.
- Environment Constraint: Do not launch browsers, headless browsers, or attempt visual validation within the editor.
- Test Generation: Write automated unit tests strictly for logic functions, never for UI visuals.

## 4. POST-EXECUTION (MANUAL CHECK INSTRUCTIONS)
- Output strict manual validation steps upon component/feature completion.
- Required format:
  1. Validation Command (e.g., typecheck or `pnpm dev`).
  2. Target Route (`/path`).
  3. Action (Interaction trigger).
  4. Expected Outcome (UI change/Data state).