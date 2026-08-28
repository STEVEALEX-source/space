import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

const yieldFrame = () => new Promise(r => setTimeout(r, 0));

// ===== INTRO BACKGROUND =====
function initIntroBackground() {
  const canvas = document.getElementById('intro-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let w = canvas.width = innerWidth;
  let h = canvas.height = innerHeight;
  
  const stars = [];
  for (let i = 0; i < 400; i++) {
    stars.push({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.5 + 0.3,
      a: Math.random() * 0.8 + 0.2,
      s: Math.random() * 0.02 + 0.005,
      p: Math.random() * Math.PI * 2
    });
  }
  
  let t = 0;
  function draw() {
    if (document.getElementById('intro').classList.contains('hidden')) return;
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(0, 0, w, h);
    
    const g = ctx.createRadialGradient(w*0.5, h*0.5, 0, w*0.5, h*0.5, w*0.6);
    g.addColorStop(0, 'rgba(100, 60, 120, 0.04)');
    g.addColorStop(0.5, 'rgba(60, 80, 140, 0.03)');
    g.addColorStop(1, 'transparent');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    
    stars.forEach(s => {
      const twinkle = Math.sin(t * s.s * 10 + s.p) * 0.5 + 0.5;
      ctx.fillStyle = `rgba(255, 245, 220, ${s.a * twinkle})`;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
      
      if (s.r > 1.2) {
        ctx.fillStyle = `rgba(255, 245, 220, ${s.a * twinkle * 0.2})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r * 3, 0, Math.PI * 2);
        ctx.fill();
      }
    });
    
    t++;
    requestAnimationFrame(draw);
  }
  draw();
  
  addEventListener('resize', () => {
    w = canvas.width = innerWidth;
    h = canvas.height = innerHeight;
  });
}
initIntroBackground();

// ===== PLANET DATA WITH MOONS =====
const PLANETS = [
  { name: 'Mercury', chapter: 'Chapter I · The Messenger', epigraph: 'Closest to the fire. Farthest from mercy.', prose: `I've always been fascinated by Mercury. It's the kind of place that makes you feel small in the most literal sense—no atmosphere to speak of, just rock and silence and a sun that looms three times larger than the one back home. The ground is pocked with craters, each one a scar from four billion years of impacts. Stand there at noon and you'd see a black sky, a blinding sun, and feel a silence so complete it would press against your eardrums. Mercury doesn't care if you're there. It never has.`, data: [{ label: 'Diameter', value: '4,879', unit: 'km' }, { label: 'Year', value: '88', unit: 'days' }, { label: 'Day', value: '59', unit: 'earth days' }, { label: 'Moons', value: '0', unit: '' }, { label: 'Surface', value: '−180 → 430', unit: '°C' }, { label: 'From Sol', value: '57.9', unit: 'M km' }], radius: 0.8, dotSize: 4, distance: 12, orbitSpeed: 0.004, moons: [] },
  { name: 'Venus', chapter: 'Chapter II · The Twin', epigraph: 'Beautiful from afar. A furnace up close.', prose: `Venus is the planet that broke my heart. From Earth, she's the brightest thing in the sky after the sun and moon—so beautiful we named her after the goddess of love. But get closer and the romance dies. The air is ninety-six percent carbon dioxide. The pressure would crush you like a tin can. It rains sulfuric acid that evaporates before it hits the ground. And she spins backwards, as if she's ashamed of what she's become. A day there lasts longer than a year. I think about that sometimes—what it must be like to live so slowly, to turn away from the sun and take your time about it.`, data: [{ label: 'Diameter', value: '12,104', unit: 'km' }, { label: 'Year', value: '225', unit: 'days' }, { label: 'Day', value: '243', unit: 'earth days' }, { label: 'Moons', value: '0', unit: '' }, { label: 'Surface', value: '462', unit: '°C' }, { label: 'From Sol', value: '108.2', unit: 'M km' }], radius: 1.2, dotSize: 6, distance: 18, orbitSpeed: 0.0015, moons: [] },
  { name: 'Earth', chapter: 'Chapter III · Home', epigraph: 'The only place we know of where the universe looked back.', prose: `This is the one I keep coming back to. Not because it's special in any cosmic sense—it's just another rock orbiting an average star in an unremarkable corner of the galaxy. But it's where I learned to look up. Where I felt rain on my face and watched the moon rise over the ocean. The water, the iron in my blood, the calcium in my bones—all of it forged in stars that died before our sun was born. We are the universe's way of knowing itself, someone said. I like that. Seven continents, five oceans, one thin skin of air holding everything together. From out here, it looks impossibly fragile. A pale blue dot, suspended in a sunbeam. Home.`, data: [{ label: 'Diameter', value: '12,742', unit: 'km' }, { label: 'Year', value: '365.25', unit: 'days' }, { label: 'Day', value: '24', unit: 'hours' }, { label: 'Moons', value: '1', unit: '' }, { label: 'Surface', value: '15', unit: '°C avg' }, { label: 'From Sol', value: '149.6', unit: 'M km' }], radius: 1.3, dotSize: 7, distance: 26, orbitSpeed: 0.001, moons: [{ name: 'Moon', radius: 0.35, distance: 3.5, orbitSpeed: 0.02, color: '#c0c0c0' }] },
  { name: 'Mars', chapter: 'Chapter IV · The Frontier', epigraph: 'Once warm. Once wet. Now, waiting.', prose: `Mars is where I go when I need to remember that things change. Olympus Mons rises twenty-one kilometers above the plain—a volcano so large it would cover most of France. Valles Marineris splits the planet like a wound, four thousand kilometers long. And somewhere beneath that rust-colored surface, water may still flow. We've sent our robots there. They're still looking, still sending back pictures of a world that was once warm, once wet, and now just waits. The polar ice caps hold enough frozen water to cover the world eleven meters deep, if only it would melt. I think about that a lot—how close we came to having neighbors, and how quiet it is now.`, data: [{ label: 'Diameter', value: '6,779', unit: 'km' }, { label: 'Year', value: '687', unit: 'days' }, { label: 'Day', value: '24.6', unit: 'hours' }, { label: 'Moons', value: '2', unit: '' }, { label: 'Surface', value: '−63', unit: '°C avg' }, { label: 'From Sol', value: '227.9', unit: 'M km' }], radius: 0.9, dotSize: 5, distance: 34, orbitSpeed: 0.0008, moons: [{ name: 'Phobos', radius: 0.08, distance: 2.2, orbitSpeed: 0.05, color: '#8b7355' }, { name: 'Deimos', radius: 0.06, distance: 3.0, orbitSpeed: 0.03, color: '#8b7355' }] },
  { name: 'Jupiter', chapter: 'Chapter V · The King', epigraph: 'A failed star, spinning in gas and storm.', prose: `Jupiter is the kind of place that makes you feel small in a different way—not because it's empty, but because it's so full. Thirteen hundred Earths could fit inside, and still have room to spare. The Great Red Spot is a hurricane older than any human civilization, a storm that has outlasted empires and religions and languages. Jupiter is less a planet than a small, failed sun, guarding the inner worlds from asteroids with its gravity. It emits more heat than it receives. Its moon Europa may harbor life beneath a shell of ice. Somewhere in that swirling amber atmosphere, the conditions for something like us may have briefly existed, and then passed away.`, data: [{ label: 'Diameter', value: '139,820', unit: 'km' }, { label: 'Year', value: '11.9', unit: 'earth years' }, { label: 'Day', value: '9.9', unit: 'hours' }, { label: 'Moons', value: '95', unit: '' }, { label: 'Surface', value: '−110', unit: '°C (clouds)' }, { label: 'From Sol', value: '778.5', unit: 'M km' }], radius: 2.8, dotSize: 14, distance: 52, orbitSpeed: 0.0004, moons: [{ name: 'Io', radius: 0.28, distance: 4.5, orbitSpeed: 0.04, color: '#ffff99' }, { name: 'Europa', radius: 0.25, distance: 5.8, orbitSpeed: 0.03, color: '#e8e8e8' }, { name: 'Ganymede', radius: 0.41, distance: 7.2, orbitSpeed: 0.02, color: '#c0c0c0' }, { name: 'Callisto', radius: 0.38, distance: 9.0, orbitSpeed: 0.015, color: '#8b7355' }] },
  { name: 'Saturn', chapter: 'Chapter VI · The Jewel', epigraph: 'The answer to what if planets could be beautiful.', prose: `Saturn is why I fell in love with the sky in the first place. I was seven years old, looking through my grandfather's telescope, and there she was—rings like spun glass, catching the light in a way that made my breath catch. They're not solid, those rings. They're billions of shards of ice and rock, each one a tiny moon, each one singing in gravity's chorus. From a distance they look like a single thing. Up close they're a chaos of collisions, ancient and ongoing. Saturn is so light it would float on water, if you could find an ocean large enough. Its moon Titan has lakes of liquid methane and rain that falls in slow motion through a thick orange sky. There are places in this system stranger than any fiction I've ever read.`, data: [{ label: 'Diameter', value: '116,460', unit: 'km' }, { label: 'Year', value: '29.5', unit: 'earth years' }, { label: 'Day', value: '10.7', unit: 'hours' }, { label: 'Moons', value: '146', unit: '' }, { label: 'Rings', value: '282,000', unit: 'km wide' }, { label: 'From Sol', value: '1.43', unit: 'B km' }], radius: 2.4, dotSize: 12, rings: true, distance: 68, orbitSpeed: 0.0002, moons: [{ name: 'Titan', radius: 0.40, distance: 6.0, orbitSpeed: 0.01, color: '#d4a574' }, { name: 'Rhea', radius: 0.12, distance: 4.5, orbitSpeed: 0.02, color: '#c0c0c0' }, { name: 'Iapetus', radius: 0.11, distance: 8.0, orbitSpeed: 0.008, color: '#8b7355' }, { name: 'Enceladus', radius: 0.08, distance: 3.5, orbitSpeed: 0.03, color: '#ffffff' }] },
  { name: 'Uranus', chapter: 'Chapter VII · The Tilted One', epigraph: 'Rolling on its side through the cold.', prose: `Uranus is the planet that doesn't play by the rules. Something hit it long ago—hard enough to knock it onto its side. Now it rolls through its orbit like a ball, its poles taking turns facing the sun for forty-two years at a time. Pale, quiet, methane blue. It's the coldest planetary atmosphere in the system, colder than Neptune even though Neptune is farther from the sun. Nobody's entirely sure why. Thirteen faint rings circle it, discovered only in 1977, as if the planet had been keeping them secret. I like that about Uranus—the way it keeps its own counsel, the way it refuses to be what you expect.`, data: [{ label: 'Diameter', value: '50,724', unit: 'km' }, { label: 'Year', value: '84', unit: 'earth years' }, { label: 'Day', value: '17.2', unit: 'hours' }, { label: 'Moons', value: '27', unit: '' }, { label: 'Surface', value: '−224', unit: '°C' }, { label: 'From Sol', value: '2.87', unit: 'B km' }], radius: 1.8, dotSize: 9, tilt: 1.7, distance: 86, orbitSpeed: 0.0001, moons: [{ name: 'Titania', radius: 0.12, distance: 4.0, orbitSpeed: 0.015, color: '#c0c0c0' }, { name: 'Oberon', radius: 0.12, distance: 5.0, orbitSpeed: 0.012, color: '#8b7355' }, { name: 'Umbriel', radius: 0.09, distance: 3.5, orbitSpeed: 0.02, color: '#6b5344' }, { name: 'Ariel', radius: 0.09, distance: 3.0, orbitSpeed: 0.025, color: '#a0a0a0' }] },
  { name: 'Neptune', chapter: 'Chapter VIII · The Last Blue', epigraph: 'Where the sun is just another star.', prose: `Neptune is where I go to remember how far we've come. The farthest out. Winds here reach two thousand one hundred kilometers per hour, faster than sound, faster than anything on Earth. It takes one hundred and sixty-five years to complete one orbit. When Voyager 2 passed in 1989, Neptune had finished barely half a lap since its discovery. The planet has an internal heat source, radiating more energy than it receives from the sun. Its moon Triton orbits backwards, as if it were captured and never quite forgiven. Out here, the sun is just another star. And I think about that—how far we've traveled, how much we've seen, and how much further we have to go.`, data: [{ label: 'Diameter', value: '49,244', unit: 'km' }, { label: 'Year', value: '165', unit: 'earth years' }, { label: 'Day', value: '16.1', unit: 'hours' }, { label: 'Moons', value: '14', unit: '' }, { label: 'Winds', value: '2,100', unit: 'km/h' }, { label: 'From Sol', value: '4.50', unit: 'B km' }], radius: 1.8, dotSize: 9, distance: 102, orbitSpeed: 0.00006, moons: [{ name: 'Triton', radius: 0.21, distance: 4.5, orbitSpeed: -0.01, color: '#c0c0c0' }, { name: 'Nereid', radius: 0.05, distance: 7.0, orbitSpeed: 0.005, color: '#8b7355' }] }
];

function makeTex(w, h, drawFn) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const ctx = c.getContext('2d');
  drawFn(ctx, w, h);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

const textureBuilders = {
  Mercury: () => makeTex(1024, 512, (ctx, w, h) => {
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, '#5a5248'); g.addColorStop(0.5, '#8a7f70'); g.addColorStop(1, '#5a5248');
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 120; i++) {
      const shade = Math.random() > 0.5 ? 40 : 140;
      ctx.fillStyle = `rgba(${shade+Math.random()*30},${shade*0.95+Math.random()*25},${shade*0.9+Math.random()*20},${Math.random()*0.3+0.1})`;
      ctx.beginPath(); ctx.ellipse(Math.random()*w, Math.random()*h, Math.random()*60+10, Math.random()*40+8, Math.random()*Math.PI, 0, Math.PI*2); ctx.fill();
    }
    for (let i = 0; i < 200; i++) {
      const x = Math.random() * w, y = Math.random() * h, r = Math.random() * 18 + 3, depth = Math.random();
      ctx.fillStyle = `rgba(40,35,30,${0.4 + depth * 0.4})`;
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI*2); ctx.fill();
      ctx.strokeStyle = `rgba(160,150,135,${0.5 + depth * 0.3})`; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(x, y, r * 0.85, 0, Math.PI*2); ctx.stroke();
    }
  }),
  
  Venus: () => makeTex(1024, 512, (ctx, w, h) => {
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, '#b88858'); g.addColorStop(0.3, '#e8c890'); g.addColorStop(0.7, '#d4a878'); g.addColorStop(1, '#b88858');
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 60; i++) {
      ctx.fillStyle = `rgba(${200+Math.random()*55},${170+Math.random()*40},${110+Math.random()*30},${Math.random()*0.3})`;
      ctx.beginPath(); ctx.ellipse(Math.random()*w, Math.random()*h, Math.random()*100+40, Math.random()*25+8, Math.random()*Math.PI, 0, Math.PI*2); ctx.fill();
    }
    for (let i = 0; i < 25; i++) {
      const y = Math.random() * h;
      ctx.strokeStyle = `rgba(230,200,150,${Math.random()*0.2})`; ctx.lineWidth = Math.random() * 8 + 2;
      ctx.beginPath(); ctx.moveTo(0, y);
      for (let x = 0; x < w; x += 20) ctx.lineTo(x, y + Math.sin(x/50 + i) * 15);
      ctx.stroke();
    }
  }),
  
  Earth: () => makeTex(1024, 512, (ctx, w, h) => {
    const ocean = ctx.createLinearGradient(0, 0, 0, h);
    ocean.addColorStop(0, '#0a3a6a'); ocean.addColorStop(0.5, '#1a5a8a'); ocean.addColorStop(1, '#0a3a6a');
    ctx.fillStyle = ocean; ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 60; i++) {
      ctx.fillStyle = `rgba(${10+Math.random()*30},${50+Math.random()*40},${100+Math.random()*50},${Math.random()*0.3})`;
      ctx.beginPath(); ctx.ellipse(Math.random()*w, Math.random()*h, Math.random()*100+30, Math.random()*60+20, Math.random()*Math.PI, 0, Math.PI*2); ctx.fill();
    }
    ctx.fillStyle = '#2d5a2d';
    const continents = [
      [[200,120],[280,110],[320,140],[340,180],[300,220],[260,230],[220,210],[180,170]],
      [[280,250],[310,260],[320,310],[310,370],[280,400],[260,380],[250,320],[260,270]],
      [[480,130],[520,120],[540,140],[530,170],[500,180],[480,160]],
      [[490,190],[540,180],[570,220],[580,280],[560,340],[520,360],[490,330],[480,260],[480,220]],
      [[540,110],[700,100],[780,130],[800,180],[760,220],[700,240],[620,230],[560,200],[540,160]],
      [[780,310],[840,300],[860,330],[850,360],[810,370],[780,350]],
      [[0,470],[1024,470],[1024,512],[0,512]]
    ];
    continents.forEach(pts => {
      ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
      for (let i = 1; i < pts.length; i++) {
        const p = pts[i-1], c = pts[i];
        ctx.quadraticCurveTo((p[0]+c[0])/2+(Math.random()-0.5)*20, (p[1]+c[1])/2+(Math.random()-0.5)*20, c[0], c[1]);
      }
      ctx.closePath(); ctx.fill();
    });
    for (let i = 0; i < 150; i++) {
      const shade = Math.random();
      ctx.fillStyle = `rgba(${40+shade*60},${80+shade*80},${30+shade*40},${Math.random()*0.3})`;
      ctx.beginPath(); ctx.ellipse(Math.random()*w, Math.random()*h, Math.random()*30+5, Math.random()*20+4, Math.random()*Math.PI, 0, Math.PI*2); ctx.fill();
    }
    ctx.fillStyle = 'rgba(180,150,100,0.7)';
    ctx.beginPath(); ctx.ellipse(520, 230, 40, 25, 0, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(820, 330, 30, 20, 0, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = 'rgba(120,100,80,0.6)';
    ctx.beginPath(); ctx.ellipse(650, 160, 60, 15, 0.2, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(270, 340, 10, 60, 0, 0, Math.PI*2); ctx.fill();
    const ice1 = ctx.createLinearGradient(0, 0, 0, 50);
    ice1.addColorStop(0, 'rgba(245,248,252,0.95)'); ice1.addColorStop(1, 'rgba(245,248,252,0)');
    ctx.fillStyle = ice1; ctx.fillRect(0, 0, w, 50);
    const ice2 = ctx.createLinearGradient(0, h-50, 0, h);
    ice2.addColorStop(0, 'rgba(245,248,252,0)'); ice2.addColorStop(1, 'rgba(245,248,252,0.95)');
    ctx.fillStyle = ice2; ctx.fillRect(0, h-50, w, 50);
  }),
  
  Mars: () => makeTex(1024, 512, (ctx, w, h) => {
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, '#a03808'); g.addColorStop(0.5, '#d4652a'); g.addColorStop(1, '#a03808');
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 80; i++) {
      ctx.fillStyle = `rgba(${100+Math.random()*80},${40+Math.random()*40},${10+Math.random()*20},${Math.random()*0.35})`;
      ctx.beginPath(); ctx.ellipse(Math.random()*w, Math.random()*h, Math.random()*80+20, Math.random()*50+10, Math.random()*Math.PI, 0, Math.PI*2); ctx.fill();
    }
    for (let i = 0; i < 30; i++) {
      ctx.fillStyle = `rgba(80,30,10,${Math.random()*0.4})`;
      ctx.beginPath(); ctx.ellipse(Math.random()*w, Math.random()*h, Math.random()*100+30, Math.random()*60+15, Math.random()*Math.PI, 0, Math.PI*2); ctx.fill();
    }
    const om = ctx.createRadialGradient(360, 230, 0, 360, 230, 50);
    om.addColorStop(0, 'rgba(200,100,50,0.8)'); om.addColorStop(0.5, 'rgba(180,80,40,0.5)'); om.addColorStop(1, 'rgba(160,60,30,0)');
    ctx.fillStyle = om; ctx.beginPath(); ctx.arc(360, 230, 50, 0, Math.PI*2); ctx.fill();
    ctx.strokeStyle = 'rgba(60,20,5,0.9)'; ctx.lineWidth = 6;
    ctx.beginPath(); ctx.moveTo(400, 256); ctx.quadraticCurveTo(560, 260, 720, 256); ctx.stroke();
    const i1 = ctx.createLinearGradient(0, 0, 0, 60);
    i1.addColorStop(0, 'rgba(235,230,220,0.95)'); i1.addColorStop(1, 'rgba(235,230,220,0)');
    ctx.fillStyle = i1; ctx.fillRect(0, 0, w, 60);
    const i2 = ctx.createLinearGradient(0, h-60, 0, h);
    i2.addColorStop(0, 'rgba(235,230,220,0)'); i2.addColorStop(1, 'rgba(235,230,220,0.95)');
    ctx.fillStyle = i2; ctx.fillRect(0, h-60, w, 60);
  }),
  
  Jupiter: () => makeTex(1024, 512, (ctx, w, h) => {
    const bands = ['#d4a878','#c89868','#e8c098','#b88858','#d4a878','#a07848','#e8c898','#c89868','#d4a878','#b88858'];
    const bh = h / bands.length;
    bands.forEach((c, i) => { ctx.fillStyle = c; ctx.fillRect(0, i*bh, w, bh+1); });
    for (let i = 0; i < 120; i++) {
      ctx.fillStyle = `rgba(${150+Math.random()*80},${100+Math.random()*60},${60+Math.random()*40},${Math.random()*0.3})`;
      ctx.beginPath(); ctx.ellipse(Math.random()*w, Math.random()*h, Math.random()*50+15, Math.random()*10+3, 0, 0, Math.PI*2); ctx.fill();
    }
    const grs = ctx.createRadialGradient(620, 280, 0, 620, 280, 60);
    grs.addColorStop(0, '#c04020'); grs.addColorStop(0.4, '#a03010'); grs.addColorStop(0.7, '#802008'); grs.addColorStop(1, 'rgba(128,32,8,0)');
    ctx.fillStyle = grs; ctx.beginPath(); ctx.ellipse(620, 280, 70, 40, 0, 0, Math.PI*2); ctx.fill();
    ctx.strokeStyle = 'rgba(180,80,40,0.4)'; ctx.lineWidth = 2;
    for (let i = 0; i < 6; i++) {
      ctx.beginPath(); ctx.ellipse(620, 280, 75 + i*5, 45 + i*3, 0, 0, Math.PI*2); ctx.stroke();
    }
  }),
  
  Saturn: () => makeTex(1024, 512, (ctx, w, h) => {
    const bands = ['#e8d8a0','#d8c890','#f0e0b0','#c8b880','#e8d8a0','#d0c088','#e8d8a0','#c8b880'];
    const bh = h / bands.length;
    bands.forEach((c, i) => { ctx.fillStyle = c; ctx.fillRect(0, i*bh, w, bh+1); });
    for (let i = 0; i < 60; i++) {
      ctx.fillStyle = `rgba(${200+Math.random()*55},${180+Math.random()*50},${130+Math.random()*40},${Math.random()*0.25})`;
      ctx.beginPath(); ctx.ellipse(Math.random()*w, Math.random()*h, Math.random()*70+20, Math.random()*10+4, 0, 0, Math.PI*2); ctx.fill();
    }
  }),
  
  Uranus: () => makeTex(1024, 512, (ctx, w, h) => {
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, '#7fb8c0'); g.addColorStop(0.5, '#a8dce0'); g.addColorStop(1, '#7fb8c0');
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 15; i++) {
      const y = Math.random() * h;
      ctx.strokeStyle = `rgba(170,220,225,${Math.random()*0.2})`; ctx.lineWidth = Math.random() * 6 + 2;
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y + (Math.random()-0.5)*10); ctx.stroke();
    }
    for (let i = 0; i < 30; i++) {
      ctx.fillStyle = `rgba(170,220,225,${Math.random()*0.2})`;
      ctx.beginPath(); ctx.ellipse(Math.random()*w, Math.random()*h, Math.random()*80+25, Math.random()*10+4, 0, 0, Math.PI*2); ctx.fill();
    }
  }),
  
  Neptune: () => makeTex(1024, 512, (ctx, w, h) => {
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, '#2040a0'); g.addColorStop(0.5, '#4166f5'); g.addColorStop(1, '#2040a0');
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 40; i++) {
      ctx.fillStyle = `rgba(80,120,220,${Math.random()*0.3})`;
      ctx.beginPath(); ctx.ellipse(Math.random()*w, Math.random()*h, Math.random()*70+20, Math.random()*10+4, 0, 0, Math.PI*2); ctx.fill();
    }
    for (let i = 0; i < 12; i++) {
      const y = Math.random() * h;
      ctx.strokeStyle = `rgba(100,140,240,${Math.random()*0.25})`; ctx.lineWidth = Math.random() * 5 + 2;
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y + (Math.random()-0.5)*15); ctx.stroke();
    }
    const gds = ctx.createRadialGradient(300, 200, 0, 300, 200, 50);
    gds.addColorStop(0, '#102060'); gds.addColorStop(0.5, '#182870'); gds.addColorStop(1, 'rgba(24,40,112,0)');
    ctx.fillStyle = gds; ctx.beginPath(); ctx.ellipse(300, 200, 60, 35, 0, 0, Math.PI*2); ctx.fill();
  })
};

// ===== SCENE SETUP =====
const container = document.getElementById('canvas-container');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, innerWidth/innerHeight, 0.1, 2000);
camera.position.set(0, 40, 80);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.3;
container.appendChild(renderer.domElement);

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
composer.addPass(new UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), 1.0, 0.7, 0.3));

// ===== CAMERA STATE =====
let camTarget = new THREE.Vector3(0, 0, 0);
let camDist = 80, camTheta = 0, camPhi = Math.PI/3;
let isDragging = false, lastMouse = { x:0, y:0 }, vel = { t:0, p:0 };
const mouseNDC = new THREE.Vector2();
const raycaster = new THREE.Raycaster();
let current = 0, transitioning = false;
const planetObjects = [];
const asteroidBelt = [];

// ===== BUILD SCENE ASYNC =====
const loadFill = document.getElementById('load-ring');
const loadStatus = document.getElementById('load-status');
const setProgress = (pct, msg) => {
  // Circumference ≈ 2 * π * 45 ≈ 283; offset from full (283) to empty (0)
  loadFill.style.strokeDashoffset = 283 * (1 - pct / 100);
  if (msg) loadStatus.textContent = msg;
};

async function buildScene() {
  setProgress(10, 'mapping stars');
  await yieldFrame();
  
  function makeStars(count, radius, size, color) {
    const g = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = radius * (0.5 + Math.random() * 0.5);
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      pos[i*3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i*3+1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i*3+2] = r * Math.cos(phi);
    }
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    return new THREE.Points(g, new THREE.PointsMaterial({ color, size, sizeAttenuation: true, transparent: true, opacity: 0.9 }));
  }
  
  scene.add(makeStars(3000, 900, 1.0, 0xffffff));
  scene.add(makeStars(1500, 600, 1.8, 0xc9d8ff));
  scene.add(makeStars(400, 400, 2.8, 0xffd9a8));

  setProgress(20, 'painting nebula');
  await yieldFrame();
  
  const nc = document.createElement('canvas'); nc.width = nc.height = 512;
  const nctx = nc.getContext('2d');
  nctx.fillStyle = '#000'; nctx.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 20; i++) {
    const x = Math.random() * 512, y = Math.random() * 512, r = 80 + Math.random() * 200;
    const g = nctx.createRadialGradient(x, y, 0, x, y, r);
    const hue = 200 + Math.random() * 100;
    g.addColorStop(0, `hsla(${hue}, 70%, 40%, 0.12)`);
    g.addColorStop(1, 'transparent');
    nctx.fillStyle = g; nctx.fillRect(0, 0, 512, 512);
  }
  const nebula = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(nc), transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending }));
  nebula.scale.set(1400, 1400, 1); nebula.position.z = -500; scene.add(nebula);

  setProgress(30, 'igniting sol');
  await yieldFrame();
  
  const sunCanvas = document.createElement('canvas'); sunCanvas.width = sunCanvas.height = 512;
  const sctx = sunCanvas.getContext('2d');
  const sg = sctx.createRadialGradient(256, 256, 0, 256, 256, 256);
  sg.addColorStop(0, '#fff5e0'); sg.addColorStop(0.2, '#ffdd80'); sg.addColorStop(0.5, '#ffaa33'); sg.addColorStop(0.8, '#ff6600'); sg.addColorStop(1, '#cc3300');
  sctx.fillStyle = sg; sctx.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 30; i++) {
    const a = Math.random() * Math.PI * 2, d = Math.random() * 200;
    sctx.fillStyle = `rgba(255, 200, 100, ${Math.random() * 0.4})`;
    sctx.beginPath(); sctx.arc(256 + Math.cos(a)*d, 256 + Math.sin(a)*d, Math.random()*20+5, 0, Math.PI*2); sctx.fill();
  }
  const sun = new THREE.Mesh(new THREE.SphereGeometry(4.5, 64, 64), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(sunCanvas) }));
  scene.add(sun);

  const gc = document.createElement('canvas'); gc.width = gc.height = 256;
  const gctx = gc.getContext('2d');
  const gg = gctx.createRadialGradient(128, 128, 0, 128, 128, 128);
  gg.addColorStop(0, 'rgba(255,240,180,0.9)'); gg.addColorStop(0.3, 'rgba(255,180,80,0.5)'); gg.addColorStop(0.6, 'rgba(255,120,40,0.2)'); gg.addColorStop(1, 'rgba(255,80,0,0)');
  gctx.fillStyle = gg; gctx.fillRect(0, 0, 256, 256);
  const sunGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(gc), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
  sunGlow.scale.set(35, 35, 1); scene.add(sunGlow);

  const cc = document.createElement('canvas'); cc.width = cc.height = 512;
  const cctx = cc.getContext('2d');
  const cg = cctx.createRadialGradient(256, 256, 0, 256, 256, 256);
  cg.addColorStop(0, 'rgba(255,220,150,0.4)'); cg.addColorStop(0.5, 'rgba(255,150,80,0.15)'); cg.addColorStop(1, 'rgba(255,100,40,0)');
  cctx.fillStyle = cg; cctx.fillRect(0, 0, 512, 512);
  const corona = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(cc), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
  corona.scale.set(70, 70, 1); scene.add(corona);

  scene.add(new THREE.AmbientLight(0xffffff, 2.2));
  scene.add(new THREE.HemisphereLight(0xffeedd, 0x223344, 1.5));
  scene.add(new THREE.PointLight(0xfff0d0, 4, 0, 0));
  const camLight = new THREE.DirectionalLight(0xfff8f0, 1.8);
  scene.add(camLight);

  // Create asteroid belt
  setProgress(32, 'generating asteroid belt');
  await yieldFrame();
  
  const asteroidGeometry = new THREE.BufferGeometry();
  const asteroidCount = 2000;
  const asteroidPositions = new Float32Array(asteroidCount * 3);
  const asteroidSizes = new Float32Array(asteroidCount);
  
  for (let i = 0; i < asteroidCount; i++) {
    const angle = Math.random() * Math.PI * 2;
    const distance = 42 + Math.random() * 6; // Between Mars (34) and Jupiter (52)
    const height = (Math.random() - 0.5) * 2;
    asteroidPositions[i*3] = Math.cos(angle) * distance;
    asteroidPositions[i*3+1] = height;
    asteroidPositions[i*3+2] = Math.sin(angle) * distance;
    asteroidSizes[i] = Math.random() * 0.15 + 0.05;
  }
  
  asteroidGeometry.setAttribute('position', new THREE.BufferAttribute(asteroidPositions, 3));
  asteroidGeometry.setAttribute('size', new THREE.BufferAttribute(asteroidSizes, 1));
  
  const asteroidMaterial = new THREE.PointsMaterial({
    color: 0x888888,
    size: 0.1,
    transparent: true,
    opacity: 0.6,
    sizeAttenuation: true
  });
  
  const asteroidSystem = new THREE.Points(asteroidGeometry, asteroidMaterial);
  scene.add(asteroidSystem);
  asteroidBelt.push(asteroidSystem);

  for (let i = 0; i < PLANETS.length; i++) {
    const data = PLANETS[i];
    setProgress(35 + i * 7, `rendering ${data.name.toLowerCase()}`);
    await yieldFrame();

    const pts = [];
    for (let j = 0; j <= 96; j++) {
      const a = (j/96) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(a)*data.distance, 0, Math.sin(a)*data.distance));
    }
    scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: 0x4466aa, transparent: true, opacity: 0.15 })));

    const tex = textureBuilders[data.name]();
    // FIXED: Less shiny materials - higher roughness, lower metalness
    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(data.radius, 64, 64),
      new THREE.MeshStandardMaterial({ 
        map: tex, 
        roughness: 0.95,  // Higher roughness = less shiny
        metalness: 0.0    // No metalness = matte finish
      })
    );
    if (data.tilt) mesh.rotation.z = data.tilt;
    mesh.userData = { planetIndex: i };

    const wrapper = new THREE.Group();
    wrapper.add(mesh);
    wrapper.userData.angle = Math.random() * Math.PI * 2;
    wrapper.position.x = Math.cos(wrapper.userData.angle) * data.distance;
    wrapper.position.z = Math.sin(wrapper.userData.angle) * data.distance;
    scene.add(wrapper);

    // Atmosphere
    const atmColor = data.name === 'Earth' ? 0x4488ff : data.name === 'Venus' ? 0xe8c890 : null;
    if (atmColor) {
      wrapper.add(new THREE.Mesh(
        new THREE.SphereGeometry(data.radius * 1.08, 48, 48),
        new THREE.ShaderMaterial({
          uniforms: { color: { value: new THREE.Color(atmColor) } },
          vertexShader: `varying vec3 vNormal; void main(){ vNormal=normalize(normalMatrix*normal); gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
          fragmentShader: `uniform vec3 color; varying vec3 vNormal; void main(){ float i=pow(0.65-dot(vNormal,vec3(0,0,1)),3.0); gl_FragColor=vec4(color,i*0.9); }`,
          transparent: true, side: THREE.BackSide, depthWrite: false, blending: THREE.AdditiveBlending
        })
      ));
    }

    // Moons
    if (data.moons && data.moons.length > 0) {
      data.moons.forEach(moonData => {
        const moonGeo = new THREE.SphereGeometry(moonData.radius, 32, 32);
        const moonMat = new THREE.MeshStandardMaterial({ 
          color: moonData.color,
          roughness: 0.95,  // Less shiny
          metalness: 0.0
        });
        const moon = new THREE.Mesh(moonGeo, moonMat);
        moon.userData = {
          orbitDistance: moonData.distance,
          orbitSpeed: moonData.orbitSpeed,
          angle: Math.random() * Math.PI * 2
        };
        wrapper.add(moon);
        
        if (!wrapper.userData.moons) wrapper.userData.moons = [];
        wrapper.userData.moons.push(moon);
      });
    }

    // Earth extras
    if (data.name === 'Earth') {
      const cloudTex = makeTex(1024, 512, (ctx, w, h) => {
        for (let i = 0; i < 150; i++) {
          ctx.fillStyle = `rgba(255,255,255,${Math.random()*0.4+0.1})`;
          ctx.beginPath(); ctx.ellipse(Math.random()*w, Math.random()*h, Math.random()*70+25, Math.random()*25+8, Math.random()*Math.PI, 0, Math.PI*2); ctx.fill();
        }
      });
      const clouds = new THREE.Mesh(new THREE.SphereGeometry(data.radius*1.02, 48, 48), new THREE.MeshPhongMaterial({ map: cloudTex, transparent: true, opacity: 0.55, depthWrite: false }));
      wrapper.add(clouds);
      wrapper.userData.clouds = clouds;
    }

    // Saturn rings
    if (data.rings) {
      const rGeo = new THREE.RingGeometry(data.radius*1.4, data.radius*2.6, 96);
      const pos = rGeo.attributes.position, uv = rGeo.attributes.uv;
      for (let j = 0; j < pos.count; j++) {
        const x = pos.getX(j), y = pos.getY(j);
        uv.setXY(j, (Math.sqrt(x*x+y*y) - data.radius*1.4) / (data.radius*1.2), 0.5);
      }
      const ringTex = makeTex(512, 8, (ctx, w, h) => {
        for (let x = 0; x < w; x++) {
          const t = x/w;
          const a = (Math.sin(t*100)*0.3+0.7) * ((Math.sin(t*25)>0.75)?0.15:1) * ((t>0.45&&t<0.52)?0.1:1) * 0.85;
          const b = 210 + Math.sin(t*50)*30;
          ctx.fillStyle = `rgba(${b},${b*0.92},${b*0.78},${a})`;
          ctx.fillRect(x, 0, 1, h);
        }
      });
      const ring = new THREE.Mesh(rGeo, new THREE.MeshBasicMaterial({ map: ringTex, side: THREE.DoubleSide, transparent: true, depthWrite: false }));
      ring.rotation.x = Math.PI/2 + 0.45;
      wrapper.add(ring);
    }

    planetObjects.push({ wrapper, mesh, data });
  }

  setProgress(95, 'final calibration');
  await yieldFrame();

  // Build nav dots
  const navEl = document.getElementById('planet-nav');
  PLANETS.forEach((p, i) => {
    const b = document.createElement('button');
    b.innerHTML = `<div class="orb" style="width:${p.dotSize}px;height:${p.dotSize}px"></div>`;
    b.addEventListener('click', () => showPlanet(i));
    navEl.appendChild(b);
  });

  // ===== EVENT LISTENERS =====
  container.addEventListener('mousedown', e => { 
    isDragging = true; 
    lastMouse = { x: e.clientX, y: e.clientY }; 
    vel = { t:0, p:0 }; 
  });
  
  window.addEventListener('mousemove', e => {
    mouseNDC.x = (e.clientX/innerWidth)*2-1;
    mouseNDC.y = -(e.clientY/innerHeight)*2+1;
    if (!isDragging) return;
    const dx = e.clientX - lastMouse.x, dy = e.clientY - lastMouse.y;
    camTheta -= dx * 0.005; 
    camPhi = Math.max(0.1, Math.min(Math.PI-0.1, camPhi - dy*0.005));
    vel.t = -dx*0.005; vel.p = -dy*0.005;
    lastMouse = { x: e.clientX, y: e.clientY };
  });
  
  window.addEventListener('mouseup', () => isDragging = false);
  
  container.addEventListener('wheel', e => { 
    e.preventDefault(); 
    camDist = Math.max(8, Math.min(200, camDist*(1+e.deltaY*0.001))); 
  }, { passive: false });

  container.addEventListener('touchstart', e => {
    if (e.touches.length === 1) { 
      isDragging = true; 
      lastMouse = { x: e.touches[0].clientX, y: e.touches[0].clientY }; 
    }
  });
  
  container.addEventListener('touchmove', e => {
    if (!isDragging || e.touches.length !== 1) return;
    e.preventDefault();
    const dx = e.touches[0].clientX - lastMouse.x, dy = e.touches[0].clientY - lastMouse.y;
    camTheta -= dx * 0.005; 
    camPhi = Math.max(0.1, Math.min(Math.PI-0.1, camPhi - dy*0.005));
    lastMouse = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }, { passive: false });
  
  container.addEventListener('touchend', () => isDragging = false);
  
  container.addEventListener('click', () => {
    raycaster.setFromCamera(mouseNDC, camera);
    const hits = raycaster.intersectObjects(planetObjects.map(p => p.mesh));
    if (hits.length > 0) showPlanet(hits[0].object.userData.planetIndex);
  });

  document.getElementById('next').addEventListener('click', () => { 
    if (current < 7) showPlanet(current+1); 
  });
  
  document.getElementById('prev').addEventListener('click', () => { 
    if (current > 0) showPlanet(current-1); 
  });
  
  window.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight' && current < 7) showPlanet(current+1);
    if (e.key === 'ArrowLeft' && current > 0) showPlanet(current-1);
    if (e.key >= '1' && e.key <= '8') showPlanet(parseInt(e.key)-1);
    if (e.key === 'Escape') closeInfo();
  });

  // Animation loop
  const clock = new THREE.Clock();
  
  function animate() {
    requestAnimationFrame(animate);
    const t = clock.elapsedTime;

    sun.rotation.y += 0.001;
    sunGlow.scale.setScalar(35 + Math.sin(t*2)*1.5);
    corona.scale.setScalar(70 + Math.sin(t*1.5)*3);

    // Update planets
    planetObjects.forEach(p => {
      p.wrapper.userData.angle += p.data.orbitSpeed;
      const a = p.wrapper.userData.angle;
      p.wrapper.position.x = Math.cos(a) * p.data.distance;
      p.wrapper.position.z = Math.sin(a) * p.data.distance;
      p.mesh.rotation.y += 0.003;
      
      if (p.wrapper.userData.clouds) p.wrapper.userData.clouds.rotation.y += 0.002;
      
      // Update moons
      if (p.wrapper.userData.moons) {
        p.wrapper.userData.moons.forEach(moon => {
          moon.userData.angle += moon.userData.orbitSpeed;
          const ma = moon.userData.angle;
          moon.position.x = Math.cos(ma) * moon.userData.orbitDistance;
          moon.position.z = Math.sin(ma) * moon.userData.orbitDistance;
          moon.position.y = Math.sin(ma * 0.3) * 0.3;
        });
      }
    });

    // Update asteroid belt
    asteroidBelt.forEach(belt => {
      const positions = belt.geometry.attributes.position.array;
      for (let i = 0; i < positions.length / 3; i++) {
        const angle = Math.atan2(positions[i*3+2], positions[i*3]);
        const newAngle = angle + 0.0002;
        const dist = Math.sqrt(positions[i*3]**2 + positions[i*3+2]**2);
        positions[i*3] = Math.cos(newAngle) * dist;
        positions[i*3+2] = Math.sin(newAngle) * dist;
      }
      belt.geometry.attributes.position.needsUpdate = true;
    });

    if (!isDragging) { vel.t *= 0.95; camTheta += vel.t * 0.3; }
    if (current >= 0 && current < planetObjects.length) {
      camTarget.lerp(planetObjects[current].wrapper.position, 0.06);
    }

    camera.position.x = camTarget.x + camDist * Math.sin(camPhi) * Math.sin(camTheta);
    camera.position.y = camTarget.y + camDist * Math.cos(camPhi);
    camera.position.z = camTarget.z + camDist * Math.sin(camPhi) * Math.cos(camTheta);
    camera.lookAt(camTarget);

    camLight.position.copy(camera.position).normalize().multiplyScalar(50);
    camLight.target.position.copy(camTarget);
    camLight.target.updateMatrixWorld();

    composer.render();
  }

  setProgress(100, 'ready');
  await yieldFrame();

  setTimeout(() => {
    document.getElementById('loading').classList.remove('visible');
    container.classList.add('ready');
    document.querySelector('.vignette').classList.add('ready');
    document.querySelector('.grain').classList.add('ready');
    document.querySelector('.masthead').classList.add('ready');
    document.querySelector('.bottom-bar').classList.add('ready');
    document.querySelector('.hint').classList.add('ready');
    showPlanet(0);
    animate();
  }, 400);
}

// ===== GLOBAL FUNCTIONS =====
window.showPlanet = function(index) {
  if (transitioning || index < 0 || index >= planetObjects.length) return;
  transitioning = true;
  current = index;
  const d = PLANETS[current];
  camTarget.copy(planetObjects[index].wrapper.position);
  camDist = d.radius * 6 + 10;

  const el = document.getElementById('planet-info');
  el.classList.remove('visible');
  
  setTimeout(() => {
    document.getElementById('pi-chapter').textContent = d.chapter;
    document.getElementById('pi-name').textContent = d.name;
    document.getElementById('pi-epigraph').textContent = d.epigraph;
    document.getElementById('pi-prose').innerHTML = `<span class="dropcap">${d.prose[0]}</span>${d.prose.slice(1)}`;
    document.getElementById('pi-data').innerHTML = d.data.map(x => 
      `<div class="datum"><div class="label">${x.label}</div><div class="value">${x.value}<span class="unit">${x.unit}</span></div></div>`
    ).join('');
    el.classList.add('visible');
    document.getElementById('cur').textContent = String(current+1).padStart(2, '0');
    document.querySelectorAll('.planet-nav button').forEach((b, i) => b.classList.toggle('active', i === current));
    setTimeout(() => transitioning = false, 800);
  }, 400);
};

window.closeInfo = function() {
  document.getElementById('planet-info').classList.remove('visible');
  camTarget.set(0, 0, 0); 
  camDist = 80; 
  camPhi = Math.PI/3;
  document.querySelectorAll('.planet-nav button').forEach(b => b.classList.remove('active'));
};

// ===== ENTRY POINT =====
document.getElementById('enter-btn').addEventListener('click', () => {
  document.getElementById('intro').classList.add('hidden');
  document.getElementById('loading').classList.add('visible');
  setTimeout(() => buildScene(), 800);
});

window.addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
  composer.setSize(innerWidth, innerHeight);
});      