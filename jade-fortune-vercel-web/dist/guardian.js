// Render the source sprite sheet with a chroma-key material in the game.
// The supplied artwork stays unchanged; only the live canvas has transparent pixels.
(()=>{
 const canvas=document.getElementById('dragon-sprite'),context=canvas.getContext('2d');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const videos=Object.fromEntries(['idle','focus','happy','extreme'].map(name=>{
  const video=document.createElement('video');
  video.muted=true;video.defaultMuted=true;video.loop=name==='idle';video.playsInline=true;video.preload='auto';video.setAttribute('playsinline','');video.src=`dragon-${name}.mp4`;
  return [name,video];
 }));
 const buffer=document.createElement('canvas');buffer.width=384;buffer.height=384;const bc=buffer.getContext('2d',{willReadFrequently:true});
 const previous=document.createElement('canvas');previous.width=canvas.width;previous.height=canvas.height;
 const pc=previous.getContext('2d');
 let finishReaction=()=>{},reactionTimeout;
 let mediaTime=-1,hasVideo=false,transitionPending=false,blendStarted=-1;
 function snapshot(){pc.clearRect(0,0,previous.width,previous.height);pc.drawImage(canvas,0,0);transitionPending=hasVideo;blendStarted=-1;}

 function resumeVideo(){
  for(const [name,video] of Object.entries(videos)){
   if(name===state&&!reduced.matches&&!document.hidden&&!video.ended)video.play().then(()=>{video.playFailed=false;}).catch(()=>{video.playFailed=true;});
   else video.pause();
  }
 }
 function paintVideo(now){
  const video=videos[state];
  if(video.playFailed)return false;
  if(video.readyState<2||video.seeking)return hasVideo&&!video.error&&now-started<2000;
  document.getElementById('dragon').classList.add('video-idle');
  const frameTime=Math.floor(video.currentTime*24);
  if(transitionPending){blendStarted=now;transitionPending=false;}
  if(mediaTime===frameTime&&blendStarted<0)return true;
  if(mediaTime!==frameTime){mediaTime=frameTime;
  bc.drawImage(video,0,0,384,384);
  const frame=bc.getImageData(0,0,384,384),d=frame.data;
  const a=(2*384+2)*4,b=(2*384+381)*4;const bg=[0,1,2].map(c=>(d[a+c]+d[b+c])/2);
  window.removeGray(d,bg);bc.putImageData(frame,0,0);}
  context.clearRect(0,0,canvas.width,canvas.height);context.drawImage(buffer,0,0,canvas.width,canvas.height);
  if(blendStarted>=0){const alpha=Math.max(0,1-(now-blendStarted)/160);context.globalAlpha=alpha;context.drawImage(previous,0,0);context.globalAlpha=1;if(!alpha)blendStarted=-1;}
  hasVideo=true;return true;
 }
 let sheet,frameWidth,frameHeight,state='idle',started=performance.now(),last=-1,raf;
 function frameAt(now){
  if(reduced.matches)return {idle:0,focus:2,happy:4,extreme:6}[state];
  const elapsed=(now-started)/1000;
  if(state==='idle'){const phase=elapsed%5.2;return phase>4.85&&phase<5.02?1:0;}
  if(state==='focus')return 2+(elapsed%1.2>.6?1:0);
  if(state==='happy')return 4+(elapsed%.8>.25&&elapsed%.8<.6?1:0);
  return 6+(elapsed%.65>.2&&elapsed%.65<.5?1:0);
 }
 function paint(now){
  if(!reduced.matches&&paintVideo(now))return;
  document.getElementById('dragon').classList.remove('video-idle');hasVideo=false;transitionPending=false;blendStarted=-1;
  if(!sheet)return;
  if(mediaTime!==-1){mediaTime=-1;last=-1;}
  const frame=frameAt(now);if(frame===last)return;last=frame;
  context.clearRect(0,0,canvas.width,canvas.height);
  context.drawImage(sheet,frame%4*frameWidth,Math.floor(frame/4)*frameHeight,frameWidth,frameHeight,0,0,canvas.width,canvas.height);
 }
 function tick(now){if(!document.hidden)paint(now);raf=requestAnimationFrame(tick);}
 window.guardian={setState(next){if(!['idle','focus','happy','extreme'].includes(next))return;finishReaction();clearTimeout(reactionTimeout);snapshot();state=next;videos[next].currentTime=0;started=performance.now();last=-1;mediaTime=-1;resumeVideo();paint(started);
  return new Promise(resolve=>{finishReaction=resolve;if(!reduced.matches&&(next==='happy'||next==='extreme'))reactionTimeout=setTimeout(resolve,next==='happy'?4800:6200);else resolve();});
 }};
 const image=new Image();
 image.onload=()=>{
  sheet=document.createElement('canvas');sheet.width=image.naturalWidth;sheet.height=image.naturalHeight;
  const ctx=sheet.getContext('2d',{willReadFrequently:true});ctx.drawImage(image,0,0);
  const pixels=ctx.getImageData(0,0,sheet.width,sheet.height),d=pixels.data;
  for(let i=0;i<d.length;i+=4){const dominance=Math.min(d[i],d[i+2])-d[i+1];if(d[i]>100&&d[i+2]>100&&dominance>20)d[i+3]=Math.round(d[i+3]*Math.max(0,1-(dominance-20)/40));}
  ctx.putImageData(pixels,0,0);frameWidth=sheet.width/4;frameHeight=sheet.height/2;
  paint(performance.now());
 };
 image.src='dragon-expressions.webp';
 if(!reduced.matches)raf=requestAnimationFrame(tick);
 for(const [name,video] of Object.entries(videos))video.addEventListener('ended',()=>{if(state===name){clearTimeout(reactionTimeout);finishReaction();}});
 for(const video of Object.values(videos))video.addEventListener('loadeddata',()=>{mediaTime=-1;last=-1;resumeVideo();paint(performance.now());});
 document.addEventListener('pointerdown',resumeVideo,{passive:true});
 reduced.addEventListener('change',()=>{cancelAnimationFrame(raf);last=-1;mediaTime=-1;resumeVideo();paint(performance.now());if(!reduced.matches)raf=requestAnimationFrame(tick);});
 document.addEventListener('visibilitychange',()=>{resumeVideo();if(!document.hidden){mediaTime=-1;last=-1;paint(performance.now());}});
})();
