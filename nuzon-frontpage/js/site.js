/* =====================================================================
   Gedeeld script voor alle pagina's: topbalk, menu en WhatsApp-knop.

   WHATSAPP_NUMMER — landcode zonder +, zonder spaties of streepjes.
   06 12 34 56 78  ->  "31612345678"
   ===================================================================== */
var WHATSAPP_NUMMER  = "31307816767";
var WHATSAPP_BERICHT = "Hallo Nuzon, ik heb een vraag over ";

(function(){
  /* ---- WhatsApp ---- */
  var wa = document.getElementById('waLink');
  if(wa){
    wa.href = 'https://wa.me/' + WHATSAPP_NUMMER
            + (WHATSAPP_BERICHT ? '?text=' + encodeURIComponent(WHATSAPP_BERICHT) : '');
  }

  /* ---- mega menu ---- */
  var btn = document.getElementById('megaBtn'), mega = document.getElementById('mega');
  if(btn && mega){
    var canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    function openMega(){
      btn.setAttribute('aria-expanded', 'true');
      mega.dataset.open = 'true';
    }
    function closeMega(){
      btn.setAttribute('aria-expanded', 'false');
      mega.dataset.open = 'false';
    }

    btn.addEventListener('click', function(e){
      var open = btn.getAttribute('aria-expanded') === 'true';
      // Met een muis heeft hover het menu al geopend; een klik mag dat niet
      // meteen weer dichtklappen. Toetsenbordgebruik (e.detail === 0) toggelt wel.
      if(open && canHover && e.detail !== 0) return;
      if(open){ closeMega(); } else { openMega(); }
    });

    if(canHover){
      // De knop en het paneel zitten allebei in de topbalk, dus de muis kan
      // van de een naar de ander zonder iets te verlaten. Daarom sluiten we
      // op de balk als geheel: geen vertraging nodig en toch geen geflikker.
      var bar = btn.closest('.topbar') || mega.parentNode;
      btn.addEventListener('mouseenter', openMega);
      bar.addEventListener('mouseleave', closeMega);
      // Ga je naar een ander item in de balk, dan sluit het menu ook meteen.
      document.querySelectorAll('.nav a').forEach(function(a){
        a.addEventListener('mouseenter', closeMega);
      });
    }

    document.addEventListener('keydown', function(e){
      if(e.key === 'Escape' && mega.dataset.open === 'true'){
        closeMega(); btn.focus();
      }
    });
    document.querySelectorAll('#mega a').forEach(function(a){
      a.addEventListener('click', closeMega);
    });
  }

  /* ---- jaartal in de footer ---- */
  var jaar = document.getElementById('jaar');
  if(jaar) jaar.textContent = new Date().getFullYear();
})();
