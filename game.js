(()=>{
'use strict';
const MATH=window.LOT_MATH_CONFIG||{};
const PAYLINES=[[1,1,1,1,1],[0,0,0,0,0],[2,2,2,2,2],[0,1,2,1,0],[2,1,0,1,2],[0,0,1,2,2],[2,2,1,0,0],[1,0,0,0,1],[1,2,2,2,1],[0,1,1,1,0],[2,1,1,1,2],[0,1,0,1,0],[2,1,2,1,2],[1,0,1,0,1],[1,2,1,2,1],[0,2,0,2,0],[2,0,2,0,2],[0,2,2,2,0],[2,0,0,0,2],[1,1,0,1,1],[1,1,2,1,1],[0,0,2,0,0],[2,2,0,2,2],[0,2,1,0,2],[2,0,1,2,0]];
const S={A:{img:'A.png',w:9,p:[0,0,2,6,15]},K:{img:'K.png',w:9,p:[0,0,2,5,12]},Q:{img:'Q.png',w:10,p:[0,0,1.5,4,10]},J:{img:'J.png',w:10,p:[0,0,1.5,4,8]},TEN:{img:'10.png',w:11,p:[0,0,1,3,7]},HELMET:{img:'helmet.png',w:6,p:[0,0,4,12,30]},LAUREL:{img:'laurel.png',w:6,p:[0,0,4,14,35]},LYRE:{img:'lyre.png',w:5,p:[0,0,5,18,45]},COIN:{img:'coin.png',w:5,p:[0,0,6,20,55]},MAP:{img:'map.png',w:5,p:[0,0,7,22,60]},CUP:{img:'cup.png',w:4,p:[0,0,8,30,80]},COLOSSEUM:{img:'colosseum.png',w:4,p:[0,0,10,40,100]},TEMPLE:{img:'temple.png',w:3,p:[0,0,12,50,125]},EAGLE:{img:'eagle.png',w:3,p:[0,0,15,65,160]},EMPEROR:{img:'emperor.png',w:2,p:[0,0,20,90,250]},WILD:{img:'../wild-gold.png',w:2,p:[0,0,25,100,300],special:1},SCATTER:{img:'../scatter.png',w:3,p:[0,0,2,10,50],special:1},BONUS:{img:'../bonus.png',w:2,p:[0,0,0,0,0],special:1}};
const debug={
  winChance:Number(MATH.lossToSmallWinChance??.52),
  bonusChance:.08,
  fourChance:Number(MATH.fourOfAKindChance??.10),
  maxAssist:Number(MATH.maxAssistedWinMultiplier??5),
  naturalHitEstimate:.22,
  naturalBonusEstimate:.015,
  lastCalculation:'Nessuna giocata calcolata.'
};
const state={credit:0,bets:[.25,.5,.75,1,1.5,2,3,5],bi:3,spinning:false,auto:false,free:0,spins:0,wager:0,paid:0,power:0,sound:true,lastWin:0,bonusIndex:0};
const $=id=>document.getElementById(id),reels=$('reels'),overlay=$('overlay'),card=$('card'),svg=$('paylines');
const money=v=>Number(v||0).toLocaleString('it-IT',{minimumFractionDigits:2,maximumFractionDigits:2});
const wait=ms=>new Promise(r=>setTimeout(r,ms));
function buildWeighted(){const a=[];for(const[k,v]of Object.entries(S)){const mult=(MATH.specialWeightMultiplier&&MATH.specialWeightMultiplier[k])||1;for(let i=0;i<Math.max(1,Math.round(v.w*mult));i++)a.push(k)}return a}
const weighted=buildWeighted(),rand=()=>weighted[Math.floor(Math.random()*weighted.length)],grid=()=>Array.from({length:5},()=>Array.from({length:3},rand));
function cell(k,c,r){const d=document.createElement('div');d.className='symbol'+(S[k].special?' special':'');d.dataset.k=k;d.dataset.c=c;d.dataset.r=r;d.innerHTML=`<img src="assets/symbols/${S[k].img}" alt="${k}">`;return d}
function render(g,spin=false){reels.innerHTML='';g.forEach((col,c)=>{const rr=document.createElement('div');rr.className='reel';col.forEach((k,row)=>{const d=cell(k,c,row);if(spin)d.classList.add('spinning');rr.appendChild(d)});reels.appendChild(rr)})}
function animateWildCell(el){if(!el||el.dataset.k!=='WILD')return;const sprite=document.createElement('div');sprite.className='wild-sprite';el.appendChild(sprite);const frames=[];for(let y=0;y<3;y++)for(let x=0;x<4;x++)frames.push([x,y]);let i=0;const timer=setInterval(()=>{const [x,y]=frames[i%frames.length];sprite.style.backgroundPosition=`${x*33.333}% ${y*50}%`;i++;if(i>=frames.length){clearInterval(timer);setTimeout(()=>sprite.remove(),120)}},75)}
function animateVisibleWilds(){document.querySelectorAll('.symbol[data-k="WILD"]').forEach((el,n)=>setTimeout(()=>animateWildCell(el),n*90))}
function evalGrid(g,bet){let total=0,wins=[];for(const rows of PAYLINES){const seq=rows.map((r,c)=>g[c][r]);let base=seq.find(x=>x!=='WILD');if(!base||base==='SCATTER'||base==='BONUS')continue;let count=0;for(const x of seq){if(x===base||x==='WILD')count++;else break}if(count>=3){const a=(S[base].p[count-1]||0)*(bet/25);if(a){total+=a;wins.push({rows,count,a})}}}const flat=g.flat(),sc=flat.filter(x=>x==='SCATTER').length,bo=flat.filter(x=>x==='BONUS').length;if(sc>=3)total+=bet*({3:2,4:10,5:50}[Math.min(sc,5)]||2);return{total,wins,sc,bo}}
function buildFrequentWinGrid(g){const line=PAYLINES[Math.floor(Math.random()*PAYLINES.length)],pool=(MATH.frequentWinSymbols||['TEN','J','Q','K','A']).filter(k=>S[k]),symbol=pool[Math.floor(Math.random()*pool.length)]||'TEN',count=Math.random()<debug.fourChance?4:3;for(let c=0;c<count;c++)g[c][line[c]]=symbol;return g}
function injectBonus(g){const cells=[];for(let c=0;c<5;c++)for(let r=0;r<3;r++)cells.push([c,r]);cells.sort(()=>Math.random()-.5);for(let i=0;i<3;i++){const[c,r]=cells[i];g[c][r]='BONUS'}return g}
function prepareGrid(g,bet){const natural=evalGrid(g,bet);const winRoll=Math.random(),bonusRoll=Math.random();let assisted=false,bonusInjected=false;
  if(natural.bo<3&&bonusRoll<debug.bonusChance){g=injectBonus(g.map(c=>c.slice()));bonusInjected=true}
  let result=evalGrid(g,bet);
  if(result.total<=0&&result.sc<3&&result.bo<3&&winRoll<debug.winChance){g=buildFrequentWinGrid(g.map(c=>c.slice()));result=evalGrid(g,bet);assisted=true;const cap=bet*debug.maxAssist;if(result.total>cap&&result.wins.length){const scale=cap/result.total;result.wins.forEach(w=>w.a*=scale);result.total=cap}}
  debug.lastCalculation=[`RNG vincita: ${winRoll.toFixed(4)} < soglia ${debug.winChance.toFixed(2)} = ${assisted?'SÌ':'NO'}`,`RNG bonus: ${bonusRoll.toFixed(4)} < soglia ${debug.bonusChance.toFixed(2)} = ${bonusInjected?'SÌ':'NO'}`,`Esito naturale: ${natural.total.toFixed(2)} crediti · Bonus naturali: ${natural.bo}`,`Esito finale base: ${result.total.toFixed(2)} crediti · Bonus: ${result.bo}`].join('\n');
  return{g,result,assisted,bonusInjected}
}
function projected(){const pHit=debug.naturalHitEstimate+(1-debug.naturalHitEstimate)*debug.winChance;const pBonus=1-(1-debug.naturalBonusEstimate)*(1-debug.bonusChance);return{hit:pHit,bonus:pBonus,wins1000:Math.round(pHit*1000),bonus1000:Math.round(pBonus*1000)}}
function hud(){
  $('credit').textContent=money(state.credit);$('bet').textContent=money(state.bets[state.bi]);$('freeText').textContent=`GIRI GRATIS ${state.free}`;$('powerFill').style.height=`${state.power/20*100}%`;$('powerText').textContent=`${state.power} / 20`;
  const r=state.wager?state.paid/state.wager*100:0,rtp=`${r.toFixed(2).replace('.',',')}%`;$('stats').textContent=`Giocate: ${state.spins} · RTP sessione: ${rtp} · Debug: ${(debug.winChance*100).toFixed(0)}% / Bonus ${(debug.bonusChance*100).toFixed(0)}%`;
  if($('mobileStats'))$('mobileStats').textContent=`${state.spins} giocate`;if($('mobileRtp'))$('mobileRtp').textContent=rtp;if($('mobileFree'))$('mobileFree').textContent=state.free;
}
function clear(){svg.innerHTML='';document.querySelectorAll('.win').forEach(e=>e.classList.remove('win'))}
function lines(ws){ws.forEach(w=>{const pts=[];for(let c=0;c<w.count;c++){const row=w.rows[c],el=reels.children[c].children[row];el.classList.add('win');pts.push(`${(c+.5)*200},${(row+.5)*200}`)}const p=document.createElementNS('http://www.w3.org/2000/svg','polyline');p.setAttribute('points',pts.join(' '));svg.appendChild(p)})}
async function modal(html,cls='',bg=''){card.className=cls;card.style.backgroundImage=bg?`linear-gradient(rgba(0,0,0,.25),rgba(0,0,0,.72)),url('${bg}')`:'';card.innerHTML=html;overlay.classList.remove('hidden');return new Promise(res=>{const close=()=>{overlay.classList.add('hidden');card.className='';card.style.backgroundImage='';res()};card.querySelectorAll('.close,.ok').forEach(b=>b.addEventListener('click',close))})}
async function bonusIntro(){card.className='visual';card.style.backgroundImage="url('assets/background-bonus.png')";card.innerHTML='<div class="bonusLogo">LOT EMPIRE</div><div class="litterioBonus">LITTERIO LO PRENDE E LO SPACCA! ⚡</div>';overlay.classList.remove('hidden');await wait(2400);overlay.classList.add('hidden');card.className='';card.style.backgroundImage=''}
function finishBonus(res,value){overlay.classList.add('hidden');card.className='';card.style.backgroundImage='';res(value)}
async function treasureBonus(bet){return new Promise(res=>{const vals=[2,3,5,8,10,12,15,20,30].sort(()=>Math.random()-.5);card.className='bonus-panel';card.innerHTML=`<h1>TESORI DELL'IMPERO</h1><p>Scegli un forziere.</p><div class="chests">${vals.map(v=>`<button class="chest" data-v="${v}">🎁</button>`).join('')}</div>`;overlay.classList.remove('hidden');card.querySelectorAll('.chest').forEach(b=>b.onclick=()=>{const v=Number(b.dataset.v)*bet;b.textContent=money(v);card.querySelectorAll('button').forEach(x=>x.disabled=true);setTimeout(()=>finishBonus(res,v),1200)})})}
async function wheelBonus(bet){return new Promise(res=>{const vals=[2,3,5,8,10,12,20,50],idx=Math.floor(Math.random()*vals.length),v=vals[idx]*bet;card.className='bonus-panel';card.innerHTML='<h1>RUOTA DELLA FORTUNA</h1><div id="bonusWheel" class="wheel">GIRA</div><div class="modal-actions"><button id="wheelGo">GIRA LA RUOTA</button></div>';overlay.classList.remove('hidden');$('wheelGo').onclick=()=>{$('wheelGo').disabled=true;$('bonusWheel').style.transform=`rotate(${1440+idx*45}deg)`;setTimeout(()=>{$('bonusWheel').textContent=`×${vals[idx]}`;setTimeout(()=>finishBonus(res,v),900)},2300)}})}
async function shieldBonus(bet){return new Promise(res=>{const vals=[3,4,5,7,8,10,12,25,40].sort(()=>Math.random()-.5);card.className='bonus-panel';card.innerHTML=`<h1>SCELTA IMPERIALE</h1><p>Scegli uno scudo e rivela il premio.</p><div class="shield-grid">${vals.map(v=>`<button class="shield" data-v="${v}">🛡️</button>`).join('')}</div>`;overlay.classList.remove('hidden');card.querySelectorAll('.shield').forEach(b=>b.onclick=()=>{const v=Number(b.dataset.v)*bet;b.textContent=`×${b.dataset.v}`;card.querySelectorAll('button').forEach(x=>x.disabled=true);setTimeout(()=>finishBonus(res,v),1200)})})}
async function litterioRevealBonus(bet){return new Promise(res=>{
  const deck=['L','L','L','L',2,3,4,5,6,8,10,15].sort(()=>Math.random()-.5);let found=0,bank=0,opened=0,done=false;
  card.className='bonus-panel';card.innerHTML=`<h1>LITTERIO EMPIRE</h1><p>Premi le caselle: trova 3 Litterio per conquistare il premio imperiale.</p><div id="litterioCounter" class="litterio-counter">Litterio trovati: 0 / 3 · Premio: 0,00</div><div class="litterio-grid">${deck.map((v,i)=>`<button class="litterio-box" data-i="${i}" data-v="${v}">?</button>`).join('')}</div>`;overlay.classList.remove('hidden');
  const finish=()=>{if(done)return;done=true;const prize=Math.max(bet*5,bank*bet);card.querySelectorAll('.litterio-box').forEach(x=>x.disabled=true);setTimeout(()=>finishBonus(res,prize),1400)};
  card.querySelectorAll('.litterio-box').forEach(b=>b.addEventListener('click',()=>{if(done||b.disabled)return;b.disabled=true;b.classList.add('revealed');opened++;const v=b.dataset.v;if(v==='L'){found++;b.innerHTML='<img src="assets/bonus.png" alt="Litterio Empire">';animateWildCell(b)}else{bank+=Number(v);b.innerHTML=`<span class="reveal-value">×${v}</span>`}const prize=Math.max(bet*5,bank*bet);card.querySelector('#litterioCounter').textContent=`Litterio trovati: ${found} / 3 · Premio: ${money(prize)}`;if(found>=3||opened>=deck.length-2)finish()}));
})}
async function bonusGame(bet){await bonusIntro();const games=[treasureBonus,wheelBonus,shieldBonus,litterioRevealBonus],fn=games[state.bonusIndex%games.length];state.bonusIndex++;return fn(bet)}
async function big(title,amount){await modal(`<div class="popup-panel"><h1>${title}</h1><div class="bigAmount">${money(amount)}</div><button class="ok">CONTINUA</button></div>`,'visual','assets/win-popups.png')}
const voucherMemory={};
function getVouchers(){
  try{
    const raw=localStorage.getItem('lotEmpireVouchersV6');
    return raw?JSON.parse(raw):voucherMemory;
  }catch{return voucherMemory}
}
function setVouchers(v){
  Object.keys(voucherMemory).forEach(k=>delete voucherMemory[k]);
  Object.assign(voucherMemory,v);
  try{localStorage.setItem('lotEmpireVouchersV6',JSON.stringify(v))}catch{}
}
const CODE_ALPHABET='0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
function checksumFor(amountPart,nonce){
  let n=17;
  for(const ch of amountPart+nonce)n=(n*31+CODE_ALPHABET.indexOf(ch)+1)%36;
  return CODE_ALPHABET[n];
}
function encodeVoucher(amount){
  const cents=Math.round(amount*100);
  const amountPart=cents.toString(36).toUpperCase();
  let code,nonce;
  const vouchers=getVouchers();
  do{
    nonce=CODE_ALPHABET[Math.floor(Math.random()*36)];
    code=amountPart+nonce+checksumFor(amountPart,nonce);
  }while(vouchers[code]);
  return {code,amountPart,nonce,checksum:code.slice(-1),cents};
}
function decodeVoucherAmount(code){
  const clean=String(code||'').trim().toUpperCase().replace(/[^0-9A-Z]/g,'');
  if(clean.length<3)return null;
  const amountPart=clean.slice(0,-2),nonce=clean.slice(-2,-1),check=clean.slice(-1);
  if(checksumFor(amountPart,nonce)!==check)return null;
  const cents=parseInt(amountPart,36);
  if(!Number.isSafeInteger(cents)||cents<=0)return null;
  return {clean,cents,amount:cents/100,amountPart,nonce,check};
}
function closeOverlay(){overlay.classList.add('hidden');card.innerHTML=''}
function openCashout(){
  if(state.spinning)return;
  const max=Math.max(0,state.credit);
  const suggested=Math.min(state.lastWin>0?state.lastWin:max,max);
  card.className='wallet-panel';
  card.innerHTML=`<button class="close" type="button">×</button><h1>RISCUOTI CREDITI DEMO</h1><p>Il valore viene convertito direttamente in base 36: per questo il codice usa meno caratteri rispetto alla cifra decimale. Gli ultimi due caratteri identificano e verificano il voucher.</p><label for="cashAmount">Importo massimo: <b>${money(max)}</b></label><input id="cashAmount" inputmode="decimal" type="number" min="0.01" max="${max}" step="0.01" value="${suggested.toFixed(2)}"><div id="cashPreview" class="amount-preview"></div><div class="modal-actions"><button type="button" id="createVoucher">GENERA CODICE</button><button type="button" class="cancel">ANNULLA</button></div><div id="voucherResult" aria-live="polite"></div>`;
  overlay.classList.remove('hidden');
  const amountInput=card.querySelector('#cashAmount');
  const preview=card.querySelector('#cashPreview');
  const refreshPreview=()=>{
    const amount=Math.round(Number(amountInput.value)*100)/100;
    if(!Number.isFinite(amount)||amount<=0){preview.textContent='Inserisci un importo valido.';return}
    const cents=Math.round(amount*100),part=cents.toString(36).toUpperCase();
    preview.innerHTML=`${money(amount)} = ${cents} centesimi = <b>${part}</b> in base 36<br><small>Codice finale previsto: ${part} + 2 caratteri di controllo</small>`;
  };
  amountInput.addEventListener('input',refreshPreview);refreshPreview();
  card.querySelector('.close').addEventListener('click',closeOverlay);
  card.querySelector('.cancel').addEventListener('click',closeOverlay);
  card.querySelector('#createVoucher').addEventListener('click',()=>{
    const amount=Math.round(Number(amountInput.value)*100)/100;
    const result=card.querySelector('#voucherResult');
    if(!Number.isFinite(amount)||amount<=0||amount>state.credit){result.textContent='Importo non valido o superiore al credito disponibile.';return}
    const encoded=encodeVoucher(amount),v=getVouchers();
    v[encoded.code]={amount,cents:encoded.cents,used:false,created:Date.now()};
    setVouchers(v);state.credit-=amount;state.lastWin=0;hud();
    result.innerHTML=`<div class="compact-code">${encoded.code}</div><p>Valore voucher: <b>${money(amount)} crediti demo</b></p><div class="code-breakdown">IMPORTO: ${encoded.amountPart} (base 36)<br>CONTROLLO: ${encoded.nonce}${encoded.checksum}<br>CODICE: ${encoded.code}</div>`;
    $('walletStatus').textContent=`Ultimo voucher: ${encoded.code} · ${money(amount)}`;
    card.querySelector('#createVoucher').disabled=true;amountInput.disabled=true;
  });
}
function openRecharge(){
  if(state.spinning)return;
  card.className='wallet-panel';
  card.innerHTML='<button class="close" type="button">×</button><h1>RICARICA BORSELLINO</h1><p>Inserisci il codice alfanumerico compatto. Il gioco decodifica la parte in base 36, verifica la firma e controlla che il voucher non sia già stato usato.</p><input id="voucherInput" inputmode="text" maxlength="12" autocomplete="off" autocapitalize="characters" placeholder="ES. 255SAB"><div id="decodePreview" class="amount-preview">In attesa del codice…</div><div class="modal-actions"><button type="button" id="redeemVoucher">AGGIUNGI CREDITI</button><button type="button" class="cancel">ANNULLA</button></div><div id="redeemResult" aria-live="polite"></div>';
  overlay.classList.remove('hidden');
  const input=card.querySelector('#voucherInput'),preview=card.querySelector('#decodePreview'),result=card.querySelector('#redeemResult');
  const showDecode=()=>{
    input.value=input.value.toUpperCase().replace(/[^0-9A-Z]/g,'');
    const decoded=decodeVoucherAmount(input.value);
    preview.innerHTML=decoded?`Valore decodificato: <b>${money(decoded.amount)}</b><br><small>${decoded.amountPart} base 36 = ${decoded.cents} centesimi · firma valida</small>`:'Codice incompleto o firma non valida.';
  };
  input.addEventListener('input',showDecode);
  card.querySelector('.close').addEventListener('click',closeOverlay);
  card.querySelector('.cancel').addEventListener('click',closeOverlay);
  card.querySelector('#redeemVoucher').addEventListener('click',()=>{
    const code=input.value.trim().toUpperCase(),decoded=decodeVoucherAmount(code),v=getVouchers(),item=v[code];
    if(!decoded){result.textContent='Codice non valido: controllo alfanumerico fallito.';return}
    if(!item){result.textContent='Codice formalmente valido, ma non emesso da questo browser.';return}
    if(item.used){result.textContent='Codice già utilizzato.';return}
    if(Math.round(Number(item.amount)*100)!==decoded.cents){result.textContent='Il valore del codice non coincide con il voucher salvato.';return}
    item.used=true;v[code]=item;setVouchers(v);state.credit+=decoded.amount;hud();
    result.innerHTML=`<p>Ricarica completata: <b>${money(decoded.amount)} crediti demo</b></p>`;
    $('walletStatus').textContent=`Voucher ${code} utilizzato`;
    card.querySelector('#redeemVoucher').disabled=true;input.disabled=true;
  });
}
function openDebug(){
  card.className='debug-panel';
  card.innerHTML=`<button class="close" type="button">×</button><h1>Debugging mode</h1><div class="debug-grid"><div class="debug-control"><label for="dbgWin">Percentuale vincite assistite <b id="dbgWinVal">${Math.round(debug.winChance*100)}%</b></label><input id="dbgWin" type="range" min="0" max="100" value="${Math.round(debug.winChance*100)}"></div><div class="debug-control"><label for="dbgBonus">Frequenza combinazioni Bonus <b id="dbgBonusVal">${Math.round(debug.bonusChance*100)}%</b></label><input id="dbgBonus" type="range" min="0" max="50" value="${Math.round(debug.bonusChance*100)}"></div><div class="debug-control"><label for="dbgFour">Probabilità 4 simboli <b id="dbgFourVal">${Math.round(debug.fourChance*100)}%</b></label><input id="dbgFour" type="range" min="0" max="100" value="${Math.round(debug.fourChance*100)}"></div><div class="debug-control"><label for="dbgCap">Limite vincita assistita <b id="dbgCapVal">×${debug.maxAssist}</b></label><input id="dbgCap" type="range" min="1" max="20" value="${debug.maxAssist}"></div></div><div id="debugMath" class="debug-math"></div><div id="debugLive" class="debug-live">${debug.lastCalculation}</div><div class="modal-actions"><button type="button" class="ok">APPLICA E CHIUDI</button></div>`;
  overlay.classList.remove('hidden');
  const q=id=>card.querySelector('#'+id);
  const refresh=()=>{
    debug.winChance=Number(q('dbgWin').value)/100;debug.bonusChance=Number(q('dbgBonus').value)/100;debug.fourChance=Number(q('dbgFour').value)/100;debug.maxAssist=Number(q('dbgCap').value);
    q('dbgWinVal').textContent=`${q('dbgWin').value}%`;q('dbgBonusVal').textContent=`${q('dbgBonus').value}%`;q('dbgFourVal').textContent=`${q('dbgFour').value}%`;q('dbgCapVal').textContent=`×${q('dbgCap').value}`;
    const pr=projected();q('debugMath').innerHTML=`<b>Proiezione su 1.000 giocate</b><br><code>P(vincita)=0,22+(1−0,22)×${debug.winChance.toFixed(2)}=${pr.hit.toFixed(3)}</code><br>Vincite stimate: <b>${pr.wins1000}</b><br><code>P(bonus)=1−(1−0,015)×(1−${debug.bonusChance.toFixed(2)})=${pr.bonus.toFixed(3)}</code><br>Bonus stimati: <b>${pr.bonus1000}</b><br><small>Proiezione tecnica indicativa; ogni spin usa comunque il generatore casuale.</small>`;
  };
  ['dbgWin','dbgBonus','dbgFour','dbgCap'].forEach(id=>q(id).addEventListener('input',refresh));refresh();
  card.querySelector('.close').addEventListener('click',closeOverlay);card.querySelector('.ok').addEventListener('click',()=>{closeOverlay();hud()});
}
async function spin(){if(state.spinning)return;const bet=state.bets[state.bi];if(state.free===0&&state.credit<bet){await modal('<h2>Credito insufficiente</h2><p>Usa RICARICA con un voucher demo oppure riavvia e aggiungi credito demo.</p><button class="ok">CHIUDI</button>');return}state.spinning=true;$('spinBtn').disabled=true;clear();$('win').textContent='0,00';if(state.free>0)state.free--;else{state.credit-=bet;state.wager+=bet}state.spins++;hud();$('message').textContent='I rulli ruotano...';render(grid(),true);let prepared=prepareGrid(grid(),bet),g=prepared.g;for(let c=0;c<5;c++){await wait(300+c*90);const rr=reels.children[c];for(let row=0;row<3;row++)rr.replaceChild(cell(g[c][row],c,row),rr.children[row]);rr.animate([{transform:'translateY(-18px)'},{transform:'translateY(8px)'},{transform:'translateY(0)'}],{duration:300,easing:'ease-out'});[...rr.children].forEach(animateWildCell)}await wait(180);const result=prepared.result;let total=result.total;if(result.sc>=3){const n={3:8,4:12,5:15}[Math.min(result.sc,5)]||8;state.free+=n;await modal(`<div class="popup-panel"><h1>GIRI GRATIS!</h1><div class="bigAmount">${n}</div><button class="ok">INIZIA</button></div>`,'visual','assets/bonus-popup.png')}if(result.bo>=3)total+=await bonusGame(bet);state.lastWin=total;if(total>0){state.credit+=total;state.paid+=total;state.power=Math.min(20,state.power+Math.max(Number(MATH.minimumPowerGainOnWin||1),Math.round(total/bet)));lines(result.wins);$('win').textContent=money(total);$('message').textContent=`${prepared.assisted?'VINCITA IMPERIALE':'VINCITA'} ${money(total)}`;if(total>=bet*20)await big(total>=bet*100?'IMPERIAL WIN':total>=bet*50?'MEGA WIN':'BIG WIN',total)}else $('message').textContent='L’Impero attende il prossimo colpo!';if(state.power>=20){const p=bet*10;state.credit+=p;state.paid+=p;state.lastWin+=p;state.power=0;await modal(`<div class="popup-panel"><h1>POTERE DELL'IMPERO!</h1><div class="bigAmount">${money(p)}</div><button class="ok">CONTINUA</button></div>`,'visual','assets/power-bar.png')}hud();state.spinning=false;$('spinBtn').disabled=false;if(state.auto)setTimeout(spin,650)}
$('spinBtn').onclick=spin;$('debugTopBtn').onclick=openDebug;$('cashoutTopBtn').onclick=openCashout;$('rechargeTopBtn').onclick=openRecharge;$('betDown').onclick=()=>{if(!state.spinning){state.bi=Math.max(0,state.bi-1);hud()}};$('betUp').onclick=()=>{if(!state.spinning){state.bi=Math.min(state.bets.length-1,state.bi+1);hud()}};$('maxBtn').onclick=()=>{state.bi=state.bets.length-1;hud()};$('autoBtn').onclick=()=>{state.auto=!state.auto;$('autoBtn').textContent=state.auto?'STOP':'AUTO';if(state.auto&&!state.spinning)spin()};$('soundBtn').onclick=()=>{state.sound=!state.sound;$('soundBtn').textContent=`AUDIO ${state.sound?'ON':'OFF'}`};$('debugBtn').onclick=openDebug;$('cashoutBtn').onclick=openCashout;$('rechargeBtn').onclick=openRecharge;
$('rulesBtn').onclick=()=>modal('<button class="close">×</button><h1>REGOLE</h1><img src="assets/paytable.png" style="width:100%"><p>5 rulli, 3 righe, 25 linee. Wild sostituisce i simboli normali. 3 Scatter assegnano giri gratis. 3 Bonus aprono uno dei quattro minigiochi a rotazione, incluso Litterio Empire.</p><button class="ok">CHIUDI</button>');
$('galleryBtn').onclick=()=>modal(`<button class="close">×</button><h1>ASSET LOT EMPIRE</h1><div class="gallery">${['number-font.png','jackpots.png','prize-coins.png','multipliers.png','loading-bars.png','power-bar.png','wild-animation.png','reel-spin.png','reel-stop.png','bonus-sequence.png'].map(x=>`<img src="assets/${x}">`).join('')}</div><button class="ok">CHIUDI</button>`);
document.addEventListener('keydown',e=>{if(e.code==='Space'&&!overlay.classList.contains('hidden'))return;if(e.code==='Space'&&!$('app').classList.contains('locked')){e.preventDefault();spin()}});
function unlockGame(){if(state.credit<=0)return;$('creditGate').classList.add('hidden');$('app').classList.remove('locked');hud();setTimeout(animateVisibleWilds,250)}
$('addDemoCredit').addEventListener('click',()=>{state.credit=999;$('gateCredit').textContent=money(state.credit);$('gateStatus').textContent='Credito demo caricato. Avvio LOT EMPIRE…';hud();setTimeout(unlockGame,450)});
$('gateRecharge').addEventListener('click',()=>{openRecharge();const observer=new MutationObserver(()=>{if(state.credit>0){$('gateCredit').textContent=money(state.credit);$('gateStatus').textContent='Codice accettato. Avvio LOT EMPIRE…';observer.disconnect();setTimeout(unlockGame,450)}});observer.observe($('credit'),{childList:true,subtree:true,characterData:true})});
render(grid());hud();
function runLoading(){const bar=document.querySelector('.loadtrack i'),txt=$('loadingText');let value=0;const timer=setInterval(()=>{value=Math.min(100,value+Math.floor(Math.random()*9)+3);bar.style.width=value+'%';txt.textContent=`CARICAMENTO SISTEMA ${value}%`;if(value>=100){clearInterval(timer);setTimeout(()=>{$('loading').style.display='none';$('creditGate').classList.remove('hidden')},350)}},90)}
window.addEventListener('load',runLoading);setTimeout(()=>{const l=$('loading');if(l&&l.style.display!=='none'){l.style.display='none';$('creditGate').classList.remove('hidden')}},6000);
})();
