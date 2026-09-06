'use strict';
(() => {
  const audio=document.getElementById('backgroundBeat');
  if(!audio)return;
  const toggle=document.getElementById('soundToggle');
  const label=document.getElementById('soundLabel');
  const volume=document.getElementById('soundVolume');
  const status=document.getElementById('soundStatus');
  const player=toggle.closest('.sound-player');
  let busy=false;
  audio.volume=0.18;
  function sync(){
    const playing=!audio.paused;
    toggle.setAttribute('aria-pressed',String(playing));
    toggle.setAttribute('aria-label',`${playing?'Pausar':'Reproduzir'} instrumental de Gorilla Roxo`);
    label.textContent=playing?'Pausar beat':'Ouvir beat';
    player.classList.toggle('is-playing',playing);
  }
  function error(){
    player.classList.add('has-error');
    status.textContent='Não foi possível iniciar o áudio. Toque em Ouvir beat para tentar novamente.';
    sync();
  }
  toggle.addEventListener('click',async()=>{
    if(busy)return;
    player.classList.remove('has-error');status.textContent='';
    if(!audio.paused){audio.pause();return;}
    busy=true;toggle.disabled=true;label.textContent='Carregando…';
    try{
      await audio.play();
      if(document.hidden)audio.pause();
      else status.textContent='Gorilla Roxo, instrumental. Trilha de fundo ativada.';
    }catch{error();}
    finally{busy=false;toggle.disabled=false;sync();}
  });
  volume.addEventListener('input',()=>{audio.volume=Number(volume.value)/100;volume.setAttribute('aria-valuetext',`${volume.value}%`);});
  audio.addEventListener('play',sync);audio.addEventListener('pause',sync);audio.addEventListener('error',error);
  document.addEventListener('visibilitychange',()=>{if(document.hidden&&!audio.paused){audio.pause();status.textContent='Trilha pausada. Toque em Ouvir beat para retomar.';}});
  addEventListener('pagehide',()=>audio.pause());
  sync();
})();
