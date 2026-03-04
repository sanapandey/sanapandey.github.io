(function () {
  'use strict';

  var panel = document.getElementById('research-panel');
  var hint = document.getElementById('research-hint');
  if (!panel || !hint) return;

  var nodes = document.querySelectorAll('#research-directions .node');
  var descriptions = document.querySelectorAll('#research-directions .research-description');
  var themes = Array.prototype.map.call(nodes, function (n) { return n.getAttribute('data-theme'); });
  var cycleInterval = null;
  var CYCLE_DURATION_MS = 4500;
  var INITIAL_DELAY_MS = 1800;

  function showDescription(theme, stopCycling) {
    if (stopCycling && cycleInterval) {
      clearInterval(cycleInterval);
      cycleInterval = null;
    }
    hint.classList.remove('visible');
    hint.style.display = theme ? 'none' : 'block';
    panel.classList.toggle('visible', !!theme);

    descriptions.forEach(function (el) {
      el.classList.toggle('visible', el.getAttribute('data-theme') === theme);
    });

    nodes.forEach(function (el) {
      el.classList.toggle('active', el.getAttribute('data-theme') === theme);
    });
  }

  function advanceCycle() {
    var visible = Array.prototype.find.call(descriptions, function (el) { return el.classList.contains('visible'); });
    var currentTheme = visible ? visible.getAttribute('data-theme') : null;
    var current = themes.indexOf(currentTheme);
    var next = current < 0 ? 0 : (current + 1) % themes.length;
    showDescription(themes[next], false);
  }

  function startCycling() {
    if (cycleInterval) return;
    cycleInterval = setInterval(advanceCycle, CYCLE_DURATION_MS);
  }

  function handleNodeClick(e) {
    var target = e.target.closest('.node');
    if (!target) return;
    var theme = target.getAttribute('data-theme');
    showDescription(theme, true);
  }

  function handleKeydown(e) {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    var target = e.target.closest('.node');
    if (!target) return;
    e.preventDefault();
    var theme = target.getAttribute('data-theme');
    showDescription(theme, true);
  }

  nodes.forEach(function (node) {
    node.addEventListener('click', handleNodeClick);
    node.addEventListener('keydown', handleKeydown);
  });

  // Auto-cycle: start after initial delay, then advance every CYCLE_DURATION_MS
  setTimeout(function () {
    showDescription(themes[0], false);
    startCycling();
  }, INITIAL_DELAY_MS);
})();
