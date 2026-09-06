'use strict';
(() => {
  const card=document.getElementById('portraitCard');
  if(!card)return;
  const stage=document.getElementById('portraitStage');
  const reset=document.getElementById('portraitReset');
  const status=document.getElementById('portraitStatus');
  const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
  let x=0,y=0,drag=null,frame=null;
  function paint(){
    frame=null;
    card.style.setProperty('--photo-x',`${x}deg`);
    card.style.setProperty('--photo-y',`${y}deg`);
    card.style.setProperty('--shadow-x',`${-y*.5}px`);
    card.style.setProperty('--shadow-y',`${18+x*.35}px`);
    card.style.setProperty('--shine-x',`${50+y}%`);
    card.style.setProperty('--shine-y',`${30-x}%`);
  }
  function update(){if(frame===null)frame=requestAnimationFrame(paint);}
  function announce(){status.textContent=x===0&&y===0?'Foto centralizada.':`Inclinação vertical: ${Math.round(x)} graus. Horizontal: ${Math.round(y)} graus.`;}
  function end(){
    if(!drag)return;
    const id=drag.id;drag=null;card.classList.remove('dragging');
    if(card.hasPointerCapture(id))card.releasePointerCapture(id);
    announce();
  }
  function center(){end();x=0;y=0;update();announce();}
  card.addEventListener('pointerdown',event=>{
    if(event.button!==0||!event.isPrimary||drag)return;
    const rect=stage.getBoundingClientRect();
    drag={id:event.pointerId,startX:event.clientX,startY:event.clientY,baseX:x,baseY:y,width:rect.width,height:rect.height};
    card.setPointerCapture(event.pointerId);card.classList.add('dragging');
    card.focus({preventScroll:true});
  });
  card.addEventListener('pointermove',event=>{
    if(!drag||event.pointerId!==drag.id)return;
    y=clamp(drag.baseY+(event.clientX-drag.startX)/Math.max(drag.width,1)*70,-32,32);
    x=clamp(drag.baseX-(event.clientY-drag.startY)/Math.max(drag.height,1)*60,-25,25);
    update();
  });
  card.addEventListener('pointerup',event=>{if(event.pointerId===drag?.id)end();});
  card.addEventListener('pointercancel',event=>{if(event.pointerId===drag?.id)end();});
  card.addEventListener('lostpointercapture',end);
  card.addEventListener('keydown',event=>{
    const step=event.shiftKey?8:4;
    if(event.key==='Home'||event.key==='Escape'){event.preventDefault();center();return;}
    if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key))return;
    event.preventDefault();
    if(event.key==='ArrowLeft')y=clamp(y-step,-32,32);
    if(event.key==='ArrowRight')y=clamp(y+step,-32,32);
    if(event.key==='ArrowUp')x=clamp(x+step,-25,25);
    if(event.key==='ArrowDown')x=clamp(x-step,-25,25);
    update();announce();
  });
  reset.addEventListener('click',center);
  card.addEventListener('dblclick',center);
  addEventListener('blur',end);
  paint();
})();
