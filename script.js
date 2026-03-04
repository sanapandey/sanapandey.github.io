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

  initProgressBar();
})();
