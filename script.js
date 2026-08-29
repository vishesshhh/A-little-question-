const SECRET = "WANNA HAVE SOME GULU GULU";
const rows = ["QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM"];

const heartSeeds = Array.from({length: 30}, (_, i) => ({
  left: `${(i * 31 + 5) % 103 - 2}%`, delay: `${(i * .63) % 10}s`,
  duration: `${10 + (i % 8)}s`, size: `${20 + (i * 11) % 48}px`, drift: `${-35 + (i * 17) % 70}px`
}));

const root = document.getElementById('root');
let stage = 0;

function backgroundHTML(){
  return `<div class="ambient"></div>
    <div class="sparkles">${Array.from({length:28},(_,i)=>`<i style="left:${(i*43+7)%98}%;top:${(i*29+3)%100}%;width:${3+(i%5)}px;height:${3+(i%5)}px;animation-delay:${(i*.37)%3.5}s"></i>`).join('')}</div>
    <div class="hearts-bg">${heartSeeds.map(h=>`<span style="left:${h.left};animation-delay:${h.delay};animation-duration:${h.duration};font-size:${h.size};--drift:${h.drift}">❤️</span>`).join('')}</div>`;
}
function burst(n=12){ return `<div class="burst">${Array.from({length:n},(_,i)=>`<span style="--a:${i*360/n}deg">❤️</span>`).join('')}</div>`; }
function render(){
  root.innerHTML = `<main class="app">${backgroundHTML()}<div id="screen"></div></main>`;
  const screen=document.getElementById('screen');
  if(stage===0) intro(screen); else if(stage===1) hidden(screen); else if(stage===2) secret(screen); else if(stage===3) question(screen); else final(screen);
}
function intro(el){
  let caught=0,pops=[];
  const positions=[[17,38],[83,38],[17,65],[83,65],[50,86],[38,87],[63,87]];
  el.innerHTML=`<section class="screen intro"><div class="intro-top"><h1>Hey dear <span>❤️</span></h1><p>I have a little question for you...</p><p class="tiny">Catch the hearts first 👀</p><div class="score">Hearts: 0/5 ❤️</div></div>${positions.map(([x,y],i)=>`<button class="catch ${i<5?'':'decoy'}" style="left:${x}%;top:${y}%;animation-delay:${i*.18}s">❤️</button>`).join('')}</section>`;
  const buttons=el.querySelectorAll('.catch');
  buttons.forEach((b,i)=>b.onclick=()=>{
    if(i>=5||i<0)return;
    b.style.pointerEvents='none'; b.style.opacity='0'; caught++;
    el.querySelector('.score').textContent=`Hearts: ${caught}/5 ❤️`;
    if(caught===5){ el.insertAdjacentHTML('beforeend',`${burst(12)}<div class="success-pop">You caught them all! 💕</div>`); setTimeout(()=>{stage=1;render()},700); }
  });
}
function hidden(el){
  el.innerHTML=`<section class="screen hidden"><div class="hidden-card"><h2>Now there's something hidden...</h2><p class="redline">Can you figure it out? 👀</p><p class="hint">Use the keyboard to unlock it ❤️</p><button class="go">Let's go ❤️</button></div></section>`;
  el.querySelector('.go').onclick=()=>{el.insertAdjacentHTML('beforeend',`<div class="transition-hearts">${burst(20)}</div>`);setTimeout(()=>{stage=2;render()},520)};
}
function secret(el){
  let typed=''; let locked=false;
  function advanceSpaces(){ while(typed.length<SECRET.length && SECRET[typed.length]===' ') typed+=' '; }
  function expected(){ return SECRET[typed.length]; }
  function update(){
    const display=el.querySelector('.secret-display');
    const words=SECRET.split(' '); let cursor=0;
    display.innerHTML=words.map((word,wi)=>{
      // Consume the space in SECRET before rendering every word after the first.
      if(wi>0) cursor++;
      let s='<span class="word">';
      for(let j=0;j<word.length;j++,cursor++){
        const filled = cursor < typed.length;
        s += `<span class="${filled?'filled':''}">${filled ? SECRET[cursor] : '_'}</span>`;
      }
      s += '</span>';
      return s;
    }).join('<span class="word-space"></span>');
    const exp=expected();
    el.querySelectorAll('.key').forEach(k=>k.classList.toggle('glow',!!exp&&k.dataset.letter===exp));
    if(typed.length===SECRET.length){ locked=true; el.querySelector('.unlock').textContent='Unlocked! ❤️'; setTimeout(()=>{stage=3;render()},900); }
  }
  function press(letter){
    if(locked)return;
    advanceSpaces();
    const exp=expected();
    if(!exp){update();return;}
    if(letter===exp){typed+=letter; advanceSpaces(); update();}
    else { const d=el.querySelector('.secret-display'); d.classList.remove('shake'); void d.offsetWidth; d.classList.add('shake'); setTimeout(()=>d.classList.remove('shake'),300); }
  }
  el.innerHTML=`<section class="screen secret"><div class="secret-card"><h2>Type the secret message...</h2><p class="hint faded">Tap the glowing letter ❤️</p><div class="secret-display"></div><div class="keyboard">${rows.map(row=>`<div class="keyrow">${row.split('').map(letter=>`<button class="key" data-letter="${letter}">${letter}</button>`).join('')}</div>`).join('')}</div><div class="unlock"></div></div></section>`;
  el.querySelectorAll('.key').forEach(k=>k.onclick=()=>press(k.dataset.letter));
  document.onkeydown=e=>{if(/^[a-zA-Z]$/.test(e.key))press(e.key.toUpperCase());};
  advanceSpaces(); update();
}
function question(el){
  let maybe=0; let x=0,y=0;
  el.innerHTML=`<section class="screen question"><div class="question-card"><h2>Wanna have some gulu gulu? ❤️</h2><p class="with">With me? 😳</p><button class="yes">YES 🙈❤️</button><button class="maybe">Maybe 👀</button><div class="try" style="display:none"><div>Hehe, nice try 😜</div><strong>Just press YES ❤️</strong></div><div class="tease" style="display:none">Nope! 😝</div></div></section>`;
  const yes=el.querySelector('.yes'), maybeBtn=el.querySelector('.maybe'), tryBox=el.querySelector('.try'), tease=el.querySelector('.tease');
  maybeBtn.onclick=()=>{
    maybe++; const maxX=Math.min(125,window.innerWidth*.25), maxY=Math.min(180,window.innerHeight*.18);
    x=(Math.random()*2-1)*maxX; y=(Math.random()*2-1)*maxY;
    maybeBtn.style.setProperty('--mx',x+'px'); maybeBtn.style.setProperty('--my',y+'px'); maybeBtn.classList.add('moved');
    tryBox.style.display='block'; if(maybe>1)tease.style.display='block';
    yes.classList.add('yes-attention');
  };
  yes.onclick=()=>{el.insertAdjacentHTML('beforeend',burst(26));setTimeout(()=>{stage=4;render()},850)};
}
function final(el){el.innerHTML=`<section class="screen final"><div class="final-card"><div class="big-heart">❤️</div><h2>Wanna have some gulu gulu? ❤️</h2><p class="with">With me? 😳</p><h3>HEHE... I KNEW IT! ❤️</h3><p class="looks">Looks like it's a YES. 🙈</p><p class="sign">— dev</p><div class="final-hearts">💕 💗 💕</div></div></section>`;}

document.addEventListener('DOMContentLoaded',render);
