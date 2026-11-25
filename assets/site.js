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

  // Ads play muted while on screen and pause when scrolled away, like a feed.
  // Skipped for visitors who ask for reduced motion; they can still press play.
  if (!ads.length || !('IntersectionObserver' in window)) return;
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      var v = e.target;
      if (e.isIntersecting) { var p = v.play(); if (p && p.catch) p.catch(function(){}); }
      else { v.pause(); }
    });
  }, {threshold: 0.6});
  ads.forEach(function(v){ io.observe(v); });
})();
