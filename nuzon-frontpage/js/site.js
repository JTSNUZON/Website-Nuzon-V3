/* =====================================================================
   Gedeeld script voor alle pagina's: topbalk, menu en WhatsApp-knop.

   WHATSAPP_NUMMER — landcode zonder +, zonder spaties of streepjes.
   06 12 34 56 78  ->  "31612345678"
   ===================================================================== */
var WHATSAPP_NUMMER  = "31307816767";
var WHATSAPP_BERICHT = "Hallo Nuzon, ik heb een vraag over ";

(function(){
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ==================================================================
     INTROSCHERM — het logo bij elke paginawissel

     Staat op elke pagina, dus ook als je van de home naar Zakelijk
     klikt. Op de homepage wacht hij op de hero-video (die roept
     nuzonSluitIntro zelf aan); elders gaat hij na de logo-animatie open.

     De scrollpositie: browsers zetten je bij een herlaadbeurt terug waar
     je was. Met het introscherm eroverheen en de scroll op slot leverde
     dat een sprong naar het midden of het eind van de pagina op. Daarom
     nemen we het herstel hier zelf over: bovenaan beginnen, tenzij er een
     anker in de URL staat — dan springen we daar netjes heen zodra het
     scherm opengaat.
     ================================================================== */
  var intro = document.getElementById('intro');
  var introWeg = false;

  function naarAnkerOfTop(){
    var doel = location.hash && document.getElementById(location.hash.slice(1));
    if(doel){ doel.scrollIntoView(); } else { window.scrollTo(0, 0); }
  }

  function sluitIntro(){
    if(introWeg) return;
    introWeg = true;
    document.documentElement.style.overflow = '';
    naarAnkerOfTop();
    if(intro){
      intro.classList.add('is-weg');
      setTimeout(function(){
        if(intro && intro.parentNode) intro.parentNode.removeChild(intro);
      }, 700);   // even lang als het wegschuiven in de css duurt
    }
    document.dispatchEvent(new CustomEvent('nuzon:intro-klaar'));
  }
  window.nuzonSluitIntro = sluitIntro;

  if(intro){
    if(reduce){
      intro.parentNode.removeChild(intro);
      intro = null;
      introWeg = true;
    } else {
      if('scrollRestoration' in history){ history.scrollRestoration = 'manual'; }
      window.scrollTo(0, 0);
      document.documentElement.style.overflow = 'hidden';
      // Noodrem: het scherm gaat hoe dan ook open. Pagina's met de
      // hero-video krijgen wat langer, want die wachten op het beeld.
      setTimeout(sluitIntro, document.body.classList.contains('has-hero') ? 1300 : 900);
    }
  }

  /* ---- fotorij ----
     Vegen op een telefoon doet de browser zelf. Op een computer zonder
     touchpad valt er weinig te vegen, dus daar mag je de rij met de muis
     verslepen. Een klik die geen sleep werd blijft gewoon een klik.

     De rij loopt rond: achter de laatste foto komt de eerste weer, en
     andersom net zo. Dat doen we door de hele reeks een paar keer te
     klonen en de scrollpositie stilletjes een ronde terug te zetten
     zodra je er een voorbij bent. Je ziet daar niets van, want op dat
     moment staat er precies hetzelfde in beeld. */
  document.querySelectorAll('[data-fotorij] .fotorij__spoor').forEach(function(spoor){

    /* --- rondlopen --- */
    var origineel = Array.prototype.slice.call(spoor.children);
    var lus = 0;                 // breedte van een hele ronde
    var herstelt = false;        // staat een correctie te wachten?

    function maakKloon(item){
      var kloon = item.cloneNode(true);
      kloon.setAttribute('aria-hidden', 'true');
      kloon.dataset.kloon = 'ja';
      Array.prototype.forEach.call(kloon.querySelectorAll('img'), function(img){
        img.setAttribute('loading', 'lazy');
      });
      return kloon;
    }

    function bouwRonde(){
      if(!origineel.length) return;

      // terug naar kaal: alleen de echte foto's
      Array.prototype.slice.call(spoor.children).forEach(function(kind){
        if(kind.dataset && kind.dataset.kloon) spoor.removeChild(kind);
      });

      var reeks = spoor.scrollWidth;
      if(reeks <= spoor.clientWidth + 1){ lus = 0; return; }  // past er gewoon in

      // Een ronde moet breder zijn dan het scherm, anders zie je bij het
      // terugzetten een sprong. Zijn het er weinig, dan herhalen we ze.
      var herhaal = Math.max(1, Math.ceil((spoor.clientWidth * 1.5) / reeks));
      var strook = document.createDocumentFragment();
      for(var ronde = 0; ronde < herhaal * 3 - 1; ronde++){
        origineel.forEach(function(item){ strook.appendChild(maakKloon(item)); });
      }
      spoor.appendChild(strook);

      lus = reeks * herhaal;
      spoor.scrollLeft = lus;                 // begin in de middelste ronde
    }

    function herstel(){
      if(!lus) return;
      if(spoor.scrollLeft >= lus * 2)      spoor.scrollLeft -= lus;
      else if(spoor.scrollLeft < lus * 0.5) spoor.scrollLeft += lus;
    }

    spoor.addEventListener('scroll', function(){
      if(!lus || herstelt) return;
      herstelt = true;
      requestAnimationFrame(function(){ herstel(); herstelt = false; });
    }, { passive:true });

    bouwRonde();
    window.addEventListener('load', bouwRonde);
    if(window.ResizeObserver){
      var vorigeBreedte = spoor.clientWidth;
      new ResizeObserver(function(){
        if(spoor.clientWidth === vorigeBreedte) return;
        vorigeBreedte = spoor.clientWidth;
        bouwRonde();
      }).observe(spoor);
    }

    /* --- slepen met de muis --- */
    var neer = false, laatsteX = 0, versleept = false;

    spoor.addEventListener('pointerdown', function(e){
      if(e.pointerType === 'touch') return;          // dat regelt de browser al
      neer = true; versleept = false;
      laatsteX = e.clientX;
      spoor.setPointerCapture(e.pointerId);
    });

    spoor.addEventListener('pointermove', function(e){
      if(!neer) return;
      var stap = laatsteX - e.clientX;
      laatsteX = e.clientX;
      if(!versleept && Math.abs(stap) > 4){ versleept = true; spoor.classList.add('is-slepen'); }
      if(versleept){ spoor.scrollLeft += stap; herstel(); }
    });

    function los(e){
      if(!neer) return;
      neer = false;
      spoor.classList.remove('is-slepen');
      if(spoor.hasPointerCapture && e && spoor.hasPointerCapture(e.pointerId)) spoor.releasePointerCapture(e.pointerId);
    }
    spoor.addEventListener('pointerup', los);
    spoor.addEventListener('pointercancel', los);
    spoor.addEventListener('pointerleave', los);

    // na het slepen niet ook nog de link eronder openen
    spoor.addEventListener('click', function(e){
      if(versleept){ e.preventDefault(); e.stopPropagation(); versleept = false; }
    }, true);
  });

  /* ---- WhatsApp ---- */
  var wa = document.getElementById('waLink');
  if(wa){
    wa.href = 'https://wa.me/' + WHATSAPP_NUMMER
            + (WHATSAPP_BERICHT ? '?text=' + encodeURIComponent(WHATSAPP_BERICHT) : '');
  }

  /* ---- menu's in de balk ----
     Twee panelen ('Wat wij doen' en 'Producten') met precies dezelfde
     schuifbeweging. Er kan er maar een tegelijk open staan: ga je met de
     muis naar de andere knop, dan wisselt het paneel meteen. */
  var menus = [
    { knop: document.getElementById('megaBtn'),  paneel: document.getElementById('mega')     },
    { knop: document.getElementById('prodBtn'),  paneel: document.getElementById('prodMega') }
  ].filter(function(m){ return m.knop && m.paneel; });

  if(menus.length){
    var canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    function isOpen(m){ return m.paneel.dataset.open === 'true'; }
    function sluit(m){
      m.knop.setAttribute('aria-expanded', 'false');
      m.paneel.dataset.open = 'false';
    }
    function sluitAlles(){ menus.forEach(sluit); }
    function open(m){
      menus.forEach(function(a){ if(a !== m) sluit(a); });
      m.knop.setAttribute('aria-expanded', 'true');
      m.paneel.dataset.open = 'true';
    }

    menus.forEach(function(m){
      m.knop.addEventListener('click', function(e){
        // Met een muis heeft hover het menu al geopend; een klik mag dat niet
        // meteen weer dichtklappen. Toetsenbordgebruik (e.detail === 0) toggelt wel.
        if(isOpen(m) && canHover && e.detail !== 0) return;
        if(isOpen(m)){ sluit(m); } else { open(m); }
      });
      m.paneel.querySelectorAll('a').forEach(function(a){
        a.addEventListener('click', sluitAlles);
      });
    });

    if(canHover){
      // De knoppen en de panelen zitten allebei in de topbalk, dus de muis kan
      // van de een naar de ander zonder iets te verlaten. Daarom sluiten we
      // op de balk als geheel: geen vertraging nodig en toch geen geflikker.
      var bar = menus[0].knop.closest('.topbar') || menus[0].paneel.parentNode;
      menus.forEach(function(m){
        m.knop.addEventListener('mouseenter', function(){ open(m); });
      });
      bar.addEventListener('mouseleave', sluitAlles);
      // Ga je naar een ander item in de balk, dan sluit het menu ook meteen.
      // Ook de knoppen tellen mee, want niet elk item is een link.
      var knoppen = menus.map(function(m){ return m.knop; });
      document.querySelectorAll('.nav a, .nav button').forEach(function(el){
        if(knoppen.indexOf(el) === -1) el.addEventListener('mouseenter', sluitAlles);
      });
    }

    document.addEventListener('keydown', function(e){
      if(e.key !== 'Escape') return;
      menus.forEach(function(m){
        if(isOpen(m)){ sluit(m); m.knop.focus(); }
      });
    });
  }

  /* ---- topbalk: doorzichtig boven de hero, matglas zodra je scrollt ----
     Alleen op pagina's met een videohero. De klasse .is-scrolled laat het
     CSS de achtergrond in .35s invaden; 8px speling voorkomt dat de balk
     staat te knipperen bij het kleinste duwtje aan het wiel. */
  var balk = document.querySelector('.topbar');
  if(balk && document.body.classList.contains('has-hero')){
    var volgScroll = function(){
      balk.classList.toggle('is-scrolled', window.scrollY > 8);
    };
    volgScroll();                                   // ook goed bij herladen halverwege de pagina
    window.addEventListener('scroll', volgScroll, { passive:true });
  }

  /* ---- fotoslider ----
     Het spoor scrollt horizontaal met scroll-snap; de pijlen schuiven een
     hele foto op en de bolletjes volgen wat er in beeld staat. */
  document.querySelectorAll('[data-slider]').forEach(function(sl){
    var spoor = sl.querySelector('.fotoslider__spoor');
    var fotos = spoor.querySelectorAll('img');
    var bak   = sl.querySelector('.fotoslider__bolletjes');
    if(fotos.length < 2){
      sl.querySelectorAll('.fotoslider__pijl').forEach(function(b){ b.hidden = true; });
      return;
    }
    var bolletjes = [];
    fotos.forEach(function(_, i){
      var b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('role', 'tab');
      b.setAttribute('aria-label', 'Foto ' + (i + 1));
      b.addEventListener('click', function(){ naar(i); });
      bak.appendChild(b);
      bolletjes.push(b);
    });
    function huidige(){ return Math.round(spoor.scrollLeft / spoor.clientWidth); }
    function naar(i){
      var n = (i + fotos.length) % fotos.length;
      spoor.scrollTo({ left: n * spoor.clientWidth, behavior: 'smooth' });
    }
    function markeer(){
      var n = huidige();
      bolletjes.forEach(function(b, i){ b.setAttribute('aria-selected', i === n ? 'true' : 'false'); });
    }
    sl.querySelector('.fotoslider__pijl--vorige').addEventListener('click', function(){ naar(huidige() - 1); });
    sl.querySelector('.fotoslider__pijl--volgende').addEventListener('click', function(){ naar(huidige() + 1); });
    spoor.addEventListener('scroll', markeer, { passive:true });
    markeer();
  });

  /* ---- videoblok ----
     Speelt met geluid zodra hij in beeld komt. Blokkeert de browser dat
     (dat mag hij, zonder klik), dan gaat hij verder zonder geluid en zet de
     knop zichzelf op 'Geluid aan'. */
  document.querySelectorAll('[data-video]').forEach(function(blok){
    var video = blok.querySelector('video');
    var knop  = blok.querySelector('[data-geluid]');
    var label = knop.querySelector('.videoblok__label');

    function toon(){
      var uit = video.muted;
      knop.setAttribute('aria-pressed', uit ? 'true' : 'false');
      label.textContent = uit ? 'Geluid aan' : 'Geluid uit';
    }
    function speel(){
      var p = video.play();
      if(p && p.catch){
        p.catch(function(){
          // Zonder klik mag alleen geluidloos spelen.
          video.muted = true; toon(); video.play().catch(function(){});
        });
      }
    }

    knop.addEventListener('click', function(){
      video.muted = !video.muted;
      toon();
      if(video.paused) video.play().catch(function(){});
    });
    toon();

    if('IntersectionObserver' in window){
      new IntersectionObserver(function(rijen){
        rijen.forEach(function(r){
          if(r.isIntersecting){ speel(); } else { video.pause(); }
        });
      }, { threshold:.35 }).observe(blok);
    } else {
      speel();
    }
  });

  /* ---- jaartal in de footer ---- */
  var jaar = document.getElementById('jaar');
  if(jaar) jaar.textContent = new Date().getFullYear();
})();
