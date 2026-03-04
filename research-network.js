(function () {
  'use strict';

  var panel = document.getElementById('research-panel');
  var hint = document.getElementById('research-hint');
  var ballWrap = document.getElementById('accent-ball-wrap');
  if (!panel || !hint) return;

  var nodes = document.querySelectorAll('#research-directions .node');
  var descriptions = document.querySelectorAll('#research-panel .research-description');
  var themes = Array.prototype.map.call(nodes, function (n) { return n.getAttribute('data-theme'); });

  var cycleInterval = null;
  var cyclingPaused = false;
  var CYCLE_DURATION_MS = 4500;
  var INITIAL_DELAY_MS = 1800;
  var BALL_DURATION_PER_EDGE_MS = 350;
  var lastClickTime = 0;
  var CLICK_DEBOUNCE_MS = 800;

  var nodePositions = themes.map(function (theme) {
    var g = document.querySelector('#research-directions .node[data-theme="' + theme + '"]');
    var circle = g ? g.querySelector('circle') : null;
    if (!circle) return { cx: 200, cy: 45 };
    return {
      cx: parseFloat(circle.getAttribute('cx'), 10),
      cy: parseFloat(circle.getAttribute('cy'), 10)
    };
  });

  var ballCurrentNodeIndex = 0;
  var ballPos = { x: nodePositions[0].cx, y: nodePositions[0].cy };
  var ballAnimationId = null;

  var edges = [
    [0, 1], [0, 2], [0, 3],
    [1, 3], [1, 4],
    [2, 3], [2, 5],
    [3, 6],
    [4, 6], [5, 6]
  ];

  function buildAdjacency() {
    var adj = [];
    for (var i = 0; i < 7; i++) adj[i] = [];
    for (var e = 0; e < edges.length; e++) {
      var a = edges[e][0], b = edges[e][1];
      if (adj[a].indexOf(b) < 0) adj[a].push(b);
      if (adj[b].indexOf(a) < 0) adj[b].push(a);
    }
    return adj;
  }

  function findPath(from, to) {
    if (from === to) return [from];
    var adj = buildAdjacency();
    var queue = [from];
    var visited = {};
    visited[from] = true;
    var parent = {};
    parent[from] = -1;
    while (queue.length > 0) {
      var u = queue.shift();
      for (var i = 0; i < adj[u].length; i++) {
        var v = adj[u][i];
        if (visited[v]) continue;
        visited[v] = true;
        parent[v] = u;
        if (v === to) {
          var path = [];
          var cur = to;
          while (cur >= 0) {
            path.unshift(cur);
            cur = parent[cur];
          }
          return path;
        }
        queue.push(v);
      }
    }
    return [from, to];
  }

  function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function moveBallAlongPath(path, callback) {
    if (ballAnimationId) cancelAnimationFrame(ballAnimationId);
    if (!path || path.length < 2) {
      if (path && path.length === 1) {
        ballPos.x = nodePositions[path[0]].cx;
        ballPos.y = nodePositions[path[0]].cy;
        ballCurrentNodeIndex = path[0];
        ballWrap.setAttribute('transform', 'translate(' + ballPos.x + ',' + ballPos.y + ')');
        if (callback) callback();
      }
      return;
    }
    var segmentIndex = 0;
    var startTime = null;

    function animateSegment(now) {
      if (!startTime) startTime = now;
      var from = path[segmentIndex];
      var to = path[segmentIndex + 1];
      var start = nodePositions[from];
      var end = nodePositions[to];
      var elapsed = now - startTime;
      var t = Math.min(1, elapsed / BALL_DURATION_PER_EDGE_MS);
      var eased = easeInOutCubic(t);
      ballPos.x = start.cx + (end.cx - start.cx) * eased;
      ballPos.y = start.cy + (end.cy - start.cy) * eased;
      ballWrap.setAttribute('transform', 'translate(' + ballPos.x + ',' + ballPos.y + ')');
      if (t >= 1) {
        ballPos.x = end.cx;
        ballPos.y = end.cy;
        ballCurrentNodeIndex = to;
        segmentIndex++;
        if (segmentIndex >= path.length - 1) {
          ballAnimationId = null;
          if (callback) callback();
          return;
        }
        startTime = now;
      }
      ballAnimationId = requestAnimationFrame(animateSegment);
    }
    ballAnimationId = requestAnimationFrame(animateSegment);
  }

  function moveBallTo(nodeIndex, callback) {
    var path = findPath(ballCurrentNodeIndex, nodeIndex);
    moveBallAlongPath(path, function () {
      ballCurrentNodeIndex = nodeIndex;
      if (callback) callback();
    });
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
    var target = e.target.closest('.node');
    if (!target) return;
    e.preventDefault();
    e.stopPropagation();
    stopCycling();

    var now = Date.now();
    if (now - lastClickTime < CLICK_DEBOUNCE_MS) return;
    lastClickTime = now;

    var theme = target.getAttribute('data-theme');
    var index = themes.indexOf(theme);
    if (index < 0) return;

    var visible = Array.prototype.find.call(descriptions, function (el) { return el.classList.contains('visible'); });
    if (visible && visible.getAttribute('data-theme') === theme) return;

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
    node.addEventListener('click', handleNodeClick, true);
    node.addEventListener('keydown', handleKeydown, true);
  });

  ballWrap.setAttribute('transform', 'translate(' + nodePositions[0].cx + ',' + nodePositions[0].cy + ')');

  setTimeout(function () {
    showDescription(themes[0], 0);
    startCycling();
  }, INITIAL_DELAY_MS);
})();
