(() => {
  const $ = id => document.getElementById(id);
  const categoryOrder = ['Messaging', 'Social Media', 'Information', 'Entertainment', 'Productivity'];
  const appOrder = ['chat1', 'chat2', 'social', 'browser', 'music', 'calendar'];
  const fmt = ms => {
    if (ms === null || ms === undefined || !Number.isFinite(ms)) return '—';
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return hours ? `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}` : `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };
  const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  function update() {
    const d = UsageTracker.snapshot();
    $('session-clock').textContent = fmt(d.sessionDuration);
    $('metric-session').textContent = fmt(d.sessionDuration);
    $('metric-average-session').textContent = fmt(d.averageAppSession);
    $('metric-switch').textContent = d.switchDuration === null ? '—' : `${(d.switchDuration / 1000).toFixed(1)} s`;
    $('metric-switch-note').textContent = 'Average of valid switches (≤ 30 s)';
    $('metric-app-sessions').textContent = d.appSessionCount;

    $('app-usage-list').innerHTML = appOrder.map(id => {
      const ms = d.appTimes[id] || 0;
      return `<div class="usage-row"><span class="usage-name">${esc(d.appNames[id])}</span><strong>${fmt(ms)}</strong></div>`;
    }).join('');

    const totalCategoryTime = Object.values(d.categoryTimes).reduce((a, b) => a + b, 0);
    let angle = 0;
    const stops = [];
    const legend = [];
    categoryOrder.forEach(category => {
      const ms = d.categoryTimes[category] || 0;
      if (ms <= 0) return;
      const share = totalCategoryTime ? (ms / totalCategoryTime) * 100 : 0;
      const deg = share * 3.6;
      stops.push(`${d.colors[category]} ${angle}deg ${angle + deg}deg`);
      angle += deg;
      legend.push(`<div class="legend-item"><span class="legend-dot" style="background:${d.colors[category]}"></span><span>${esc(category)}</span><strong>${fmt(ms)} · ${share.toFixed(1)}%</strong></div>`);
    });
    $('category-donut').style.background = stops.length ? `conic-gradient(${stops.join(',')})` : 'conic-gradient(#e9eaf0 0deg 360deg)';
    $('category-legend').innerHTML = legend.join('') || '<div class="empty-state">Open an app to see category usage here.</div>';

    $('typing-speed').textContent = Math.round(d.typingSpeed);
    $('typing-duration').textContent = d.averageKeyDuration === null ? '—' : `${Math.round(d.averageKeyDuration)} ms`;
    $('typing-interval').textContent = d.averageInterKeyInterval === null ? '—' : `${Math.round(d.averageInterKeyInterval)} ms`;
    $('typing-backspace').textContent = d.backspaceCount.toLocaleString();
    $('typing-note').textContent = d.keyPressCount
      ? `${d.keyPressCount} key presses observed. CPM counts letters and punctuation, but excludes spaces.`
      : 'Start typing in a chat to measure keyboard activity.';


  }

  function reset() {
    UsageTracker.reset();
    PhoneApps.reset();
    update();
  }

  PhoneApps.init();
  $('end-session').addEventListener('click', () => {
    if (confirm('End this session and discard all activity data?')) reset();
  });
  window.setInterval(update, 500);
  update();
})();
