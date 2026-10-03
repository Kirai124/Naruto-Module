/** Pure rules shared by tracker, migrations and regression tests. */
export const MODULE_ID = 'n5eb-classmod-library';
export const TRACKER_FLAG = 'rasenganTracker';
export const MIN_LEVELS = {1:4, 2:8, 3:10, 4:14};
export const clamp = (v, min, max) => Math.min(max, Math.max(min, Number(v) || 0));
export function level(actor) {
  const mod = Array.from(actor?.items ?? []).find(i => i.type === 'classmod' && i.system?.identifier === 'rasengan');
  return clamp(Math.floor(Number(mod?.system?.levels ?? 0)), 0, 4);
}
export function intelligence(actor) {
  const a = actor?.system?.abilities?.int ?? {};
  return Number.isFinite(Number(a.mod)) ? Number(a.mod) : Math.floor((Number(a.value ?? 10)-10)/2);
}
export function values(actor) {
  const l = level(actor), c = Number(actor?.system?.details?.level ?? 0), i = intelligence(actor);
  return {level:l, maximum:l*100, points:l*15, attack:i+c+l, dc:10+i+Math.floor(c/4), discounts:l>=2?Math.max(0,i):0};
}
export function normalize(actor, raw, arts) {
  const v = values(actor), known = new Set(arts.map(a=>a.id));
  const learned = [...new Set((raw?.learned ?? []).filter(id=>known.has(id)))];
  // Keep the ledger intact on a level reduction; never silently erase echoes or learned Arts.
  return {version:1, chakra:clamp(raw?.chakra ?? v.maximum,0,v.maximum), discountUsed:Math.max(0,Math.floor(Number(raw?.discountUsed)||0)), learned,
    cores:(raw?.cores ?? []).filter(c=>known.has(c.art)).map(c=>({...c,compression:clamp(c.compression,0,3)})),
    echoes:Array.isArray(raw?.echoes)?raw.echoes:[], pending:Array.isArray(raw?.pending)?raw.pending:[],
    reactionTurn:String(raw?.reactionTurn ?? ''), lastCompression:String(raw?.lastCompression ?? ''), cooldownUntil:Number(raw?.cooldownUntil)||0, comboAwaitingFullRest:Boolean(raw?.comboAwaitingFullRest), chakraLocked:Boolean(raw?.chakraLocked)};
}
export function remainingPoints(actor, state, arts) {
  return values(actor).points - arts.filter(a=>state.learned.includes(a.id)).reduce((n,a)=>n+a.points,0);
}
export function cost(art, discount=false) { return Math.max(0, art.cost - (discount?5:0)); }
export function reshapeCost(from,to) { return Math.max(0,to.cost-from.cost); }
export function damageParts(art, compression=0, critical=false, type='chakra') {
  return art.parts.map((p,index)=>{
    const m=/^(\d+)d(\d+)$/.exec(p.formula); if(!m)throw new Error('Unsupported damage dice');
    return {formula:`${(Number(m[1])+(index===0?clamp(compression,0,3):0))*(critical?2:1)}d${m[2]}`,type:p.type==='chakra'?type:p.type};
  });
}
export function canPurchase(actor,state,art,arts) {
  if(state.learned.includes(art.id))return 'Already learned';
  if(remainingPoints(actor,state,arts)<art.points)return 'Not enough Rasengan Points';
  if(art.requiresArts.some(id=>!state.learned.includes(id)))return 'Learn the prerequisite Art first';
  return '';
}
export function usagePrerequisite(actor,state,art) {
  if(state.chakraLocked)return 'Cannot mold Chakra until a Full Rest';
  if(art.partner&&state.comboAwaitingFullRest)return 'Take a Full Rest before the cooldown begins';
  if(!state.learned.includes(art.id))return 'Art has not been learned';
  if(art.requiresArts.some(id=>!state.learned.includes(id)))return 'Missing prerequisite Art';
  const identifiers=new Set(Array.from(actor?.items ?? []).map(i=>i.system?.identifier));
  if(art.requires.some(id=>!identifiers.has(id)))return `Requires ${art.prerequisiteText}`;
  if(art.id==='ultimate-rasengan'&&Number(actor?.system?.attributes?.hp?.value)!==1)return 'Ultimate Rasengan requires exactly 1 HP';
  if(art.partner&&state.cooldownUntil>Number(globalThis.game?.time?.worldTime ?? 0))return 'The one-month cooldown has not elapsed';
  return '';
}
