const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');
const ts = require('typescript');

function load(file, imports) {
  const source = readFileSync(path.join(__dirname, '..', file), 'utf8');
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      jsx: ts.JsxEmit.ReactJSX,
    },
  });
  const exports = {};
  new Function('require', 'exports', outputText)((name) => {
    assert.ok(Object.hasOwn(imports, name), name);
    return imports[name];
  }, exports);
  return exports;
}

// Run the actual hook logic with controlled state and effects, without mounting Expo.
function hookHarness(file, name, imports) {
  const values = [];
  let effects = [];
  let index = 0;
  const hook = load(file, {
    ...imports,
    react: {
      createContext: () => ({ Provider: 'auth' }),
      Fragment: 'fragment',
      useState(initial) {
        const slot = index++;
        if (!(slot in values)) values[slot] = initial;
        return [values[slot], (next) => {
          values[slot] = typeof next === 'function' ? next(values[slot]) : next;
        }];
      },
      useRef(initial) {
        const slot = index++;
        return values[slot] ??= { current: initial };
      },
      useCallback: (fn) => fn,
      useMemo: (fn) => fn(),
      useEffect: (fn) => effects.push(fn),
    },
    'react/jsx-runtime': { jsx: (type, props, key) => ({ type, props, key }) },
  })[name];
  return {
    render(...args) {
      index = 0;
      effects = [];
      return hook(...args);
    },
    effect(slot) {
      return effects[slot]();
    },
  };
}

const deferred = () => {
  let resolve;
  const promise = new Promise((done) => { resolve = done; });
  return { promise, resolve };
};
const settle = () => new Promise(setImmediate);
const session = { user: { id: 'supabase-user', email: 'test@example.test', user_metadata: { name: 'Test User' } } };
const signedIn = { '@/components/contexts/auth-context': { useAuthContext: () => ({ session, demo: false }) } };

test('startup waits for Supabase and account changes get a fresh provider tree', () => {
  let authChanged;
  const app = hookHarness('components/contexts/auth-context.tsx', 'AuthProvider', {
    '@/hooks/useCalendarType': { useCalendarType: () => ({}) },
    '@/lib/supabase': { supabase: { auth: { onAuthStateChange(callback) {
      authChanged = callback;
      return { data: { subscription: { unsubscribe() {} } } };
    } } } },
    '@/utility/tokenUtils': { setGoogleTokenSession() {} },
    './screen-size-context': { useScreenSize: () => ({ isWeb: true }) },
  });
  const render = () => app.render({ children: null }).props;
  assert.equal(render().value.isStorageLoaded, false);
  app.effect(0);
  authChanged('INITIAL_SESSION', null);
  assert.equal(render().value.validJwt, false);
  authChanged('SIGNED_IN', session);
  assert.equal(render().value.validJwt, true);
  assert.equal(render().children.key, 'supabase-user');
  authChanged('TOKEN_REFRESHED', { ...session, access_token: 'new-token' });
  assert.equal(render().children.key, 'supabase-user');
  authChanged('SIGNED_IN', { user: { id: 'another-user' } });
  assert.equal(render().children.key, 'another-user');
});

test('partial preferences hydrate without writes and only an edited field is saved', async () => {
  const writes = [];
  const palette = [{ paletteId: 0, name: 'Saved', palette: ['#111111'], colorMap: {} }];
  const groups = [{ id: 'Saved group', userId: 'google-user', calendars: [] }];
  const hook = hookHarness('hooks/useColorGroups.ts', 'useCalendarPreferences', {
    ...signedIn,
    '@/components/contexts/profile-context': { useProfileContext: () => ({ familyProfiles: { parent: { id: 'google-user' } } }) },
    '@/utility/constants': { DEFAULT_COLORS: ['#000000'] },
    '@/utility/demoData': {},
    '@/utility/supabaseFunctions': {
      readCalendarPreferences: async () => ({ palette, groups, hiddenCalendars: null }),
      writeCalendarPreferences: async (...args) => writes.push(args),
    },
  });
  hook.render();
  hook.effect(0);
  await settle();
  const loaded = hook.render();
  assert.deepEqual(loaded.paletteData, palette);
  assert.deepEqual(loaded.groupsData, groups);
  assert.deepEqual(loaded.hiddenCalendarsData, []);
  hook.effect(1);
  await settle();
  assert.deepEqual(writes, []);
  loaded.setHiddenCalendarsData(['hidden']);
  hook.render();
  hook.effect(1);
  await settle();
  assert.deepEqual(writes, [['supabase-user', { hiddenCalendars: ['hidden'] }, true, 'google-user']]);
});

test('a failed preference read blocks writes and a successful missing row allows them', async () => {
  const writes = [];
  let fail = true;
  const hook = hookHarness('hooks/useColorGroups.ts', 'useCalendarPreferences', {
    ...signedIn,
    '@/components/contexts/profile-context': { useProfileContext: () => ({ familyProfiles: null }) },
    '@/utility/constants': { DEFAULT_COLORS: ['#000000'] },
    '@/utility/demoData': {},
    '@/utility/supabaseFunctions': {
      async readCalendarPreferences() {
        if (fail) throw new Error('offline');
        return null;
      },
      writeCalendarPreferences: async (...args) => writes.push(args),
    },
  });
  hook.render();
  hook.effect(0);
  await settle();
  const failed = hook.render();
  assert.equal(failed.error, 'offline');
  failed.setHiddenCalendarsData(['unsaved']);
  hook.render();
  hook.effect(1);
  await settle();
  assert.deepEqual(writes, []);
  fail = false;
  await failed.refreshColorGroups();
  const restored = hook.render();
  assert.equal(restored.hasLoadedPreferences, true);
  assert.deepEqual(restored.hiddenCalendarsData, []);
  restored.setHiddenCalendarsData(['hidden']);
  hook.render();
  hook.effect(1);
  await settle();
  assert.deepEqual(writes, [['supabase-user', { hiddenCalendars: ['hidden'] }, false, undefined]]);
});

test('sharing loads on demand and refreshes only the changed calendar', async () => {
  const calls = [];
  let fail = true;
  const hook = hookHarness('hooks/APIFetchingHooks/useCalendarList.ts', 'useCalendarList', {
    ...signedIn,
    '@/utility/demoData': {},
    '@/utility/tokenUtils': { getValidAccessToken: async () => ({ accessToken: 'google-token' }) },
    '@/services/api': {
      fetchCalendarList: async () => ({ items: [
        { id: 'pending', accessRole: 'owner' },
        { id: 'available', accessRole: 'owner' },
        { id: 'reader', accessRole: 'reader' },
      ] }),
      getCalendarSharingSettings: async (id) => {
        calls.push(id);
        if (id === 'pending' && fail) throw new Error('ACL denied');
        return { items: [{ id: 'user:guest@example.test', role: 'reader' }] };
      },
    },
  });
  await hook.render().refetch();
  assert.deepEqual(calls, []);
  assert.equal(hook.render().hasLoadedList, true);
  const panel = hook.render();
  await Promise.all([panel.loadSharingSettings(), panel.loadSharingSettings()]);
  assert.deepEqual(calls, ['available', 'pending']);
  assert.deepEqual(hook.render().sharedObjs.map((cal) => cal.id), ['available']);
  assert.equal(hook.render().hasSharingError, true);
  assert.equal(hook.render().error, null);
  assert.equal(hook.render().calendarObjs.length, 3);

  fail = false;
  await hook.render().refreshSharingSettings('pending');
  assert.deepEqual(calls, ['available', 'pending', 'pending']);
  assert.equal(hook.render().hasSharingError, false);
  assert.equal(hook.render().sharedObjs.length, 2);
});

test('profile uses session metadata and ignores a response after cleanup', async () => {
  const profile = deferred();
  const hook = hookHarness('hooks/useProfile.ts', 'useProfiles', {
    ...signedIn,
    '@/utility/demoData': {},
    '@/lib/supabase': { supabase: { from: () => ({
      select: () => ({ eq: (column, value) => {
        assert.deepEqual([column, value], ['id', 'supabase-user']);
        return { maybeSingle: () => profile.promise };
      } }),
    }) } },
  });
  assert.equal(hook.render().familyProfiles.parent.name, 'Test User');
  const cleanup = hook.effect(0);
  cleanup();
  profile.resolve({ data: { google_id: 'old-user', name: 'Old Profile' } });
  await settle();
  assert.equal(hook.render().familyProfiles.parent.name, 'Test User');
});

test('group reconciliation does not write during startup or when the list confirms a change', () => {
  const saved = [{ id: 'owner', userId: 'google-user', calendars: [{ calendarId: 'removed', isActive: true }] }];
  const hook = hookHarness('hooks/useCalendarGroup.ts', 'useCalendarGroup', {
    ...signedIn,
    '@/components/contexts/calendar-preferences-context': { useCalendarPreferencesContext: () => ({
      groupsData: saved,
      hasLoadedPreferences: true,
      hasHydratedPreferences: true,
      setGroupsData: () => assert.fail('group reconciliation wrote preferences'),
    }) },
  });
  assert.equal(hook.render(null, 'google-user').canEdit, false);
  const groups = hook.render([{ calendarId: 'added', owner: true }], 'google-user').groupedCalendars;
  assert.deepEqual(groups[0].calendars.map((cal) => cal.calendarId), ['added']);
  assert.deepEqual(saved[0].calendars, [{ calendarId: 'removed', isActive: true }]);
});

test('the sidebar keeps its saved groups until refreshed preferences arrive', () => {
  const calendar = { calendarId: 'cal', owner: true };
  const group = (id) => [{ id, userId: 'google-user', calendars: [{ ...calendar, isActive: true }] }];
  let preferences = { groupsData: group('Previous'), hasLoadedPreferences: true, hasHydratedPreferences: true };
  const hook = hookHarness('hooks/useCalendarGroup.ts', 'useCalendarGroup', {
    ...signedIn,
    '@/components/contexts/calendar-preferences-context': { useCalendarPreferencesContext: () => preferences },
  });
  const render = () => hook.render([calendar], 'google-user');
  assert.equal(render().groupedCalendars[0].id, 'Previous');
  preferences = { ...preferences, hasLoadedPreferences: false };
  const refreshing = render();
  assert.equal(refreshing.hasGroups, true);
  assert.equal(refreshing.canEdit, false);
  assert.equal(refreshing.groupedCalendars[0].id, 'Previous');
  preferences = { ...preferences, hasLoadedPreferences: true, groupsData: group('Updated') };
  assert.equal(render().groupedCalendars[0].id, 'Updated');
});

test('Google token requests wait for registration and cannot reuse a previous account token', async () => {
  const registration = deferred();
  const calls = [];
  const tokens = load('utility/tokenUtils.ts', {
    '@/lib/supabase': { supabase: { functions: { async invoke(name) {
      calls.push(name);
      return name === 'update-google-token'
        ? registration.promise
        : { data: { accessToken: 'google-token', expiresIn: 3600 } };
    } } } },
  });
  tokens.setGoogleTokenSession({ user: { id: 'account-a' }, access_token: 'session-a', provider_refresh_token: 'provider-refresh' });
  const token = tokens.getValidAccessToken('account-a');
  await new Promise((resolve) => setTimeout(resolve, 10));
  assert.deepEqual(calls, ['update-google-token']);
  registration.resolve({});
  assert.equal((await token).accessToken, 'google-token');
  tokens.setGoogleTokenSession({ user: { id: 'account-b' }, access_token: 'session-b' });
  await assert.rejects(tokens.getValidAccessToken('account-a'), /No active/);
  await tokens.getValidAccessToken('account-b');
  assert.deepEqual(calls, ['update-google-token', 'google-access-token', 'google-access-token']);
});

test('calendar startup requests expanded events without requesting recurring masters', async () => {
  const calls = [];
  const app = hookHarness('hooks/APIFetchingHooks/useCalendar.ts', 'useCalendar', {
    ...signedIn,
    '@/components/contexts/calendar-obj-context': {
      useCalendarObjects: () => ({
        hasLoadedList: true,
        calendarObjs: [{ calendarId: 'calendar', calendarName: 'Calendar' }],
      }),
    },
    '@/services/api': {
      fetchGivenCalendarRange: async (_token, id) => {
        calls.push(id);
        return [{ id: 'instance', recurringEventId: 'master' }];
      },
      fetchMultiGivenCalendarRange: async () => {
        calls.push('unexpected series request');
        return [];
      },
    },
    '@/utility/constants': { BUFFER_INCREMENT: 14 },
    '@/utility/demoEvents/demoEvents0': { demoEvents: [] },
    '@/utility/eventUtils': { processCalendar: (events) => events },
    '@/utility/tokenUtils': { getValidAccessToken: async () => ({ accessToken: 'google-token' }) },
    'date-fns': require('date-fns'),
  });
  const render = () => app.render('UTC', true, { type: 'D' });
  render();
  app.effect(0);
  await settle();
  assert.deepEqual(calls, ['calendar']);
  assert.equal(render().calendars.parent[0].events[0].recurringEventId, 'master');
});

test('recurring masters are fetched once per calendar and series, invalidated, and retryable', async () => {
  let calls = 0;
  const app = hookHarness('hooks/useRecurringSeries.ts', 'useRecurringSeries', {
    ...signedIn,
    '@/services/api': {
      async fetchGivenEvent(_token, key) {
        calls++;
        if (calls === 3) throw new Error('temporary failure');
        return { ...key, recurrence: ['RRULE:FREQ=WEEKLY'] };
      },
    },
    '@/utility/eventUtils': { processEvent: (raw) => raw },
    '@/utility/tokenUtils': { getValidAccessToken: async () => ({ accessToken: 'google-token' }) },
  });
  const event = { calendarId: 'calendar', recurringEventId: 'master' };
  const { loadRecurringMaster, invalidateRecurringMaster } = app.render('UTC');
  assert.equal(calls, 0);
  const first = loadRecurringMaster(event);
  assert.equal(first, loadRecurringMaster(event));
  assert.equal((await first).id, 'master');
  assert.equal(await loadRecurringMaster(event), await first);
  await loadRecurringMaster({ ...event, calendarId: 'other' });
  assert.equal(calls, 2);

  invalidateRecurringMaster('calendar', 'master');
  await assert.rejects(loadRecurringMaster(event), /temporary failure/);
  assert.equal((await loadRecurringMaster(event)).id, 'master');
  assert.equal(calls, 4);
});
