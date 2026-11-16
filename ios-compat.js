/* CF Coach iPhone PWA compatibility layer, 2026-11-16.
 * Browser audio is best-effort while app is active; iOS does not promise background timing.
 */
(()=>{
  'use strict';
  // Do not replace the Android bridge if this site is opened inside Android WebView.
  if(!window.AndroidCoach){
    let audioContext=null, announcementJob=null, timerCfg=null, startAt=0, offset=0;
    function initAudio(){
      const AC=window.AudioContext||window.webkitAudioContext;
      if(!audioContext&&AC)try{audioContext=new AC()}catch(e){}
      if(audioContext&&audioContext.state==='suspended')audioContext.resume().catch(()=>{});
      return audioContext;
    }
    function beep(hz=880,ms=170){
      try{
        const ctx=initAudio();if(!ctx)return;
        const oscillator=ctx.createOscillator(),gain=ctx.createGain();
        oscillator.type='sine';oscillator.frequency.value=Number(hz)||880;
        gain.gain.setValueAtTime(0.0001,ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(.22,ctx.currentTime+.012);
        gain.gain.exponentialRampToValueAtTime(.0001,ctx.currentTime+Math.max(.05,(Number(ms)||170)/1000));
        oscillator.connect(gain);gain.connect(ctx.destination);
        oscillator.start();oscillator.stop(ctx.currentTime+Math.max(.06,(Number(ms)||170)/1000)+.02);
      }catch(e){}
    }
    function speak(str){
      try{
        if(!('speechSynthesis' in window))return;
        window.speechSynthesis.cancel();
        const s=new SpeechSynthesisUtterance(String(str||''));
        s.lang='ru-RU';s.rate=1.05;s.volume=1;
        window.speechSynthesis.speak(s);
      }catch(e){}
    }
    function stopAnnouncements(){
      if(announcementJob){clearInterval(announcementJob);announcementJob=null;}
      timerCfg=null;
    }
    function startAnnouncements(raw){
      stopAnnouncements();
      try{timerCfg=typeof raw==='string'?JSON.parse(raw):raw||{}}catch(e){timerCfg={}}
      initAudio();
      const cfg=timerCfg;
      startAt=Date.now();offset=Number(cfg.elapsedOffset)||0;
      const cycle=Number(cfg.cycleSeconds)||((Number(cfg.workSeconds)||0)+(Number(cfg.restSeconds)||0));
      let lastBoundary=-1;
      if(cfg.voice&&cfg.startPrompt)speak(cfg.startPrompt);
      else if(cfg.sound)beep(880,150);
      announcementJob=setInterval(()=>{
        const elapsed=Math.floor((Date.now()-startAt)/1000)+offset;
        if(!timerCfg)return;
        const total=Number(cfg.totalSeconds)||Number(cfg.capSeconds)||((Number(cfg.rounds)||0)*cycle);
        if(total&&elapsed>=total){
          if(cfg.sound)beep(660,400);
          if(cfg.voice)speak('Время! Тренировка завершена.');
          stopAnnouncements();return;
        }
        if(cycle>0&&elapsed>0&&elapsed%cycle===0&&lastBoundary!==elapsed){
          lastBoundary=elapsed;
          if(cfg.sound)beep(880,200);
          const step=Math.floor(elapsed/cycle);
          if(cfg.voice){
            let prompt=(cfg.roundPrompts||[])[step];
            if(!prompt)prompt='Раунд '+(step+1);
            speak(prompt);
          }
        }
      },250);
    }
    window.AndroidCoach={__iosPWA:true,setTheme:()=>{},beep,speak,startTimer:startAnnouncements,stopTimer:stopAnnouncements};
    // Audio generally requires an explicit tap on iOS.
    document.addEventListener('pointerdown',()=>{initAudio()}, {passive:true});
  }
  // Reconcile display with the actual clock when returning from background.
  const originalStart=window.startTimer;
  const originalStop=window.stopTimer;
  let finishAt=0;
  if(typeof originalStart==='function'&&typeof originalStop==='function'){
    window.startTimer=function(config){
      if(!timer.running)finishAt=Date.now()+(Number(timer.remain)||0)*1000;
      return originalStart(config);
    };
    window.stopTimer=function(redraw){finishAt=0;return originalStop(redraw);};
    document.addEventListener('visibilitychange',()=>{
      if(document.hidden||!timer.running||!finishAt)return;
      const remain=Math.max(0,Math.ceil((finishAt-Date.now())/1000));
      timer.remain=remain;
      if(remain<=0){window.stopTimer(true);return;}
      const t=document.getElementById('time');if(t)t.textContent=timerDisplay();
      const ring=document.getElementById('timerRing');
      if(ring)ring.style.setProperty('--pct',Math.round(100*remain/Math.max(1,timer.total)));
    });
  }
})();
