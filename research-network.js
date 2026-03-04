(function () {
  'use strict';

  var panel = document.getElementById('research-panel');
  var hint = document.getElementById('research-hint');
  var ballWrap = document.getElementById('accent-ball-wrap');
  if (!panel || !hint) return;

  var nodes = document.querySelectorAll('#research-directions .node');
  var descriptions = document.querySelectorAll('#research-directions .research-description');
  var themes = Array.prototype.map.call(nodes, function (n) { return n.getAttribute('data-theme'); });

  var cycleInterval = null;
  var cyclingPaused = false;
  var CYCLE_DURATION_MS = 4500;
  var INITIAL_DELAY_MS = 1800;
  var BALL_DURATION_MS = 600;
  var lastClickTime = 0;
  var CLICK_DEBOUNCE_MS = 500;

  var nodePositions = themes.map(function (theme) {
    var g = document.querySelector('#research-directions .node[data-theme="' + theme + '"]');
    var circle = g ? g.querySelector('circle') : null;
    if (!circle) return { cx: 200, cy: 45 };
    return {
      cx: parseFloat(circle.getAttribute('cx'), 10),
      cy: parseFloat(circle.getAttribute('cy'), 10)
    };
  });

  var ballPos = { x: nodePositions[0].cx, y: nodePositions[0].cy };
  var ballAnimationId = null;

  function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function moveBallTo(nodeIndex, callback) {
    if (ballAnimationId) cancelAnimationFrame(ballAnimationId);
    var target = nodePositions[nodeIndex];
    if (!target) return;
    var startX = ballPos.x;
    var startY = ballPos.y;
    var startTime = null;

    function step(now) {
      if (!startTime) startTime = now;
      var elapsed = now - startTime;
      var t = Math.min(1, elapsed / BALL_DURATION_MS);
      var eased = easeInOutCubic(t);
      ballPos.x = startX + (target.cx - startX) * eased;
      ballPos.y = startY + (target.cy - startY) * eased;
      ballWrap.setAttribute('transform', 'translate(' + ballPos.x + ',' + ballPos.y + ')');
      if (t < 1) {
        ballAnimationId = requestAnimationFrame(step);
      } else {
        ballAnimationId = null;
        ballPos.x = target.cx;
        ballPos.y = target.cy;
        if (callback) callback();
      }
    }
    ballAnimationId = requestAnimationFrame(step);
  }

  function showDescription(theme, moveBallToIndex) {
    hint.style.display = theme ? 'none' : 'block';
    panel.classList.toggle('visible', !!theme);

    descriptions.forEach(function (el) {
      el.classList.toggle('visible', el.getAttribute('data-theme') === theme);
    });

    nodes.forEach(function (el) {
      el.classList.toggle('active', el.getAttribute('data-theme') === theme);
    });

    if (theme && moveBallToIndex !== undefined) {
      moveBallTo(moveBallToIndex);
    }
  }

  function advanceCycle() {
    if (cyclingPaused) return;
    var visible = Array.prototype.find.call(descriptions, function (el) { return el.classList.contains('visible'); });
    var currentTheme = visible ? visible.getAttribute('data-theme') : null;
    var current = themes.indexOf(currentTheme);
    var next = current < 0 ? 0 : (current + 1) % themes.length;
    showDescription(themes[next], next);
  }

  function startCycling() {
    if (cycleInterval || cyclingPaused) return;
    cycleInterval = setInterval(advanceCycle, CYCLE_DURATION_MS);
  }

  function stopCycling() {
    cyclingPaused = true;
    if (cycleInterval) {
      clearInterval(cycleInterval);
      cycleInterval = null;
    }
  }

  function handleNodeClick(e) {
    e.preventDefault();
    e.stopPropagation();
    var now = Date.now();
    if (now - lastClickTime < CLICK_DEBOUNCE_MS) return;
    lastClickTime = now;

    var target = e.target.closest('.node');
    if (!target) return;
    var theme = target.getAttribute('data-theme');
    var index = themes.indexOf(theme);
    if (index < 0) return;

    stopCycling();
    showDescription(theme, index);
  }

  function handleKeydown(e) {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    var target = e.target.closest('.node');
    if (!target) return;
    e.preventDefault();
    var theme = target.getAttribute('data-theme');
    var index = themes.indexOf(theme);
    if (index < 0) return;

    stopCycling();
    showDescription(theme, index);
  }

  nodes.forEach(function (node) {
    node.addEventListener('click', handleNodeClick);
    node.addEventListener('keydown', handleKeydown);
  });

  ballWrap.setAttribute('transform', 'translate(' + nodePositions[0].cx + ',' + nodePositions[0].cy + ')');

  setTimeout(function () {
    showDescription(themes[0], 0);
    startCycling();
  }, INITIAL_DELAY_MS);
})();
