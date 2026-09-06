'use strict';
/* Native WebGL: no dependencies, external models, or network requests. */
(() => {
  const canvas = document.getElementById('reactorCanvas');
  if (!canvas) return;
  const $ = id => document.getElementById(id);
  const hero = $('inicio');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const energy = $('reactorEnergy');
  const pause = $('reactorPause');
  const state = { shape:'orbit', palette:'violet', speed:0.35, paused:reduce.matches, x:-0.3, y:0.45, time:0, visible:true, lost:false };
  let gl;
  try { gl = canvas.getContext('webgl', { alpha:true, antialias:true, powerPreference:'low-power', preserveDrawingBuffer:false }); } catch { /* Accessible static fallback remains. */ }
  function fallback(message) {
    canvas.classList.remove('ready'); canvas.hidden = true;
    $('reactorFallback').hidden = false; $('reactorControls').hidden = true;
    $('reactorReset').hidden = true; $('reactorHint').textContent = message;
  }
  if (!gl) { fallback('Explore os projetos e conheça meu trabalho abaixo.'); return; }
  const vertex = `attribute vec3 aPosition; attribute vec3 aNormal;
    uniform mat4 uModel; uniform mat4 uProjection; uniform mat3 uNormal;
    varying vec3 vNormal; varying vec3 vWorld;
    void main(){vec4 p=uModel*vec4(aPosition,1.0);vWorld=p.xyz;vNormal=normalize(uNormal*aNormal);gl_Position=uProjection*vec4(p.xyz-vec3(0.0,0.0,7.4),1.0);}`;
  const fragment = `precision mediump float;varying vec3 vNormal;varying vec3 vWorld;uniform vec3 uColor;
    void main(){vec3 n=normalize(vNormal);vec3 l=normalize(vec3(-3.0,5.0,5.0)-vWorld);
    vec3 v=normalize(vec3(0.0,0.0,7.4)-vWorld);float diffuse=max(dot(n,l),0.0);
    float spec=pow(max(dot(n,normalize(l+v)),0.0),48.0);
    float rim=pow(1.0-max(dot(n,v),0.0),2.5);
    vec3 color=uColor*(0.30+0.68*diffuse)+vec3(0.95,0.92,1.0)*spec*0.58+uColor*rim*0.22;
    gl_FragColor=vec4(color,1.0);}`;
  function shader(type, source) {
    const result = gl.createShader(type); gl.shaderSource(result,source); gl.compileShader(result);
    if (!gl.getShaderParameter(result,gl.COMPILE_STATUS)) { gl.deleteShader(result); throw new Error('Shader unavailable'); }
    return result;
  }
  let program;
  try {
    const vs=shader(gl.VERTEX_SHADER,vertex), fs=shader(gl.FRAGMENT_SHADER,fragment);
    program=gl.createProgram(); gl.attachShader(program,vs);gl.attachShader(program,fs);gl.linkProgram(program);
    gl.deleteShader(vs); gl.deleteShader(fs);
    if (!gl.getProgramParameter(program,gl.LINK_STATUS)) throw new Error('Program unavailable');
  } catch { fallback('Explore os projetos e conheça meu trabalho abaixo.'); return; }
  gl.useProgram(program); gl.enable(gl.DEPTH_TEST); gl.clearColor(0,0,0,0);
  const uniforms=Object.fromEntries(['uModel','uProjection','uNormal','uColor'].map(n=>[n,gl.getUniformLocation(program,n)]));
  const position=gl.getAttribLocation(program,'aPosition'), normal=gl.getAttribLocation(program,'aNormal');
  gl.enableVertexAttribArray(position); gl.enableVertexAttribArray(normal);
  function mesh(sample, uSteps, vSteps) {
    const values=[];
    for(let u=0;u<uSteps;u++)for(let v=0;v<vSteps;v++) {
      for(const [du,dv] of [[0,0],[1,0],[1,1],[0,0],[1,1],[0,1]]) values.push(...sample((u+du)/uSteps,(v+dv)/vSteps));
    }
    const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(values),gl.STATIC_DRAW);
    return {buffer,count:values.length/6};
  }
  const tau=Math.PI*2;
  const torus=mesh((u,v)=>{const a=u*tau,b=v*tau,c=Math.cos(a),s=Math.sin(a),cb=Math.cos(b),sb=Math.sin(b);return [(1+0.31*cb)*c,(1+0.31*cb)*s,0.31*sb,cb*c,cb*s,sb];},64,20);
  const sphere=mesh((u,v)=>{const a=u*tau,b=v*Math.PI,x=Math.cos(a)*Math.sin(b),y=Math.cos(b),z=Math.sin(a)*Math.sin(b);return [x,y,z,x,y,z];},24,16);
  const box=(()=>{
    const data=[];
    const faces=[[[1,0,0],[[1,-1,-1],[1,1,-1],[1,1,1],[1,-1,1]]],[[-1,0,0],[[-1,-1,1],[-1,1,1],[-1,1,-1],[-1,-1,-1]]],[[0,1,0],[[-1,1,-1],[-1,1,1],[1,1,1],[1,1,-1]]],[[0,-1,0],[[-1,-1,1],[-1,-1,-1],[1,-1,-1],[1,-1,1]]],[[0,0,1],[[-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1]]],[[0,0,-1],[[1,-1,-1],[-1,-1,-1],[-1,1,-1],[1,1,-1]]]];
    for(const [n,points] of faces)for(const i of [0,1,2,0,2,3])data.push(...points[i],...n);
    const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(data),gl.STATIC_DRAW);return {buffer,count:36};
  })();
  function multiply(a,b) { const r=new Float32Array(16);for(let c=0;c<4;c++)for(let row=0;row<4;row++)for(let k=0;k<4;k++)r[c*4+row]+=a[k*4+row]*b[c*4+k];return r; }
  function rotation(x,y,z) {
    const cx=Math.cos(x),sx=Math.sin(x),cy=Math.cos(y),sy=Math.sin(y),cz=Math.cos(z),sz=Math.sin(z);
    return multiply(multiply([cy,0,-sy,0,0,1,0,0,sy,0,cy,0,0,0,0,1],[1,0,0,0,0,cx,sx,0,0,-sx,cx,0,0,0,0,1]),[cz,sz,0,0,-sz,cz,0,0,0,0,1,0,0,0,0,1]);
  }
  const palettes={violet:[[0.52,0.24,0.86],[0.79,0.98,0.34],[1,0.50,0.28],[0.96,0.84,1]],lime:[[0.42,0.68,0.10],[0.62,0.30,0.85],[1,0.62,0.27],[0.97,1,0.78]],blue:[[0.10,0.55,0.79],[1,0.47,0.27],[0.78,0.95,1],[0.42,0.25,0.77]]};
  let group;
  function drawObject(geometry, point, scale, angles, color) {
    const local=rotation(...angles);
    for(let c=0;c<3;c++)for(let r=0;r<3;r++)local[c*4+r]*=scale;
    local[12]=point[0];local[13]=point[1];local[14]=point[2];
    const model=multiply(group,local);
    const normals=new Float32Array([model[0]/scale,model[1]/scale,model[2]/scale,model[4]/scale,model[5]/scale,model[6]/scale,model[8]/scale,model[9]/scale,model[10]/scale]);
    gl.uniformMatrix4fv(uniforms.uModel,false,model);gl.uniformMatrix3fv(uniforms.uNormal,false,normals);gl.uniform3fv(uniforms.uColor,color);
    gl.bindBuffer(gl.ARRAY_BUFFER,geometry.buffer);gl.vertexAttribPointer(position,3,gl.FLOAT,false,24,0);gl.vertexAttribPointer(normal,3,gl.FLOAT,false,24,12);gl.drawArrays(gl.TRIANGLES,0,geometry.count);
  }
  function resize() {
    const rect=canvas.getBoundingClientRect(),dpr=Math.min(devicePixelRatio||1,1.7);
    const w=Math.max(1,Math.round(rect.width*dpr)),h=Math.max(1,Math.round(rect.height*dpr));
    if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}
    gl.viewport(0,0,w,h);
    const aspect=w/h, f=1/Math.tan(Math.PI/7), near=.1,far=50;
    gl.uniformMatrix4fv(uniforms.uProjection,false,new Float32Array([f/aspect,0,0,0,0,f,0,0,0,0,(far+near)/(near-far),-1,0,0,2*far*near/(near-far),0]));
  }
  function render() {
    if(state.lost)return;
    resize();gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
    const t=state.time, colors=palettes[state.palette];group=rotation(state.x,state.y,0);
    if(state.shape==='orbit') {
      drawObject(torus,[0,0,0],1.12,[.5+t*.15,t*.2,-.3],colors[0]);
      drawObject(sphere,[0,0,0],.55,[0,0,0],colors[1]);
      for(let i=0;i<7;i++){const a=i*tau/7+t*.32;drawObject(i%3===0?box:sphere,[Math.cos(a)*1.95,Math.sin(a)*1.8,Math.sin(a*2)*.5],.18+(i%3)*.07,[a,a*.6,.3],colors[(i+1)%4]);}
      drawObject(torus,[1.6,-1.2,.25],.35,[.6,-.4,t],colors[2]);
    } else if(state.shape==='pulse') {
      for(let i=0;i<3;i++)drawObject(torus,[0,(i-1)*.8,0],.78+Math.sin(t*1.1+i)*.06,[Math.PI/2+.22,0,t*.25+i],colors[i]);
      drawObject(sphere,[0,0,0],.51,[0,0,0],colors[3]);
      for(let i=0;i<6;i++){const a=i*tau/6+t*.3;drawObject(sphere,[Math.cos(a)*1.7,Math.sin(a)*1.7,Math.sin(a)*.5],.19,[0,0,0],colors[i%4]);}
    } else {
      for(let i=0;i<13;i++){const a=i*.66+t*.4,y=(i-6)*.27;drawObject(i%3===0?box:sphere,[Math.cos(a)*.9,y,Math.sin(a)*.9],.29,[a,a*.4,.3],colors[i%4]);}
      drawObject(torus,[0,0,0],1.5,[0,Math.PI/2,t*.2],colors[0]);
    }
  }
  let frame=null,last=0;
  function shouldAnimate(){return state.visible&&!document.hidden&&!state.lost&&!state.paused&&!reduce.matches&&state.speed>0;}
  function tick(now){frame=null;const dt=last?Math.min((now-last)/1000,.05):0;last=now;if(shouldAnimate())state.time+=dt*(.3+state.speed*1.8);render();if(shouldAnimate())frame=requestAnimationFrame(tick);}
  function requestRender(){if(frame===null&&!state.lost)frame=requestAnimationFrame(tick);}
  function syncPause(){pause.textContent=state.paused?'Retomar':'Pausar';pause.setAttribute('aria-label',state.paused?'Retomar animação':'Pausar animação');pause.setAttribute('aria-pressed',String(state.paused));}
  function announce(text){$('reactorStatus').textContent=text;}
  document.querySelectorAll('[data-shape]').forEach(button=>button.addEventListener('click',()=>{
    state.shape=button.dataset.shape;document.querySelectorAll('[data-shape]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));announce(`Composição ${button.textContent} selecionada.`);requestRender();
  }));
  document.querySelectorAll('button[data-palette]').forEach(button=>button.addEventListener('click',()=>{
    state.palette=button.dataset.palette;hero.dataset.palette=state.palette;
    document.querySelectorAll('button[data-palette]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));announce(`${button.getAttribute('aria-label')} selecionada.`);requestRender();
  }));
  energy.addEventListener('input',()=>{state.speed=Number(energy.value)/100;$('reactorEnergyValue').textContent=`${energy.value}%`;requestRender();});
  pause.addEventListener('click',()=>{state.paused=!state.paused;syncPause();requestRender();});
  function reset(){state.x=-.3;state.y=.45;requestRender();}
  $('reactorReset').addEventListener('click',reset);
  let drag=null;
  canvas.addEventListener('pointerdown',event=>{if(event.button!==0)return;drag={id:event.pointerId,x:event.clientX,y:event.clientY};canvas.setPointerCapture(event.pointerId);canvas.classList.add('dragging');});
  canvas.addEventListener('pointermove',event=>{if(!drag||event.pointerId!==drag.id)return;state.y+=(event.clientX-drag.x)*.009;state.x=Math.max(-1.4,Math.min(1.4,state.x+(event.clientY-drag.y)*.009));drag.x=event.clientX;drag.y=event.clientY;requestRender();});
  function endDrag(){drag=null;canvas.classList.remove('dragging');}
  canvas.addEventListener('pointerup',endDrag);canvas.addEventListener('pointercancel',endDrag);canvas.addEventListener('lostpointercapture',endDrag);
  canvas.addEventListener('keydown',event=>{const actions={ArrowLeft:()=>state.y-=.16,ArrowRight:()=>state.y+=.16,ArrowUp:()=>state.x=Math.max(-1.4,state.x-.16),ArrowDown:()=>state.x=Math.min(1.4,state.x+.16),Home:reset};if(actions[event.key]){event.preventDefault();actions[event.key]();requestRender();}});
  reduce.addEventListener('change',()=>{if(reduce.matches)state.paused=true;pause.disabled=reduce.matches;energy.disabled=reduce.matches;syncPause();requestRender();});
  document.addEventListener('visibilitychange',()=>{last=0;if(document.hidden&&frame!==null){cancelAnimationFrame(frame);frame=null;}else requestRender();});
  if('IntersectionObserver'in window)new IntersectionObserver(entries=>{state.visible=entries[0].isIntersecting;last=0;if(!state.visible&&frame!==null){cancelAnimationFrame(frame);frame=null;}else requestRender();}).observe(canvas);
  addEventListener('resize',requestRender);
  canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();state.lost=true;if(frame!==null)cancelAnimationFrame(frame);frame=null;fallback('A visualização 3D foi interrompida. Recarregue para tentar novamente.');});
  $('reactorFallback').hidden=true;$('reactorControls').hidden=false;canvas.classList.add('ready');
  pause.disabled=reduce.matches;energy.disabled=reduce.matches;syncPause();
  if(reduce.matches)$('reactorHint').textContent='Movimento automático desativado. Use as setas para girar.';
  requestRender();
})();
