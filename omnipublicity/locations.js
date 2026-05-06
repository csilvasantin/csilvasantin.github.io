// OmniPublicity — catálogo por defecto de tiendas (gemelos digitales).
// Tanto el mapa público como el backoffice leen primero de localStorage
// ('omnip-locations'); si no hay nada, caen a este array.
//
// Schema: { id, name, kind, addr, coords:[lng,lat], surfaces:[
//   { name, desc, status:'live'|'sched'|'idle', impr:Number, cpm:String, surface:'pantalla'|'escaparate'|'mostrador'|'vending'|'pwa' }
// ] }
window.OMNIP_LOCATIONS_DEFAULT = [
  {
    id:'xtanco', name:'Xtanco', kind:'Estanco · Retail físico',
    addr:'Calle de Santa Rosa 4 · Madrid', coords:[-3.7283, 40.4036],
    surfaces:[
      { name:'LED Frontal',          desc:'Pantalla principal sobre el mostrador · 1920×1080 · 24h', status:'live',  impr:540, cpm:'€8',  surface:'pantalla' },
      { name:'LED Vertical',         desc:'Display lateral del producto destacado · 1080×1920',      status:'live',  impr:380, cpm:'€6',  surface:'pantalla' },
      { name:'Escaparate exterior',  desc:'LED en la fachada visible desde la calle · noche',        status:'sched', impr:210, cpm:'€5',  surface:'escaparate' },
      { name:'Mostrador panel',      desc:'Panel táctil del mostrador · interacción cliente',        status:'live',  impr:90,  cpm:'€4',  surface:'mostrador' },
      { name:'Vending / cigarreras', desc:'Display digital del vending · loop comercial',            status:'idle',  impr:60,  cpm:'€3',  surface:'vending' },
      { name:'PWA Xtanco Club',      desc:'Notificaciones push y cards en la app del Club',          status:'live',  impr:140, cpm:'€2',  surface:'pwa' },
    ],
  },
  {
    id:'admira-loterias', name:'Admira Loterías', kind:'Loterías · Punto autorizado',
    addr:'Gran Vía 32 · Madrid', coords:[-3.7037, 40.4204],
    surfaces:[
      { name:'LED jackpot',     desc:'Bote del Euromillones en pantalla principal · 1920×1080',   status:'live',  impr:820, cpm:'€9', surface:'pantalla' },
      { name:'Escaparate digital', desc:'Animación del último ganador · visible 24h',              status:'live',  impr:340, cpm:'€6', surface:'escaparate' },
      { name:'Boletos kiosk',   desc:'Kiosko táctil de venta · vertical 1080×1920',                status:'sched', impr:120, cpm:'€4', surface:'mostrador' },
      { name:'PWA Admira Win',  desc:'Notificación push tras décimo comprado',                    status:'live',  impr:200, cpm:'€3', surface:'pwa' },
    ],
  },
  {
    id:'admira-vapeo', name:'Admira Vapeo', kind:'Vapeo · Retail especializado',
    addr:'Calle Fuencarral 88 · Madrid', coords:[-3.6997, 40.4279],
    surfaces:[
      { name:'LED catálogo',           desc:'Carrusel de sabores en pantalla principal',          status:'live',  impr:420, cpm:'€6', surface:'pantalla' },
      { name:'Escaparate animado',     desc:'Loop nocturno con humo + colores',                   status:'sched', impr:160, cpm:'€4', surface:'escaparate' },
      { name:'Vending de e-líquidos',  desc:'8 tubos · cada uno con su panel digital',            status:'live',  impr:75,  cpm:'€3', surface:'vending' },
    ],
  },
  {
    id:'admira-prensa', name:'Admira Prensa', kind:'Quiosco · Retail físico',
    addr:'Plaza de Cibeles · Madrid', coords:[-3.6927, 40.4196],
    surfaces:[
      { name:'LED titulares',     desc:'Resumen prensa diaria · cabeceras rotando · 1920×1080', status:'live',  impr:1200, cpm:'€7', surface:'pantalla' },
      { name:'Mostrador revista', desc:'Panel táctil con portadas + compra rápida',             status:'live',  impr:180,  cpm:'€4', surface:'mostrador' },
      { name:'Escaparate noche',  desc:'LED de la portada del día siguiente desde 22h',         status:'sched', impr:280,  cpm:'€5', surface:'escaparate' },
      { name:'PWA Admira Press',  desc:'Edición digital del día con anuncios contextuales',     status:'live',  impr:90,   cpm:'€3', surface:'pwa' },
    ],
  },
  {
    id:'admira-bcn', name:'Admira BCN', kind:'Estanco · Retail físico',
    addr:'Passeig de Gràcia 45 · Barcelona', coords:[2.1654, 41.3925],
    surfaces:[
      { name:'LED Frontal',       desc:'Pantalla principal · catalán/castellano/inglés',  status:'live',  impr:680, cpm:'€8', surface:'pantalla' },
      { name:'LED Vertical',      desc:'Display lateral · turistas + locales',            status:'live',  impr:410, cpm:'€7', surface:'pantalla' },
      { name:'Escaparate Gràcia', desc:'Visible desde Passeig de Gràcia · alto tráfico',  status:'live',  impr:520, cpm:'€9', surface:'escaparate' },
      { name:'Vending tabaco',    desc:'Panel digital del vending exterior',              status:'idle',  impr:50,  cpm:'€3', surface:'vending' },
      { name:'PWA Admira Club',   desc:'Push contextual a socios cercanos',               status:'live',  impr:160, cpm:'€2', surface:'pwa' },
    ],
  },
];

window.OMNIP_STORE_KEY = 'omnip-locations';

window.loadOmnipLocations = function() {
  try {
    const raw = localStorage.getItem(window.OMNIP_STORE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length) return parsed;
    }
  } catch (e) {}
  return window.OMNIP_LOCATIONS_DEFAULT;
};

window.saveOmnipLocations = function(arr) {
  try {
    localStorage.setItem(window.OMNIP_STORE_KEY, JSON.stringify(arr));
    return true;
  } catch (e) { return false; }
};
