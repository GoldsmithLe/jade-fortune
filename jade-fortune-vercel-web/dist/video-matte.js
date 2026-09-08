// Live video compositing: key the neutral background while retaining colored scales and bright ivory.
(function(root){
 function removeGray(data,bg){
  for(let i=0;i<data.length;i+=4){
   const distance=Math.max(Math.abs(data[i]-bg[0]),Math.abs(data[i+1]-bg[1]),Math.abs(data[i+2]-bg[2]));
   const alpha=Math.max(0,Math.min(1,(distance-12)/20));
   if(alpha===0){data[i+3]=0;continue;}
   if(alpha<1){for(let c=0;c<3;c++)data[i+c]=Math.max(0,Math.min(255,(data[i+c]-bg[c]*(1-alpha))/alpha));}
   data[i+3]=Math.round(255*alpha);
  }
  return data;
 }
 if(typeof module!=='undefined')module.exports={removeGray};else root.removeGray=removeGray;
})(typeof window!=='undefined'?window:globalThis);
