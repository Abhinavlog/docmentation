/* Zemgeez — shared script (~2 KB). Theme, menu, tabs, filters, reveal, demo playback, video carousel. */
(function () {
  var d = document, root = d.documentElement, $ = function (s, c) { return (c || d).querySelector(s); }, $$ = function (s, c) { return Array.prototype.slice.call((c || d).querySelectorAll(s)); };
  d.body.classList.remove('no-js');
  var y = $('#y'); if (y) y.textContent = new Date().getFullYear();

  /* Theme toggle */
  var tb = $('#theme');
  if (tb) tb.onclick = function () { var t = root.dataset.theme === 'dark' ? 'light' : 'dark'; root.dataset.theme = t; try { localStorage.setItem('theme', t); } catch (e) {} };

  /* Mobile menu */
  var nav = $('#nav'), mb = $('#menu');
  if (nav && mb) {
    mb.onclick = function () { var o = nav.classList.toggle('open'); mb.setAttribute('aria-expanded', o); };
    $$('.mobile a', nav).forEach(function (a) { a.onclick = function () { nav.classList.remove('open'); mb.setAttribute('aria-expanded', 'false'); }; });
  }

  /* Tabs (component library) */
  var tabs = $$('[role=tab]');
  tabs.forEach(function (t) { t.onclick = function () { tabs.forEach(function (x) { x.setAttribute('aria-selected', x === t); d.getElementById(x.getAttribute('aria-controls')).hidden = x !== t; }); }; });

  /* Work filters */
  var fbtns = $$('[data-filter]');
  function filter(f) {
    fbtns.forEach(function (b) { b.setAttribute('aria-selected', b.dataset.filter === f); });
    $$('.work[data-cat]').forEach(function (c) { c.hidden = f !== 'all' && c.dataset.cat.indexOf(f) < 0; });
  }
  if (fbtns.length) {
    fbtns.forEach(function (b) { b.onclick = function () { filter(b.dataset.filter); }; });
    var h = location.hash.slice(1); if (h === 'shopify' || h === 'react') filter(h);
  }

  /* Reveal on scroll + play demos only while visible */
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }); }, { rootMargin: '0px 0px -8% 0px' });
    $$('.rv').forEach(function (el) { io.observe(el); });
    var so = new IntersectionObserver(function (es) { es.forEach(function (e) { e.target.classList.toggle('on', e.isIntersecting); }); }, { threshold: .25 });
    $$('.stage').forEach(function (el) { so.observe(el); });
  } else {
    $$('.rv').forEach(function (el) { el.classList.add('in'); });
    $$('.stage').forEach(function (el) { el.classList.add('on'); });
  }

  /* Video carousel: only the active slide "plays"; autoplay pauses off-screen, on hover and on touch */
  $$('[data-carousel]').forEach(function (vc) {
    var track = $('.vc-track', vc), slides = $$('.vc-slide', vc), dots = $('.vc-dots', vc), stat = $('[data-stat]', vc.parentNode), i = 0, timer, visible = false, hover = false;
    slides.forEach(function (s, n) {
      var b = d.createElement('button'); b.setAttribute('aria-label', 'Go to video ' + (n + 1)); b.onclick = function () { go(n); }; dots.appendChild(b);
    });
    var dbs = $$('button', dots);
    function mark(n) {
      i = n;
      slides.forEach(function (s, k) { s.classList.toggle('active', k === n); $('.state', s).textContent = k === n ? '▶ Playing' : 'Poster only'; });
      dbs.forEach(function (b, k) { b.setAttribute('aria-current', k === n); });
      if (stat) stat.textContent = '1 video loaded · ~1.2 MB';
    }
    function go(n) { n = (n + slides.length) % slides.length; var s = slides[n]; track.scrollTo({ left: s.offsetLeft - (track.clientWidth - s.clientWidth) / 2, behavior: 'smooth' }); mark(n); restart(); }
    function restart() { clearInterval(timer); if (visible && !hover) timer = setInterval(function () { go(i + 1); }, 4000); vc.classList.toggle('paused', !visible || hover); }
    $('[data-prev]', vc).onclick = function () { go(i - 1); };
    $('[data-next]', vc).onclick = function () { go(i + 1); };
    var st; track.addEventListener('scroll', function () {
      clearTimeout(st); st = setTimeout(function () {
        var c = track.scrollLeft + track.clientWidth / 2, best = 0, bd = 1e9;
        slides.forEach(function (s, k) { var m = Math.abs(s.offsetLeft + s.clientWidth / 2 - c); if (m < bd) { bd = m; best = k; } });
        if (best !== i) { mark(best); restart(); }
      }, 90);
    }, { passive: true });
    vc.addEventListener('mouseenter', function () { hover = true; restart(); });
    vc.addEventListener('mouseleave', function () { hover = false; restart(); });
    vc.addEventListener('touchstart', function () { hover = true; restart(); setTimeout(function () { hover = false; restart(); }, 6000); }, { passive: true });
    if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { visible = es[0].isIntersecting; restart(); }, { threshold: .3 }).observe(vc);
    else visible = true;
    mark(0); restart();
  });
})();