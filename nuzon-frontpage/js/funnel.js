/* =====================================================================
   AANVRAAGFUNNEL — de vragenlijst achter elke adviesknop

   Losse drop-in: zet dit bestand na js/site.js op elke pagina. Het script
   zoekt zelf de knoppen met een van de teksten in KNOPTEKSTEN (plus alles
   met data-funnel) en opent daar het overlayscherm. De pagina blijft
   achter het scherm staan.

   Verzenden gaat via mailto naar ONTVANGER. Wil je later een echte
   backend, vervang dan alleen verstuur().
   ===================================================================== */
var NUZON_ONTVANGER = "info@nuzon.nl";

(function(){
  var KNOPTEKSTEN = [
    "vraag schouw aan",
    "gratis advies",
    "vraag persoonlijk advies aan",
    "vraag advies aan",
    "vraag gratis advies aan",
    "plan een gratis dakcheck",
    "plan een dakcheck"
  ];

  /* Vestiging Soest — Weteringpad 13A */
  var BASIS = [52.1736, 5.2894];

  /* Indicatie per postcodegebied (eerste twee cijfers). Genoeg om te zien
     of een aanvraag dichtbij of ver weg ligt; geen routeafstand. */
  var PC = {10:["Amsterdam",52.37,4.89],11:["Amsterdam-Zuidoost",52.32,4.95],12:["Hilversum e.o.",52.22,5.17],13:["Almere",52.37,5.22],14:["Naarden / Weesp",52.30,5.05],15:["Zaanstad",52.44,4.83],16:["Purmerend",52.51,4.96],17:["Den Helder",52.90,4.78],18:["Alkmaar",52.63,4.75],19:["Heemskerk e.o.",52.53,4.66],20:["Haarlem",52.38,4.64],21:["Hillegom / Lisse",52.28,4.57],22:["Katwijk",52.20,4.42],23:["Leiden",52.16,4.49],24:["Alphen aan den Rijn",52.13,4.66],25:["Den Haag",52.07,4.30],26:["Delft",52.01,4.36],27:["Zoetermeer",52.06,4.49],28:["Rijswijk / Voorburg",52.04,4.32],29:["Capelle / Krimpen",51.93,4.60],30:["Rotterdam",51.92,4.48],31:["Schiedam / Vlaardingen",51.92,4.39],32:["Spijkenisse",51.85,4.33],33:["Dordrecht",51.81,4.67],34:["Nieuwegein",52.03,5.09],35:["Utrecht",52.09,5.11],36:["Woerden / Maarssen",52.14,4.88],37:["Zeist",52.09,5.23],38:["Amersfoort",52.16,5.39],39:["Veenendaal",52.03,5.56],40:["Culemborg",51.95,5.23],41:["Tiel",51.89,5.43],42:["Gorinchem",51.83,4.97],43:["Vlissingen",51.44,3.57],44:["Goes",51.50,3.89],45:["Terneuzen",51.33,3.83],46:["Bergen op Zoom",51.49,4.29],47:["Roosendaal",51.53,4.46],48:["Breda",51.59,4.78],49:["Oosterhout",51.64,4.86],50:["Tilburg",51.56,5.09],51:["Waalwijk",51.69,5.07],52:["'s-Hertogenbosch",51.70,5.30],53:["Zaltbommel",51.81,5.25],54:["Uden / Veghel",51.62,5.61],55:["Valkenswaard",51.35,5.46],56:["Eindhoven",51.44,5.48],57:["Helmond",51.48,5.66],58:["Deurne e.o.",51.46,5.79],59:["Weert",51.25,5.71],60:["Roermond",51.19,5.99],61:["Sittard",51.00,5.87],62:["Maastricht",50.85,5.69],63:["Geleen e.o.",50.95,5.83],64:["Heerlen",50.89,5.98],65:["Nijmegen",51.84,5.86],66:["Beuningen e.o.",51.86,5.75],67:["Wageningen / Bemmel",51.96,5.66],68:["Arnhem",51.98,5.91],69:["Zevenaar e.o.",51.93,6.07],70:["Doetinchem",51.97,6.29],71:["Winterswijk",51.97,6.72],72:["Zutphen",52.14,6.20],73:["Apeldoorn",52.21,5.97],74:["Deventer",52.25,6.16],75:["Enschede",52.22,6.89],76:["Hengelo",52.27,6.79],77:["Almelo",52.36,6.66],78:["Hardenberg",52.58,6.62],79:["Ommen e.o.",52.52,6.43],80:["Zwolle",52.51,6.09],81:["Kampen",52.55,5.91],82:["Nunspeet / Elburg",52.36,5.79],83:["Steenwijk / Meppel",52.70,6.19],84:["Heerenveen",52.88,5.98],85:["Emmeloord",52.71,5.75],86:["Sneek",53.03,5.66],87:["Harlingen",53.17,5.42],88:["Leeuwarden",53.20,5.79],89:["Dokkum",53.32,5.99],90:["Leeuwarden e.o.",53.20,5.79],91:["Drachten",53.10,6.10],92:["Leek / Roden",53.15,6.42],93:["Assen",52.99,6.56],94:["Hoogeveen",52.72,6.48],95:["Stadskanaal",52.99,6.95],96:["Veendam",53.11,6.87],97:["Groningen",53.22,6.57],98:["Delfzijl",53.33,6.92],99:["Appingedam e.o.",53.35,6.80]};

  var WERKGEBIED_KM = 60;

  var stap = 0, klaar = false;
  var d = { klant:"", wensen:[], situatie:{}, termijn:"", postcode:"", huisnummer:"", overig:"", naam:"", bedrijf:"", email:"", telefoon:"" };
  var laatsteTrigger = null;

  var STAPPEN = ["type","wens","situatie","locatie","termijn","contact"];

  var KOPPEN = {
    type:     ["Voor wie doen we dit?",        "Zo weten we met welke regels, subsidies en garanties we rekenen."],
    wens:     ["Waar wilt u advies over?",     "Meerdere keuzes mogelijk \u2014 een combinatie mag."],
    situatie: ["Uw situatie",                  "Vier korte vragen, dan weten onze adviseurs wat er kan."],
    locatie:  ["Waar staat het object?",       "Met uw postcode zien wij direct hoe ver het van Soest ligt."],
    termijn:  ["Planning",                     "En alles wat u ons verder wilt meegeven."],
    contact:  ["Hoe mogen wij u bereiken?",    "Wij nemen binnen \u00e9\u00e9n werkdag contact op."]
  };

  function zakelijk(){ return d.klant === "Zakelijk"; }

  function situatieVragen(){
    return zakelijk() ? [
      { key:"pand",        label:"Wat voor pand is het?",              opts:["Kantoor","Bedrijfshal of loods","Winkel of horeca","Agrarisch bedrijf","Meerdere locaties"] },
      { key:"bezit",       label:"Eigendom of gehuurd?",               opts:["Eigendom","Gehuurd","Nog in aankoop"] },
      { key:"aansluiting", label:"Wat voor netaansluiting heeft u?",    opts:["Kleinverbruik (t/m 3x80A)","Grootverbruik","Weet ik niet"] },
      { key:"huidig",      label:"Zijn er al zonnepanelen aanwezig?",  opts:["Nee","Ja, uitbreiden","Ja, vervangen"] }
    ] : [
      { key:"woning", label:"Wat voor woning heeft u?",  opts:["Vrijstaand","Twee-onder-een-kap","Tussen- of hoekwoning","Appartement","Boerderij of schuur"] },
      { key:"bezit",  label:"Koop of huur?",             opts:["Koopwoning","Huurwoning"] },
      { key:"huidig", label:"Heeft u al zonnepanelen?",  opts:["Nee","Ja, uitbreiden","Ja, vervangen"] }
    ];
  }

  function afstand(){
    var m = String(d.postcode).replace(/\s/g,"").match(/^(\d{4})/);
    if(!m) return null;
    var r = PC[parseInt(m[1].slice(0,2),10)];
    if(!r) return null;
    var rad = function(g){ return g * Math.PI / 180; };
    var dLat = rad(r[1] - BASIS[0]), dLon = rad(r[2] - BASIS[1]);
    var a = Math.pow(Math.sin(dLat/2),2) + Math.cos(rad(BASIS[0])) * Math.cos(rad(r[1])) * Math.pow(Math.sin(dLon/2),2);
    /* 1.25 als ruwe omrekening van vogelvlucht naar wegkilometers */
    return { plaats:r[0], km: Math.round(6371 * 2 * Math.asin(Math.sqrt(a)) * 1.25) };
  }

  function geldig(){
    switch(STAPPEN[stap]){
      case "type":     return !!d.klant;
      case "wens":     return d.wensen.length > 0;
      case "situatie": return situatieVragen().every(function(v){ return !!d.situatie[v.key]; });
      case "locatie":  return /^\d{4}\s?[a-zA-Z]{0,2}$/.test(d.postcode.trim()) && !!d.huisnummer.trim();
      case "termijn":  return !!d.termijn;
      case "contact":  return !!d.naam.trim() && /.+@.+\..+/.test(d.email) && !!d.telefoon.trim();
    }
    return false;
  }

  function samenvatting(){
    var a = afstand();
    var r = [
      "Type klant: " + d.klant,
      "Interesse: " + d.wensen.join(", ")
    ];
    situatieVragen().forEach(function(v){
      r.push(v.label.replace(/\?$/,"") + ": " + (d.situatie[v.key] || "-"));
    });
    r.push("Adres: postcode " + d.postcode.toUpperCase() + ", huisnummer " + d.huisnummer);
    r.push("Afstand tot Soest: " + (a ? "\u00b1 " + a.km + " km (" + a.plaats + ")" : "onbekend"));
    r.push("Termijn: " + d.termijn);
    r.push("Overige informatie: " + (d.overig.trim() || "-"));
    r.push("");
    r.push("Naam: " + d.naam);
    if(zakelijk()) r.push("Bedrijf: " + (d.bedrijf || "-"));
    r.push("E-mail: " + d.email);
    r.push("Telefoon: " + d.telefoon);
    if(laatsteTrigger) r.push("", "Gestart via: " + laatsteTrigger);
    return r.join("\n");
  }

  function verstuur(){
    var onderwerp = "Adviesaanvraag " + (zakelijk() ? "zakelijk" : "particulier") + (d.naam ? " \u2014 " + d.naam : "");
    window.location.href = "mailto:" + NUZON_ONTVANGER
      + "?subject=" + encodeURIComponent(onderwerp)
      + "&body=" + encodeURIComponent(samenvatting());
  }

  /* ---------------------------------------------------------------- CSS */
  var STIJL = [
    ".nzf{position:fixed;inset:0;z-index:1200;display:flex;align-items:center;justify-content:center;padding:clamp(12px,3vh,40px) clamp(12px,3vw,40px);background:rgba(16,13,6,.62);backdrop-filter:blur(6px);opacity:0;transition:opacity .24s ease}",
    ".nzf[data-open='true']{opacity:1}",
    ".nzf[hidden]{display:none}",
    ".nzf__panel{position:relative;width:min(760px,100%);max-height:100%;display:flex;flex-direction:column;background:var(--bg,#fff);border-radius:6px;box-shadow:0 34px 90px rgba(20,16,6,.4);transform:translateY(16px) scale(.985);transition:transform .28s cubic-bezier(.2,.8,.3,1);overflow:hidden}",
    ".nzf[data-open='true'] .nzf__panel{transform:none}",
    ".nzf__head{padding:clamp(22px,3vw,32px) clamp(22px,3.4vw,40px) 18px;border-bottom:1px solid var(--line,#ECE6DA);display:flex;gap:16px;align-items:flex-start}",
    ".nzf__eyebrow{font-size:.7rem;font-weight:600;letter-spacing:.16em;text-transform:uppercase;color:var(--gold-deep,#A87A10);margin:0 0 8px}",
    ".nzf__title{font-size:clamp(1.35rem,2.4vw,1.85rem);font-weight:800;letter-spacing:-.03em;line-height:1.14;color:var(--ink,#16130C);margin:0}",
    ".nzf__sub{margin:8px 0 0;font-size:.95rem;color:var(--body,#524B3D);line-height:1.5}",
    ".nzf__x{flex:none;width:38px;height:38px;border:1px solid var(--line-2,#E0D7C4);border-radius:4px;background:none;cursor:pointer;color:var(--ink,#16130C);font-size:20px;line-height:1;transition:border-color .18s,color .18s}",
    ".nzf__x:hover{border-color:var(--gold,#C8941B);color:var(--gold-deep,#A87A10)}",
    ".nzf__bar{display:flex;gap:5px;padding:0 clamp(22px,3.4vw,40px);margin-top:16px}",
    ".nzf__bar span{flex:1;height:3px;border-radius:2px;background:var(--line,#ECE6DA);transition:background .3s}",
    ".nzf__bar span.is-done{background:var(--gold,#C8941B)}",
    ".nzf__body{padding:clamp(20px,3vw,30px) clamp(22px,3.4vw,40px) clamp(24px,3vw,34px);overflow-y:auto;flex:1}",
    ".nzf__body>*{animation:nzf-in .26s ease both}",
    "@keyframes nzf-in{from{opacity:0;transform:translateX(14px)}to{opacity:1;transform:none}}",
    ".nzf__foot{padding:16px clamp(22px,3.4vw,40px) clamp(20px,2.6vw,26px);border-top:1px solid var(--line,#ECE6DA);display:flex;align-items:center;gap:14px;background:var(--bg-soft,#FAF7F0)}",
    ".nzf__hint{flex:1;font-size:.78rem;color:var(--muted,#8C8474)}",
    ".nzf .btn[disabled]{opacity:.42;pointer-events:none}",
    ".nzf__grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:14px}",
    ".nzf__big{text-align:left;padding:22px 24px;border:1px solid var(--line-2,#E0D7C4);border-radius:5px;background:#fff;cursor:pointer;transition:border-color .18s,box-shadow .18s,background .18s}",
    ".nzf__big:hover{border-color:var(--gold,#C8941B);box-shadow:0 10px 30px rgba(30,24,8,.09)}",
    ".nzf__big[aria-pressed='true']{border-color:var(--gold,#C8941B);background:var(--bg-gold,#FBF3DF)}",
    ".nzf__big b{display:block;font-size:1.12rem;font-weight:700;letter-spacing:-.02em;color:var(--ink,#16130C);margin-bottom:6px}",
    ".nzf__big small{display:block;font-size:.86rem;line-height:1.5;color:var(--body,#524B3D)}",
    ".nzf__opts{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:10px}",
    ".nzf__opt{display:flex;align-items:center;gap:11px;text-align:left;padding:13px 15px;border:1px solid var(--line-2,#E0D7C4);border-radius:5px;background:#fff;cursor:pointer;font-size:.97rem;font-weight:500;color:var(--ink,#16130C);transition:border-color .18s,background .18s}",
    ".nzf__opt:hover{border-color:var(--gold,#C8941B)}",
    ".nzf__opt[aria-pressed='true']{border-color:var(--gold,#C8941B);background:var(--bg-gold,#FBF3DF)}",
    ".nzf__tick{flex:none;width:20px;height:20px;border-radius:3px;border:1px solid var(--line-2,#E0D7C4);display:flex;align-items:center;justify-content:center;font-size:12px;color:#14110A;background:#fff}",
    ".nzf__opt[aria-pressed='true'] .nzf__tick{background:var(--gold-grad,#C8941B);border-color:transparent}",
    ".nzf__vraag{margin:0 0 12px;font-size:.82rem;font-weight:600;letter-spacing:.09em;text-transform:uppercase;color:var(--muted,#8C8474)}",
    ".nzf__blok+.nzf__blok{margin-top:26px}",
    ".nzf__pills{display:flex;flex-wrap:wrap;gap:9px}",
    ".nzf__pill{padding:10px 16px;border:1px solid var(--line-2,#E0D7C4);border-radius:999px;background:#fff;cursor:pointer;font-size:.94rem;font-weight:500;color:var(--ink,#16130C);transition:border-color .18s,background .18s}",
    ".nzf__pill:hover{border-color:var(--gold,#C8941B)}",
    ".nzf__pill[aria-pressed='true']{border-color:var(--gold,#C8941B);background:var(--bg-gold,#FBF3DF)}",
    ".nzf__velden{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px}",
    ".nzf__veld label{display:block;font-size:.8rem;font-weight:600;letter-spacing:.06em;text-transform:uppercase;color:var(--muted,#8C8474);margin-bottom:7px}",
    ".nzf__veld input,.nzf__veld textarea{width:100%;padding:12px 14px;border:1px solid var(--line-2,#E0D7C4);border-radius:4px;background:#fff;font-size:1rem;color:var(--ink,#16130C)}",
    ".nzf__veld textarea{resize:vertical;min-height:118px;line-height:1.55}",
    ".nzf__veld input:focus,.nzf__veld textarea:focus{outline:none;border-color:var(--gold,#C8941B);box-shadow:0 0 0 3px rgba(200,148,27,.16)}",
    ".nzf__afstand{margin-top:22px;display:flex;align-items:center;gap:18px;padding:18px 22px;border:1px solid var(--line,#ECE6DA);border-radius:5px;background:var(--bg-soft,#FAF7F0)}",
    ".nzf__afstand.is-in{background:var(--bg-gold,#FBF3DF);border-color:rgba(200,148,27,.4)}",
    ".nzf__km{font-size:1.7rem;font-weight:800;letter-spacing:-.03em;color:var(--ink,#16130C);white-space:nowrap}",
    ".nzf__afstand p{margin:0;font-size:.92rem;line-height:1.5;color:var(--body,#524B3D)}",
    ".nzf__klaar{max-width:52ch}",
    ".nzf__vink{width:52px;height:52px;border-radius:50%;background:var(--gold-grad,#C8941B);color:#14110A;display:flex;align-items:center;justify-content:center;font-size:24px;margin-bottom:18px}",
    ".nzf__pre{margin:20px 0 0;white-space:pre-wrap;font-family:inherit;font-size:.9rem;line-height:1.65;color:var(--body,#524B3D);background:var(--bg-soft,#FAF7F0);border:1px solid var(--line,#ECE6DA);border-radius:5px;padding:18px 22px}",
    "@media (max-width:560px){.nzf{padding:0}.nzf__panel{width:100%;height:100%;max-height:100%;border-radius:0}}"
  ].join("");

  /* ------------------------------------------------------------- opbouw */
  var laag, panel, elKop, elSub, elEyebrow, elBar, elBody, elTerug, elVerder, elHint;

  function esc(s){ return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"); }

  function bouw(){
    var stijl = document.createElement("style");
    stijl.textContent = STIJL;
    document.head.appendChild(stijl);

    laag = document.createElement("div");
    laag.className = "nzf";
    laag.setAttribute("data-open","false");
    laag.hidden = true;
    laag.innerHTML =
      '<div class="nzf__panel" role="dialog" aria-modal="true" aria-labelledby="nzfTitel">' +
        '<div class="nzf__head">' +
          '<div style="flex:1">' +
            '<p class="nzf__eyebrow"></p>' +
            '<h2 class="nzf__title" id="nzfTitel"></h2>' +
            '<p class="nzf__sub"></p>' +
          '</div>' +
          '<button type="button" class="nzf__x" aria-label="Sluiten">&times;</button>' +
        '</div>' +
        '<div class="nzf__bar"></div>' +
        '<div class="nzf__body"></div>' +
        '<div class="nzf__foot">' +
          '<button type="button" class="btn btn--ghost nzf__terug">Terug</button>' +
          '<span class="nzf__hint"></span>' +
          '<button type="button" class="btn nzf__verder">Volgende</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(laag);

    panel     = laag.querySelector(".nzf__panel");
    elEyebrow = laag.querySelector(".nzf__eyebrow");
    elKop     = laag.querySelector(".nzf__title");
    elSub     = laag.querySelector(".nzf__sub");
    elBar     = laag.querySelector(".nzf__bar");
    elBody    = laag.querySelector(".nzf__body");
    elTerug   = laag.querySelector(".nzf__terug");
    elVerder  = laag.querySelector(".nzf__verder");
    elHint    = laag.querySelector(".nzf__hint");

    for(var i = 0; i < STAPPEN.length; i++) elBar.appendChild(document.createElement("span"));

    laag.querySelector(".nzf__x").addEventListener("click", sluit);
    laag.addEventListener("mousedown", function(e){ if(e.target === laag) sluit(); });
    elTerug.addEventListener("click", function(){ if(stap > 0){ stap--; toon(); } });
    elVerder.addEventListener("click", volgende);

    elBody.addEventListener("click", function(e){
      var k = e.target.closest("[data-key]");
      if(!k) return;
      var key = k.getAttribute("data-key"), val = k.getAttribute("data-val");
      if(key === "wensen"){
        var i = d.wensen.indexOf(val);
        if(i > -1) d.wensen.splice(i,1); else d.wensen.push(val);
        toon(true);
      } else if(key === "klant"){
        d.klant = val; d.situatie = {}; stap = 1; toon();
      } else if(key === "termijn"){
        d.termijn = val; toon(true);
      } else {
        d.situatie[key] = val; toon(true);
      }
    });

    elBody.addEventListener("input", function(e){
      var f = e.target.getAttribute("data-veld");
      if(!f) return;
      d[f] = e.target.value;
      if(f === "postcode" || f === "huisnummer") vulAfstand();
      voet();
    });

    document.addEventListener("keydown", function(e){
      if(e.key === "Escape" && !laag.hidden) sluit();
    });
  }

  /* ------------------------------------------------------------- render */
  function optKnop(key, val, gekozen, vink){
    return '<button type="button" class="nzf__opt" data-key="' + esc(key) + '" data-val="' + esc(val) + '" aria-pressed="' + (gekozen ? "true" : "false") + '">' +
      (vink ? '<span class="nzf__tick">' + (gekozen ? "\u2713" : "") + '</span>' : "") +
      '<span>' + esc(val) + '</span></button>';
  }

  function inhoud(){
    var s = STAPPEN[stap], h = "";

    if(s === "type"){
      var kaarten = [
        ["Particulier","Woning, appartement, garage of eigen schuur."],
        ["Zakelijk","Kantoor, bedrijfshal, agrarisch bedrijf of meerdere locaties."]
      ];
      h = '<div class="nzf__grid">' + kaarten.map(function(k){
        return '<button type="button" class="nzf__big" data-key="klant" data-val="' + k[0] + '" aria-pressed="' + (d.klant === k[0] ? "true" : "false") + '"><b>' + k[0] + '</b><small>' + k[1] + '</small></button>';
      }).join("") + '</div>';
    }

    if(s === "wens"){
      var wensen = ["Zonnepanelen","Thuisbatterij","Laadpaal","Noodstroom","Weet ik nog niet"];
      h = '<div class="nzf__opts">' + wensen.map(function(w){
        return optKnop("wensen", w, d.wensen.indexOf(w) > -1, true);
      }).join("") + '</div>';
    }

    if(s === "situatie"){
      h = situatieVragen().map(function(v){
        return '<div class="nzf__blok"><p class="nzf__vraag">' + esc(v.label) + '</p><div class="nzf__pills">' +
          v.opts.map(function(o){
            return '<button type="button" class="nzf__pill" data-key="' + v.key + '" data-val="' + esc(o) + '" aria-pressed="' + (d.situatie[v.key] === o ? "true" : "false") + '">' + esc(o) + '</button>';
          }).join("") + '</div></div>';
      }).join("");
    }

    if(s === "locatie"){
      h = '<div class="nzf__velden" style="max-width:440px">' +
        '<div class="nzf__veld"><label for="nzfPc">Postcode</label><input id="nzfPc" data-veld="postcode" value="' + esc(d.postcode) + '" placeholder="3768 AA" autocomplete="postal-code"></div>' +
        '<div class="nzf__veld"><label for="nzfNr">Huisnummer</label><input id="nzfNr" data-veld="huisnummer" value="' + esc(d.huisnummer) + '" placeholder="13A"></div>' +
        '</div><div class="nzf__afstand"><span class="nzf__km"></span><p></p></div>';
    }

    if(s === "termijn"){
      var t = ["Zo snel mogelijk","Binnen 3 maanden","Binnen 6 tot 12 maanden","Ik ori\u00ebnteer me nog"];
      h = '<div class="nzf__blok"><p class="nzf__vraag">Wanneer wilt u het laten uitvoeren?</p><div class="nzf__pills">' +
        t.map(function(o){
          return '<button type="button" class="nzf__pill" data-key="termijn" data-val="' + esc(o) + '" aria-pressed="' + (d.termijn === o ? "true" : "false") + '">' + esc(o) + '</button>';
        }).join("") + '</div></div>' +
        '<div class="nzf__blok nzf__veld"><label for="nzfInfo">Overige informatie (optioneel)</label>' +
        '<textarea id="nzfInfo" data-veld="overig" placeholder="Bijvoorbeeld: dakvorm, ruimte in de meterkast, gewenst vermogen, eerdere offertes.">' + esc(d.overig) + '</textarea></div>';
    }

    if(s === "contact"){
      h = '<div class="nzf__velden" style="max-width:560px">' +
        '<div class="nzf__veld"><label for="nzfNaam">Naam</label><input id="nzfNaam" data-veld="naam" value="' + esc(d.naam) + '" placeholder="Voor- en achternaam" autocomplete="name"></div>' +
        (zakelijk() ? '<div class="nzf__veld"><label for="nzfBedr">Bedrijfsnaam</label><input id="nzfBedr" data-veld="bedrijf" value="' + esc(d.bedrijf) + '" placeholder="Bedrijf B.V." autocomplete="organization"></div>' : "") +
        '<div class="nzf__veld"><label for="nzfMail">E-mailadres</label><input id="nzfMail" type="email" data-veld="email" value="' + esc(d.email) + '" placeholder="naam@voorbeeld.nl" autocomplete="email"></div>' +
        '<div class="nzf__veld"><label for="nzfTel">Telefoonnummer</label><input id="nzfTel" type="tel" data-veld="telefoon" value="' + esc(d.telefoon) + '" placeholder="06 12 34 56 78" autocomplete="tel"></div>' +
        '</div>';
    }

    return h;
  }

  function vulAfstand(){
    var box = elBody.querySelector(".nzf__afstand");
    if(!box) return;
    var a = afstand();
    var km = box.querySelector(".nzf__km"), p = box.querySelector("p");
    if(!a){
      box.classList.remove("is-in");
      km.textContent = "\u2014";
      p.textContent = "Vul uw postcode in voor een indicatie van de afstand tot onze vestiging in Soest.";
      return;
    }
    var binnen = a.km <= WERKGEBIED_KM;
    box.classList.toggle("is-in", binnen);
    km.textContent = "\u00b1 " + a.km + " km";
    p.textContent = a.plaats + " \u2014 " + (binnen
      ? "binnen ons werkgebied. Een schouw plannen we snel in."
      : "buiten ons standaard werkgebied. Wij nemen contact op over de mogelijkheden.");
  }

  function voet(){
    if(klaar){
      elTerug.style.visibility = "hidden";
      elVerder.textContent = "Sluiten";
      elVerder.removeAttribute("disabled");
      elHint.textContent = "";
      return;
    }
    elTerug.style.visibility = stap === 0 ? "hidden" : "visible";
    elVerder.textContent = STAPPEN[stap] === "contact" ? "Aanvraag versturen" : "Volgende";
    if(geldig()) elVerder.removeAttribute("disabled"); else elVerder.setAttribute("disabled","");
    elHint.textContent = geldig() ? "" : "Vul deze stap in om verder te gaan";
  }

  function toon(behoudScroll){
    var y = behoudScroll ? elBody.scrollTop : 0;
    if(klaar){
      elEyebrow.textContent = "Verzonden";
      elKop.textContent = "Bedankt voor uw aanvraag";
      elSub.textContent = "Uw mailprogramma opent met de volledige aanvraag aan " + NUZON_ONTVANGER + ".";
      elBar.querySelectorAll("span").forEach(function(sp){ sp.classList.add("is-done"); });
      elBody.innerHTML = '<div class="nzf__klaar"><div class="nzf__vink">\u2713</div>' +
        '<p style="margin:0;line-height:1.6">Wij nemen binnen \u00e9\u00e9n werkdag contact met u op. Hieronder staat wat u ons heeft doorgegeven.</p>' +
        '<pre class="nzf__pre">' + esc(samenvatting()) + '</pre></div>';
      voet();
      return;
    }
    var k = KOPPEN[STAPPEN[stap]];
    elEyebrow.textContent = "Stap " + (stap + 1) + " van " + STAPPEN.length;
    elKop.textContent = k[0];
    elSub.textContent = k[1];
    elBar.querySelectorAll("span").forEach(function(sp, i){ sp.classList.toggle("is-done", i <= stap); });
    elBody.innerHTML = inhoud();
    if(STAPPEN[stap] === "locatie") vulAfstand();
    elBody.scrollTop = y;
    voet();
  }

  function volgende(){
    if(klaar){ sluit(); return; }
    if(!geldig()) return;
    if(STAPPEN[stap] === "contact"){ klaar = true; toon(); verstuur(); return; }
    stap++;
    toon();
  }

  var scrollY = 0;

  function open(bron){
    if(!laag) bouw();
    laatsteTrigger = bron || null;
    if(klaar){ klaar = false; stap = 0; }
    laag.hidden = false;
    scrollY = window.scrollY;
    document.body.style.overflow = "hidden";
    toon();
    requestAnimationFrame(function(){ laag.setAttribute("data-open","true"); });
    setTimeout(function(){
      var f = elBody.querySelector("input, button");
      if(f) f.focus({ preventScroll:true });
    }, 260);
  }

  function sluit(){
    if(!laag || laag.hidden) return;
    laag.setAttribute("data-open","false");
    document.body.style.overflow = "";
    setTimeout(function(){ laag.hidden = true; }, 240);
  }

  window.nuzonFunnel = { open:open, sluit:sluit };

  /* ------------------------------------------------------------ knoppen */
  function isTrigger(el){
    if(el.hasAttribute("data-funnel")) return true;
    var t = (el.textContent || "").replace(/\s+/g," ").trim().toLowerCase();
    return KNOPTEKSTEN.indexOf(t) > -1;
  }

  document.addEventListener("click", function(e){
    var el = e.target.closest("a, button");
    if(!el || (laag && laag.contains(el))) return;
    if(!isTrigger(el)) return;
    e.preventDefault();
    open((el.textContent || "").replace(/\s+/g," ").trim());
  });
})();
