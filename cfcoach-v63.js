/* CF COACH v6.3: production UI layer. Existing workout data/storage/native bridge remain unchanged. */
const V63_ICONS={
 home:'<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z"/>',
 book:'<path d="M12 7v14M12 7C9 4 6 4 3 5v14c3-1 6-1 9 2M12 7c3-3 6-3 9-2v14c-3-1-6-1-9 2"/>',
 timer:'<circle cx="12" cy="13" r="8"/><path d="M12 9v5l3 2M9 2h6m-3 0v3M19 6l2-2"/>',
 dumbbell:'<path d="m6.5 6.5 11 11M3 7l4-4 3 3-4 4-3-3ZM14 18l4-4 3 3-4 4-3-3ZM8.5 12l3.5-3.5"/>',
 user:'<circle cx="12" cy="8" r="4"/><path d="M4 21v-2a8 8 0 0 1 16 0v2Z"/>',
 bell:'<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9ZM10 21h4"/>',
 calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4m10-4v4M3 10h18m-13 4h3m4 0h2"/>',
 trophy:'<path d="M8 21h8M12 17v4M7 3h10v7a5 5 0 0 1-10 0V3ZM7 5H4v4a4 4 0 0 0 3 4m10-8h3v4a4 4 0 0 1-3 4"/>',
 back:'<path d="m14 5-7 7 7 7M7 12h14"/>',
 chart:'<path d="M4 20V9m5 11V5m5 15v-9m5 9V3"/>',
 flame:'<path d="M12 22c5 0 8-3 8-8 0-4-3-8-6-11 0 4-2 6-4 7 0-2-1-3-2-4-1 3-4 6-4 10a8 8 0 0 0 8 6Z"/>',
 reset:'<path d="M3 11a9 9 0 1 1 2 7m-2 3v-7h7"/>',
 volume:'<path d="m3 9 4 0 5-4v14l-5-4H3ZM16 9a5 5 0 0 1 0 6m3-9a9 9 0 0 1 0 12"/>',
 mute:'<path d="M3 9h4l5-4v14l-5-4H3Zm13 1 5 5m0-5-5 5"/>',
 search:'<circle cx="11" cy="11" r="7"/><path d="m16 16 5 5"/>',
 check:'<path d="m4 12 5 5L20 6"/>',
 spark:'<path d="m12 2 2.2 7.8L22 12l-7.8 2.2L12 22l-2.2-7.8L2 12l7.8-2.2Z"/>'
};
function vIcon(name){return `<svg aria-hidden="true" class="v63-svg" viewBox="0 0 24 24">${V63_ICONS[name]||V63_ICONS.spark}</svg>`}
let v63ProgramFilter='mine',v63WorkTab='train',v63ExerciseFilter='Все',v63ExerciseQuery='',v63DetailTab='tech',v63ActiveExercise='clean',v63AnimateDemo=true,v63PreviousTab='exercises',v63WorkoutId='';
const V63_EXERCISES=[
 {id:'clean',name:'Взятие на грудь',en:'Clean',category:'Штанга',img:'athlete/clean-steps.webp',anim:'athlete/clean-motion.gif',hero:'media/clean-tech.jpg',mov:'clean',cue:['Спина прямая, корпус в напряжении','Мощное разгибание ног и бёдер','Быстрый подрыв и уход под штангу','Фиксация на груди, локти вперёд','Контроль и устойчивое положение'],scale:'Отрабатывай движение с пустым грифом, затем увеличивай вес только при стабильной технике.'},
 {id:'snatch',name:'Рывок',en:'Snatch',category:'Штанга',img:'athlete/snatch-steps.webp',anim:'athlete/snatch-motion.gif',mov:'snatch',cue:['Держи гриф близко к телу','Мощно разгибай ноги и таз','Активно уходи под штангу','Фиксируй штангу над головой','Сохраняй баланс на всей стопе'],scale:'Начинай с PVC-палки или пустого грифа; используй силовой рывок при необходимости.'},
 {id:'jerk',name:'Толчок',en:'Jerk',category:'Штанга',img:'athlete/jerk-steps.webp',anim:'athlete/jerk-motion.gif',mov:'jerk',cue:['Сохраняй вертикальное положение корпуса','Выполняй короткий контролируемый подсед','Мощно разгибай ноги','Быстро фиксируй руки над головой','Удерживай корпус и баланс'],scale:'Работай с пустым грифом и не тренируй движение через боль в плече.'},
 {id:'front',name:'Фронтальный присед',en:'Front Squat',category:'Штанга',img:'athlete/front-steps.webp',anim:'athlete/front-motion.gif',mov:'front',cue:['Локти направлены вперёд и вверх','Корпус остаётся вертикальным','Колени движутся по линии стоп','Пятки сохраняют контакт с полом','Вставай без потери положения спины'],scale:'Используй лёгкий гриф или гоблет-присед, если фронтальная стойка пока ограничена.'},
 {id:'deadlift',name:'Становая тяга',en:'Deadlift',category:'Штанга',img:'athlete/deadlift-steps.webp',anim:'athlete/deadlift-motion.gif',mov:'deadlift',cue:['Штанга остаётся близко к голеням','Спина сохраняет нейтральное положение','Стабилизируй корпус до старта','Ноги и таз разгибаются согласованно','Фиксация без переразгибания'],scale:'Уменьши вес и сократи амплитуду, если не удаётся держать нейтральную спину.'},
 {id:'t2b',name:'ГНКП — ноги к перекладине',en:'Toes to Bar',category:'Гимнастика',img:'athlete/t2b-steps.webp',anim:'athlete/t2b-motion.gif',cue:['Собери корпус в hollow-положение','Сохраняй контроль маха','Поднимай ноги без рывков','Не допускай боли в плечах'],scale:'Колени к груди или подъём коленей в висе.'},
 {id:'dips',name:'Отжимания на брусьях',en:'Dips',category:'Гимнастика',img:'athlete/dips-steps.webp',anim:'athlete/dips-motion.gif',cue:['Опускайся в контролируемой амплитуде','Лопатки стабильны','Локти движутся назад','Разгибай руки без рывка'],scale:'Отжимания с опорой ног или на параллельных брусьях с резиной.'},
 {id:'muscleup',name:'Выход силой',en:'Muscle-up',category:'Гимнастика',img:'athlete/muscleup-steps.webp',cue:['Развивай стабильный вис','Работай над взрывной тягой','Отдельно тренируй переход','Выполняй движение технически'],scale:'Подтягивания к груди, переходы с опорой и медленные негативы.'},
 {id:'boxjump',name:'Прыжки на тумбу',en:'Box Jump',category:'Кардио',img:'athlete/boxjump-steps.webp',anim:'athlete/boxjump-motion.gif',cue:['Выбирай безопасную высоту тумбы','Мягко приземляйся на обе ноги','Выпрямляйся вверху','Контролируй спуск с тумбы'],scale:'Зашагивания на тумбу и меньшая высота.'},
 {id:'pullup',name:'Подтягивания',en:'Pull-up',category:'Гимнастика',img:'tech/pull-up.png',cue:['Корпус остаётся собранным','Поднимайся без резких рывков','Двигайся в контролируемой амплитуде'],scale:'Подтягивания с резиной или тяга колец.'},
 {id:'squat',name:'Присед со штангой',en:'Back Squat',category:'Штанга',img:'tech/back-squat.png',mov:'squat',cue:['Держи напряжённый корпус','Колени направлены по стопам','Поднимайся грудью и тазом одновременно'],scale:'Присед с пустым грифом или собственным весом.'},
 {id:'kbswing',name:'Махи гирей',en:'Kettlebell Swing',category:'Кардио',img:'tech/kb-swing.png',cue:['Таз активно уходит назад','Стабилизируй спину','Сила движения идёт от разгибания таза'],scale:'Уменьши вес гири и амплитуду.'}
];
function v63GoBack(){tab='home';render()}
function v63Header(title,back=false){return `<header class="v63-header ${back?'v63-back-head':''}">${back?`<button aria-label="Назад" class="v63-icon-btn" data-v63-back>${vIcon('back')}</button><h1 class="v63-title">${esc(title)}</h1>`:`<h1 class="v63-title">${esc(title)}</h1>`}</header>`}
function home(){
 const p=profile(),pl=plan(),L=logs(),done=pl.filter(w=>L[w.id]?.done).length,w=pl[Math.min(done,pl.length-1)],pr=progMeta(p.program),weekDone=pl.filter(x=>L[x.id]?.done&&x.week===w.week).length,percent=pl.length?Math.round(done/pl.length*100):0,ca=coachAdvice();
 return `<div class="v63-page v63-home"><div class="v63-header"><div class="v63-brand"><span class="v63-slashes"><i></i><i></i><i></i></span><span><b>CF</b> <strong>COACH</strong></span></div><button class="v63-icon-btn" aria-label="AI Coach" data-tabgo="ai">${vIcon('bell')}</button></div>
 <h2 class="v63-heading">Привет, ${esc(p.name||'Дмитрий')}! 👋</h2><p class="v63-caption">Готов к тренировке?</p>
 <section class="v63-home-hero"><div class="v63-hero-content"><h2>Сегодняшняя<br>тренировка</h2><p>Сила + Меткон</p><button class="v63-orange-btn" data-v63-work="${w.id}">▶ &nbsp;Начать</button></div></section>
 <div class="v63-meter-grid"><div class="v63-meter"><div><div class="v63-meter-title">${vIcon('calendar')} Неделя</div><div class="v63-meter-value">${weekDone} / ${pr.freq||3}</div><div class="v63-meter-sub">тренировок</div></div><div class="v63-donut" style="--pct:${Math.min(100,weekDone/(pr.freq||3)*100)}"></div></div><div class="v63-meter"><div><div class="v63-meter-title">${vIcon('chart')} Блок</div><div class="v63-meter-value">${Math.min(w.week,pr.weeks)} / ${pr.weeks}</div><div class="v63-meter-sub">недель</div></div><div class="v63-donut" style="--pct:${Math.min(100,percent)}"></div></div></div>
 <div class="v63-focus"><span class="medal">🏆</span><div><strong>Текущий фокус</strong><br>${esc(w.focus||'Сила и техника тяжёлой атлетики')}</div></div>
 <div class="v63-quote"><b>“</b> Стань сильнее, чем вчера!</div><div class="v63-shortcut"><button data-tabgo="builder">＋ Свой WOD</button><button data-tabgo="food">🥗 Питание</button><button data-tabgo="ai">✦ AI Coach</button></div>
 <div class="v63-subheading">Твоя тренировка</div><div class="v63-week-block"><div class="v63-week-head">${vIcon('calendar')} Неделя ${w.week} · День ${w.day}<span class="v63-round-pill">${percent}% цикла</span></div><div class="v63-week-body"><strong>${esc(w.focus)}</strong><br>${esc(scaled(w.strength))}</div></div>
 <div class="v63-light-card"><strong style="font-size:13px;color:var(--text)">✦ ${esc(ca.title)}</strong><div class="muted" style="margin-top:5px">${esc(ca.text)}</div></div></div>`;
}
function programs(){
 const p=profile(),ordered=['performance16','foundation12','start8','athlete12'].map(id=>progMeta(id));
 const pool=v63ProgramFilter==='mine'?ordered.filter(pr=>pr.id===p.program||pr.name==='FOUNDATION'||pr.name==='START'):v63ProgramFilter==='levels'?ordered.filter(pr=>pr.levels.includes(p.level)):ordered;
 return `<div class="v63-page">${v63Header('Программы')}<div class="v63-segment">${[['mine','Мои'],['all','Все'],['levels','Уровни']].map(([k,n])=>`<button data-v63-program-filter="${k}" class="${v63ProgramFilter===k?'active':''}">${n}</button>`).join('')}</div>
 ${pool.map(pr=>`<article class="v63-program-card"><img src="media/program-${pr.name.toLowerCase()==='performance'?'performance':pr.name.toLowerCase()==='foundation'?'foundation':'start'}.jpg" alt="${esc(pr.name)}"><div class="v63-program-body"><h3>${esc(pr.name)}</h3><p>${pr.name==='PERFORMANCE'?'Для подготовленных. Сила, тяжёлая атлетика, гимнастика':pr.name==='FOUNDATION'?'Базовая подготовка и развитие техники':pr.name==='START'?'Мягкий старт в кроссфит':esc(pr.desc)}</p>${p.program===pr.id?'<div class="v63-active-note">✓ Текущая программа</div>':''}<div class="v63-program-actions"><button class="v63-mini-btn primary" data-program="${pr.id}">${p.program===pr.id?'Выбрана':'Выбрать'}</button><button class="v63-mini-btn" data-preview="${pr.id}">План</button></div></div><button aria-label="Показать план ${esc(pr.name)}" class="v63-program-go" data-preview="${pr.id}">›</button></article>`).join('')}
 <div class="v63-secondary-panel" style="margin-top:15px"><strong>Персональная программа</strong><div class="muted">Подходящая нагрузка: ${esc(LEVELS[p.level].name)}. Программу и рабочие веса можно менять в профиле.</div></div></div>`;
}
function dailyWorkout(){
 const pl=plan(),w=getWorkout(v63WorkoutId)||pl.find(x=>!logs()[x.id]?.done)||pl[0];if(!w)return home();const l=logs()[w.id]||{},tc=timerFromText(w);
 return `<div class="v63-page">${v63Header('Тренировка дня',true)}<div class="v63-workout-date">${vIcon('calendar')} &nbsp;Неделя ${w.week} · День ${w.day}</div><div class="v63-segment" style="justify-content:center">${[['train','Тренировка'],['notes','Заметки'],['result','Результат']].map(([k,n])=>`<button class="${v63WorkTab===k?'active':''}" data-v63-work-tab="${k}">${n}</button>`).join('')}</div>
 ${v63WorkTab==='train'?`<div class="v63-week-block"><div class="v63-week-head">🏋️ &nbsp;А. Сила</div><div class="v63-week-body">${esc(scaled(w.strength))}</div></div><div class="v63-week-block"><div class="v63-week-head">🤸 &nbsp;В. Навык / Гимнастика</div><div class="v63-week-body">${esc(scaled(w.block2))}</div></div><div class="v63-week-block"><div class="v63-week-head"><span>🔥 &nbsp;С. Меткон</span><span class="v63-metcon-tag">${tc.mode} ${Math.round(tc.total/60)} мин</span></div><div class="v63-week-body">${esc(scaled(w.metcon))}</div></div><button class="v63-orange-btn wide" data-v63-start-work="${w.id}">▶ &nbsp;Начать тренировку</button><button class="v63-mini-btn" style="width:100%;margin-top:10px;min-height:38px" data-workout="${w.id}">Посмотреть весь WOD / записать результат</button>`:
 v63WorkTab==='notes'?`<div class="v63-week-block"><div class="v63-week-head">Разминка</div><div class="v63-week-body">${esc(scaled(w.warmup))}</div></div><div class="v63-week-block"><div class="v63-week-head">Техника и рекомендации</div><div class="v63-week-body">${esc(w.rule||'Следи за самочувствием и качеством движений.')}</div></div><button class="v63-orange-btn wide" data-workout="${w.id}">Открыть подробности и заметки</button>`:
 `<div class="v63-week-block"><div class="v63-week-head">Результат тренировки</div><div class="v63-week-body">${l.done?`<b>✓ Выполнено</b><br>${esc(l.result||'Без текстового результата')}<br>Вес: ${esc(l.weight||'—')} кг · RPE: ${esc(l.rpe||'—')}`:'Ещё не записан. После WOD сохрани вес, подходы, время и самочувствие.'}</div></div><button class="v63-orange-btn wide" data-workout="${w.id}">${l.done?'Изменить результат':'Записать результат'}</button>`}
 </div>`;
}
function timers(){
 const presets=[['EMOM',60,600,'EMOM'],['AMRAP',0,720,'AMRAP'],['FORTIME',0,900,'For Time'],['INTERVALS',60,480,'Интервалы']];
 const rounds=Math.max(1,Math.ceil(timer.total/Math.max(1,timer.cycle||60))),pct=Math.round(100*timer.remain/Math.max(1,timer.total));
 return `<div class="v63-page">${v63Header('Таймеры',true)}<div class="v63-timer-card"><div class="v63-timer-presets">${presets.map(([m,c,t,n])=>`<button data-tpreset="${m}|${c}|${t}" class="${timer.mode===m?'active':''}">${n}</button>`).join('')}</div><div class="v63-timer-ring" id="timerRing" style="--pct:${pct}"><div class="v63-timer-inner"><div class="v63-timer-mode">${timer.mode==='FORTIME'?'FOR TIME':esc(timer.mode)}</div><div class="v63-timer-time" id="time">${timerDisplay()}</div><div class="v63-timer-help">${timer.mode==='EMOM'?`${rounds} раундов × ${fmt(timer.cycle)}`:timer.mode==='AMRAP'?'Максимум раундов':timer.mode==='INTERVALS'?'Работа / отдых':'Работай на время'}</div></div></div><div class="v63-timer-controls"><button class="v63-round-control" id="treset" aria-label="Сброс таймера">${vIcon('reset')}</button><button class="v63-play-control" id="tstart" aria-label="${timer.running?'Пауза':'Старт таймера'}">${timer.running?'❚❚':'▶'}</button><button class="v63-round-control" data-v63-sound aria-label="Звук таймера">${vIcon(timer.voice?'volume':'mute')}</button></div>
 <div class="v63-quick"><h3>Быстрые настройки</h3><div class="v63-quick-grid"><div class="v63-quick-box"><div class="v63-counter"><button data-v63-rounds="-1" aria-label="Минус раунд">−</button><strong>${rounds}</strong><button data-v63-rounds="1" aria-label="Плюс раунд">+</button></div><small>раундов</small></div><button class="v63-quick-box" data-v63-duration><strong>${fmt(timer.cycle||60)}</strong><small>время раунда &nbsp;›</small></button></div></div>
 ${timer.label?`<div class="v63-light-card"><strong>${esc(timer.label)}</strong></div>`:''}
 <div class="v63-shortcut"><button data-tabgo="builder">＋ Конструктор WOD</button><button data-tabgo="profile">Рабочие веса</button></div></div></div>`;
}
function exercises(){
 const found=V63_EXERCISES.filter(e=>(v63ExerciseFilter==='Все'||e.category===v63ExerciseFilter)&&(`${e.name} ${e.en}`.toLowerCase().includes(v63ExerciseQuery.toLowerCase())));
 return `<div class="v63-page">${v63Header('Упражнения',true)}<label class="v63-search">${vIcon('search')}<input type="search" id="v63ExerciseSearch" value="${esc(v63ExerciseQuery)}" placeholder="Поиск упражнения" aria-label="Поиск упражнения"></label><div class="v63-segment" style="margin-top:5px">${['Все','Штанга','Гимнастика','Кардио'].map(x=>`<button data-v63-ex-filter="${x}" class="${v63ExerciseFilter===x?'active':''}">${x}</button>`).join('')}</div><div class="v63-ex-list">${found.map(e=>`<button class="v63-ex-row" data-v63-ex="${e.id}"><img src="${e.img}" alt=""><span class="v63-ex-name">${esc(e.name)}<small>(${esc(e.en)})</small></span><span class="v63-ex-arrow">›</span></button>`).join('')||'<div class="v63-secondary-panel">Ничего не найдено. Попробуй другой запрос.</div>'}</div></div>`;
}
function exerciseDetail(){
 const e=V63_EXERCISES.find(x=>x.id===v63ActiveExercise)||V63_EXERCISES[0],w=weights(),mv=MOVES.find(m=>m.id===e.mov),weight=mv?(w[mv.id]||mv.ref):null;
 return `<div class="v63-page">${v63Header(e.name+' ('+e.en+')',true)}<div class="v63-detail-media v72-detail-media"><img class="${e.anim&&v63AnimateDemo?'v72-motion-anim':'v72-photo-strip'}" src="${e.anim&&v63AnimateDemo?e.anim:e.img}" alt="Демонстрация фаз упражнения: ${esc(e.name)}"></div><div class="v72-media-controls">${e.anim?`<button class="v72-motion-toggle" type="button" data-v63-motion>${v63AnimateDemo?'❚❚ Показать все фазы':'▶ Смотреть движение'}</button>`:'<span class="v72-photo-label">Три фазы движения</span>'}<span>AI-иллюстрация · сверяй технику с тренером</span></div><div class="v63-segment" style="justify-content:center">${[['tech','Техника'],['sets','Подходы'],['scale','Масштабирование']].map(([key,label])=>`<button data-v63-detail-tab="${key}" class="${v63DetailTab===key?'active':''}">${label}</button>`).join('')}</div>
 ${v63DetailTab==='tech'?`<h2 class="v63-subheading">Ключевые моменты</h2><ul class="v63-list-check">${e.cue.map(t=>`<li><span class="v63-check">✓</span><span>${esc(t)}</span></li>`).join('')}</ul>`:v63DetailTab==='sets'?`<div class="v63-secondary-panel"><strong>Рабочие подходы</strong><p>Используй тренировочный план для количества подходов и повторений. Сохраняй выполненные веса и RPE в результате тренировки.</p><button class="v63-orange-btn" data-tabgo="programs">Открыть программы</button></div>`:`<div class="v63-secondary-panel"><strong>Упрощение движения</strong><p>${esc(e.scale)}</p></div>`}
 ${weight?`<div class="v63-weights">${vIcon('dumbbell')} &nbsp;<strong>Рабочие веса (PERFORMANCE)</strong>Старт: ${esc(weight)} кг &nbsp;·&nbsp; Прогрессия: ${[0,2.5,5,7.5,10].map(n=>String(weight+n).replace('.5',',5')).join(' → ')}+ кг<div style="font-size:11px;margin-top:5px">Фактические рабочие веса можно изменить в профиле.</div></div>`:''}
 <button class="v63-mini-btn" style="width:100%;margin-top:16px;min-height:40px" data-tabgo="profile">Мои рабочие веса и PR</button></div>`;
}
function v63Bind(){
 document.querySelectorAll('[data-v63icon]').forEach(el=>{el.innerHTML=vIcon(el.dataset.v63icon)});
 document.querySelectorAll('[data-v63-back]').forEach(el=>el.onclick=()=>{tab=tab==='exercise-detail'?v63PreviousTab:'home';render()});
 document.querySelectorAll('[data-v63-work]').forEach(el=>el.onclick=()=>{v63WorkoutId=el.dataset.v63Work;v63WorkTab='train';tab='workout';render()});
 document.querySelectorAll('[data-v63-program-filter]').forEach(el=>el.onclick=()=>{v63ProgramFilter=el.dataset.v63ProgramFilter;render()});
 document.querySelectorAll('[data-v63-work-tab]').forEach(el=>el.onclick=()=>{v63WorkTab=el.dataset.v63WorkTab;render()});
 document.querySelectorAll('[data-v63-start-work]').forEach(el=>el.onclick=()=>{const w=getWorkout(el.dataset.v63StartWork);if(!w)return;const tc=timerFromText(w);stopTimer();timer.mode=tc.mode;timer.cycle=tc.cycle;timer.total=tc.total;timer.remain=tc.total;timer.prompts=[];timer.label=w.focus;tab='timer';render()});
 document.querySelectorAll('[data-v63-rounds]').forEach(el=>el.onclick=()=>{if(timer.running)return;let current=Math.max(1,Math.ceil(timer.total/Math.max(1,timer.cycle||60))),n=Math.max(1,Math.min(90,current+Number(el.dataset.v63Rounds)));timer.total=n*(timer.cycle||60);timer.remain=timer.total;render()});
 document.querySelectorAll('[data-v63-duration]').forEach(el=>el.onclick=()=>{if(timer.running)return;const choices=[30,45,60,90,120,180,240],old=timer.cycle||60,next=choices[(choices.indexOf(old)+1)%choices.length]||60,rounds=Math.max(1,Math.ceil(timer.total/old));timer.cycle=next;timer.total=next*rounds;timer.remain=timer.total;render()});
 document.querySelectorAll('[data-v63-sound]').forEach(el=>el.onclick=()=>{timer.voice=!timer.voice;timer.sound=timer.voice;render()});
 document.querySelectorAll('[data-v63-ex-filter]').forEach(el=>el.onclick=()=>{v63ExerciseFilter=el.dataset.v63ExFilter;render()});
 const search=document.getElementById('v63ExerciseSearch');if(search)search.oninput=e=>{v63ExerciseQuery=e.target.value;const pos=e.target.selectionStart;render();const next=document.getElementById('v63ExerciseSearch');if(next){next.focus();try{next.setSelectionRange(pos,pos)}catch(err){}}};
 document.querySelectorAll('[data-v63-ex]').forEach(el=>el.onclick=()=>{v63PreviousTab='exercises';v63ActiveExercise=el.dataset.v63Ex;v63DetailTab='tech';v63AnimateDemo=true;tab='exercise-detail';render()});
 document.querySelectorAll('[data-v63-detail-tab]').forEach(el=>el.onclick=()=>{v63DetailTab=el.dataset.v63DetailTab;render()});
 document.querySelectorAll('[data-v63-motion]').forEach(el=>el.onclick=()=>{v63AnimateDemo=!v63AnimateDemo;render()});
}
// Keep all legacy data, logging, builder, food diary, native timer service and AI functions.
render = function(){
 const p=profile();applyTheme();
 const routes={home,programs,builder,timer:timers,food,profile:prof,ai,workout:dailyWorkout,exercises,'exercise-detail':exerciseDetail};
 document.getElementById('app').innerHTML=(routes[tab]||home)();
 document.querySelectorAll('.nav button').forEach(b=>b.classList.toggle('active',b.dataset.tab===tab||(tab==='workout'&&b.dataset.tab==='home')||(tab==='exercise-detail'&&b.dataset.tab==='exercises')));
 bind();v63Bind();
 const fab=document.getElementById('aifab');if(fab){fab.style.display=tab==='ai'?'none':'block';fab.onclick=()=>{tab='ai';render()}}
 const old=document.getElementById('onboard');if(old)old.remove();if(!p.onboarded){document.body.insertAdjacentHTML('beforeend',onboarding());bindOnboard()}
};
// v6.3 replaces only the UI. Previous localStorage data keys and saved sessions are untouched.
document.querySelectorAll('[data-v63icon]').forEach(el=>{el.innerHTML=vIcon(el.dataset.v63icon)});
render();
