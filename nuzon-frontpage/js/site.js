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
      }, 1000);
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
      setTimeout(sluitIntro, document.body.classList.contains('has-hero') ? 2400 : 1200);
    }
  }

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

  /* ---- jaartal in de footer ---- */
  var jaar = document.getElementById('jaar');
  if(jaar) jaar.textContent = new Date().getFullYear();
})();
