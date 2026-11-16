/* CF Coach v7.5: local-only Apple Health XML import (Mi Fitness / Smart Band 10).
 * No credentials, Bluetooth or HealthKit access. The browser never uploads file contents.
 * Import is deliberately manual; native iOS HealthKit integration is a separate project.
 */
'use strict';
const CF_MIBAND_KEY='cfcoach_miband_health_v1';
const CF_MIBAND_DAYS=30;
function cfMiStore(){try{const d=JSON.parse(localStorage.getItem(CF_MIBAND_KEY)||'null');return d&&d.version===1&&Array.isArray(d.days)?d:null}catch(e){return null}}
function cfMiFmtDate(s){if(!s)return '';const d=s.match(/^(\d{4}-\d{2}-\d{2})/);return d?d[1]:''}
function cfMiDateShift(d,n){const x=new Date(d+'T12:00:00');x.setDate(x.getDate()+n);return [x.getFullYear(),String(x.getMonth()+1).padStart(2,'0'),String(x.getDate()).padStart(2,'0')].join('-')}
function cfMiDateToday(){const x=new Date();return [x.getFullYear(),String(x.getMonth()+1).padStart(2,'0'),String(x.getDate()).padStart(2,'0')].join('-')}
function cfMiAttr(raw){const o={};const re=/([\w:-]+)\s*=\s*(['"])(.*?)\2/g;let m;while((m=re.exec(raw)))o[m[1]]=m[3];return o}
function cfMiSupportedMetric(type){if(type.endsWith('StepCount'))return 'steps';if(type.endsWith('ActiveEnergyBurned'))return 'calories';if(type.endsWith('RestingHeartRate'))return 'restingHR';if(type.endsWith('HeartRate'))return 'heartRate';if(type.endsWith('SleepAnalysis'))return 'sleep';return null}
function cfMiIsBand(src){return /(mi[\s-]*fitness|xiaomi|smart\s*band|mi[\s-]*band)/i.test(src||'')}
function cfMiPick(sources){const pairs=Object.entries(sources||{});if(!pairs.length)return null;const band=pairs.filter(([name])=>cfMiIsBand(name));const pool=band.length?band:pairs;pool.sort((a,b)=>b[1].n-a[1].n);return {src:pool[0][0],...pool[0][1],fromBand:band.length>0}}
function cfMiMetric(raw,attrMap){const a=cfMiAttr(raw),type=a.type||'',metric=cfMiSupportedMetric(type);
  if(!metric)return;
  const src=(a.sourceName||'Неизвестный источник').slice(0,90);
  const day=cfMiFmtDate(metric==='sleep'?a.endDate:a.startDate);if(!attrMap[day]||!day)return;
  let val=Number(a.value);if(metric==='calories'){if(a.unit==='kJ')val/=4.184;else if(a.unit==='J')val/=4184;else if(a.unit&&a.unit!=='kcal'&&a.unit!=='Cal')return;}if(metric==='sleep'){
    const v=String(a.value||'');if(!/Asleep/i.test(v))return;
    const start=cfMiParseDate(a.startDate),end=cfMiParseDate(a.endDate);val=(end-start)/3600000;
    if(!Number.isFinite(val)||val<=0||val>24)return;
    const k=/Asleep(Core|Deep|REM)/i.test(v)?'sleepStage':'sleepOther';
    const x=(attrMap[day][k][src] ||= {sum:0,n:0});x.sum+=val;x.n++;return;
  }
  if(!Number.isFinite(val)||val<0)return;
  if(metric==='heartRate'||metric==='restingHR'){if(val<30||val>230)return;}
  if(metric==='steps'&&val>100000)return;
  if(metric==='calories'&&val>20000)return;
  const x=(attrMap[day][metric][src] ||= {sum:0,n:0});x.sum+=val;x.n++;
}
function cfMiParseDate(v){if(!v)return NaN;const m=v.match(/^(\d{4}-\d\d-\d\d)\s+(\d\d:\d\d:\d\d)\s+([+-]\d\d)(\d\d)$/);return Date.parse(m?`${m[1]}T${m[2]}${m[3]}:${m[4]}`:v)}
function cfMiWorkout(raw,days){const a=cfMiAttr(raw),d=cfMiFmtDate(a.startDate),x=days[d];if(!x)return;const src=a.sourceName||'Неизвестный источник';const entry=(x.workouts[src] ||= {n:0,sum:0});entry.n++;entry.sum+=1}
async function cfMiImportXML(file,onProgress){
 if(!file||!/\.xml$/i.test(file.name))throw Error('Выбери файл export.xml из распакованного архива Apple Health.');
 if(file.size>1000*1024*1024)throw Error('Файл больше 1 ГБ — открой экспорт на компьютере и оставь данные за последние 30 дней.');
 const dates={},now=cfMiDateToday();for(let i=0;i<CF_MIBAND_DAYS;i++){
   const d=cfMiDateShift(now,-i);dates[d]={steps:{},calories:{},restingHR:{},heartRate:{},sleepStage:{},sleepOther:{},workouts:{}};
 }
 const step=1024*1024;let offset=0,tail='',records=0,workouts=0,matched=0;const decoder=new TextDecoder('utf-8');
 // Read in slices to avoid loading a potentially huge Health export into memory.
 while(offset<file.size){
   const end=Math.min(file.size,offset+step);const b=decoder.decode(await file.slice(offset,end).arrayBuffer(),{stream:end<file.size});offset=end;
   tail+=b;
   const re=/<(Record|Workout)\b([^<>]*?)>/g;let m,last=0;
   while((m=re.exec(tail))){
     const raw=m[2],kind=m[1];
     if(kind==='Record'){records++;cfMiMetric(raw,dates)}
     else{workouts++;cfMiWorkout(raw,dates)}
     last=re.lastIndex;matched++;
   }
   // Keep only an incomplete tag. XML exports can also contain nested metadata tags.
   const lastClose=tail.lastIndexOf('>');tail=lastClose>=0?tail.slice(lastClose+1).slice(-32768):tail.slice(-32768);
   if(onProgress)onProgress(Math.min(100,Math.round(100*offset/file.size)));
   await new Promise(resolve=>setTimeout(resolve,0));
 }
 const out=[];const sources=new Set();let bandDays=0,anyDays=0;
 for(const [date,m] of Object.entries(dates).sort((a,b)=>b[0].localeCompare(a[0]))){
   const p={date};const selected={};
   for(const k of ['steps','calories','restingHR','heartRate']){
     const v=cfMiPick(m[k]);if(!v)continue;selected[k]=v.src;sources.add(v.src);p[k]=k==='heartRate'||k==='restingHR'?Math.round(v.sum/v.n):Math.round(v.sum);if(v.fromBand)p.bandData=true;
   }
   const sleepSource=cfMiPick(Object.keys(m.sleepStage).length?m.sleepStage:m.sleepOther);
   if(sleepSource){p.sleepHours=Math.round(sleepSource.sum*10)/10;selected.sleep=sleepSource.src;sources.add(sleepSource.src);if(sleepSource.fromBand)p.bandData=true}
   const w=cfMiPick(m.workouts);if(w){p.workouts=w.n;selected.workouts=w.src;if(w.fromBand)p.bandData=true}
   if(Object.keys(selected).length){anyDays++;if(p.bandData)bandDays++;p.sources=selected;out.push(p)}
 }
 if(!records&&!workouts)throw Error('В файле не найдены записи Apple Health. Проверь, что выбран именно export.xml.');
 if(!out.length)throw Error('В выбранном файле нет поддерживаемых показателей за последние 30 дней.');
 const result={version:1,importedAt:new Date().toISOString(),fileName:file.name,days:out,sourceNames:[...sources],bandDays,anyDays,recordCount:records,workoutCount:workouts};
 try{localStorage.setItem(CF_MIBAND_KEY,JSON.stringify(result))}catch(e){throw Error('Не удалось сохранить показатели на устройстве. Проверь свободное место в Safari.');}
 return result;
}
async function cfMiImportFile(file,onProgress){
 if(!file)throw Error('Файл не выбран.');
 if(/\.xml$/i.test(file.name))return cfMiImportXML(file,onProgress);
 if(!/\.zip$/i.test(file.name))throw Error('Поддерживается Apple Health ZIP или файл export.xml.');
 if(file.size>30*1024*1024)throw Error('Архив больше 30 МБ. Распакуй ZIP в приложении «Файлы» и выбери export.xml — так iPhone не исчерпает память.');
 if(typeof JSZip==='undefined')throw Error('Модуль чтения ZIP не загрузился. Распакуй ZIP вручную или обнови приложение.');
 if(onProgress)onProgress(2);
 const zip=await JSZip.loadAsync(file);
 const candidate=zip.file(/(^|\/)export\.xml$/i).find(x=>!x.dir);
 if(!candidate)throw Error('Не найден export.xml внутри ZIP. Используй архив, полученный в приложении «Здоровье».');
 if(candidate._data&&candidate._data.uncompressedSize>90*1024*1024)throw Error('В архиве очень большой export.xml. Распакуй ZIP и выбери export.xml напрямую.');
 const blob=await candidate.async('blob',()=>{});
 if(blob.size>90*1024*1024)throw Error('Распакованный файл слишком большой для ZIP-импорта. Выбери export.xml напрямую.');
 const input=new File([blob],'export.xml',{type:'text/xml'});
 return cfMiImportXML(input,onProgress);
}
function cfMiView(){
 const s=cfMiStore(),n=(x)=>x===undefined?'—':Number(x).toLocaleString('ru-RU');
 const day=s?.days?.[0];let top='';
 if(s){
  top=`<section class="cf-mi-card"><div class="cf-mi-section-title">Последняя загрузка</div><p class="cf-mi-muted">${new Date(s.importedAt).toLocaleString('ru-RU')} · ${s.anyDays} дней с данными</p>${s.bandDays===0?'<p class="cf-mi-warning">В импортированных записях не найден источник Mi Fitness/Xiaomi. Проверь разрешения на передачу данных и повтори экспорт.</p>':`<p class="cf-mi-success">Обнаружены показатели Xiaomi/Mi Fitness за ${s.bandDays} дн.</p>`}</section>
  <section class="cf-mi-card"><div class="cf-mi-section-title">Последний день с показателями · ${day.date}</div><div class="cf-mi-metrics"><div><b>${n(day.steps)}</b><small>шагов</small></div><div><b>${n(day.restingHR??day.heartRate)}</b><small>${day.restingHR!==undefined?'пульс покоя':'ср. пульс'}, уд/мин</small></div><div><b>${day.sleepHours??'—'}</b><small>сон, часов</small></div><div><b>${n(day.calories)}</b><small>активные ккал</small></div></div><p class="cf-mi-muted">Источник шагов: ${esc(day.sources?.steps||'не указан')} · зарегистрировано тренировок: ${day.workouts??'—'}</p></section>
  <section class="cf-mi-card"><div class="cf-mi-section-title">История за 7 дней</div><div class="cf-mi-history">${s.days.slice(0,7).map(d=>`<div class="cf-mi-history-row"><span>${d.date.slice(5)}</span><span>${n(d.steps)} шагов</span><span>${d.sleepHours??'—'} ч сна</span><span>${n(d.restingHR??d.heartRate)} уд/мин</span></div>`).join('')}</div><small class="cf-mi-muted">Пульс из отдельных измерений не является показателем пульса покоя. Значения из разных источников не суммируются.</small></section>
  <section class="cf-mi-card"><button class="cf-mi-delete" id="cfMiClear">Удалить импортированные показатели</button></section>`;
 }
 return `<div class="v63-page">${v63Header('Mi Band 10 · Здоровье',true)}<div class="cf-mi-notice"><b>Mi Band 10 → Mi Fitness → Apple Health → CF Coach</b><br>Импорт вручную. Автоматический доступ к Apple Health невозможен в этой веб-версии.</div>
 ${top}
 <section class="cf-mi-card"><div class="cf-mi-section-title">Импорт данных Apple Health</div>
 <p class="cf-mi-muted">1. В Mi Fitness включи «Профиль → Данные сторонних приложений → Здоровье» и разреши нужные категории.</p>
 <p class="cf-mi-muted">2. В «Здоровье» на iPhone нажми свою аватарку → «Экспортировать все данные о здоровье». Сохрани ZIP в «Файлы».</p>
 <p class="cf-mi-muted">3. Загрузи ZIP напрямую (до 30 МБ) или распакуй его в «Файлах» и выбери <b>export.xml</b>. Обработка происходит только на iPhone.</p>
 <label class="cf-mi-picker" for="cfMiFile">Выбрать ZIP или export.xml</label><input id="cfMiFile" type="file" accept=".zip,.xml,text/xml,application/xml,application/zip" style="display:none"/>
 <div id="cfMiStatus" class="cf-mi-status" role="status" aria-live="polite">Импортируется последние 30 дней; предыдущие записи CF Coach не изменяются.</div>
 </section><section class="cf-mi-card"><div class="cf-mi-section-title">Что может читать приложение</div><p class="cf-mi-muted">Шаги, пульс, пульс покоя, длительность сна, активные калории и количество зарегистрированных тренировок — только если они действительно присутствуют в экспорте. Данные не отправляются на сервер.</p><p class="cf-mi-muted">Текущие тренировочные рекомендации по этим данным автоматически не меняются. Для полноценной синхронизации и обоснованной коррекции нагрузки нужна дальнейшая разработка.</p></section></div>`;
}
function cfMiSummaryCard(){const s=cfMiStore();if(!s)return '<div class="v63-light-card"><b>⌚ Mi Band 10</b><div class="muted">Подключи данные сна, пульса и шагов из Apple Health.</div><button class="v63-mini-btn" data-tabgo="wearable">Настроить импорт</button></div>';
const d=s.days[0];return `<div class="v63-light-card"><b>⌚ Mi Band 10 · ${d.date.slice(5)}</b><div class="muted">${d.steps===undefined?'—':d.steps.toLocaleString('ru-RU')} шагов · ${d.sleepHours??'—'} ч сна · ${d.restingHR??d.heartRate??'—'} уд/мин</div><button class="v63-mini-btn" data-tabgo="wearable">Обновить данные</button></div>`}
function cfMiBind(){const input=document.getElementById('cfMiFile');if(input)input.onchange=async()=>{
 const f=input.files&&input.files[0],out=document.getElementById('cfMiStatus');if(!f)return;input.disabled=true;
 try{if(out)out.textContent='Чтение экспорта… 0%';const s=await cfMiImportFile(f,p=>{if(out)out.textContent=`Чтение экспорта… ${p}%`});render();const n=document.getElementById('cfMiStatus');if(n)n.textContent=`Готово: ${s.anyDays} дней, ${s.bandDays} с данными Mi Fitness.`}
 catch(e){if(out)out.textContent='Ошибка: '+(e?.message||String(e));input.disabled=false}
};const del=document.getElementById('cfMiClear');if(del)del.onclick=()=>{if(confirm('Удалить из CF Coach импортированные показатели здоровья? Дневник тренировок останется без изменений.')){localStorage.removeItem(CF_MIBAND_KEY);render()}};
}
