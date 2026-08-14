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
    var closeTimer = null;
    var canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    function openMega(){
      clearTimeout(closeTimer);
      btn.setAttribute('aria-expanded', 'true');
      mega.dataset.open = 'true';
    }
    function closeMega(){
      btn.setAttribute('aria-expanded', 'false');
      mega.dataset.open = 'false';
    }
    function scheduleClose(){
      clearTimeout(closeTimer);
      closeTimer = setTimeout(closeMega, 200);
    }

    btn.addEventListener('click', function(){
      var open = btn.getAttribute('aria-expanded') === 'true';
      if(open){ closeMega(); } else { openMega(); }
    });

    if(canHover){
      btn.addEventListener('mouseenter', openMega);
      btn.addEventListener('mouseleave', scheduleClose);
      mega.addEventListener('mouseenter', function(){ clearTimeout(closeTimer); });
      mega.addEventListener('mouseleave', scheduleClose);
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
