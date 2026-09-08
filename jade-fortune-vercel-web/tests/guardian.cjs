const vm=require('node:vm'),fs=require('node:fs'),assert=require('node:assert/strict');
const videos=[],events={},raf=[],classes=new Set();let now=0,reads=0;
const reduced={matches:false,addEventListener(n,fn){this.change=fn}};
const ctx={globalAlpha:1,drawImage(){},clearRect(){},getImageData(){reads++;return {data:new Uint8ClampedArray(384*384*4)}},putImageData(){}};
const canvas={width:448,height:448,getContext:()=>ctx};
const document={hidden:false,getElementById:id=>id==='dragon'?{classList:{add:s=>classes.add(s),remove:s=>classes.delete(s)}}:canvas,addEventListener:(n,f)=>events[n]=f,createElement:tag=>{if(tag==='canvas')return {...canvas};const v={currentTime:0,readyState:2,ended:false,play(){this.playing=true;return Promise.resolve()},pause(){this.playing=false},setAttribute(){},events:{},addEventListener(n,f){this.events[n]=f}};videos.push(v);return v;}};
const sandbox={setTimeout:()=>1,clearTimeout(){},document,matchMedia:()=>reduced,performance:{now:()=>now},window:{removeGray(){}},Image:class{},requestAnimationFrame:f=>{raf.push(f);return raf.length},cancelAnimationFrame(){}};
vm.runInNewContext(fs.readFileSync('dist/guardian.js','utf8'),sandbox);
assert.equal(raf.length,1,'video loop starts even if fallback image never loads');
const tick=t=>{now=t;raf.shift()(t)};
sandbox.window.guardian.setState('idle');assert(classes.has('video-idle'));const first=reads;
videos[0].currentTime=.005;tick(10);assert.equal(reads,first,'same 24fps bucket is not keyed twice');
videos[1].seeking=true;sandbox.window.guardian.setState('focus');tick(20);assert(classes.has('video-idle'),'retain current video while next seeks');
videos[1].seeking=false;tick(40);tick(220);assert.equal(ctx.globalAlpha,1);
for(const [i,state] of ['idle','focus','happy','extreme'].entries()){videos[i].currentTime=1;sandbox.window.guardian.setState(state);assert.equal(videos[i].currentTime,0);assert(videos[i].playing);assert(videos.every((v,j)=>j===i||!v.playing));assert.equal(videos[i].loop,i===0);}
document.hidden=true;events.visibilitychange();assert(videos.every(v=>!v.playing));document.hidden=false;events.visibilitychange();assert(videos[3].playing);
reduced.matches=true;reduced.change();assert(videos.every(v=>!v.playing));assert(!classes.has('video-idle'));
const count=raf.length;reduced.matches=false;reduced.change();assert.equal(raf.length,count+1,'render loop restarts when reduced motion is disabled');
const {evaluate}=require('../dist/game.js');assert.equal(evaluate([[0,1,2],[0,3,4],[0,5,6],[7,1,2],[7,3,4]],20).total,20);
assert.equal(evaluate([[9,1,2],[9,3,4],[9,5,6],[7,1,2],[7,3,4]],20).scatters,3);
console.log('PASS: independent loop, frame processing cap, seek continuity, state interruption, visibility, reduced motion, payout fixtures');

(async()=>{let completed=false;const reaction=sandbox.window.guardian.setState('happy');reaction.then(()=>completed=true);await Promise.resolve();assert.equal(completed,false,'reaction awaits playback completion');videos[2].events.ended();await reaction;assert.equal(completed,true);const interrupted=sandbox.window.guardian.setState('extreme');sandbox.window.guardian.setState('focus');await interrupted;console.log('PASS: completion event and manual interruption resolve reaction wait');})().catch(e=>{console.error(e);process.exitCode=1});
