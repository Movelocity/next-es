# Change: Update Workspace Initialization Logic

## Why
Currently, the application hardcodes `'default'` as the initial workspace, which creates a poor user experience. When users work with multiple workspaces, they must re-select their preferred workspace on each visit. This change improves UX by remembering the last selected workspace and automatically restoring it on subsequent visits.

## What Changes
- Remove the hardcoded `'default'` workspace initialization
- Add logic to restore the last selected workspace from localStorage on app initialization
- If no previous workspace selection exists in localStorage, automatically select the first available workspace from the server
- Maintain backward compatibility by ensuring workspace persistence continues to work as expected

## Impact
- Affected specs: `workspace-management` (new)
- Affected code:
  - `app/components/EsLogPanel/store.ts` (line 77: workspace initialization)
  - `app/components/workspace/WorkspaceSelector.tsx` (initialization logic)
  - `app/components/workspace/WorkspaceManager.tsx` (initialization logic)
- User experience: Users will no longer need to manually select their workspace on each visit
- No breaking changes: Existing localStorage keys remain compatible

