(function () {
  'use strict';

  var panel = document.getElementById('research-panel');
  var hint = document.getElementById('research-hint');
  if (!panel || !hint) return;

  var nodes = document.querySelectorAll('#research-directions .node');
  var descriptions = document.querySelectorAll('#research-directions .research-description');

  function showDescription(theme) {
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

  function handleNodeClick(e) {
    var target = e.target.closest('.node');
    if (!target) return;
    var theme = target.getAttribute('data-theme');
    showDescription(theme);
  }

  function handleKeydown(e) {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    var target = e.target.closest('.node');
    if (!target) return;
    e.preventDefault();
    var theme = target.getAttribute('data-theme');
    showDescription(theme);
  }

  nodes.forEach(function (node) {
    node.addEventListener('click', handleNodeClick);
    node.addEventListener('keydown', handleKeydown);
  });
})();
