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

  // Add .is-scrolled to the header once the page has scrolled past a small threshold
  function initHeaderScrollState() {
    var header = document.querySelector('header');
    if (!header) return;
    function update() {
      var y = document.documentElement.scrollTop || document.body.scrollTop;
      header.classList.toggle('is-scrolled', y > 8);
    }
    window.addEventListener('scroll', update, { passive: true });
    update();
  }

  // Reveal sections + select children as they scroll into view
  function initRevealOnScroll() {
    var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var targets = document.querySelectorAll(
      'section, .landing-row, .timeline-year, .pub-item, .contact-item, .blog-list li'
    );
    if (!targets.length) return;

    if (reduceMotion || !('IntersectionObserver' in window)) {
      targets.forEach(function (el) { el.classList.add('in-view'); });
      return;
    }

    // Mark already-visible elements as in-view immediately so they don't flash
    var viewportH = window.innerHeight || document.documentElement.clientHeight;
    targets.forEach(function (el) {
      var rect = el.getBoundingClientRect();
      var alreadyVisible = rect.top < viewportH * 0.9 && rect.bottom > 0;
      el.classList.add('reveal');
      if (alreadyVisible) {
        el.classList.add('in-view');
      }
    });

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    targets.forEach(function (el) {
      if (!el.classList.contains('in-view')) observer.observe(el);
    });
  }

  // Collapsible older years on the home timeline
  function initTimelineToggle() {
    var toggle = document.getElementById('timeline-toggle');
    var timeline = document.querySelector('#updates .timeline');
    if (!toggle || !timeline) return;
    var label = toggle.querySelector('.timeline-toggle-label');

    toggle.addEventListener('click', function () {
      var expanded = timeline.classList.toggle('is-expanded');
      toggle.setAttribute('aria-expanded', expanded ? 'true' : 'false');
      if (label) label.textContent = expanded ? 'Hide older updates' : 'Show older updates';
    });
  }

  initProgressBar();
  initScrollBackground();
  initHeaderScrollState();
  initRevealOnScroll();
  initTimelineToggle();
})();
