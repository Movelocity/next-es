# Testing Guide

This document provides step-by-step instructions for manually testing the workspace initialization changes.

## Prerequisites

1. Start the development server: `yarn dev` (or `npm run dev`)
2. Open browser DevTools (F12) to monitor console logs
3. Have access to Application > Local Storage in DevTools

## Test Scenarios

### ✅ Test 1: Fresh Installation (No localStorage)

**Objective:** Verify that first-time users get automatically assigned the first available workspace.

**Steps:**
1. Open DevTools > Application > Local Storage
2. Clear all `eslog_*` keys (especially `eslog_currentWorkspace`)
3. Refresh the page (F5)
4. Check console logs for: `"No saved workspace found, fetching first available workspace from server"`
5. Verify the WorkspaceSelector displays a workspace name (not "加载中...")
6. Check Local Storage to confirm `eslog_currentWorkspace` is now set

**Expected Results:**
- First workspace from server is automatically selected
- Console shows initialization messages
- localStorage contains the selected workspace name

---

### ✅ Test 2: Workspace Persistence After Browser Refresh

**Objective:** Verify that the selected workspace is restored on subsequent visits.

**Steps:**
1. Select a workspace from the WorkspaceSelector dropdown
2. Wait for the workspace to load (console shows success message)
3. Note the current workspace name
4. Refresh the page (F5)
5. Verify the same workspace is still selected

**Expected Results:**
- Workspace selection persists across refreshes
- Console shows: `"Initializing with saved workspace: '<workspace-name>'"`
- User doesn't need to re-select their workspace

---

### ✅ Test 3: Saved Workspace No Longer Exists

**Objective:** Verify graceful fallback when saved workspace is deleted.

**Steps:**
1. Select a workspace (e.g., "test-workspace")
2. Verify localStorage has `eslog_currentWorkspace` = "test-workspace"
3. Using WorkspaceManager, delete "test-workspace"
4. Refresh the page (F5)
5. Observe console logs and UI

**Expected Results:**
- Console shows: `"Saved workspace 'test-workspace' not found, falling back to first available workspace"`
- First available workspace is automatically selected
- localStorage is updated with new workspace name
- No errors or crashes

---

### ✅ Test 4: No Workspaces Available

**Objective:** Verify the app handles empty workspace list gracefully.

**Steps:**
1. Delete all workspaces using WorkspaceManager
2. Refresh the page (F5)
3. Check console logs and UI behavior

**Expected Results:**
- Console shows: `"No workspaces available on server. Please create a workspace to get started."`
- WorkspaceSelector shows "加载中..." or empty state
- No JavaScript errors
- User can still create a new workspace

---

### ✅ Test 5: Multiple Workspaces Selection

**Objective:** Verify workspace switching works correctly and persists.

**Steps:**
1. Ensure you have at least 3 workspaces
2. Switch between different workspaces using WorkspaceSelector
3. After each switch, check localStorage value
4. Refresh after each switch to confirm persistence

**Expected Results:**
- Each workspace switch updates localStorage immediately
- After refresh, the last selected workspace is restored
- Workspace data (queries, params) loads correctly for each workspace

---

### ✅ Test 6: SSR Compatibility

**Objective:** Verify no hydration mismatches occur.

**Steps:**
1. With a saved workspace in localStorage
2. Perform a hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
3. Check browser console for hydration errors
4. Verify UI renders without flashing or mismatches

**Expected Results:**
- No "Hydration failed" errors in console
- No content mismatch warnings
- Smooth initial render

---

### ✅ Test 7: Backward Compatibility

**Objective:** Verify existing users' data is preserved.

**Steps:**
1. Manually set localStorage items with old format (if applicable)
2. Ensure `eslog_currentWorkspace` exists with a valid workspace name
3. Refresh the page
4. Verify the workspace loads correctly

**Expected Results:**
- Existing localStorage data is read correctly
- No data migration required
- Users' existing setup works without changes

---

## Console Log Reference

During testing, you should see these console messages:

**Successful initialization with saved workspace:**
```
Initializing with saved workspace: 'my-workspace'
Loaded workspace 'my-workspace' from server
```

**First-time user initialization:**
```
No saved workspace found, fetching first available workspace from server
Initializing with first workspace: 'workspace-1'
Loaded workspace 'workspace-1' from server
```

**Fallback when saved workspace doesn't exist:**
```
Initializing with saved workspace: 'deleted-workspace'
Workspace 'deleted-workspace' not found on server, using local data without enabling sync
Saved workspace 'deleted-workspace' not found, falling back to first available workspace
Loaded workspace 'workspace-1' from server
```

**No workspaces available:**
```
No saved workspace found, fetching first available workspace from server
No workspaces available on server. Please create a workspace to get started.
```

---

## Troubleshooting

### Issue: Workspace keeps resetting to the first one

**Possible Causes:**
- localStorage is being cleared by browser settings
- Another part of the code is overwriting `eslog_currentWorkspace`
- Workspace switching is not saving to localStorage

**Solution:**
- Check browser settings for localStorage persistence
- Verify `setCurrentWorkspace` is being called on workspace switch
- Check DevTools > Application > Local Storage for the key

### Issue: Console shows errors about workspace not found

**Possible Causes:**
- Workspace was deleted but localStorage still references it
- Server-side workspace data is out of sync

**Solution:**
- This should trigger automatic fallback (see Test 3)
- If not working, check `initializeWorkspace` logic in store.ts

### Issue: "加载中..." displayed permanently

**Possible Causes:**
- `initializeWorkspace` is not being called
- API requests are failing
- No workspaces exist on server

**Solution:**
- Check console for initialization messages
- Verify API endpoints are working
- Check network tab in DevTools for failed requests

---

## Verification Checklist

After completing all tests, verify:

- [ ] First-time users automatically get a workspace assigned
- [ ] Workspace selection persists across browser refreshes
- [ ] Deleted workspace triggers fallback behavior
- [ ] Empty workspace list is handled gracefully
- [ ] No console errors during any test scenario
- [ ] No hydration warnings in console
- [ ] localStorage keys are correctly maintained
- [ ] WorkspaceSelector UI updates correctly
- [ ] WorkspaceManager UI updates correctly

---

## Additional Notes

- All console logs are intentionally verbose for debugging
- In production, consider reducing log verbosity
- The initialization happens once per page load
- Components call `initializeWorkspace()` on mount

