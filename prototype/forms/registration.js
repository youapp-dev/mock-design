
let cc='my';
const face=(x,y,s=1,mouth='smile')=>`<g transform="translate(${x} ${y}) scale(${s})">
  <g class="blink"><ellipse cx="-6" cy="0" rx="2.6" ry="3.2" fill="#2A1A3A"/><ellipse cx="6" cy="0" rx="2.6" ry="3.2" fill="#2A1A3A"/></g>
  <circle cx="-5.2" cy="-1.2" r="1" fill="#fff"/><circle cx="6.8" cy="-1.2" r="1" fill="#fff"/>
  <ellipse cx="-10" cy="4.5" rx="3.2" ry="2" fill="#FF7BA3" opacity=".7"/><ellipse cx="10" cy="4.5" rx="3.2" ry="2" fill="#FF7BA3" opacity=".7"/>
  ${mouth==='open'?'<path d="M-3.5 4 Q0 9.5 3.5 4 Z" fill="#B3284A"/>':'<path d="M-3 4 Q0 7 3 4" stroke="#2A1A3A" stroke-width="1.6" fill="none" stroke-linecap="round"/>'}</g>`;
const coinRaw=(id,c0,c1,c2,lab)=>`<g id="${id}"><g class="bob"><ellipse cx="-6" cy="19" rx="4" ry="2.5" fill="${c1}"/><ellipse cx="6" cy="19" rx="4" ry="2.5" fill="${c1}"/>
  <circle r="17" fill="${c1}"/><circle r="15" fill="${c0}"/><circle r="11.5" fill="none" stroke="#fff" stroke-opacity=".45" stroke-width="1.5"/>
  <text y="-6" text-anchor="middle" font-family="Baloo 2,sans-serif" font-weight="800" font-size="8" fill="${c2}">${lab}</text>${face(0,3,.62)}
  <path d="M-15 2 q-7 -4 -6 -10" stroke="${c1}" stroke-width="3" fill="none" stroke-linecap="round"/><path class="wave" d="M15 2 q7 -4 6 -10" stroke="${c1}" stroke-width="3" fill="none" stroke-linecap="round"/></g></g>`;
const cloud=(x,y,s)=>`<g transform="translate(${x} ${y}) scale(${s})"><g class="drift"><path d="M-30 8 a12 12 0 0 1 4-22 a16 16 0 0 1 30-6 a13 13 0 0 1 24 10 a10 10 0 0 1 -2 18 Z" fill="#fff" opacity=".92"/>${face(0,-2,.55)}</g></g>`;
const cat=(id)=>`<g id="${id}"><ellipse cx="0" cy="22" rx="16" ry="14" fill="#fff"/><path d="M-8 12 q8 -6 16 0 v8 h-16Z" fill="#F2A35E" opacity=".9"/>
  <path class="wiggle" d="M14 26 q16 -2 14 -18" stroke="#F2A35E" stroke-width="5" fill="none" stroke-linecap="round"/>
  <circle cx="0" cy="0" r="14" fill="#fff"/><path d="M-12 -6 l-2 -12 l9 6Z M12 -6 l2 -12 l-9 6Z" fill="#fff"/><path d="M-11 -9 l-1 -6 l4 3Z" fill="#FF9CB8"/><path d="M4 -10 a6 6 0 0 1 8 2 a8 8 0 0 1 -8 4Z" fill="#F2A35E"/>
  ${face(0,2,.6)}<path class="wave" d="M-14 16 q-12 -6 -10 -18" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round"/></g>`;
const stars=[[24,40],[288,30],[200,18],[110,60],[60,120],[300,150]].map(([x,y],i)=>`<path class="twk" style="animation-delay:${i*.35}s" d="M${x} ${y-5} l1.5 3.5 l3.5 1.5 l-3.5 1.5 l-1.5 3.5 l-1.5 -3.5 l-3.5 -1.5 l3.5 -1.5Z" fill="#FFF3C4"/>`).join('');
const moon=`<g transform="translate(46 54)"><circle r="18" fill="#FFF3C4"/><circle cx="7" cy="-5" r="16" fill="#B48ADB" opacity="0"/>${face(0,2,.6)}</g>`;
const cup=(id,clip,liq,lab,s=1)=>`<g id="${id}" transform="scale(${s})"><g clip-path="url(#${clip})"><rect id="${liq}" x="-32" y="-30" width="64" height="80"/><ellipse id="${liq}f" cx="0" cy="-30" rx="30" ry="5" fill="#FFF1DC"/></g>
  <path d="M-26 -30 L26 -30 L20 30 Q0 37 -20 30 Z" fill="none" stroke="#fff" stroke-width="4" stroke-linejoin="round"/>${face(0,8,.7)}
  <text x="0" y="52" text-anchor="middle" font-family="Baloo 2,sans-serif" font-weight="800" font-size="13" fill="#fff">${lab}</text></g>`;
const eth=`<g id="eth"><g class="bob"><path d="M0 -22 L15 2 L0 10 L-15 2 Z" fill="#fff"/><path d="M0 13 L15 5 L0 26 L-15 5 Z" fill="#E7DBFF"/><path d="M0 -22 L0 10 L15 2 Z" fill="#D7C6FF"/>${face(0,0,.5)}<path class="wave" d="M14 4 q8 -4 9 -12" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M-14 4 q-8 -4 -9 -12" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round"/></g></g>`;

const hornbill=(id)=>`<g id="${id}">
  <path d="M-30 4 q-16 6 -20 18 q12 -2 22 -10Z" fill="#fff"/><path d="M-44 18 q8 -3 14 -8" stroke="#2A2A3A" stroke-width="3"/>
  <ellipse cx="0" cy="6" rx="26" ry="16" fill="#2E2A3D"/><ellipse cx="4" cy="12" rx="15" ry="9" fill="#fff"/>
  <path class="flap" d="M-6 0 q-10 -30 10 -36 q8 14 6 34Z" fill="#3F3954"/>
  <circle cx="22" cy="-8" r="12" fill="#2E2A3D"/>
  <path d="M28 -16 q22 -8 30 2 q-10 -2 -26 6Z" fill="#FFB020"/><path d="M30 -8 q26 2 32 14 q-16 -6 -30 -6Z" fill="#FFD25A"/><path d="M31 -6 q20 4 24 10" stroke="#E07A00" stroke-width="1.2" fill="none"/>
  ${face(20,-8,.55)}<g transform="translate(2 22)"><path d="M-4 0 v8 M4 0 v8" stroke="#FFB020" stroke-width="2.5" stroke-linecap="round"/></g></g>`;
const egret=(id)=>`<g id="${id}">
  <path d="M-28 6 q-18 2 -24 10 q12 2 24 -4Z" fill="#E9EEF5"/>
  <ellipse cx="0" cy="8" rx="24" ry="14" fill="#fff"/>
  <path class="flap" d="M-8 2 q-8 -32 14 -36 q6 16 4 36Z" fill="#E9EEF5"/>
  <path d="M16 2 q14 -6 6 -18 q-6 -8 4 -12" stroke="#fff" stroke-width="9" fill="none" stroke-linecap="round"/>
  <circle cx="28" cy="-30" r="10" fill="#fff"/><path d="M36 -32 l26 4 l-26 4Z" fill="#FFC83D"/>
  ${face(26,-30,.48)}<g transform="translate(0 20)"><path d="M-4 0 v14 M4 0 v14" stroke="#2A2A3A" stroke-width="2.5" stroke-linecap="round"/></g></g>`;
const BIRD={my:hornbill,sg:hornbill,vn:egret};

const MP={utan:{body:'#D4661F',belly:'#F2A35E',head:'#E07A2E',mask:'#F7C08A',earIn:'#F2A35E'},
 otter:{body:'#7E5034',belly:'#E8CBA6',head:'#8E5C3C',mask:'#F0D8B8',earIn:'#E8CBA6'},
 buffalo:{body:'#6F7C8E',belly:'#B9C3D0',head:'#7F8C9E',mask:'#CBD3DD',earIn:'#E6B8C2'}};
const KIND={my:'utan',sg:'otter',vn:'buffalo'};
const ARMS={wave:'<path class="wave" d="M20 34 q20 -6 24 -26" stroke="{C}" stroke-width="9" fill="none" stroke-linecap="round"/><path d="M-20 34 q-18 8 -20 26" stroke="{C}" stroke-width="9" fill="none" stroke-linecap="round"/>',
 tarik:'<path id="armL" d="M-20 34 q-30 -14 -46 -66" stroke="{C}" stroke-width="9" fill="none" stroke-linecap="round"/><path d="M20 34 q24 18 38 50" stroke="{C}" stroke-width="9" fill="none" stroke-linecap="round"/>',
 cheer:'<path class="wave" d="M20 34 q16 -16 18 -40" stroke="{C}" stroke-width="9" fill="none" stroke-linecap="round"/><path class="wave" d="M-20 34 q-16 -16 -18 -40" stroke="{C}" stroke-width="9" fill="none" stroke-linecap="round"/>',
 ride:'<path d="M-16 40 q-10 -4 -14 -16" stroke="{C}" stroke-width="9" fill="none" stroke-linecap="round"/>'};
const mascot=(cc,id,hat,arms='wave')=>{const k=KIND[cc],m=MP[k];const ar=ARMS[arms].split('{C}').join(m.body);
  let ears,top='',extra='';
  if(k==='utan'){ears=`<circle cx="-21" cy="2" r="7" fill="${m.body}"/><circle cx="21" cy="2" r="7" fill="${m.body}"/><circle cx="-21" cy="2" r="3.5" fill="${m.earIn}"/><circle cx="21" cy="2" r="3.5" fill="${m.earIn}"/>`;top=`<path d="M-8 -21 q4 -10 8 -2 q4 -9 8 2" fill="${m.head}"/>`;}
  else if(k==='otter'){ears=`<circle cx="-17" cy="-12" r="5" fill="${m.body}"/><circle cx="17" cy="-12" r="5" fill="${m.body}"/>`;extra=`<ellipse cx="0" cy="5" rx="3.4" ry="2.4" fill="#3A2416"/><path d="M-8 9 h-10 M-8 11 l-9 3 M8 9 h10 M8 11 l9 3" stroke="#5A3A26" stroke-width="1" stroke-linecap="round"/>`;}
  else{ears=`<ellipse cx="-24" cy="-2" rx="9" ry="5" fill="${m.body}" transform="rotate(-20 -24 -2)"/><ellipse cx="24" cy="-2" rx="9" ry="5" fill="${m.body}" transform="rotate(20 24 -2)"/><ellipse cx="-24" cy="-2" rx="5" ry="2.5" fill="${m.earIn}" transform="rotate(-20 -24 -2)"/><ellipse cx="24" cy="-2" rx="5" ry="2.5" fill="${m.earIn}" transform="rotate(20 24 -2)"/>`;
    top=`<path d="M-14 -16 q-18 -4 -20 -20 q8 8 18 10Z M14 -16 q18 -4 20 -20 q-8 8 -18 10Z" fill="#F3E9D2"/>`;extra=`<circle cx="-4" cy="12" r="1.6" fill="#5B6676"/><circle cx="4" cy="12" r="1.6" fill="#5B6676"/>`;}
  const chef='<g transform="translate(0 -24)"><rect x="-12" y="-4" width="24" height="8" rx="3" fill="#fff"/><circle cx="-8" cy="-9" r="7" fill="#fff"/><circle cx="0" cy="-13" r="8" fill="#fff"/><circle cx="8" cy="-9" r="7" fill="#fff"/></g>';
  const non='<g transform="translate(0 -18)"><path d="M-30 4 L0 -22 L30 4 Q0 10 -30 4Z" fill="#F2D27A"/><path d="M-20 -1 L0 -18 M20 -1 L0 -18 M-10 -6 L0 -18 M10 -6 L0 -18" stroke="#D9B456" stroke-width="1"/></g>';
  return `<g id="${id}"><ellipse cx="0" cy="44" rx="24" ry="26" fill="${m.body}"/><ellipse cx="0" cy="48" rx="13" ry="15" fill="${m.belly}"/>${ar}${ears}
  ${top}<circle cx="0" cy="0" r="22" fill="${m.head}"/><ellipse cx="0" cy="${k==='buffalo'?8:5}" rx="16" ry="${k==='buffalo'?12:13}" fill="${m.mask}"/>${face(0,k==='buffalo'?1:3,.9,'open')}${extra}
  ${hat?(k==='buffalo'?non:chef):''}</g>`;};

const palm=`<rect x="-2" y="-26" width="4" height="26" fill="#6B3FA8"/><path d="M0 -26 q-16 -4 -22 4 q10 -2 22 -4 q-10 -12 -20 -8 q12 0 20 8 q6 -14 20 -14 q-12 6 -20 14 q16 -6 22 4 q-12 -6 -22 -4" fill="#5CC98D"/>`;
const bamboo=`<g fill="#5CC98D"><rect x="-6" y="-38" width="4" height="38" rx="2"/><rect x="0" y="-46" width="4" height="46" rx="2"/><rect x="6" y="-32" width="4" height="32" rx="2"/><path d="M2 -46 q10 -6 16 0 q-8 -2 -16 0Z M-4 -38 q-10 -6 -16 0 q8 -2 16 0Z M8 -32 q10 -4 14 2 q-8 -2 -14 -2Z"/></g>`;
const bush=`<g fill="#5CC98D"><circle cx="-8" cy="-6" r="8"/><circle cx="4" cy="-9" r="10"/><circle cx="14" cy="-5" r="7"/></g>`;
const lights=(xs)=>`<g fill="#FFE9A8">${xs.map((p,i)=>`<rect class="twk" style="animation-delay:${(i*.29)%2}s" x="${p[0]}" y="${p[1]}" width="2" height="4" rx="1"/>`).join('')}</g>`;
const SKY={
 my:`<g fill="#D9C8FF"><path d="M224 340 V250 l5-12 v-10 l3-9 v-16 l2-15 2 15 v16 l3 9 v10 l5 12 V340Z"/><path d="M258 340 V250 l5-12 v-10 l3-9 v-16 l2-15 2 15 v16 l3 9 v10 l5 12 V340Z"/><rect x="238" y="262" width="24" height="5" rx="2"/></g>
   ${lights([0,1,2,3,4,5].flatMap(i=>[[229+(i%2)*4,270+i*10],[263+(i%2)*4,268+i*10]]))}<path d="M150 340 V286 h4 v-26 l4-9 l4 9 v26 h4 V340Z" fill="#CDB8FA"/><circle cx="158" cy="276" r="7" fill="#CDB8FA"/>`,
 sg:`<g fill="#D9C8FF"><path d="M212 340 L214 254 h14 L230 340Z"/><path d="M234 340 L236 254 h14 L252 340Z"/><path d="M256 340 L258 254 h14 L274 340Z"/><path d="M204 246 h82 q8 0 8 4 q0 4 -8 4 h-82 q-4 0 -4 -4 q0 -4 4 -4Z"/></g>
   ${lights([0,1,2,3,4,5,6].flatMap(i=>[[219,262+i*10],[241,262+i*10],[263,262+i*10]]))}
   <g transform="translate(118 300)" stroke="#CDB8FA" stroke-width="2" fill="none"><circle r="24"/>${[0,1,2,3,4,5].map(i=>`<path d="M0 0 L${(Math.cos(i*Math.PI/3)*24).toFixed(1)} ${(Math.sin(i*Math.PI/3)*24).toFixed(1)}"/>`).join('')}<path d="M-12 40 L0 0 L12 40" stroke-width="3"/></g>
   ${[160,182].map((x,i)=>`<g transform="translate(${x} ${300-i*10})"><path d="M-3 40 L-1 0 h2 L3 40Z" fill="#CDB8FA"/><path d="M-16 -2 Q0 -14 16 -2 Q0 4 -16 -2Z" fill="#CDB8FA"/>${lights([[-10,-6],[-2,-9],[7,-6]])}</g>`).join('')}
   <g transform="translate(46 312)" fill="#E3D6FF"><path d="M-6 28 q-2 -18 6 -26 q10 -4 12 6 q2 8 -6 10 q8 6 4 10Z"/><circle cx="4" cy="-2" r="8"/><path d="M12 -2 q22 -6 26 14" stroke="#fff" stroke-width="2.5" fill="none" stroke-dasharray="3 4" class="twk"/></g>`,
 vn:`<g fill="#D9C8FF"><path d="M226 340 V236 h20 V340Z"/><path d="M229 236 V210 h14 V236Z"/><path d="M232 210 V190 h8 V210Z"/><path d="M235 190 V170 h2 V190Z"/>
   <path d="M266 340 L270 236 q6 -10 12 0 L286 340Z"/><ellipse cx="276" cy="262" rx="14" ry="3"/></g>
   ${lights([0,1,2,3,4,5,6].flatMap(i=>[[231,244+i*12],[239,248+i*12],[275,276+i*9]]))}
   <g transform="translate(150 300)" fill="#CDB8FA"><rect x="-3" y="10" width="6" height="30"/><rect x="-14" y="-2" width="28" height="12" rx="2"/><path d="M-24 0 Q-14 -4 -10 -14 h20 Q14 -4 24 0 Q0 -6 -24 0Z"/></g>`};
const DECO={my:[30,90,300].map((x,i)=>`<g transform="translate(${x} ${340-i*4})">${palm}</g>`).join(''),
 sg:[30,92,300].map((x,i)=>`<g transform="translate(${x} ${344-i*4})">${bush}</g>`).join(''),
 vn:[28,96,302].map((x,i)=>`<g transform="translate(${x} ${344-i*4})">${bamboo}</g>`).join('')};
const LAYER={my:['#FF8FB8','#FFF1DC','#5CC98D'],sg:['#E9B96E','#8FBF5A','#FFF1B8'],vn:['#6CC27A','#F6D36B']};
const CUR={my:{lab:'RM',coin:['#FFC83D','#E9A100','#7A4A00'],plus:'+RM100',cup:'#C98B4E'},sg:{lab:'S$',coin:['#E8EDF3','#B7C2CF','#4A5566'],plus:'+S$30',cup:'#9A6A3E'},vn:{lab:'₫',coin:['#FFC83D','#E9A100','#7A4A00'],plus:'+150.000₫',cup:'#6B4423'}};
const SHOP={my:{name:'KOPI HUTAN',sign:'#1F6B4A',ink:'#FFF6E8',aw:['#E3263C','#fff'],qr:'DuitNow',qc:'#E4007C',lan:'#E3263C'},
 sg:{name:'AH HUAT',sign:'#C8102E',ink:'#FFF6E8',aw:['#1F9E8E','#fff'],qr:'PayNow',qc:'#7A2C8F',lan:'#E3263C'},
 vn:{name:'BÁNH MÌ CÔ BA',sign:'#D52B1E',ink:'#FFE15A',aw:['#FFC83D','#D52B1E'],qr:'VietQR',qc:'#0A5BB5',lan:'#FFB020'}};
const shopSvg=(cc)=>{const s=SHOP[cc];return `<g id="shop" transform="translate(150 186)">
  <rect x="0" y="34" width="160" height="148" rx="8" fill="#FFF6E8"/>
  <rect x="6" y="4" width="148" height="26" rx="8" fill="${s.sign}"/><text x="80" y="22" text-anchor="middle" font-family="Baloo 2,sans-serif" font-weight="800" font-size="${s.name.length>10?12:14}" fill="${s.ink}" letter-spacing=".5">${s.name}</text>
  ${[0,1,2,3,4,5,6,7,8].map(i=>`<path d="M${i*17.8} 32 h17.8 v14 q-8.9 10 -17.8 0Z" fill="${s.aw[i%2]}"/>`).join('')}
  ${[22,138].map(x=>`<g transform="translate(${x} 58)"><g class="wiggle"><path d="M0 -8 v6" stroke="#7A4A00" stroke-width="2"/><ellipse cx="0" cy="8" rx="9" ry="11" fill="${s.lan}"/><rect x="-4" y="-3" width="8" height="4" rx="1" fill="#FFD25A"/><rect x="-3" y="18" width="6" height="5" fill="#FFD25A"/></g></g>`).join('')}
  <rect id="win" x="14" y="80" width="62" height="50" rx="8" fill="#FFE29A"/><path d="M45 80 v50 M14 105 h62" stroke="#FFF6E8" stroke-width="3"/>
  <rect x="94" y="80" width="50" height="102" rx="8" fill="#B07A4A"/><circle cx="134" cy="132" r="3" fill="#FFE29A"/>
  <g transform="translate(22 140)"><rect width="30" height="40" rx="5" fill="${s.qc}"/><rect x="6" y="6" width="18" height="18" rx="3" fill="#fff"/><path d="M9 9h5v5h-5zM16 16h5v5h-5zM16 9h5v5h-5z" fill="${s.qc}"/><text x="15" y="35" text-anchor="middle" font-family="Nunito Sans,sans-serif" font-weight="800" font-size="7" fill="#fff">${s.qr}</text></g>
  <g transform="translate(-8 150) scale(.8)"><path d="M-10 30 h20 l-3 14 h-14Z" fill="#C2552B"/><path d="M0 30 q-14 -10 -10 -26 q8 8 10 26 q2 -22 12 -26 q2 16 -12 26" fill="#3FB97A"/></g></g>`;};
const coinC=(id,cc)=>{const c=CUR[cc];return coinRaw(id,c.coin[0],c.coin[1],c.coin[2],c.lab);};
const vehicle=(cc)=>{const rider=`<g transform="translate(14 -26) scale(.55)">${mascot(cc,'becaUtan',cc==='vn','ride')}</g>`;
  if(cc==='vn')return `<g id="beca"><circle cx="-30" cy="22" r="14" fill="none" stroke="#fff" stroke-width="4"/><circle cx="30" cy="22" r="14" fill="none" stroke="#fff" stroke-width="4"/>
   <g id="spokes" stroke="#fff" stroke-width="1.5"><path d="M-30 8 V36 M-44 22 H-16"/></g>
   <path d="M-44 14 q4 -18 26 -18 h20 l14 -14 h8 l-10 20 q10 4 16 22 h-20 q-4 -10 -16 -10 h-22 q-12 0 -16 10Z" fill="#E3263C"/><rect x="-30" y="-8" width="28" height="7" rx="3" fill="#2A1A3A"/>
   <circle cx="36" cy="-14" r="4" fill="#FFE29A"/><g transform="translate(-34 -24)">${coinC('becaCoin',cc)}</g>
   <g transform="translate(-6 -40) scale(.55)">${mascot(cc,'becaUtan',true,'ride')}</g></g>`;
  const can=cc==='sg'?['#1F9E8E','#FFC83D']:['#E3263C','#FFD25A'];
  return `<g id="beca"><circle cx="-26" cy="20" r="16" fill="none" stroke="#fff" stroke-width="4"/><circle cx="-26" cy="20" r="3" fill="#fff"/>
  <circle cx="30" cy="22" r="14" fill="none" stroke="#fff" stroke-width="4"/><circle cx="30" cy="22" r="3" fill="#fff"/>
  <g id="spokes" stroke="#fff" stroke-width="1.5"><path d="M-26 6 V34 M-40 20 H-12"/></g>
  <path d="M-46 6 h40 v-6 q-20 -6 -40 0Z" fill="${can[0]}"/><path d="M-50 -2 q24 -34 48 0" fill="${can[1]}" stroke="${can[0]}" stroke-width="2"/>
  <rect x="-46" y="4" width="40" height="8" rx="3" fill="${can[0]}"/><path d="M-6 10 L30 22 M8 10 v-14" stroke="#fff" stroke-width="3"/>
  <g transform="translate(-24 -8)">${coinC('becaCoin',cc)}</g>${rider}</g>`;};
const flowerSvg=(cc)=>{
  if(cc==='sg')return `<g id="flower">${[[-1,-1],[1,-1]].map(([sx])=>`<path d="M0 0 C${sx*-6} -30 ${sx*18} -70 ${sx*30} -66 C${sx*44} -56 ${sx*20} -20 0 0Z" fill="#D46BD4"/>`).join('')}
   ${[-1,1].map(sx=>`<path d="M0 0 C${sx*30} -26 ${sx*76} -26 ${sx*78} 0 C${sx*72} 18 ${sx*30} 16 0 0Z" fill="#E694E6"/>`).join('')}
   <path d="M0 0 C-34 10 -36 60 0 66 C36 60 34 10 0 0Z" fill="#9B2C9E"/><path d="M0 8 C-16 16 -16 44 0 50 C16 44 16 16 0 8Z" fill="#C24FC4"/><circle r="12" fill="#FFD25A"/>${face(0,1,.9,'open')}</g>`;
  if(cc==='vn')return `<g id="flower" transform="translate(0 20)">${[-2,-1,0,1,2].map(i=>`<path d="M0 0 C${-20+i*14} -20 ${-14+i*20} -70 ${i*22} -80 C${14+i*20} -70 ${20+i*14} -20 0 0Z" fill="#F7A8C8" transform="rotate(${i*14})"/>`).join('')}
   ${[-1,0,1].map(i=>`<path d="M0 6 C${-24+i*16} -10 ${-16+i*18} -54 ${i*20} -62 C${16+i*18} -54 ${24+i*16} -10 0 6Z" fill="#FF7FB0" transform="rotate(${i*22})"/>`).join('')}
   <ellipse cx="0" cy="-34" rx="16" ry="9" fill="#FFD25A"/>${face(0,-22,1,'open')}<path d="M-46 10 q46 16 92 0" stroke="#5CC98D" stroke-width="6" fill="none" stroke-linecap="round"/></g>`;
  return `<g id="flower">${[0,1,2,3,4].map(i=>`<path d="M0 0 C-30 -18 -28 -70 0 -74 C28 -70 30 -18 0 0Z" fill="${i%2?'#E3263C':'#F04A5E'}" transform="rotate(${i*72})"/><path d="M0 -10 C-8 -30 -6 -50 0 -58" stroke="#FF8FA0" stroke-width="2" fill="none" transform="rotate(${i*72})"/>`).join('')}
  <circle r="20" fill="#B0122C"/>${face(0,1,1.1,'open')}<path d="M8 -12 Q22 -40 38 -54" stroke="#FFE29A" stroke-width="4" fill="none" stroke-linecap="round"/><g fill="#FFD25A"><circle cx="38" cy="-54" r="5"/><circle cx="31" cy="-58" r="3.5"/><circle cx="44" cy="-47" r="3.5"/></g></g>`;};
const phin=`<g id="cT"><g clip-path="url(#cP)"><rect id="lA" x="-22" y="-16" width="44" height="30"/><ellipse id="lAf" cx="0" cy="-16" rx="20" ry="3" fill="#B8F2E1"/></g>
  <rect x="-22" y="-18" width="44" height="30" rx="4" fill="none" stroke="#fff" stroke-width="3.5"/><rect x="-30" y="12" width="60" height="6" rx="3" fill="#E1E5EA"/>
  <path d="M-18 -18 h36 v-5 q-18 -9 -36 0Z" fill="#E1E5EA"/><circle cy="-27" r="3.2" fill="#E1E5EA"/>${face(0,-3,.6)}
  <text x="0" y="-36" text-anchor="middle" font-family="Baloo 2,sans-serif" font-weight="800" font-size="13" fill="#fff">USDT</text></g>`;


/* ---------- hero scene, built from the YouApp payment-animation kit ---------- */
const RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
const art=document.getElementById('art');
const gift=(id,s=1)=>`<g id="${id}" transform="scale(${s})"><g class="bob">
  <rect x="-22" y="-6" width="44" height="34" rx="6" fill="#FF8FB8"/><rect x="-4" y="-6" width="8" height="34" fill="#FFD25A"/>
  ${face(0,12,.75,'open')}
  <g id="${id}Lid"><rect x="-26" y="-16" width="52" height="12" rx="5" fill="#F06A9E"/><rect x="-4" y="-16" width="8" height="12" fill="#FFD25A"/>
  <path d="M0 -16 C-6 -30 -22 -30 -18 -20 C-15 -14 -6 -16 0 -16Z M0 -16 C6 -30 22 -30 18 -20 C15 -14 6 -16 0 -16Z" fill="#FFD25A"/></g></g></g>`;
const heart=(c='#FF6B9A')=>`<path d="M0 4 C-10 -4 -6 -12 0 -7 C6 -12 10 -4 0 4Z" fill="${c}"/>`;
function scene(){
  const hills=LAYER.my;
  art.innerHTML=`<defs><linearGradient id="isky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9C6FD6"/><stop offset=".7" stop-color="#C9A6F0"/><stop offset="1" stop-color="#F6D7EC"/></linearGradient>
    <clipPath id="iclip"><rect width="560" height="400" rx="32"/></clipPath></defs>
  <g clip-path="url(#iclip)">
  <rect width="560" height="400" fill="url(#isky)"/>
  <g transform="scale(1.75 1.2)">${stars}</g>
  <g transform="translate(14 -10) scale(1.2)">${moon}</g>
  ${cloud(170,64,1)}${cloud(470,92,.8)}${cloud(330,40,.6)}
  <g transform="translate(66 -90) scale(1.26)">${SKY.my}</g>
  <path d="M0 330 Q120 296 250 322 T560 312 V400 H0Z" fill="#B994EC"/>
  <path d="M0 352 Q150 332 300 350 T560 344 V400 H0Z" fill="#9B74E0"/>
  <g transform="translate(250 30) scale(.9)">${shopSvg('my')}</g>
  <g transform="translate(-10 22)">${[0,1].map(i=>`<g transform="translate(${30+i*60} ${340-i*6}) scale(1.4)">${palm}</g>`).join('')}</g>
  <g transform="translate(540 380) scale(1.4)">${palm}</g>
  <g transform="translate(506 340) scale(.85)">${cat('icat')}</g>
  <g transform="translate(150 262) scale(1.45)" id="utanWrap">${mascot('my','utan',false,'wave')}</g>
  <g transform="translate(236 334)">${gift('igift',1.15)}</g>
  <g id="hearts"></g>
  <g transform="translate(36 386) scale(.42)">${flowerSvg('my')}</g>
  <g id="flyer"><g id="flyInner">
    <path id="rope" d="M-40 10 L-92 22" stroke="#fff" stroke-width="1.6" stroke-dasharray="3 3"/>
    <g transform="translate(-176 22)"><path d="M-84 -14 h168 l-10 14 l10 14 h-168 l10 -14Z" fill="#FFD25A"/><text id="banner" x="0" y="5" text-anchor="middle" font-family="Baloo 2,sans-serif" font-weight="800" font-size="13" fill="#2A1466"></text></g>
    <g transform="scale(1.05)">${hornbill('ihb')}</g>
    <g transform="translate(4 44) scale(.85)">${coinC('icoin','my')}</g>
  </g></g>
  <g id="conf"></g>
  </g>`;
}
scene();
let t0=performance.now(),party=0;
const flyer=document.getElementById('flyer'),hearts=document.getElementById('hearts'),confG=document.getElementById('conf');
const NS='http://www.w3.org/2000/svg';
let H=[],C=[];
function spawnHeart(){const g=document.createElementNS(NS,'g');g.innerHTML=heart(['#FF6B9A','#FFD25A','#fff'][Math.random()*3|0]);hearts.appendChild(g);H.push({g,x:236+(Math.random()*30-15),y:304,vx:Math.random()*.6-.3,vy:-.6-Math.random()*.5,life:0,s:.8+Math.random()*.6});}
function burst(n=70){const cols=['#FFD25A','#FF8FB8','#5CC98D','#fff','#E3263C','#7A4BD6'];for(let i=0;i<n;i++){const r=document.createElementNS(NS,'rect');r.setAttribute('width',6);r.setAttribute('height',10);r.setAttribute('rx',2);r.setAttribute('fill',cols[i%cols.length]);confG.appendChild(r);
  C.push({r,x:236,y:300,vx:(Math.random()-.5)*9,vy:-4-Math.random()*7,a:Math.random()*360,va:(Math.random()-.5)*20,life:0});}}
let last=0;
function frame(now){
  const t=(now-t0)/1000;
  /* hornbill loops across the sky with the banner */
  const P=14, u=(t%P)/P, x=-180+u*(560+360), y=120+Math.sin(u*Math.PI*2)*22+Math.sin(t*3)*4;
  flyer.setAttribute('transform',`translate(${x.toFixed(1)} ${y.toFixed(1)})`);
  if(now-last>(party?120:520)){spawnHeart();last=now;}
  H=H.filter(h=>{h.life++;h.x+=h.vx+Math.sin(h.life/12)*.3;h.y+=h.vy;const o=Math.max(0,1-h.life/150);h.g.setAttribute('transform',`translate(${h.x.toFixed(1)} ${h.y.toFixed(1)}) scale(${h.s})`);h.g.setAttribute('opacity',o.toFixed(2));if(o<=0){h.g.remove();return false;}return true;});
  C=C.filter(c=>{c.life++;c.vy+=.22;c.vx*=.99;c.x+=c.vx;c.y+=c.vy;c.a+=c.va;c.r.setAttribute('transform',`translate(${c.x.toFixed(1)} ${c.y.toFixed(1)}) rotate(${c.a.toFixed(0)})`);if(c.y>420){c.r.remove();return false;}return true;});
  requestAnimationFrame(frame);
}
function setBanner(txt){document.getElementById('banner').textContent=txt;}
function utan(arms){document.getElementById('utanWrap').innerHTML=mascot('my','utan',false,arms);}
function openGift(){const lid=document.getElementById('igiftLid');if(lid){lid.style.transition='transform .6s cubic-bezier(.3,1.6,.5,1)';lid.style.transform='translate(-18px,-30px) rotate(-28deg)';}}
function celebrate(){party=1;utan('cheer');openGift();burst(90);setTimeout(()=>burst(60),500);setTimeout(()=>party=0,3500);}
function cheerOnce(){utan('cheer');burst(24);setTimeout(()=>utan('wave'),1800);}
if(!RM)requestAnimationFrame(frame);else{flyer.setAttribute('transform','translate(380 110)');}
window.__scene={setBanner,celebrate,cheerOnce};

/* small spot illustrations */
const spot=(inner,vb='-40 -40 80 80')=>`<svg viewBox="${vb}" aria-hidden="true">${inner}</svg>`;
const ICONS={
 step1:spot(`<circle r="36" fill="#EFE6FF"/><g class="bob"><rect x="-24" y="-14" width="48" height="34" rx="6" fill="#fff" stroke="#B79BF0" stroke-width="2"/><path d="M-24 -12 L0 6 L24 -12" fill="none" stroke="#B79BF0" stroke-width="2"/>${face(0,10,.6)}<g transform="translate(16 -16)">${heart('#FF6B9A')}</g></g>`),
 step2:spot(`<circle r="36" fill="#E2F6EE"/><g class="bob"><rect x="-26" y="-16" width="52" height="34" rx="6" fill="#fff" stroke="#7FD3B4" stroke-width="2"/><circle cx="-11" cy="0" r="8" fill="#FFB86B"/>${face(-11,1,.42)}<rect x="2" y="-6" width="16" height="4" rx="2" fill="#BFE9D8"/><rect x="2" y="2" width="12" height="4" rx="2" fill="#BFE9D8"/>
   <g transform="translate(20 16)"><circle r="10" fill="#0F9D6E"/><path d="M-4 0 l3 3 l5 -6" stroke="#fff" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g></g>`),
 step3:spot(`<circle r="36" fill="#FFF1D6"/><g transform="translate(10 -2)"><rect x="-14" y="-18" width="28" height="36" rx="5" fill="#E4007C"/><rect x="-9" y="-13" width="18" height="18" rx="3" fill="#fff"/><path d="M-6 -10h5v5h-5zM1 -3h5v5h-5zM1 -10h5v5h-5z" fill="#E4007C"/></g><g transform="translate(-14 12) scale(.8)">${coinC('sc3','my')}</g>`),
 earn:spot(`<g transform="translate(-26 6)">${coinC('e1','my')}</g><g transform="translate(26 6) scale(-1 1)">${coinRaw('e2','#2FBF94','#1C8F6C','#fff','₮')}</g><g class="twk"><path d="M0 -26 l3 7 l7 3 l-7 3 l-3 7 l-3 -7 l-7 -3 l7 -3Z" fill="#FFD25A"/></g>`,'-56 -40 112 72'),
 gift:spot(`<g transform="translate(0 8)">${gift('gg',1)}</g>`,'-32 -36 64 72'),
 ok:spot(`<circle r="38" fill="#E2F6EE"/><g transform="translate(0 6) scale(1.3)">${coinC('okc','my')}</g><g transform="translate(-24 -22)" class="twk">${heart('#FF6B9A')}</g><g transform="translate(26 -18)" class="twk" style="animation-delay:.6s">${heart('#FFD25A')}</g>`)
};
document.querySelectorAll('[data-icon]').forEach(e=>{e.innerHTML=ICONS[e.dataset.icon];});
