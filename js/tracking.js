/* Session-only tracking. All measurements stay in memory and are discarded on reset/reload. */
window.UsageTracker = (() => {
  let startedAt = Date.now();
  const events = [];
  const appDurations = new Map();
  const categoryDurations = new Map();
  const appSessions = [];
  const switchDurations = [];
  const keyDurations = [];
  const interKeyIntervals = [];
  const categories = {
    chat1: 'Messaging', chat2: 'Messaging', social: 'Social Media',
    browser: 'Information', music: 'Entertainment', calendar: 'Productivity'
  };
  const appNames = {
    chat1: 'Messages', chat2: 'Group chat', social: 'Social',
    browser: 'Browser', music: 'Music', calendar: 'Calendar'
  };
  const colors = {
    Messaging: '#796de2', 'Social Media': '#e58caf', Information: '#58b89a',
    Entertainment: '#e9b65c', Productivity: '#6f9bd7'
  };
  let activeApp = null;
  let activeAppStartedAt = null;
  let lastAppLeftAt = null;
  let lastKeyReleaseAt = null;
  let currentKeyDown = null;
  let lastCompletedKey = null;
  let firstKeyDownAt = null;
  let lastKeyUpAt = null;
  let typedCharacters = 0;
  let backspaceCount = 0;
  let keyPressCount = 0;

  function log(type, detail = '') {
    events.unshift({ type, detail, at: Date.now() });
    if (events.length > 30) events.pop();
  }

  function finishApp(now) {
    if (!activeApp || activeAppStartedAt === null) return;
    const duration = Math.max(0, now - activeAppStartedAt);
    appDurations.set(activeApp, (appDurations.get(activeApp) || 0) + duration);
    const category = categories[activeApp];
    categoryDurations.set(category, (categoryDurations.get(category) || 0) + duration);
    appSessions.push({ app: activeApp, duration });
    log('Closed app', appNames[activeApp]);
    activeApp = null;
    activeAppStartedAt = null;
  }

  function openApp(id) {
    const now = Date.now();
    if (activeApp) {
      finishApp(now);
      lastAppLeftAt = now;
    }
    if (lastAppLeftAt !== null) {
      const switchDuration = now - lastAppLeftAt;
      if (switchDuration >= 0 && switchDuration <= 30000) switchDurations.push(switchDuration);
    }
    lastAppLeftAt = null;
    activeApp = id;
    activeAppStartedAt = now;
    log('Opened app', appNames[id] || id);
  }

  function closeApp() {
    if (!activeApp) return;
    const now = Date.now();
    finishApp(now);
    lastAppLeftAt = now;
  }

  function tap(kind = 'screen') { log('Interaction', kind); }

  function keyDown(key) {
    const now = Date.now();
    if (lastKeyReleaseAt !== null) interKeyIntervals.push(Math.max(0, now - lastKeyReleaseAt));
    if (firstKeyDownAt === null) firstKeyDownAt = now;
    currentKeyDown = { key, at: now };
  }

  function keyUp(key) {
    const now = Date.now();
    if (currentKeyDown && currentKeyDown.key === key) {
      keyDurations.push(Math.max(0, now - currentKeyDown.at));
      currentKeyDown = null;
    }
    lastKeyReleaseAt = now;
    lastKeyUpAt = now;
    lastCompletedKey = { key, at: now };
  }

  function key(key) {
    // Keyboard activation without pointer events (e.g. accessibility) is still recorded.
    const alreadyPointerTimed = lastCompletedKey && lastCompletedKey.key === key && Date.now() - lastCompletedKey.at < 1000;
    if ((!currentKeyDown || currentKeyDown.key !== key) && !alreadyPointerTimed) {
      keyDown(key);
      keyUp(key);
    }
    lastCompletedKey = null;
    keyPressCount++;
    if (key === 'Backspace') backspaceCount++;
    else if (key.length === 1 && key !== ' ') typedCharacters++;
    log('Key press', key === ' ' ? 'Space' : key);
  }

  function snapshot() {
    const now = Date.now();
    const appTimes = Object.fromEntries(appDurations);
    const categoryTimes = Object.fromEntries(categoryDurations);
    if (activeApp && activeAppStartedAt !== null) {
      const liveDuration = now - activeAppStartedAt;
      appTimes[activeApp] = (appTimes[activeApp] || 0) + liveDuration;
      const category = categories[activeApp];
      categoryTimes[category] = (categoryTimes[category] || 0) + liveDuration;
    }
    const completedSessions = appSessions.map(s => s.duration);
    if (activeApp && activeAppStartedAt !== null) completedSessions.push(now - activeAppStartedAt);
    const avgSession = completedSessions.length
      ? completedSessions.reduce((a, b) => a + b, 0) / completedSessions.length : null;
    const typingSpan = firstKeyDownAt !== null && lastKeyUpAt !== null ? Math.max(1, lastKeyUpAt - firstKeyDownAt) : 0;
    const avgKeyDuration = keyDurations.length ? keyDurations.reduce((a, b) => a + b, 0) / keyDurations.length : null;
    const avgInterval = interKeyIntervals.length ? interKeyIntervals.reduce((a, b) => a + b, 0) / interKeyIntervals.length : null;
    return {
      sessionDuration: now - startedAt,
      appTimes, categoryTimes, colors, appNames,
      averageAppSession: avgSession,
      appSessionCount: completedSessions.length,
      switchDuration: switchDurations.length ? switchDurations.reduce((a, b) => a + b, 0) / switchDurations.length : null,
      switchSamples: switchDurations.length,
      typingSpeed: typingSpan >= 1000 ? typedCharacters / (typingSpan / 60000) : 0,
      averageKeyDuration: avgKeyDuration,
      averageInterKeyInterval: avgInterval,
      backspaceCount,
      keyPressCount,
      events: events.slice(0, 8),
      activeApp
    };
  }

  function reset() {
    startedAt = Date.now();
    events.length = 0;
    appDurations.clear(); categoryDurations.clear(); appSessions.length = 0;
    switchDurations.length = 0; keyDurations.length = 0; interKeyIntervals.length = 0;
    activeApp = null; activeAppStartedAt = null; lastAppLeftAt = null;
    lastKeyReleaseAt = null; currentKeyDown = null; lastCompletedKey = null; firstKeyDownAt = null; lastKeyUpAt = null;
    typedCharacters = 0; backspaceCount = 0; keyPressCount = 0;
  }

  return { tap, keyDown, keyUp, key, openApp, closeApp, log, snapshot, reset, categories, appNames, colors };
})();
