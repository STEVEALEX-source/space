import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

const yieldFrame = () => new Promise(r => setTimeout(r, 0));

function initIntroBackground() {
  const canvas = document.getElementById('intro-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let w = canvas.width = innerWidth, h = canvas.height = innerHeight;
  const stars = Array.from({length: 400}, () => ({ x: Math.random()*w, y: Math.random()*h, r: Math.random()*1.5+0.3, a: Math.random()*0.8+0.2, s: Math.random()*0.02+0.005, p: Math.random()*Math.PI*2 }));
  let t = 0;
  function draw() {
    if (document.getElementById('intro').classList.contains('hidden')) return;
    ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fillRect(0, 0, w, h);
    const g = ctx.createRadialGradient(w*0.5, h*0.5, 0, w*0.5, h*0.5, w*0.6);
    g.addColorStop(0, 'rgba(100,60,120,0.04)'); g.addColorStop(0.5, 'rgba(60,80,140,0.03)'); g.addColorStop(1, 'transparent');
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    stars.forEach(s => {
      const tw = Math.sin(t*s.s*10+s.p)*0.5+0.5;
      ctx.fillStyle = `rgba(255,245,220,${s.a*tw})`; ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI*2); ctx.fill();
      if (s.r > 1.2) { ctx.fillStyle = `rgba(255,245,220,${s.a*tw*0.2})`; ctx.beginPath(); ctx.arc(s.x, s.y, s.r*3, 0, Math.PI*2); ctx.fill(); }
    });
    t++; requestAnimationFrame(draw);
  }
  draw();
  addEventListener('resize', () => { w = canvas.width = innerWidth; h = canvas.height = innerHeight; });
}
initIntroBackground();

const ALL_BODIES = [
  { name: 'Mercury', type: 'planet', chapter: 'Chapter I · The Messenger', epigraph: 'Closest to the fire. Farthest from mercy.', prose: `I've always been fascinated by Mercury. No atmosphere to speak of, just rock and silence and a sun that looms three times larger than the one back home. The ground is pocked with craters, each one a scar from four billion years of impacts. Mercury doesn't care if you're there. It never has.`, data: [{label:'Diameter',value:'4,879',unit:'km'},{label:'Year',value:'88',unit:'days'},{label:'Day',value:'59',unit:'earth days'},{label:'Moons',value:'0',unit:''},{label:'Surface',value:'−180 to 430',unit:'°C'},{label:'From Sol',value:'57.9',unit:'M km'}], radius: 0.8, dotSize: 4, distance: 12, orbitSpeed: 0.004, moons: [], rotationSpeed: 0.002, color: '#8a7f70' },
  { name: 'Venus', type: 'planet', chapter: 'Chapter II · The Twin', epigraph: 'Beautiful from afar. A furnace up close.', prose: `Venus is the planet that broke my heart. The air is ninety six percent carbon dioxide. The pressure would crush you like a tin can. It rains sulfuric acid that evaporates before it hits the ground. And she spins backwards, as if she's ashamed of what she's become. A day there lasts longer than a year.`, data: [{label:'Diameter',value:'12,104',unit:'km'},{label:'Year',value:'225',unit:'days'},{label:'Day',value:'243',unit:'earth days'},{label:'Moons',value:'0',unit:''},{label:'Surface',value:'462',unit:'°C'},{label:'From Sol',value:'108.2',unit:'M km'}], radius: 1.2, dotSize: 6, distance: 18, orbitSpeed: 0.0015, moons: [], rotationSpeed: -0.001, color: '#e8c890' },
  { name: 'Earth', type: 'planet', chapter: 'Chapter III · Home', epigraph: 'The only place we know of where the universe looked back.', prose: `This is the one I keep coming back to. Where I felt rain on my face and watched the moon rise over the ocean. The water, the iron in my blood, the calcium in my bones. All of it forged in stars that died before our sun was born. Seven continents, five oceans, one thin skin of air holding everything together. A pale blue dot, suspended in a sunbeam. Home.`, data: [{label:'Diameter',value:'12,742',unit:'km'},{label:'Year',value:'365.25',unit:'days'},{label:'Day',value:'24',unit:'hours'},{label:'Moons',value:'1',unit:''},{label:'Surface',value:'15',unit:'°C avg'},{label:'From Sol',value:'149.6',unit:'M km'}], radius: 1.3, dotSize: 7, distance: 26, orbitSpeed: 0.001, moons: [{name:'Moon',radius:0.35,distance:3.5,orbitSpeed:0.02,color:'#c0c0c0'}], rotationSpeed: 0.005, color: '#4a90e2' },
  { name: 'Mars', type: 'planet', chapter: 'Chapter IV · The Frontier', epigraph: 'Once warm. Once wet. Now, waiting.', prose: `Mars is where I go when I need to remember that things change. Olympus Mons rises twenty one kilometers above the plain. Valles Marineris splits the planet like a wound. Somewhere beneath that rust colored surface, water may still flow. The polar ice caps hold enough frozen water to cover the world eleven meters deep, if only it would melt.`, data: [{label:'Diameter',value:'6,779',unit:'km'},{label:'Year',value:'687',unit:'days'},{label:'Day',value:'24.6',unit:'hours'},{label:'Moons',value:'2',unit:''},{label:'Surface',value:'−63',unit:'°C avg'},{label:'From Sol',value:'227.9',unit:'M km'}], radius: 0.9, dotSize: 5, distance: 34, orbitSpeed: 0.0008, moons: [{name:'Phobos',radius:0.08,distance:2.2,orbitSpeed:0.05,color:'#8b7355'},{name:'Deimos',radius:0.06,distance:3.0,orbitSpeed:0.03,color:'#8b7355'}], rotationSpeed: 0.005, color: '#c1440e' },
  { name: 'Jupiter', type: 'planet', chapter: 'Chapter V · The King', epigraph: 'A failed star, spinning in gas and storm.', prose: `Thirteen hundred Earths could fit inside. The Great Red Spot is a hurricane older than any human civilization. Jupiter is less a planet than a small, failed sun, guarding the inner worlds from asteroids with its gravity. Its moon Europa may harbor life beneath a shell of ice.`, data: [{label:'Diameter',value:'139,820',unit:'km'},{label:'Year',value:'11.9',unit:'earth years'},{label:'Day',value:'9.9',unit:'hours'},{label:'Moons',value:'95',unit:''},{label:'Surface',value:'−110',unit:'°C clouds'},{label:'From Sol',value:'778.5',unit:'M km'}], radius: 2.8, dotSize: 14, distance: 52, orbitSpeed: 0.0004, moons: [{name:'Io',radius:0.28,distance:4.5,orbitSpeed:0.04,color:'#ffff99'},{name:'Europa',radius:0.25,distance:5.8,orbitSpeed:0.03,color:'#e8e8e8'},{name:'Ganymede',radius:0.41,distance:7.2,orbitSpeed:0.02,color:'#c0c0c0'},{name:'Callisto',radius:0.38,distance:9.0,orbitSpeed:0.015,color:'#8b7355'}], rotationSpeed: 0.01, color: '#d8a878' },
  { name: 'Saturn', type: 'planet', chapter: 'Chapter VI · The Jewel', epigraph: 'The answer to what if planets could be beautiful.', prose: `Saturn is why I fell in love with the sky in the first place. Rings like spun glass, catching the light in a way that made my breath catch. They're billions of shards of ice and rock, each one a tiny moon. Saturn is so light it would float on water, if you could find an ocean large enough.`, data: [{label:'Diameter',value:'116,460',unit:'km'},{label:'Year',value:'29.5',unit:'earth years'},{label:'Day',value:'10.7',unit:'hours'},{label:'Moons',value:'146',unit:''},{label:'Rings',value:'282,000',unit:'km wide'},{label:'From Sol',value:'1.43',unit:'B km'}], radius: 2.4, dotSize: 12, distance: 68, orbitSpeed: 0.0002, rings: true, moons: [{name:'Titan',radius:0.40,distance:6.0,orbitSpeed:0.01,color:'#d4a574'},{name:'Enceladus',radius:0.08,distance:3.5,orbitSpeed:0.03,color:'#ffffff'}], rotationSpeed: 0.009, color: '#e8d8a0' },
  { name: 'Uranus', type: 'planet', chapter: 'Chapter VII · The Tilted One', epigraph: 'Rolling on its side through the cold.', prose: `Something hit it long ago. Hard enough to knock it onto its side. Now it rolls through its orbit like a ball. Pale, quiet, methane blue. The coldest planetary atmosphere in the system, colder than Neptune even though Neptune is farther from the sun. Thirteen faint rings circle it, discovered only in 1977.`, data: [{label:'Diameter',value:'50,724',unit:'km'},{label:'Year',value:'84',unit:'earth years'},{label:'Day',value:'17.2',unit:'hours'},{label:'Moons',value:'27',unit:''},{label:'Surface',value:'−224',unit:'°C'},{label:'From Sol',value:'2.87',unit:'B km'}], radius: 1.8, dotSize: 9, distance: 86, orbitSpeed: 0.0001, tilt: 1.7, moons: [{name:'Titania',radius:0.12,distance:4.0,orbitSpeed:0.015,color:'#c0c0c0'},{name:'Oberon',radius:0.12,distance:5.0,orbitSpeed:0.012,color:'#8b7355'}], rotationSpeed: -0.007, color: '#9fd8e0' },
  { name: 'Neptune', type: 'planet', chapter: 'Chapter VIII · The Last Blue', epigraph: 'Where the sun is just another star.', prose: `The farthest out. Winds here reach two thousand one hundred kilometers per hour, faster than sound. It takes one hundred and sixty five years to complete one orbit. Its moon Triton orbits backwards, as if it were captured and never quite forgiven. Out here, the sun is just another star.`, data: [{label:'Diameter',value:'49,244',unit:'km'},{label:'Year',value:'165',unit:'earth years'},{label:'Day',value:'16.1',unit:'hours'},{label:'Moons',value:'14',unit:''},{label:'Winds',value:'2,100',unit:'km/h'},{label:'From Sol',value:'4.50',unit:'B km'}], radius: 1.8, dotSize: 9, distance: 102, orbitSpeed: 0.00006, moons: [{name:'Triton',radius:0.21,distance:4.5,orbitSpeed:-0.01,color:'#c0c0c0'}], rotationSpeed: 0.006, color: '#4166f5' },
  { name: 'Ceres', type: 'dwarf', chapter: 'Appendix I · The Belt Queen', epigraph: 'Hidden in plain sight among the rubble.', prose: `Ceres is the largest object in the asteroid belt, a lonely world of ice and rock caught between Mars and Jupiter. For centuries it was classified as an asteroid, then promoted to dwarf planet in 2006. It has bright spots of sodium carbonate on its surface, remnants of a subsurface ocean that may still exist deep below.`, data: [{label:'Diameter',value:'940',unit:'km'},{label:'Year',value:'1,682',unit:'days'},{label:'Day',value:'9.1',unit:'hours'},{label:'Moons',value:'0',unit:''},{label:'Surface',value:'−105',unit:'°C avg'},{label:'From Sol',value:'414',unit:'M km'}], radius: 0.35, dotSize: 3, distance: 44, orbitSpeed: 0.0006, moons: [], rotationSpeed: 0.004, color: '#8a8a8a' },
  { name: 'Pluto', type: 'dwarf', chapter: 'Appendix II · The Exile', epigraph: 'Demoted but never forgotten.', prose: `Pluto was the ninth planet of my childhood, and its demotion in 2006 still stings. But seeing the images from New Horizons in 2015 changed everything. A heart shaped glacier of nitrogen ice. Mountains of water ice. A thin blue atmosphere. Pluto is not a failed planet. It is a world in its own right.`, data: [{label:'Diameter',value:'2,377',unit:'km'},{label:'Year',value:'248',unit:'earth years'},{label:'Day',value:'6.4',unit:'earth days'},{label:'Moons',value:'5',unit:''},{label:'Surface',value:'−230',unit:'°C avg'},{label:'From Sol',value:'5.9',unit:'B km'}], radius: 0.5, dotSize: 4, distance: 115, orbitSpeed: 0.00004, moons: [{name:'Charon',radius:0.25,distance:2.5,orbitSpeed:0.015,color:'#a0a0a0'}], rotationSpeed: -0.003, color: '#c4a882' },
  { name: 'Eris', type: 'dwarf', chapter: 'Appendix III · The Troublemaker', epigraph: 'The one that started the argument.', prose: `Eris is the reason Pluto lost its planet status. Discovered in 2005, it is slightly more massive than Pluto and orbits even farther out. Named after the Greek goddess of discord, which feels appropriate given the controversy it caused. Its surface is covered in methane ice, making it one of the most reflective objects in the solar system.`, data: [{label:'Diameter',value:'2,326',unit:'km'},{label:'Year',value:'559',unit:'earth years'},{label:'Day',value:'25.9',unit:'hours'},{label:'Moons',value:'1',unit:''},{label:'Surface',value:'−243',unit:'°C avg'},{label:'From Sol',value:'10.2',unit:'B km'}], radius: 0.48, dotSize: 3, distance: 130, orbitSpeed: 0.000025, moons: [{name:'Dysnomia',radius:0.1,distance:2.0,orbitSpeed:0.01,color:'#888888'}], rotationSpeed: 0.002, color: '#d0d0d0' },
  { name: 'Haumea', type: 'dwarf', chapter: 'Appendix IV · The Spinner', epigraph: 'Stretched thin by its own fury.', prose: `Haumea spins so fast that it has been stretched into an ellipsoid, looking more like a rugby ball than a sphere. One rotation takes less than four hours. It has a ring system, the first dwarf planet known to have one, and two small moons named after the daughters of the Hawaiian goddess it was named for.`, data: [{label:'Diameter',value:'1,632',unit:'km'},{label:'Year',value:'283',unit:'earth years'},{label:'Day',value:'3.9',unit:'hours'},{label:'Moons',value:'2',unit:''},{label:'Surface',value:'−241',unit:'°C avg'},{label:'From Sol',value:'6.5',unit:'B km'}], radius: 0.42, dotSize: 3, distance: 122, orbitSpeed: 0.000035, moons: [{name:'Hiiaka',radius:0.08,distance:2.0,orbitSpeed:0.02,color:'#aaaaaa'},{name:'Namaka',radius:0.05,distance:1.5,orbitSpeed:0.03,color:'#999999'}], rotationSpeed: 0.02, color: '#c8b8a8' },
  { name: 'Makemake', type: 'dwarf', chapter: 'Appendix V · The Silent One', epigraph: 'No atmosphere. No sound. Just ice and void.', prose: `Makemake is one of the quietest worlds we know of. No significant atmosphere, no known geological activity, just a surface of methane and ethane ice reflecting the distant sun. It is reddish brown, similar to Pluto, but smaller and lonelier. Named after the Rapa Nui god of fertility.`, data: [{label:'Diameter',value:'1,430',unit:'km'},{label:'Year',value:'306',unit:'earth years'},{label:'Day',value:'22.8',unit:'hours'},{label:'Moons',value:'1',unit:''},{label:'Surface',value:'−240',unit:'°C avg'},{label:'From Sol',value:'6.8',unit:'B km'}], radius: 0.4, dotSize: 3, distance: 125, orbitSpeed: 0.00003, moons: [{name:'MK2',radius:0.06,distance:1.8,orbitSpeed:0.015,color:'#777777'}], rotationSpeed: 0.003, color: '#b07050' },
  { name: 'Milky Way', type: 'homegalaxy', chapter: 'Home · Our Galaxy', epigraph: 'A hundred thousand light years across, and we are somewhere in it.', prose: `The Milky Way is home. A barred spiral galaxy containing between one hundred and four hundred billion stars, one of which is our sun. We live in a minor spiral arm called the Orion Arm, about twenty six thousand light years from the galactic center. From a dark sky, the galaxy appears as a faint band of light stretching across the heavens. It is the sum of all those distant suns, blended into a single milky river. We are inside it, looking out.`, data: [{label:'Type',value:'Barred Spiral',unit:''},{label:'Diameter',value:'100,000',unit:'ly'},{label:'Stars',value:'100 to 400B',unit:''},{label:'Age',value:'13.6',unit:'billion years'},{label:'Our position',value:'Orion Arm',unit:''},{label:'From center',value:'26,000',unit:'ly'}], radius: 0, dotSize: 10, distance: 0, orbitSpeed: 0, moons: [], rotationSpeed: 0.00008, color: '#f0e8d0', galaxySize: 800, galaxyColor: 0xf0e8d0, galaxyType: 'milkyway' },
  { name: 'Andromeda', type: 'galaxy', chapter: 'Beyond I · The Neighbor', epigraph: 'Two and a half million light years away, and closing.', prose: `Andromeda is the nearest major galaxy to our own Milky Way, a sprawling spiral of a trillion stars visible to the naked eye as a faint smudge in the autumn sky. It is larger than our galaxy and approaching us at 110 kilometers per second. In about four and a half billion years, the two galaxies will collide and merge.`, data: [{label:'Type',value:'Spiral',unit:''},{label:'Distance',value:'2.537',unit:'M ly'},{label:'Diameter',value:'220,000',unit:'ly'},{label:'Stars',value:'1 trillion',unit:''},{label:'Mass',value:'1.2T',unit:'solar masses'},{label:'Approaching',value:'110',unit:'km/s'}], radius: 0, dotSize: 6, distance: 0, orbitSpeed: 0, moons: [], rotationSpeed: 0.0003, color: '#c8b8ff', galaxySize: 80, galaxyColor: 0xc8b8ff, galaxyType: 'spiral' },
  { name: 'Triangulum', type: 'galaxy', chapter: 'Beyond II · The Pinwheel', epigraph: 'The third wheel of the Local Group.', prose: `Triangulum is the third largest galaxy in our Local Group, a face on spiral that looks like a pinwheel frozen in time. It is small compared to Andromeda and the Milky Way, containing only about forty billion stars. But it is one of the most distant objects visible to the naked eye.`, data: [{label:'Type',value:'Spiral',unit:''},{label:'Distance',value:'2.73',unit:'M ly'},{label:'Diameter',value:'60,000',unit:'ly'},{label:'Stars',value:'40 billion',unit:''},{label:'Mass',value:'50B',unit:'solar masses'},{label:'Also known as',value:'M33',unit:''}], radius: 0, dotSize: 4, distance: 0, orbitSpeed: 0, moons: [], rotationSpeed: 0.0004, color: '#a0c0ff', galaxySize: 45, galaxyColor: 0xa0c0ff, galaxyType: 'spiral' },
  { name: 'Large Magellanic Cloud', type: 'galaxy', chapter: 'Beyond III · The Companion', epigraph: 'A satellite galaxy, tethered by gravity.', prose: `The Large Magellanic Cloud is a satellite galaxy of the Milky Way, orbiting us at a distance of 160,000 light years. It is an irregular galaxy, lacking the elegant spiral structure of Andromeda, but it contains the Tarantula Nebula, the most active star forming region in the entire Local Group.`, data: [{label:'Type',value:'Irregular',unit:''},{label:'Distance',value:'160,000',unit:'ly'},{label:'Diameter',value:'14,000',unit:'ly'},{label:'Stars',value:'30 billion',unit:''},{label:'Mass',value:'10B',unit:'solar masses'},{label:'Also known as',value:'LMC',unit:''}], radius: 0, dotSize: 5, distance: 0, orbitSpeed: 0, moons: [], rotationSpeed: 0.0002, color: '#ffe0a0', galaxySize: 30, galaxyColor: 0xffe0a0, galaxyType: 'irregular' },
  { name: 'Small Magellanic Cloud', type: 'galaxy', chapter: 'Beyond IV · The Little Sister', epigraph: 'Smaller, fainter, but no less ancient.', prose: `The Small Magellanic Cloud is the smaller companion of the Large Magellanic Cloud, a dwarf irregular galaxy about 200,000 light years away. It is being slowly torn apart by the gravitational pull of the Milky Way, its stars streaming out in a long tidal tail.`, data: [{label:'Type',value:'Irregular',unit:''},{label:'Distance',value:'200,000',unit:'ly'},{label:'Diameter',value:'7,000',unit:'ly'},{label:'Stars',value:'3 billion',unit:''},{label:'Mass',value:'7B',unit:'solar masses'},{label:'Also known as',value:'SMC',unit:''}], radius: 0, dotSize: 3, distance: 0, orbitSpeed: 0, moons: [], rotationSpeed: 0.0003, color: '#d0c8b0', galaxySize: 18, galaxyColor: 0xd0c8b0, galaxyType: 'irregular' },
  { name: 'Sombrero Galaxy', type: 'galaxy', chapter: 'Beyond V · The Hat', epigraph: 'A bright core wrapped in dust.', prose: `The Sombrero Galaxy gets its name from its appearance: a bright central bulge surrounded by a wide, dark dust lane that makes it look like a Mexican hat seen from the side. It sits about thirty million light years away. Its central black hole is one billion solar masses.`, data: [{label:'Type',value:'Edge on Spiral',unit:''},{label:'Distance',value:'29.6',unit:'M ly'},{label:'Diameter',value:'49,000',unit:'ly'},{label:'Stars',value:'100 billion',unit:''},{label:'Black hole',value:'1B',unit:'solar masses'},{label:'Also known as',value:'M104',unit:''}], radius: 0, dotSize: 4, distance: 0, orbitSpeed: 0, moons: [], rotationSpeed: 0.0002, color: '#ffe8c0', galaxySize: 28, galaxyColor: 0xffe8c0, galaxyType: 'edgeon' },
  { name: 'Whirlpool Galaxy', type: 'galaxy', chapter: 'Beyond VI · The Spiral', epigraph: 'The galaxy that proved spirals exist.', prose: `The Whirlpool Galaxy was the first galaxy in which spiral structure was observed, by Lord Rosse in 1845. It is a grand design spiral, its arms sweeping out in elegant curves studded with pink star forming regions. It is interacting with a smaller companion galaxy.`, data: [{label:'Type',value:'Grand Design Spiral',unit:''},{label:'Distance',value:'23',unit:'M ly'},{label:'Diameter',value:'76,000',unit:'ly'},{label:'Stars',value:'160 billion',unit:''},{label:'Mass',value:'160B',unit:'solar masses'},{label:'Also known as',value:'M51',unit:''}], radius: 0, dotSize: 5, distance: 0, orbitSpeed: 0, moons: [], rotationSpeed: 0.0003, color: '#c0d0ff', galaxySize: 48, galaxyColor: 0xc0d0ff, galaxyType: 'spiral' }
];

function makeTex(w, h, drawFn) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const ctx = c.getContext('2d'); drawFn(ctx, w, h);
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; return tex;
}

function makePlanetTex(color) {
  return makeTex(512, 256, (ctx, w, h) => {
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, color); g.addColorStop(1, color);
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 80; i++) {
      ctx.fillStyle = `rgba(${Math.random()*60+40},${Math.random()*60+40},${Math.random()*60+40},${Math.random()*0.3})`;
      ctx.beginPath(); ctx.ellipse(Math.random()*w, Math.random()*h, Math.random()*40+10, Math.random()*30+8, Math.random()*Math.PI, 0, Math.PI*2); ctx.fill();
    }
  });
}

const textureBuilders = {
  Mercury: () => makeTex(1024, 512, (ctx, w, h) => { const g = ctx.createLinearGradient(0,0,0,h); g.addColorStop(0,'#4a4238'); g.addColorStop(0.5,'#8a7f70'); g.addColorStop(1,'#4a4238'); ctx.fillStyle=g; ctx.fillRect(0,0,w,h); for(let i=0;i<300;i++){const x=Math.random()*w,y=Math.random()*h,r=Math.random()*20+3; ctx.fillStyle=`rgba(30,25,20,${Math.random()*0.5+0.3})`; ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2); ctx.fill(); ctx.strokeStyle=`rgba(170,160,145,${Math.random()*0.4+0.3})`; ctx.lineWidth=1.5; ctx.beginPath(); ctx.arc(x,y,r*0.85,0,Math.PI*2); ctx.stroke();} }),
  Venus: () => makeTex(1024, 512, (ctx, w, h) => { const g = ctx.createLinearGradient(0,0,0,h); g.addColorStop(0,'#a87848'); g.addColorStop(0.5,'#e8c890'); g.addColorStop(1,'#a87848'); ctx.fillStyle=g; ctx.fillRect(0,0,w,h); for(let i=0;i<60;i++){ctx.fillStyle=`rgba(${210+Math.random()*45},${180+Math.random()*40},${120+Math.random()*30},${Math.random()*0.3})`; ctx.beginPath(); ctx.ellipse(Math.random()*w,Math.random()*h,Math.random()*100+40,Math.random()*25+8,Math.random()*Math.PI,0,Math.PI*2); ctx.fill();} }),
  Earth: () => makeTex(1024, 512, (ctx, w, h) => { ctx.fillStyle='#0a4a7a'; ctx.fillRect(0,0,w,h); ctx.fillStyle='#2a5a2a'; const c=[[200,120],[280,110],[320,140],[340,180],[300,220],[260,230],[220,210],[180,170]]; ctx.beginPath(); ctx.moveTo(c[0][0],c[0][1]); c.forEach(p=>ctx.lineTo(p[0],p[1])); ctx.closePath(); ctx.fill(); ctx.fillStyle='#2a5a2a'; ctx.beginPath(); ctx.ellipse(520,250,80,100,0,0,Math.PI*2); ctx.fill(); ctx.beginPath(); ctx.ellipse(700,180,120,80,0,0,Math.PI*2); ctx.fill(); ctx.beginPath(); ctx.ellipse(820,330,40,30,0,0,Math.PI*2); ctx.fill(); const ice=ctx.createLinearGradient(0,0,0,50); ice.addColorStop(0,'rgba(250,252,255,0.95)'); ice.addColorStop(1,'rgba(250,252,255,0)'); ctx.fillStyle=ice; ctx.fillRect(0,0,w,50); const ice2=ctx.createLinearGradient(0,h-50,0,h); ice2.addColorStop(0,'rgba(250,252,255,0)'); ice2.addColorStop(1,'rgba(250,252,255,0.95)'); ctx.fillStyle=ice2; ctx.fillRect(0,h-50,w,50); }),
  Mars: () => makeTex(1024, 512, (ctx, w, h) => { const g = ctx.createLinearGradient(0,0,0,h); g.addColorStop(0,'#903008'); g.addColorStop(0.5,'#d4652a'); g.addColorStop(1,'#903008'); ctx.fillStyle=g; ctx.fillRect(0,0,w,h); for(let i=0;i<80;i++){ctx.fillStyle=`rgba(${100+Math.random()*80},${40+Math.random()*40},${10+Math.random()*20},${Math.random()*0.35})`; ctx.beginPath(); ctx.ellipse(Math.random()*w,Math.random()*h,Math.random()*80+20,Math.random()*50+10,Math.random()*Math.PI,0,Math.PI*2); ctx.fill();} const i1=ctx.createLinearGradient(0,0,0,60); i1.addColorStop(0,'rgba(240,235,225,0.95)'); i1.addColorStop(1,'rgba(240,235,225,0)'); ctx.fillStyle=i1; ctx.fillRect(0,0,w,60); }),
  Jupiter: () => makeTex(1024, 512, (ctx, w, h) => { const bands=['#d4a878','#c89868','#e8c098','#b88858','#d4a878','#a07848','#e8c898','#c89868','#d4a878','#b88858']; const bh=h/bands.length; bands.forEach((c,i)=>{ctx.fillStyle=c; ctx.fillRect(0,i*bh,w,bh+1);}); const grs=ctx.createRadialGradient(620,280,0,620,280,60); grs.addColorStop(0,'#c04020'); grs.addColorStop(0.5,'#a03010'); grs.addColorStop(1,'rgba(128,32,8,0)'); ctx.fillStyle=grs; ctx.beginPath(); ctx.ellipse(620,280,70,40,0,0,Math.PI*2); ctx.fill(); }),
  Saturn: () => makeTex(1024, 512, (ctx, w, h) => { const bands=['#e8d8a0','#d8c890','#f0e0b0','#c8b880','#e8d8a0','#d0c088','#e8d8a0','#c8b880']; const bh=h/bands.length; bands.forEach((c,i)=>{ctx.fillStyle=c; ctx.fillRect(0,i*bh,w,bh+1);}); }),
  Uranus: () => makeTex(1024, 512, (ctx, w, h) => { const g=ctx.createLinearGradient(0,0,0,h); g.addColorStop(0,'#6fa8b0'); g.addColorStop(0.5,'#a8dce0'); g.addColorStop(1,'#6fa8b0'); ctx.fillStyle=g; ctx.fillRect(0,0,w,h); }),
  Neptune: () => makeTex(1024, 512, (ctx, w, h) => { const g=ctx.createLinearGradient(0,0,0,h); g.addColorStop(0,'#1830a0'); g.addColorStop(0.5,'#4166f5'); g.addColorStop(1,'#1830a0'); ctx.fillStyle=g; ctx.fillRect(0,0,w,h); const gds=ctx.createRadialGradient(300,200,0,300,200,50); gds.addColorStop(0,'#081050'); gds.addColorStop(1,'rgba(24,40,112,0)'); ctx.fillStyle=gds; ctx.beginPath(); ctx.ellipse(300,200,60,35,0,0,Math.PI*2); ctx.fill(); })
};

function create3DGalaxy(body) {
  const group = new THREE.Group();
  const col = new THREE.Color(body.galaxyColor);
  const size = body.galaxySize;
  const type = body.galaxyType;
  const particleCount = type === 'irregular' ? 8000 : 15000;
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);
  if (type === 'spiral') {
    const numArms = 2; const armSpread = 0.6;
    for (let i = 0; i < particleCount; i++) {
      const isCore = Math.random() < 0.3;
      if (isCore) {
        const radius = Math.random() * size * 0.15; const angle = Math.random() * Math.PI * 2; const height = (Math.random() - 0.5) * size * 0.05;
        positions[i*3] = Math.cos(angle) * radius; positions[i*3+1] = height; positions[i*3+2] = Math.sin(angle) * radius;
        const brightness = 0.8 + Math.random() * 0.2;
        colors[i*3] = col.r * brightness; colors[i*3+1] = col.g * brightness; colors[i*3+2] = col.b * brightness;
      } else {
        const arm = Math.floor(Math.random() * numArms); const baseAngle = (arm / numArms) * Math.PI * 2; const t = Math.random();
        const radius = t * size * 0.5 + size * 0.1; const angle = baseAngle + t * Math.PI * 3 + (Math.random() - 0.5) * armSpread * (1 + t * 2); const height = (Math.random() - 0.5) * size * 0.03 * (1 + t);
        positions[i*3] = Math.cos(angle) * radius; positions[i*3+1] = height; positions[i*3+2] = Math.sin(angle) * radius;
        const brightness = (1 - t * 0.5) * (0.6 + Math.random() * 0.4); const starType = Math.random();
        if (starType < 0.1) { colors[i*3] = 1.0; colors[i*3+1] = 0.8; colors[i*3+2] = 0.6; }
        else if (starType < 0.2) { colors[i*3] = 0.8; colors[i*3+1] = 0.9; colors[i*3+2] = 1.0; }
        else { colors[i*3] = col.r * brightness; colors[i*3+1] = col.g * brightness; colors[i*3+2] = col.b * brightness; }
      }
    }
  } else if (type === 'irregular') {
    for (let i = 0; i < particleCount; i++) {
      const radius = Math.random() * size * 0.4; const angle = Math.random() * Math.PI * 2; const height = (Math.random() - 0.5) * size * 0.15;
      const offsetX = (Math.random() - 0.5) * size * 0.2; const offsetZ = (Math.random() - 0.5) * size * 0.2;
      positions[i*3] = Math.cos(angle) * radius + offsetX; positions[i*3+1] = height; positions[i*3+2] = Math.sin(angle) * radius + offsetZ;
      const brightness = 0.5 + Math.random() * 0.5;
      colors[i*3] = col.r * brightness; colors[i*3+1] = col.g * brightness; colors[i*3+2] = col.b * brightness;
    }
  } else if (type === 'edgeon') {
    for (let i = 0; i < particleCount; i++) {
      const isCore = Math.random() < 0.4;
      if (isCore) {
        const radius = Math.random() * size * 0.1; const angle = Math.random() * Math.PI * 2; const height = (Math.random() - 0.5) * size * 0.08;
        positions[i*3] = Math.cos(angle) * radius; positions[i*3+1] = height; positions[i*3+2] = Math.sin(angle) * radius;
        const brightness = 0.9 + Math.random() * 0.1;
        colors[i*3] = col.r * brightness; colors[i*3+1] = col.g * brightness; colors[i*3+2] = col.b * brightness;
      } else {
        const radius = Math.random() * size * 0.5 + size * 0.1; const angle = Math.random() * Math.PI * 2; const height = (Math.random() - 0.5) * size * 0.02;
        positions[i*3] = Math.cos(angle) * radius; positions[i*3+1] = height; positions[i*3+2] = Math.sin(angle) * radius;
        const brightness = 0.6 + Math.random() * 0.4;
        colors[i*3] = col.r * brightness; colors[i*3+1] = col.g * brightness; colors[i*3+2] = col.b * brightness;
      }
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  const material = new THREE.PointsMaterial({ size: 0.15, vertexColors: true, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true });
  const points = new THREE.Points(geometry, material);
  group.add(points);
  if (type === 'spiral' || type === 'edgeon') {
    const coreGeometry = new THREE.SphereGeometry(size * 0.08, 32, 32);
    const coreMaterial = new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending });
    const core = new THREE.Mesh(coreGeometry, coreMaterial);
    group.add(core);
  }
  if (type === 'edgeon') group.rotation.x = Math.PI * 0.4;
  return group;
}

function createMilkyWay() {
  const group = new THREE.Group();
  const size = 800;
  const particleCount = 80000;
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);
  const numArms = 4;
  const armSpread = 0.5;
  const barAngle = Math.PI * 0.15;
  for (let i = 0; i < particleCount; i++) {
    const r = Math.random();
    let x, y, z;
    if (r < 0.15) {
      const radius = Math.random() * size * 0.12; const angle = Math.random() * Math.PI * 2; const height = (Math.random() - 0.5) * size * 0.06;
      x = Math.cos(angle) * radius; z = Math.sin(angle) * radius; y = height;
      const brightness = 0.85 + Math.random() * 0.15;
      colors[i*3] = 1.0 * brightness; colors[i*3+1] = 0.92 * brightness; colors[i*3+2] = 0.75 * brightness;
    } else if (r < 0.25) {
      const t = (Math.random() - 0.5) * 2; const barLength = size * 0.25; const barWidth = size * 0.04;
      x = t * barLength * Math.cos(barAngle) + (Math.random() - 0.5) * barWidth * Math.sin(barAngle);
      z = t * barLength * Math.sin(barAngle) + (Math.random() - 0.5) * barWidth * Math.cos(barAngle);
      y = (Math.random() - 0.5) * size * 0.02;
      const brightness = 0.7 + Math.random() * 0.3;
      colors[i*3] = 1.0 * brightness; colors[i*3+1] = 0.88 * brightness; colors[i*3+2] = 0.7 * brightness;
    } else {
      const arm = Math.floor(Math.random() * numArms); const baseAngle = (arm / numArms) * Math.PI * 2; const t = Math.pow(Math.random(), 0.7);
      const radius = t * size * 0.5 + size * 0.12; const angle = baseAngle + t * Math.PI * 2.5 + (Math.random() - 0.5) * armSpread * (1 + t * 1.5); const height = (Math.random() - 0.5) * size * 0.015 * (1 + t * 0.5);
      x = Math.cos(angle) * radius; z = Math.sin(angle) * radius; y = height;
      const brightness = (1 - t * 0.4) * (0.5 + Math.random() * 0.5); const starType = Math.random();
      if (starType < 0.15) { colors[i*3] = 0.7 * brightness; colors[i*3+1] = 0.85 * brightness; colors[i*3+2] = 1.0 * brightness; }
      else if (starType < 0.3) { colors[i*3] = 1.0 * brightness; colors[i*3+1] = 1.0 * brightness; colors[i*3+2] = 0.95 * brightness; }
      else if (starType < 0.5) { colors[i*3] = 1.0 * brightness; colors[i*3+1] = 0.9 * brightness; colors[i*3+2] = 0.7 * brightness; }
      else { colors[i*3] = 1.0 * brightness; colors[i*3+1] = 0.7 * brightness; colors[i*3+2] = 0.5 * brightness; }
    }
    positions[i*3] = x; positions[i*3+1] = y; positions[i*3+2] = z;
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  const material = new THREE.PointsMaterial({ size: 0.8, vertexColors: true, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true });
  const points = new THREE.Points(geometry, material);
  group.add(points);
  const coreGeometry = new THREE.SphereGeometry(size * 0.06, 32, 32);
  const coreMaterial = new THREE.MeshBasicMaterial({ color: 0xfff0c0, transparent: true, opacity: 0.7, blending: THREE.AdditiveBlending });
  const core = new THREE.Mesh(coreGeometry, coreMaterial);
  group.add(core);
  const dustCount = 6000;
  const dustPositions = new Float32Array(dustCount * 3);
  for (let i = 0; i < dustCount; i++) {
    const arm = Math.floor(Math.random() * numArms); const baseAngle = (arm / numArms) * Math.PI * 2 + Math.PI / numArms; const t = Math.random();
    const radius = t * size * 0.45 + size * 0.15; const angle = baseAngle + t * Math.PI * 2.5 + (Math.random() - 0.5) * 0.3;
    dustPositions[i*3] = Math.cos(angle) * radius; dustPositions[i*3+1] = (Math.random() - 0.5) * size * 0.01; dustPositions[i*3+2] = Math.sin(angle) * radius;
  }
  const dustGeometry = new THREE.BufferGeometry();
  dustGeometry.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
  const dustMaterial = new THREE.PointsMaterial({ size: 1.5, color: 0x1a0a05, transparent: true, opacity: 0.4, blending: THREE.NormalBlending, depthWrite: false, sizeAttenuation: true });
  const dust = new THREE.Points(dustGeometry, dustMaterial);
  group.add(dust);
  return group;
}

const container = document.getElementById('canvas-container');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, innerWidth/innerHeight, 0.1, 10000);
camera.position.set(0, 40, 80);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.1;
container.appendChild(renderer.domElement);
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
composer.addPass(new UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), 0.4, 0.3, 0.85));
let camTarget = new THREE.Vector3(0, 0, 0);
let camDist = 80, camTheta = 0, camPhi = Math.PI/3;
let isDragging = false, lastMouse = { x:0, y:0 }, vel = { t:0, p:0 };
const mouseNDC = new THREE.Vector2();
const raycaster = new THREE.Raycaster();
let current = 0, transitioning = false;
let currentView = 'planets';
const bodyObjects = [];
const galaxyObjects = [];
const asteroidBelt = [];
let milkyWayGroup = null;
let sunMarker3D = null;
const loadFill = document.getElementById('load-ring');
const loadStatus = document.getElementById('load-status');
const setProgress = (pct, msg) => { loadFill.style.strokeDashoffset = 283 - (283 * pct / 100); if (msg) loadStatus.textContent = msg; };

function makeStars(count, radius, size, color) {
  const g = new THREE.BufferGeometry(); const pos = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) { const r = radius*(0.5+Math.random()*0.5); const theta = Math.random()*Math.PI*2; const phi = Math.acos(2*Math.random()-1); pos[i*3]=r*Math.sin(phi)*Math.cos(theta); pos[i*3+1]=r*Math.sin(phi)*Math.sin(theta); pos[i*3+2]=r*Math.cos(phi); }
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  return new THREE.Points(g, new THREE.PointsMaterial({ color, size, sizeAttenuation: true, transparent: true, opacity: 0.9 }));
}

async function buildScene() {
  setProgress(5, 'mapping stars'); await yieldFrame();
  scene.add(makeStars(4000, 1200, 1.0, 0xffffff));
  scene.add(makeStars(2000, 800, 1.8, 0xc9d8ff));
  scene.add(makeStars(600, 500, 2.8, 0xffd9a8));
  setProgress(10, 'painting nebula'); await yieldFrame();
  const nc = document.createElement('canvas'); nc.width = nc.height = 512;
  const nctx = nc.getContext('2d'); nctx.fillStyle = '#000'; nctx.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 25; i++) { const x=Math.random()*512, y=Math.random()*512, r=80+Math.random()*200; const g=nctx.createRadialGradient(x,y,0,x,y,r); g.addColorStop(0,`hsla(${200+Math.random()*100},70%,40%,0.12)`); g.addColorStop(1,'transparent'); nctx.fillStyle=g; nctx.fillRect(0,0,512,512); }
  const nebula = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(nc), transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending }));
  nebula.scale.set(1400, 1400, 1); nebula.position.z = -500; scene.add(nebula);
  setProgress(15, 'igniting sol'); await yieldFrame();
  const sunCanvas = document.createElement('canvas'); sunCanvas.width = sunCanvas.height = 512;
  const sctx = sunCanvas.getContext('2d');
  const sg = sctx.createRadialGradient(256,256,0,256,256,256);
  sg.addColorStop(0,'#fff5e0'); sg.addColorStop(0.2,'#ffdd80'); sg.addColorStop(0.5,'#ffaa33'); sg.addColorStop(0.8,'#ff6600'); sg.addColorStop(1,'#cc3300');
  sctx.fillStyle=sg; sctx.fillRect(0,0,512,512);
  const sun = new THREE.Mesh(new THREE.SphereGeometry(4.5, 64, 64), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(sunCanvas) }));
  scene.add(sun);
  const gc = document.createElement('canvas'); gc.width = gc.height = 256;
  const gctx = gc.getContext('2d');
  const gg = gctx.createRadialGradient(128,128,0,128,128,128);
  gg.addColorStop(0,'rgba(255,240,180,0.9)'); gg.addColorStop(0.3,'rgba(255,180,80,0.5)'); gg.addColorStop(0.6,'rgba(255,120,40,0.2)'); gg.addColorStop(1,'rgba(255,80,0,0)');
  gctx.fillStyle=gg; gctx.fillRect(0,0,256,256);
  const sunGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(gc), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
  sunGlow.scale.set(35, 35, 1); scene.add(sunGlow);
  const corona = new THREE.Sprite(new THREE.SpriteMaterial({ map: (() => { const c=document.createElement('canvas'); c.width=c.height=512; const x=c.getContext('2d'); const g=x.createRadialGradient(256,256,0,256,256,256); g.addColorStop(0,'rgba(255,220,150,0.4)'); g.addColorStop(0.5,'rgba(255,150,80,0.15)'); g.addColorStop(1,'rgba(255,100,40,0)'); x.fillStyle=g; x.fillRect(0,0,512,512); return new THREE.CanvasTexture(c); })(), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
  corona.scale.set(70, 70, 1); scene.add(corona);
  scene.add(new THREE.AmbientLight(0xffffff, 2.2));
  scene.add(new THREE.HemisphereLight(0xffeedd, 0x223344, 1.5));
  scene.add(new THREE.PointLight(0xfff0d0, 4, 0, 0));
  const camLight = new THREE.DirectionalLight(0xfff8f0, 1.8);
  scene.add(camLight);
  setProgress(20, 'generating asteroid belt'); await yieldFrame();
  const astGeo = new THREE.BufferGeometry(); const astCount = 2000; const astPos = new Float32Array(astCount * 3);
  for (let i = 0; i < astCount; i++) { const a=Math.random()*Math.PI*2, d=42+Math.random()*6, h=(Math.random()-0.5)*2; astPos[i*3]=Math.cos(a)*d; astPos[i*3+1]=h; astPos[i*3+2]=Math.sin(a)*d; }
  astGeo.setAttribute('position', new THREE.BufferAttribute(astPos, 3));
  const astSys = new THREE.Points(astGeo, new THREE.PointsMaterial({ color: 0x888888, size: 0.1, transparent: true, opacity: 0.6, sizeAttenuation: true }));
  scene.add(astSys); asteroidBelt.push(astSys);
  const solidBodies = ALL_BODIES.filter(b => b.type === 'planet' || b.type === 'dwarf');
  for (let i = 0; i < solidBodies.length; i++) {
    const data = solidBodies[i];
    setProgress(25 + i * 3, `rendering ${data.name.toLowerCase()}`); await yieldFrame();
    const pts = [];
    for (let j = 0; j <= 96; j++) { const a = (j/96)*Math.PI*2; pts.push(new THREE.Vector3(Math.cos(a)*data.distance, 0, Math.sin(a)*data.distance)); }
    const orbitLine = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: data.type === 'dwarf' ? 0x665544 : 0x4466aa, transparent: true, opacity: data.type === 'dwarf' ? 0.1 : 0.15 }));
    scene.add(orbitLine);
    const tex = textureBuilders[data.name] ? textureBuilders[data.name]() : makePlanetTex(data.color);
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(data.radius, 48, 48), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.95, metalness: 0.0 }));
    if (data.tilt) mesh.rotation.z = data.tilt;
    mesh.userData = { bodyIndex: ALL_BODIES.indexOf(data) };
    const wrapper = new THREE.Group();
    wrapper.add(mesh);
    wrapper.userData.angle = Math.random() * Math.PI * 2;
    wrapper.position.x = Math.cos(wrapper.userData.angle) * data.distance;
    wrapper.position.z = Math.sin(wrapper.userData.angle) * data.distance;
    scene.add(wrapper);
    if (data.name === 'Earth' || data.name === 'Venus') {
      const atmColor = data.name === 'Earth' ? 0x4488ff : 0xe8c890;
      wrapper.add(new THREE.Mesh(new THREE.SphereGeometry(data.radius*1.08, 48, 48), new THREE.ShaderMaterial({
        uniforms: { color: { value: new THREE.Color(atmColor) } },
        vertexShader: `varying vec3 vNormal; void main(){ vNormal=normalize(normalMatrix*normal); gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
        fragmentShader: `uniform vec3 color; varying vec3 vNormal; void main(){ float i=pow(0.65-dot(vNormal,vec3(0,0,1)),3.0); gl_FragColor=vec4(color,i*0.9); }`,
        transparent: true, side: THREE.BackSide, depthWrite: false, blending: THREE.AdditiveBlending
      })));
    }
    if (data.moons && data.moons.length > 0) {
      data.moons.forEach(md => {
        const moon = new THREE.Mesh(new THREE.SphereGeometry(md.radius, 24, 24), new THREE.MeshStandardMaterial({ color: md.color, roughness: 0.95, metalness: 0.0 }));
        moon.userData = { orbitDistance: md.distance, orbitSpeed: md.orbitSpeed, angle: Math.random()*Math.PI*2 };
        wrapper.add(moon);
        if (!wrapper.userData.moons) wrapper.userData.moons = [];
        wrapper.userData.moons.push(moon);
      });
    }
    if (data.name === 'Earth') {
      const cloudTex = makeTex(1024, 512, (ctx, w, h) => { for(let i=0;i<150;i++){ctx.fillStyle=`rgba(255,255,255,${Math.random()*0.4+0.1})`; ctx.beginPath(); ctx.ellipse(Math.random()*w,Math.random()*h,Math.random()*70+25,Math.random()*25+8,Math.random()*Math.PI,0,Math.PI*2); ctx.fill();} });
      const clouds = new THREE.Mesh(new THREE.SphereGeometry(data.radius*1.02, 48, 48), new THREE.MeshPhongMaterial({ map: cloudTex, transparent: true, opacity: 0.55, depthWrite: false }));
      wrapper.add(clouds); wrapper.userData.clouds = clouds;
    }
    if (data.rings) {
      const rGeo = new THREE.RingGeometry(data.radius*1.4, data.radius*2.6, 96);
      const pos = rGeo.attributes.position, uv = rGeo.attributes.uv;
      for (let j = 0; j < pos.count; j++) { const x=pos.getX(j), y=pos.getY(j); uv.setXY(j, (Math.sqrt(x*x+y*y)-data.radius*1.4)/(data.radius*1.2), 0.5); }
      const ringTex = makeTex(512, 8, (ctx, w, h) => { for(let x=0;x<w;x++){const t=x/w; const a=(Math.sin(t*100)*0.3+0.7)*((Math.sin(t*25)>0.75)?0.15:1)*((t>0.45&&t<0.52)?0.1:1)*0.85; const b=210+Math.sin(t*50)*30; ctx.fillStyle=`rgba(${b},${b*0.92},${b*0.78},${a})`; ctx.fillRect(x,0,1,h);} });
      const ring = new THREE.Mesh(rGeo, new THREE.MeshBasicMaterial({ map: ringTex, side: THREE.DoubleSide, transparent: true, depthWrite: false }));
      ring.rotation.x = Math.PI/2 + 0.45; wrapper.add(ring);
    }
    bodyObjects.push({ wrapper, mesh, data, orbitLine });
  }
  setProgress(70, 'weaving the milky way'); await yieldFrame();
  milkyWayGroup = createMilkyWay();
  milkyWayGroup.position.set(-300, 0, -150);
  milkyWayGroup.userData = { bodyIndex: ALL_BODIES.findIndex(b => b.name === 'Milky Way') };
  scene.add(milkyWayGroup);
  const sunMarkerGeo = new THREE.SphereGeometry(2, 16, 16);
  const sunMarkerMat = new THREE.MeshBasicMaterial({ color: 0xffd866, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending });
  sunMarker3D = new THREE.Mesh(sunMarkerGeo, sunMarkerMat);
  sunMarker3D.position.set(0, 0, 0);
  scene.add(sunMarker3D);
  const sunGlowMarker = new THREE.Sprite(new THREE.SpriteMaterial({
    map: (() => {
      const c = document.createElement('canvas'); c.width = c.height = 128;
      const x = c.getContext('2d');
      const g = x.createRadialGradient(64, 64, 0, 64, 64, 64);
      g.addColorStop(0, 'rgba(255, 216, 102, 0.8)');
      g.addColorStop(0.3, 'rgba(255, 216, 102, 0.3)');
      g.addColorStop(1, 'rgba(255, 216, 102, 0)');
      x.fillStyle = g; x.fillRect(0, 0, 128, 128);
      return new THREE.CanvasTexture(c);
    })(),
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending
  }));
  sunGlowMarker.scale.set(15, 15, 1);
  sunMarker3D.add(sunGlowMarker);
  sunMarker3D.visible = false;
  setProgress(85, 'mapping distant galaxies'); await yieldFrame();
  const galaxies = ALL_BODIES.filter(b => b.type === 'galaxy');
  const galaxyPositions = [
    new THREE.Vector3(400, 150, -500),
    new THREE.Vector3(-350, 200, -450),
    new THREE.Vector3(200, -100, -400),
    new THREE.Vector3(-250, -150, -480),
    new THREE.Vector3(500, 80, -600),
    new THREE.Vector3(-450, 250, -550)
  ];
  galaxies.forEach((g, i) => {
    const galaxy = create3DGalaxy(g);
    galaxy.position.copy(galaxyPositions[i]);
    galaxy.userData = { bodyIndex: ALL_BODIES.indexOf(g) };
    scene.add(galaxy);
    galaxyObjects.push({ galaxy, data: g });
  });
  setProgress(95, 'final calibration'); await yieldFrame();
  buildNav();
  container.addEventListener('mousedown', e => { isDragging = true; lastMouse = { x: e.clientX, y: e.clientY }; vel = { t:0, p:0 }; });
  window.addEventListener('mousemove', e => {
    mouseNDC.x = (e.clientX/innerWidth)*2-1; mouseNDC.y = -(e.clientY/innerHeight)*2+1;
    if (!isDragging) return;
    const dx = e.clientX - lastMouse.x, dy = e.clientY - lastMouse.y;
    camTheta -= dx * 0.005; camPhi = Math.max(0.1, Math.min(Math.PI-0.1, camPhi - dy*0.005));
    vel.t = -dx*0.005; vel.p = -dy*0.005;
    lastMouse = { x: e.clientX, y: e.clientY };
  });
  window.addEventListener('mouseup', () => isDragging = false);
  container.addEventListener('wheel', e => { e.preventDefault(); camDist = Math.max(5, Math.min(2000, camDist*(1+e.deltaY*0.001))); }, { passive: false });
  container.addEventListener('touchstart', e => { if (e.touches.length === 1) { isDragging = true; lastMouse = { x: e.touches[0].clientX, y: e.touches[0].clientY }; } });
  container.addEventListener('touchmove', e => { if (!isDragging || e.touches.length !== 1) return; e.preventDefault(); const dx = e.touches[0].clientX - lastMouse.x, dy = e.touches[0].clientY - lastMouse.y; camTheta -= dx * 0.005; camPhi = Math.max(0.1, Math.min(Math.PI-0.1, camPhi - dy*0.005)); lastMouse = { x: e.touches[0].clientX, y: e.touches[0].clientY }; }, { passive: false });
  container.addEventListener('touchend', () => isDragging = false);
  container.addEventListener('click', () => {
    raycaster.setFromCamera(mouseNDC, camera);
    const meshes = bodyObjects.map(b => b.mesh);
    const galaxyMeshes = [];
    galaxyObjects.forEach(g => {
      g.galaxy.traverse(child => {
        if (child.isMesh || child.isPoints) {
          child.userData.bodyIndex = g.galaxy.userData.bodyIndex;
          galaxyMeshes.push(child);
        }
      });
    });
    if (milkyWayGroup) {
      milkyWayGroup.traverse(child => {
        if (child.isMesh || child.isPoints) {
          child.userData.bodyIndex = milkyWayGroup.userData.bodyIndex;
          galaxyMeshes.push(child);
        }
      });
    }
    if (sunMarker3D && sunMarker3D.visible) {
      galaxyMeshes.push(sunMarker3D);
      sunMarker3D.userData.bodyIndex = milkyWayGroup.userData.bodyIndex;
    }
    const hits = raycaster.intersectObjects([...meshes, ...galaxyMeshes]);
    if (hits.length > 0) showBody(hits[0].object.userData.bodyIndex);
  });
  document.getElementById('next').addEventListener('click', () => navigateNext());
  document.getElementById('prev').addEventListener('click', () => navigatePrev());
  window.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight') navigateNext();
    if (e.key === 'ArrowLeft') navigatePrev();
    if (e.key === 'Escape') closeInfo();
  });
  document.getElementById('view-planets').addEventListener('click', () => switchView('planets'));
  document.getElementById('view-dwarfs').addEventListener('click', () => switchView('dwarfs'));
  document.getElementById('view-milkyway').addEventListener('click', () => switchView('milkyway'));
  document.getElementById('view-galaxies').addEventListener('click', () => switchView('galaxies'));
  const clock = new THREE.Clock();
  function animate() {
    requestAnimationFrame(animate);
    const t = clock.elapsedTime;
    sun.rotation.y += 0.001;
    sunGlow.scale.setScalar(35 + Math.sin(t*2)*1.5);
    corona.scale.setScalar(70 + Math.sin(t*1.5)*3);
    bodyObjects.forEach(b => {
      b.wrapper.userData.angle += b.data.orbitSpeed;
      const a = b.wrapper.userData.angle;
      b.wrapper.position.x = Math.cos(a) * b.data.distance;
      b.wrapper.position.z = Math.sin(a) * b.data.distance;
      b.mesh.rotation.y += b.data.rotationSpeed;
      if (b.wrapper.userData.clouds) b.wrapper.userData.clouds.rotation.y += 0.002;
      if (b.wrapper.userData.moons) {
        b.wrapper.userData.moons.forEach(moon => {
          moon.userData.angle += moon.userData.orbitSpeed;
          const ma = moon.userData.angle;
          moon.position.x = Math.cos(ma) * moon.userData.orbitDistance;
          moon.position.z = Math.sin(ma) * moon.userData.orbitDistance;
          moon.position.y = Math.sin(ma * 0.3) * 0.3;
        });
      }
    });
    galaxyObjects.forEach(g => { g.galaxy.rotation.y += g.data.rotationSpeed; });
    if (milkyWayGroup) milkyWayGroup.rotation.y += 0.00008;
    if (sunMarker3D && sunMarker3D.visible) {
      const pulse = 1 + Math.sin(t * 2) * 0.2;
      sunMarker3D.scale.setScalar(pulse);
    }
    asteroidBelt.forEach(belt => {
      const positions = belt.geometry.attributes.position.array;
      for (let i = 0; i < positions.length / 3; i++) {
        const angle = Math.atan2(positions[i*3+2], positions[i*3]); const newAngle = angle + 0.0002; const dist = Math.sqrt(positions[i*3]**2 + positions[i*3+2]**2);
        positions[i*3] = Math.cos(newAngle) * dist; positions[i*3+2] = Math.sin(newAngle) * dist;
      }
      belt.geometry.attributes.position.needsUpdate = true;
    });
    if (!isDragging) { vel.t *= 0.95; camTheta += vel.t * 0.3; }
    if (current >= 0 && current < ALL_BODIES.length) {
      const body = ALL_BODIES[current];
      if (body.type === 'galaxy' || body.type === 'homegalaxy') {
        if (body.type === 'homegalaxy' && milkyWayGroup) {
          camTarget.lerp(milkyWayGroup.position, 0.06);
        } else {
          const go = galaxyObjects.find(g => g.data.name === body.name);
          if (go) camTarget.lerp(go.galaxy.position, 0.06);
        }
      } else {
        const bo = bodyObjects.find(b => b.data.name === body.name);
        if (bo) camTarget.lerp(bo.wrapper.position, 0.06);
      }
    }
    camera.position.x = camTarget.x + camDist * Math.sin(camPhi) * Math.sin(camTheta);
    camera.position.y = camTarget.y + camDist * Math.cos(camPhi);
    camera.position.z = camTarget.z + camDist * Math.sin(camPhi) * Math.cos(camTheta);
    camera.lookAt(camTarget);
    camLight.position.copy(camera.position).normalize().multiplyScalar(50);
    camLight.target.position.copy(camTarget); camLight.target.updateMatrixWorld();
    updateSunMarker();
    composer.render();
  }
  setProgress(100, 'ready'); await yieldFrame();
  setTimeout(() => {
    document.getElementById('loading').classList.remove('visible');
    container.classList.add('ready');
    document.querySelector('.vignette').classList.add('ready');
    document.querySelector('.grain').classList.add('ready');
    document.querySelector('.masthead').classList.add('ready');
    document.querySelector('.bottom-bar').classList.add('ready');
    document.querySelector('.hint').classList.add('ready');
    document.getElementById('view-toggle').classList.add('ready');
    switchView('planets');
    animate();
  }, 400);
}

function updateSunMarker() {
  const marker = document.getElementById('sun-marker');
  if (!sunMarker3D || !sunMarker3D.visible) {
    marker.style.display = 'none';
    return;
  }
  const pos = sunMarker3D.position.clone();
  pos.project(camera);
  if (pos.z < 1 && pos.z > -1) {
    const x = (pos.x * 0.5 + 0.5) * innerWidth;
    const y = (-pos.y * 0.5 + 0.5) * innerHeight;
    marker.style.display = 'block';
    marker.style.left = (x - 5) + 'px';
    marker.style.top = (y - 5) + 'px';
  } else {
    marker.style.display = 'none';
  }
}

function getVisibleBodies() {
  if (currentView === 'planets') return ALL_BODIES.filter(b => b.type === 'planet');
  if (currentView === 'dwarfs') return ALL_BODIES.filter(b => b.type === 'dwarf');
  if (currentView === 'milkyway') return ALL_BODIES.filter(b => b.type === 'homegalaxy');
  if (currentView === 'galaxies') return ALL_BODIES.filter(b => b.type === 'galaxy');
  return ALL_BODIES;
}

function buildNav() {
  const navEl = document.getElementById('planet-nav');
  navEl.innerHTML = '';
  const bodies = getVisibleBodies();
  bodies.forEach((b, i) => {
    const btn = document.createElement('button');
    btn.innerHTML = `<div class="orb" style="width:${b.dotSize}px;height:${b.dotSize}px;background:${b.color}"></div>`;
    btn.addEventListener('click', () => { current = ALL_BODIES.indexOf(b); showBody(current); });
    navEl.appendChild(btn);
  });
}

function switchView(view) {
  currentView = view;
  document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
  document.getElementById(`view-${view}`).classList.add('active');
  bodyObjects.forEach(b => {
    const visible = (view === 'planets' && b.data.type === 'planet') || (view === 'dwarfs' && b.data.type === 'dwarf');
    b.wrapper.visible = visible;
    b.orbitLine.visible = visible;
  });
  asteroidBelt.forEach(belt => { belt.visible = (view === 'planets' || view === 'dwarfs' || view === 'milkyway'); });
  if (milkyWayGroup) { milkyWayGroup.visible = (view === 'milkyway'); }
  if (sunMarker3D) { sunMarker3D.visible = (view === 'milkyway'); }
  galaxyObjects.forEach(g => { g.galaxy.visible = view === 'galaxies'; });
  if (view === 'milkyway') {
    camDist = 1000;
    camPhi = Math.PI / 2.5;
    camTarget.set(-300, 0, -150);
  } else if (view === 'galaxies') {
    camDist = 300;
    camPhi = Math.PI / 3;
    camTarget.set(0, 0, 0);
  } else if (view === 'dwarfs') {
    camDist = 150;
    camTarget.set(0, 0, 0);
  } else {
    camDist = 80;
    camTarget.set(0, 0, 0);
  }
  buildNav();
  const bodies = getVisibleBodies();
  if (bodies.length > 0) {
    current = ALL_BODIES.indexOf(bodies[0]);
    showBody(current);
  }
  document.getElementById('tot').textContent = String(bodies.length).padStart(2, '0');
}

function navigateNext() {
  const bodies = getVisibleBodies();
  const currentInList = bodies.findIndex(b => ALL_BODIES.indexOf(b) === current);
  const next = (currentInList + 1) % bodies.length;
  current = ALL_BODIES.indexOf(bodies[next]);
  showBody(current);
}

function navigatePrev() {
  const bodies = getVisibleBodies();
  const currentInList = bodies.findIndex(b => ALL_BODIES.indexOf(b) === current);
  const prev = (currentInList - 1 + bodies.length) % bodies.length;
  current = ALL_BODIES.indexOf(bodies[prev]);
  showBody(current);
}

function showBody(index) {
  if (transitioning || index < 0 || index >= ALL_BODIES.length) return;
  transitioning = true;
  current = index;
  const d = ALL_BODIES[current];
  if (d.type === 'homegalaxy') {
    if (milkyWayGroup) {
      camTarget.copy(milkyWayGroup.position);
      camDist = d.galaxySize * 1.5;
    }
  } else if (d.type === 'galaxy') {
    const go = galaxyObjects.find(g => g.data.name === d.name);
    if (go) { camTarget.copy(go.galaxy.position); camDist = d.galaxySize * 2; }
  } else {
    const bo = bodyObjects.find(b => b.data.name === d.name);
    if (bo) { camTarget.copy(bo.wrapper.position); camDist = d.radius * 6 + 10; }
  }
  const el = document.getElementById('planet-info');
  el.classList.remove('visible');
  setTimeout(() => {
    document.getElementById('pi-chapter').textContent = d.chapter;
    document.getElementById('pi-name').textContent = d.name;
    document.getElementById('pi-epigraph').textContent = d.epigraph;
    document.getElementById('pi-prose').innerHTML = `<span class="dropcap">${d.prose[0]}</span>${d.prose.slice(1)}`;
    document.getElementById('pi-data').innerHTML = d.data.map(x => `<div class="datum"><div class="label">${x.label}</div><div class="value">${x.value}<span class="unit">${x.unit}</span></div></div>`).join('');
    el.classList.add('visible');
    const bodies = getVisibleBodies();
    const currentInList = bodies.findIndex(b => ALL_BODIES.indexOf(b) === current);
    document.getElementById('cur').textContent = String(currentInList + 1).padStart(2, '0');
    document.querySelectorAll('.planet-nav button').forEach((b, i) => b.classList.toggle('active', i === currentInList));
    setTimeout(() => transitioning = false, 800);
  }, 400);
}

window.closeInfo = function() {
  document.getElementById('planet-info').classList.remove('visible');
  if (currentView === 'milkyway') {
    camTarget.set(-300, 0, -150);
    camDist = 1000;
  } else if (currentView === 'galaxies') {
    camTarget.set(0, 0, 0);
    camDist = 300;
  } else if (currentView === 'dwarfs') {
    camTarget.set(0, 0, 0);
    camDist = 150;
  } else {
    camTarget.set(0, 0, 0);
    camDist = 80;
  }
  camPhi = Math.PI/3;
  document.querySelectorAll('.planet-nav button').forEach(b => b.classList.remove('active'));
};

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