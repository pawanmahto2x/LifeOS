# Phase 3 Implementation Report: Goal UI/UX Restructuring

## 1. UI Audit Findings
- **Goals Dashboard**: Previously displayed simple cards with a basic modal. Felt disjointed from the rest of the application.
- **Goal Detail Page**: Had a basic "AI Plan" preview box injected awkwardly in the middle of the screen. Did not provide any review capabilities before persistence (immediate mutation).
- **Backend Schema Constraints**: The `Task` and `Habit` schemas do not contain a strict `goalId` foreign key. Tasks/Habits generated during `applyAIPlan` are pushed globally to the user's account under the Goal's *category*. 
- **Tests**: The frontend lacked a configured test runner (Jest/Vitest). Attempting to inject one hit deeply nested Babel peer-dependency conflicts within `shadcn/ui` components.

## 2. Components Changed
- `src/app/(dashboard)/goals/page.tsx`: Entirely redesigned. Separated active vs completed goals, incorporated empty states with clear calls-to-action, and improved visual hierarchy using strategic progress bars and current milestone highlights.
- `src/app/(dashboard)/goals/[id]/page.tsx`: Redesigned to feature a cohesive "Strategic Roadmap" layout. Integrated the new interactive AI Plan review, and improved the layout structure (Header, Progress Tracker, Roadmap, Context, Analytics).

## 3. Components Created
- `CreateGoalDialog.tsx`: An advanced 2-step modal. Step 1 (Define Goal), Step 2 (Context Building for AI). Navigates smoothly directly into AI planning on the Goal Details page via URL param `?generate=true`.
- `AIPlanReview.tsx`: An interactive state-driven component that allows users to review, edit, and remove generated milestones, tasks, and habits before hitting "Accept & Apply Plan". 

## 4. Backend Files Changed
None. The existing API contracts (`goalService.generateAIPlan` and `goalService.applyAIPlan`) were perfectly suited to handle the new interactive approval workflow.

## 5. API Changes
None. The frontend correctly delays calling the `apply-plan` endpoint until the user hits "Accept All & Add to LifeOS" on the edited version of the payload.

## 6. Goal Workflow
CREATE GOAL (Dialog) -> ADD CONTEXT (Dialog Step 2) -> Redirect to `/[id]?generate=true` -> GENERATE AI PLAN -> REVIEW AI PLAN (Interactive Editor) -> USER APPROVAL -> APPLY PLAN -> TRACK PROGRESS.

## 7. Approval Workflow
The AI Plan payload is strictly held in local React state (`editedPlan`). Users can remove milestones/tasks, rename them, or regenerate completely. The final payload is submitted to MongoDB only upon explicit approval.

## 8. Tests Added
- Skipped frontend tests due to missing test runner in `lifeos-client` and severe npm dependency conflicts with `@vitejs/plugin-react` & `shadcn` Babel presets.

## 9. Existing Test Results
- All **113 backend tests** pass securely. No backend logic was modified, ensuring total backward compatibility.

## 10. TypeScript Result
- Frontend compilation (`npx tsc --noEmit`) passes with 0 errors.

## 11. Remaining Limitations
1. **Frontend Testing**: Will need dedicated effort to install Playwright or Cypress later, as Jest/Vitest hit standard `peerDependency` conflicts in the current `package.json` tree.
2. **Goal-Linked Tasks Visibility**: Because `Task` and `Habit` schemas lack a strict `goalId` foreign key in the backend, they are available in the user's global task/habit tracking modules but cannot be strictly tied back and listed directly on the Goal detail page natively. I opted to preserve backend stability and not introduce breaking schema changes for this phase.

## 12. Screenshots/Preview
Launch the Next.js development server to view the new workflow in `/goals`.
