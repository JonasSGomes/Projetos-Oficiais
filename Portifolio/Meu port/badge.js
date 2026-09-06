'use strict';
(() => {
 const stage=document.getElementById('badgeStage');if(!stage)return;
 const body=document.getElementById('badgeBody'),canvas=document.getElementById('badgeRope');
 const ctx=canvas.getContext('2d');
 const flip=document.getElementById('badgeFlip'),status=document.getElementById('badgeStatus');
 let width=0,height=0,cardHeight=0,cardWidth=0,length=95,x=-38,y=0,vx=30,vy=0,angle=0,spin=0,depth=0,flipped=false,drag=null,brush=null,frame=null,last=0,visible=true;
 // This badge always uses physics, as requested; other page motion settings are independent.
 const physics=true;
 const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
 function measure(){const r=stage.getBoundingClientRect();width=r.width;height=r.height;cardHeight=body.offsetHeight;cardWidth=body.offsetWidth;length=Math.max(72,Math.min(112,height-cardHeight-45));const dpr=Math.min(devicePixelRatio||1,2);canvas.width=width*dpr;canvas.height=height*dpr;ctx?.setTransform(dpr,0,0,dpr,0,0);}
 function paint(){
   body.style.transform=`translate3d(${x}px,${y}px,0) rotate(${angle}deg) rotateY(${depth}deg)`;
   if(!ctx)return;ctx.clearRect(0,0,width,height);
   const anchorX=width/2,anchorY=12,bobX=anchorX+x,bobY=y+14;
   const distance=Math.hypot(x,bobY-anchorY),slack=Math.max(0,length-distance)*.7;
   ctx.lineCap='round';ctx.beginPath();ctx.moveTo(anchorX,anchorY);ctx.quadraticCurveTo(anchorX+x*.5-clamp(vx*.025,-12,12),(anchorY+bobY)/2+slack,bobX,bobY);ctx.strokeStyle='#342041';ctx.lineWidth=12;ctx.stroke();ctx.strokeStyle='#c8b1df';ctx.lineWidth=2;ctx.stroke();
 }
 function tick(time){frame=null;const dt=Math.min((time-last)/1000||.016,.032);last=time;
   if(physics){
     // A slack strap, a spring toward the hand, and independent angular inertia.
     for(let step=0;step<4;step++){const h=dt/4;const dist=Math.max(1,Math.hypot(x,y));const force=Math.max(0,dist-length)*75;
       let fx=-x/dist*force-vx*1.15,fy=850-y/dist*force-vy*1.15;
       if(drag){fx+=(drag.tx-x)*155-vx*15;fy+=(drag.ty-y)*155-vy*15;}
       vx=clamp(vx+fx*h,-800,800);vy=clamp(vy+fy*h,-650,650);x+=vx*h;y+=vy*h;
       const limit=Math.max(38,(width-cardWidth)/2+24);if(Math.abs(x)>limit){x=Math.sign(x)*limit;vx*=-.48;}
       const bottom=Math.max(length+850/75+4,height-cardHeight-18);if(y>bottom){y=bottom;vy=Math.min(0,-vy*.35);}if(y<18){y=18;vy=Math.max(0,-vy*.3);}
       const target=-Math.atan2(x,Math.max(y,25))*180/Math.PI*.38;
       spin+=((target-angle)*22-spin*2.2-fx*.045)*h;angle+=spin*h;
       if(Math.abs(angle)>33){angle=Math.sign(angle)*33;spin*=-.3;}
     }
     depth+=(clamp(vx*.025,-12,12)-depth)*Math.min(1,dt*7);
   }
   paint();const resting=!drag&&Math.abs(vx)+Math.abs(vy)<.45&&Math.abs(spin)<.2&&Math.abs(angle)<.12&&Math.abs(x)<.15;
   if(resting){x=0;y=length+850/75;vx=vy=angle=spin=depth=0;paint();}
   if(visible&&!document.hidden&&physics&&!resting)frame=requestAnimationFrame(tick);
 }
 function run(){if(frame===null&&visible&&!document.hidden){last=performance.now();frame=requestAnimationFrame(tick);}}
 function stop(){if(frame!==null)cancelAnimationFrame(frame);frame=null;}
 function clearDrag(){if(!drag)return;const id=drag.id;drag=null;body.classList.remove('dragging');if(body.hasPointerCapture(id))body.releasePointerCapture(id);}
 function center(){clearDrag();brush=null;x=0;y=length+850/75;vx=vy=angle=spin=depth=0;stop();paint();status.textContent='Crachá centralizado.';}
 function swing(direction=1){if(!physics){x=direction*20;angle=direction*-5;paint();return;}vx=clamp(vx+direction*360,-650,650);vy-=85;spin-=direction*60;run();}
 function turn(){flipped=!flipped;document.getElementById('badgeInner').classList.toggle('flipped',flipped);flip.setAttribute('aria-pressed',String(flipped));document.getElementById('badgeFront').setAttribute('aria-hidden',String(flipped));document.getElementById('badgeBack').setAttribute('aria-hidden',String(!flipped));status.textContent=flipped?'Verso do crachá.':'Frente do crachá.';}
 body.addEventListener('pointerenter',e=>{brush={x:e.clientX,time:performance.now()};});
 body.addEventListener('pointerleave',()=>brush=null);
 body.addEventListener('pointerdown',e=>{if(e.button!==0||!e.isPrimary||drag)return;const r=stage.getBoundingClientRect();brush=null;drag={id:e.pointerId,ox:e.clientX-r.left-width/2-x,oy:e.clientY-r.top-y,tx:x,ty:y,handVX:0,handVY:0,lastX:e.clientX,lastY:e.clientY,lastT:performance.now()};body.setPointerCapture(e.pointerId);body.classList.add('dragging');body.focus({preventScroll:true});run();});
 body.addEventListener('pointermove',e=>{
   const now=performance.now();
   if(!drag){if(e.pointerType==='mouse'&&brush&&physics){const dx=e.clientX-brush.x;if(Math.abs(dx)>1&&now-brush.time<100){vx=clamp(vx+dx*2,-260,260);spin=clamp(spin-dx*.34,-100,100);run();}brush={x:e.clientX,time:now};}return;}
   if(drag.id!==e.pointerId)return;
   const r=stage.getBoundingClientRect(),dt=Math.max(.012,(now-drag.lastT)/1000),limit=Math.max(38,(width-cardWidth)/2+24);
   drag.tx=clamp(e.clientX-r.left-width/2-drag.ox,-limit,limit);drag.ty=clamp(e.clientY-r.top-drag.oy,22,Math.max(length+850/75+4,height-cardHeight-18));
   drag.handVX=clamp((e.clientX-drag.lastX)/dt,-650,650);drag.handVY=clamp((e.clientY-drag.lastY)/dt,-450,450);
   drag.lastX=e.clientX;drag.lastY=e.clientY;drag.lastT=now;
   if(!physics){x=drag.tx;y=drag.ty;angle=-x*.1;paint();}else run();
 });
 function release(){if(!drag)return;if(physics&&performance.now()-drag.lastT<100){vx=clamp(vx+drag.handVX*.42,-700,700);vy=clamp(vy+drag.handVY*.25,-500,500);spin=clamp(spin-drag.handVX*.086,-150,150);}clearDrag();if(!physics){vx=vy=spin=0;paint();}else run();}
 for(const name of ['pointerup','pointercancel','lostpointercapture'])body.addEventListener(name,release);
 body.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown',' ','Home','Escape'].includes(e.key))e.preventDefault();if(e.key==='ArrowLeft')swing(-1);if(e.key==='ArrowRight')swing(1);if(e.key==='ArrowUp'||e.key==='ArrowDown')swing(e.key==='ArrowUp'?1:-1);if(e.key===' ')turn();if(e.key==='Home'||e.key==='Escape')center();});
 flip.addEventListener('click',turn);document.getElementById('badgeReset').addEventListener('click',center);
 new ResizeObserver(()=>{measure();if(!physics)center();else{y=Math.min(y,height-cardHeight-22);run();}}).observe(stage);
 new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible)run();else{release();stop();}}).observe(stage);
 document.addEventListener('visibilitychange',()=>{if(document.hidden){release();stop();}else run();});addEventListener('blur',release);
 measure();y=15;run();
})();
