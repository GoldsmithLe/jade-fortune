
const NAMES=['Jade dragon seal','Ivory lotus','Silk lantern','Jade ingot','Ace','King','Queen','Jack','Wild','Scatter'];
const WEIGHTS=[6,8,10,12,14,14,14,14,4,3];
const PAYS=[[20,60,200],[15,40,120],[10,30,80],[8,20,60],[5,12,30],[5,12,30],[5,12,30],[5,12,30]];
const LINES=[[1,1,1,1,1],[0,0,0,0,0],[2,2,2,2,2],[0,1,2,1,0],[2,1,0,1,2],[0,0,1,2,2],[2,2,1,0,0],[1,0,0,0,1],[1,2,2,2,1],[0,1,1,1,0],[2,1,1,1,2],[1,0,1,2,1],[1,2,1,0,1],[0,1,0,1,0],[2,1,2,1,2],[1,1,0,1,1],[1,1,2,1,1],[0,2,0,2,0],[2,0,2,0,2],[0,2,2,2,0]];
function evaluate(grid,bet){let total=0;const cells=new Set();let wins=0;for(const line of LINES){let best=0,bestCount=0;for(let s=0;s<8;s++){let n=0;while(n<5&&(grid[n][line[n]]===s||grid[n][line[n]]===8))n++;const pay=n>=3?PAYS[s][n-3]*bet/20:0;if(pay>best){best=pay;bestCount=n;}}if(best){total+=best;wins++;for(let c=0;c<bestCount;c++)cells.add(c+':'+line[c]);}}return {total:Math.round(total*100)/100,cells,wins,scatters:grid.flat().filter(s=>s===9).length};}
function randomSymbol(){const a=new Uint32Array(1);crypto.getRandomValues(a);let n=a[0]/4294967296*WEIGHTS.reduce((a,b)=>a+b,0);for(let i=0;i<WEIGHTS.length;i++){n-=WEIGHTS[i];if(n<0)return i;}return 7;}
if(typeof module!=='undefined')module.exports={evaluate,LINES};
if(typeof document!=='undefined'){
const $=id=>document.getElementById(id),fmt=n=>n.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});
const bets=[10,20,40,100,200];let bi=1,balance=10000,free=0,freeBet=20,busy=false,turbo=false,sound=false,audio;
let autoActive=false,autoRemaining=0,autoTimer,winPause=0,autoGeneration=0,reactionDone=Promise.resolve();
function stopAuto(){autoGeneration++;autoActive=false;autoRemaining=0;clearTimeout(autoTimer);sync();}
function queueAuto(){if(autoActive&&(autoRemaining>0||free>0)&&(free>0||balance>=bets[bi])){const generation=autoGeneration;const pause=new Promise(resolve=>{autoTimer=setTimeout(resolve,Math.max(winPause,turbo?350:850));});Promise.all([pause,reactionDone]).then(()=>{if(autoActive&&generation===autoGeneration)spin();});}else if(autoActive)stopAuto();}
let grid=[[0,4,2],[1,7,3],[8,0,6],[3,5,1],[9,2,4]];
function cellHTML(s){return '<span class="symbol-art" style="--sx:'+(s%5*25)+'%;--sy:'+(s<5?0:100)+'%" aria-hidden="true"></span>'+(s===8?'<span class="special">WILD</span>':s===9?'<span class="special">SCATTER</span>':'');}
const motionPreference=window.matchMedia('(prefers-reduced-motion: reduce)');
let reduceMotion=motionPreference.matches;
motionPreference.addEventListener('change',e=>{reduceMotion=e.matches;if(reduceMotion)clearEffects();});
let dragonTimer;
function setDragon(state,hold=0){
 clearTimeout(dragonTimer);
 $('dragon').dataset.state=state;reactionDone=Promise.resolve(window.guardian?.setState(state));
 $('dragon').setAttribute('aria-label',({idle:'Jade guardian resting',focus:'Jade guardian watching the reels',happy:'Jade guardian celebrating a win',extreme:'Jade guardian celebrating a big reward'})[state]);
 if(hold){const currentReaction=reactionDone;dragonTimer=setTimeout(()=>{currentReaction.then(()=>{if(!busy&&reactionDone===currentReaction)setDragon('idle');});},hold);}
}
let isFreeRound=false,fxTimers=[];
function clearEffects(){fxTimers.forEach(clearTimeout);fxTimers=[];$('effects').replaceChildren();$('cabinet').classList.remove('celebrating','scatter-award','has-win');}
function burst(kind,cells=new Set()){
 if(reduceMotion)return;
 const stage=$('cabinet').getBoundingClientRect(),target=$('lastwin').getBoundingClientRect();
 const anchors=[...cells].map(k=>$('cell'+k.replace(':','-')).getBoundingClientRect());
 if(!anchors.length){document.querySelectorAll('.s9').forEach(el=>anchors.push(el.getBoundingClientRect()));}
 if(!anchors.length)return;
 const perCell=Math.max(3,Math.min(8,Math.floor(64/anchors.length)));
 anchors.forEach((rect,a)=>{
  const x=rect.left-stage.left+rect.width/2,y=rect.top-stage.top+rect.height/2;
  const ring=document.createElement('i');ring.className='hit-ring';ring.style.left=x+'px';ring.style.top=y+'px';ring.style.width=ring.style.height=Math.min(rect.width,rect.height)*.8+'px';$('effects').append(ring);
  for(let i=0;i<perCell;i++){
   const p=document.createElement('i');const trail=i%3===0&&kind!=='scatter';p.className='mote '+kind+(trail?' win-trail':'');
   const angle=2*Math.PI*i/perCell+a*.3,distance=35+Math.random()*60;
   p.style.setProperty('--x',x+'px');p.style.setProperty('--y',y+'px');
   p.style.setProperty('--dx',(trail?target.left-stage.left+target.width/2-x:Math.cos(angle)*distance)+'px');
   p.style.setProperty('--dy',(trail?target.top-stage.top+target.height/2-y:Math.sin(angle)*distance)+'px');
   p.style.setProperty('--delay',(a*.025+Math.random()*.15)+'s');$('effects').append(p);
  }
 });
 fxTimers.push(setTimeout(()=>$('effects').replaceChildren(),2300));
}


function render(){ $('reels').innerHTML=grid.map((col,c)=>'<div class="reel" id="reel'+c+'">'+col.map((s,r)=>'<div class="cell s'+s+'" id="cell'+c+'-'+r+'" aria-label="Reel '+(c+1)+', row '+(r+1)+': '+NAMES[s]+'">'+cellHTML(s)+'</div>').join('')+'</div>').join('');}
function sync(){$('cabinet').classList.toggle('free-scene',free>0||isFreeRound);$('spin').classList.toggle('auto-running',autoActive);$('auto').classList.toggle('auto-running',autoActive); $('balance').textContent=fmt(balance);$('bet').textContent=fmt(free?freeBet:bets[bi]);$('minus').disabled=busy||autoActive||free>0||bi===0;$('plus').disabled=busy||autoActive||free>0||bi===bets.length-1;$('spin').disabled=autoActive?false:busy||(!free&&balance<bets[bi]);$('reset').disabled=busy;$('mode').textContent=free?'FREE SPINS · '+free+' LEFT':'BASE GAME';$('spin-label').textContent=autoActive?'STOP':free?'FREE':'SPIN';$('auto-icon').textContent=autoActive?'□':'▷';$('auto-label').textContent=autoActive?String(autoRemaining):'AUTO';$('auto').setAttribute('aria-label',autoActive?'Stop autoplay':'Configure autoplay');$('spin').setAttribute('aria-label',autoActive?'Stop autoplay':'Spin reels');}
function tone(freq,duration=.12){if(!sound)return;try{audio??=new(window.AudioContext||window.webkitAudioContext)();audio.resume();const o=audio.createOscillator(),g=audio.createGain();o.type='sine';o.frequency.value=freq;g.gain.setValueAtTime(.055,audio.currentTime);g.gain.exponentialRampToValueAtTime(.001,audio.currentTime+duration);o.connect(g);g.connect(audio.destination);o.start();o.stop(audio.currentTime+duration);}catch{}}
const delay=ms=>new Promise(r=>setTimeout(r,ms));
async function spin(){if(busy||(!free&&balance<bets[bi]))return;busy=true;winPause=0;isFreeRound=free>0;clearEffects();$('cabinet').classList.add('spinning');setDragon('focus');const stake=free?freeBet:bets[bi];if(free)free--;else {balance-=stake;if(autoActive)autoRemaining--;}balance=Math.round(balance*100)/100;$('overlay').hidden=true;$('lastwin').textContent='0.00';$('result').textContent='The reels are turning…';render();sync();tone(180);
let revealedScatters=0;const outcome=Array.from({length:5},()=>Array.from({length:3},randomSymbol));
await Promise.all(outcome.map(async(col,c)=>{const reel=$('reel'+c);reel.classList.add('rolling');const tick=setInterval(()=>{reel.querySelectorAll('.cell').forEach(el=>el.innerHTML=cellHTML(randomSymbol()));},80);await delay(turbo?220+c*80:600+c*200);clearInterval(tick);reel.classList.remove('rolling','anticipating');reel.classList.add('landed');col.forEach((s,r)=>{const el=$('cell'+c+'-'+r);el.innerHTML=cellHTML(s);el.className='cell s'+s;el.setAttribute('aria-label','Reel '+(c+1)+', row '+(r+1)+': '+NAMES[s]);});revealedScatters+=col.filter(s=>s===9).length;if(revealedScatters>=2){for(let next=c+1;next<5;next++)$('reel'+next).classList.add('anticipating');}tone(270+c*65,.09);}));
$('cabinet').classList.remove('spinning');grid=outcome;const result=evaluate(grid,stake);balance=Math.round((balance+result.total)*100)/100;$('lastwin').textContent=fmt(result.total);result.cells.forEach(k=>{$('cell'+k.replace(':','-')).classList.add('winner');});if(result.scatters>=3){free+=8;freeBet=stake;$('cabinet').classList.add('scatter-award');burst('scatter');$('banner').textContent='✦ 8 FREE SPINS AWARDED ✦';}else $('banner').textContent=free?'FREE SPINS · EVERY SPIN IS A NEW CHANCE':'3 SCATTERS AWARD 8 FREE SPINS';
$('result').textContent=result.total?result.wins+' winning '+(result.wins===1?'line':'lines')+' · +'+fmt(result.total):result.scatters>=3?'The temple awards 8 free spins!':'No win this spin';
if(result.total>=stake*2){$('cabinet').classList.add('celebrating');$('win-title').textContent=result.total>=stake*10?'BIG WIN':'TEMPLE TREASURE';$('win-amount').textContent=fmt(result.total);fxTimers.push(setTimeout(()=>{$('overlay').hidden=false;},650));}
if(result.total){$('cabinet').classList.add('has-win');winPause=2800;if(result.scatters<3)burst(result.total>=stake*10?'big':'win',result.cells);tone(660,.3);setTimeout(()=>tone(880,.3),130);}if(result.scatters>=3||result.total>=stake*10)winPause=4200;busy=false;setDragon(result.scatters>=3||result.total>=stake*10?'extreme':result.total>0?'happy':'idle',result.scatters>=3||result.total>=stake*10?4200:result.total>0?2800:0);sync();if(!free&&balance<bets[bi])$('result').textContent='Lower your bet or reset demo credits';queueAuto();}
$('spin').onclick=()=>{if(autoActive)stopAuto();else spin();};$('minus').onclick=()=>{if(!busy&&!free&&!autoActive){bi=Math.max(0,bi-1);sync();}};$('plus').onclick=()=>{if(!busy&&!free&&!autoActive){bi=Math.min(bets.length-1,bi+1);sync();}};$('turbo').onclick=()=>{turbo=!turbo;$('turbo').setAttribute('aria-pressed',String(turbo));};$('sound').onclick=()=>{sound=!sound;$('sound').setAttribute('aria-label',sound?'Mute sound':'Enable sound');$('sound').style.color=sound?'#ffe291':'#fff4db';$('sound').textContent=sound?'♫':'♪';tone(440);};$('reset').onclick=()=>{if(busy)return;stopAuto();balance=10000;free=0;isFreeRound=false;clearEffects();setDragon('idle');$('lastwin').textContent='0.00';$('overlay').hidden=true;$('banner').textContent='3 SCATTERS AWARD 8 FREE SPINS';$('result').textContent='Demo balance restored';render();sync();};$('info').onclick=()=>{stopAuto();$('rules').showModal();};$('auto').onclick=()=>{if(autoActive){stopAuto();return;}if(!busy)$('autoplay').showModal();};document.querySelector('.close-auto').onclick=()=>$('autoplay').close();document.querySelectorAll('[data-count]').forEach(el=>el.onclick=()=>{autoRemaining=Number(el.dataset.count);autoActive=true;$('autoplay').close();sync();spin();});document.addEventListener('visibilitychange',()=>{if(document.hidden){stopAuto();clearTimeout(dragonTimer);}else if(!busy)setDragon('idle');});$('close').onclick=()=>$('rules').close();$('lines').innerHTML=LINES.map((l,i)=>'<div>'+(i+1)+': '+l.map(r=>['Top','Mid','Low'][r]).join(' · ')+'</div>').join('');document.addEventListener('keydown',e=>{if(e.code==='Space'&&!e.repeat&&!$('rules').open&&!$('autoplay').open&&!autoActive&&!['BUTTON','INPUT','SELECT','SUMMARY','A'].includes(document.activeElement.tagName)){e.preventDefault();spin();}});render();sync();}
