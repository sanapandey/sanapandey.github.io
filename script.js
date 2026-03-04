(function () {
  'use strict';

  // Progress bar on scroll (consistent across all pages)
  function initProgressBar() {
    var bar = document.querySelector('#progress-bar .progress');
    if (!bar) return;
    function update() {
      var h = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      var y = document.documentElement.scrollTop || document.body.scrollTop;
      bar.style.width = (h ? (y / h) * 100 : 0) + '%';
    }
    window.addEventListener('scroll', update, { passive: true });
    update();
  }

  // Scroll-linked background: set ratio 0..1 for use in CSS gradient/wash
  function initScrollBackground() {
    function update() {
      var h = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      var y = document.documentElement.scrollTop || document.body.scrollTop;
      var ratio = h > 0 ? Math.min(1, y / h) : 0;
      document.body.style.setProperty('--scroll-ratio', ratio);
    }
    window.addEventListener('scroll', update, { passive: true });
    update();
  }

  initProgressBar();
  initScrollBackground();
})();
