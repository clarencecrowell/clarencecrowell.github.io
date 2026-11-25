// clarencecrowell.org
(function(){
  var films = [].slice.call(document.querySelectorAll('video:not(.ad)'));
  var ads = [].slice.call(document.querySelectorAll('video.ad'));

  function pauseFilms(except){
    films.forEach(function(v){ if (v !== except) v.pause(); });
  }

  // YouTube and Vimeo show a thumbnail until play is pressed. The player only
  // loads then, so a page with a dozen videos stays fast.
  document.querySelectorAll('.yt').forEach(function(box){
    var link = box.querySelector('.yt-link');
    if (!link) return;
    link.addEventListener('click', function(e){
      e.preventDefault();
      var src = box.dataset.vimeo
        ? 'https://player.vimeo.com/video/' + box.dataset.vimeo + '?autoplay=1&dnt=1'
        : 'https://www.youtube-nocookie.com/embed/' + box.dataset.id + '?autoplay=1&rel=0';
      var f = document.createElement('iframe');
      f.src = src;
      f.title = box.dataset.title || 'Video';
      f.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen; web-share';
      f.setAttribute('allowfullscreen', '');
      box.appendChild(f);
      link.remove();
      pauseFilms(null);
    });
  });

  // One film at a time.
  films.forEach(function(v){
    v.addEventListener('play', function(){ pauseFilms(v); });
  });

  // Photos open full size. Arrow keys step through the set, Esc closes.
  var shots = [].slice.call(document.querySelectorAll('.masonry img'));
  if (shots.length) {
    var box = document.createElement('div');
    box.className = 'lightbox';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-label', 'Photo viewer');
    box.innerHTML = '<span class="lb-cap"></span><button class="lb-close" aria-label="Close">&times;</button><img alt="">';
    document.body.appendChild(box);
    var big = box.querySelector('img'), cap = box.querySelector('.lb-cap'), cur = -1;
    var show = function(i){
      cur = (i + shots.length) % shots.length;
      big.src = shots[cur].currentSrc || shots[cur].src;
      big.alt = shots[cur].alt;
      cap.textContent = (cur + 1) + ' / ' + shots.length;
      box.classList.add('on');
      document.body.style.overflow = 'hidden';
    };
    var hide = function(){ box.classList.remove('on'); document.body.style.overflow = ''; if (shots[cur]) shots[cur].focus(); cur = -1; };
    shots.forEach(function(im, i){
      im.setAttribute('tabindex', '0');
      im.addEventListener('click', function(){ show(i); });
      im.addEventListener('keydown', function(e){ if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); show(i); } });
    });
    box.addEventListener('click', function(e){ if (e.target === big) show(cur + 1); else hide(); });
    document.addEventListener('keydown', function(e){
      if (cur < 0) return;
      if (e.key === 'Escape') hide();
      else if (e.key === 'ArrowRight') show(cur + 1);
      else if (e.key === 'ArrowLeft') show(cur - 1);
    });
  }

  // Ads play muted while on screen and pause when scrolled away, like a feed.
  // Skipped for visitors who ask for reduced motion; they can still press play.
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (ads.length && 'IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        var v = e.target;
        if (e.isIntersecting) { var p = v.play(); if (p && p.catch) p.catch(function(){}); }
        else { v.pause(); }
      });
    }, {threshold: 0.6});
    ads.forEach(function(v){ io.observe(v); });
  }
})();
