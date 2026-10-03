import {createTrackerWindow, trackerTabs} from './tracker-window.js';
import {ARTS} from './rasengan-catalog.js';
import {MODULE_ID as ID, TRACKER_FLAG, level, intelligence, values, normalize, remainingPoints, cost, reshapeCost, damageParts, canPurchase, usagePrerequisite} from './rasengan-rules.js';

const dialogs=new Map(), queues=new Map(), damageQueues=new Map(), combatActors=new Map(), bypass=new WeakSet();
// Foundry mutates operation options (including parent/pack). Never share them
// between embedded Item/Effect operations and Actor updates, or between Actors.
const internalOptions=(options={})=>({[ID]:{rasengan:true},...options});
const esc=v=>foundry.utils.escapeHTML(String(v??''));
const clone=v=>foundry.utils.deepClone(v);
const random=()=>foundry.utils.randomID();
const artBy=id=>ARTS.find(a=>a.id===id);
const getActor=context=>context?.documentName==='Actor'?context:context?.actor??canvas.tokens?.controlled?.[0]?.actor??game.user.character;
const read=actor=>normalize(actor,actor?.getFlag(ID,TRACKER_FLAG),ARTS);
function own(actor){if(!actor?.isOwner)throw new Error('You must own the Rasengan character.');if(!level(actor))throw new Error('Rasengan Class Mod is required.');}
function queue(actor,task){const key=actor.uuid,previous=queues.get(key)??Promise.resolve(),current=previous.catch(()=>{}).then(task);queues.set(key,current);return current.finally(()=>{if(queues.get(key)===current)queues.delete(key);});}
async function write(actor,state){own(actor);const next=normalize(actor,state,ARTS);if(JSON.stringify(actor.getFlag(ID,TRACKER_FLAG))!==JSON.stringify(next))await actor.update({[`flags.${ID}.${TRACKER_FLAG}`]:next},internalOptions({render:false}));refresh(actor);refreshStrip(actor);return read(actor);}
async function message(actor,content,flags={}){return ChatMessage.create({speaker:ChatMessage.getSpeaker({actor}),content,flags:{[ID]:flags}});}
async function form(title,content,label='Apply'){
  return foundry.applications.api.DialogV2.wait({window:{title},content,buttons:[{action:'apply',label,default:true,callback:(e,b)=>new FormDataExtended(b.form).object},{action:'cancel',label:'Cancel'}],rejectClose:false});
}
const yes=(title,content)=>foundry.applications.api.DialogV2.confirm({window:{title},content,rejectClose:false});
function targetRef(token){return {uuid:token.actor.uuid,name:token.name??token.actor.name,tokenUuid:token.document?.uuid??token.uuid};}
function targets(){return Array.from(game.user.targets??[]).filter(t=>t.actor).map(targetRef);}
async function resolveTarget(uuid){const doc=await fromUuid(uuid);return doc?.documentName==='Actor'?doc:doc?.actor??null;}
function turnKey(actor){const c=game.combat;if(!c)return '';const index=c.turns?.findIndex(t=>t.actor?.uuid===actor.uuid)??-1;const round=Number(c.round??0)-(index>=0&&Number(c.turn??0)<index?1:0);return `${c.id}:${round}:${actor.uuid}`;}
function reactionAvailable(actor,state){const k=turnKey(actor);return !k||state.reactionTurn!==k;}
let contentPromise;
function bundledItems() {
  // Load only this small bundle once, never all 887 compendium documents on an item update.
  contentPromise ??= fetch(`modules/${ID}/data/rasengan.json`).then(async response => {
    if (!response.ok) throw new Error('Rasengan content could not be loaded. Check the installed module files.');
    return (await response.json()).items;
  }).catch(error => {contentPromise = null; throw error;});
  return contentPromise;
}
function itemSource(source) {const data=clone(source);delete data._id;delete data.folder;return data;}
async function ensureArtItem(actor, art) {
  if (Array.from(actor.items).some(item=>item.flags?.[ID]?.rasenganArt===art.id)) return [];
  const source=(await bundledItems()).find(item=>item._id===art.itemId);
  if (!source) throw new Error(`Missing bundled Rasengan Art: ${art.name}`);
  const created=await actor.createEmbeddedDocuments('Item',[itemSource(source)],internalOptions());
  if (!created?.length) throw new Error(`${art.name} could not be added to the character. No Rasengan Points were spent.`);
  return created;
}
async function ensureActor(actor){
  if(!actor?.isOwner||!level(actor))return;
  if(!actor.getFlag(ID,TRACKER_FLAG))await write(actor,read(actor));
  await ensureSheetValues(actor);
  const data=await bundledItems(),owned=new Set(Array.from(actor.items).map(i=>i.system?.identifier));
  const features=data.filter(i=>i.flags?.[ID]?.rasenganFeatureLevel && Number(i.flags[ID].rasenganFeatureLevel)<=level(actor)&&!owned.has(i.system?.identifier));
  if(features.length)await actor.createEmbeddedDocuments('Item',features.map(itemSource),internalOptions());
  // Repair purchases committed by 0.19.1 before a failed native item import, without charging again.
  for(const id of read(actor).learned)await ensureArtItem(actor,artBy(id));
}
async function ensureSheetValues(actor){
  const item=Array.from(actor.items).find(rasenganClassMod);if(!item?.update)return;
  const v=values(actor),expected={
    'system.attackBonus.value':String(v.attack),'system.attackBonus.formula':'@abilities.int.mod+@details.level+@classmods.rasengan.levels','system.attackBonus.scaling':'',
    'system.save.value':String(v.dc),'system.save.formula':'10+@abilities.int.mod+floor(@details.level/4)','system.save.scaling':''
  },patch={};
  for(const [path,value] of Object.entries(expected))if(String(foundry.utils.getProperty(item,path)??'')!==value)patch[path]=value;
  if(Object.keys(patch).length)await item.update(patch,internalOptions());
}
async function purchase(actor,id){return queue(actor,async()=>{
  own(actor);const state=read(actor),art=artBy(id);if(!art)throw new Error('Unknown Art');
  const reason=canPurchase(actor,state,art,ARTS);if(reason)throw new Error(reason);
  const created=await ensureArtItem(actor,art);
  state.learned.push(id);
  try {await write(actor,state);}
  catch(error){
    // A failed ledger save must not leave a newly granted free Art on the sheet.
    if(created.length)await actor.deleteEmbeddedDocuments('Item',created.map(item=>item.id),internalOptions());
    throw error;
  }
});}
function checkUse(actor,state,art){own(actor);const reason=usagePrerequisite(actor,state,art);if(reason)throw new Error(reason);if(remainingPoints(actor,state,ARTS)<0)throw new Error('Your learned Arts exceed the budget after a level reduction. Have the GM review them.');}
async function externalCosts(actor,art){
  const updates={};
  if(art.chakraCost){const current=Number(actor.system?.attributes?.chakra?.value??0);if(current<art.chakraCost)throw new Error('Not enough normal Chakra');updates['system.attributes.chakra.value']=current-art.chakraCost;}
  if(art.celestialCost){
    const tracker=globalThis.N5eBClassMods?.getTenseiganTracker?.(actor);
    // The installed tracker calls this field celestialChakra; don't guess a new resource path.
    const key=tracker&&Object.hasOwn(tracker,'celestialChakra')?'celestialChakra':tracker&&Object.hasOwn(tracker,'chakra')?'chakra':null;
    if(!key||typeof globalThis.N5eBClassMods?.setTenseiganTracker!=='function')throw new Error('Celestial Chakra tracker is unavailable');
    if(Number(tracker[key])<art.celestialCost)throw new Error('Not enough Celestial Chakra');
    await globalThis.N5eBClassMods.setTenseiganTracker(actor,{[key]:Number(tracker[key])-art.celestialCost});
  }
  if(Object.keys(updates).length)await actor.update(updates,internalOptions());
}
async function formationOptions(actor,art){
  const v=values(actor),state=read(actor);
  return form(`Form ${art.name}`,`<p>${esc(art.costText)} · Attack +${v.attack} · DC ${v.dc}</p>
    ${v.level>=2?`<label>Damage type<select name="type"><option value="chakra">Chakra</option><option value="bludgeoning">Bludgeoning</option><option value="force">Force</option></select></label><label><input type="checkbox" name="discount" ${state.discountUsed>=v.discounts?'disabled':''}> Reduce cost by 5 (${Math.max(0,v.discounts-state.discountUsed)} uses remaining)</label>`:''}
    ${art.partner?'<label>Adjacent partner with Chidori (required)<input type="text" name="partner" placeholder="Name"></label>':''}
    ${art.combo?`<label>Finishing Rasengan Art<select name="finisher">${ARTS.filter(a=>state.learned.includes(a.id)&&!a.combo&&!a.partner).map(a=>`<option value="${a.id}">${esc(a.name)} (${a.cost} Planetary Chakra)</option>`).join('')}</select></label>`:''}`, 'Form / Pay');
}
async function formArt(actor,id,{maintain=true}={}){
  const art=artBy(id);if(!art)throw new Error('Unknown Art');own(actor);
  if(maintain&&level(actor)<2)throw new Error('Advanced Chakra Control (level 2) is required to maintain an Art.');
  const options=await formationOptions(actor,art);if(!options||typeof options!=='object')return;
  return queue(actor,async()=>{
    const state=read(actor);checkUse(actor,state,art);
    const hands=art.id==='spiralling-serial-spheres-rasengan'?2:1;
    if(state.cores.reduce((n,c)=>n+(c.hands??1),0)+hands>2)throw new Error('Not enough free hands. Release or dismiss a core first.');
    if(art.partner&&!String(options.partner??'').trim())throw new Error('An adjacent Chidori partner must be named.');
    const finisher=art.combo?artBy(options.finisher):null;if(art.combo&&!finisher)throw new Error('Choose a finishing Art');
    if(finisher)checkUse(actor,state,finisher);
    const discount=level(actor)>=2&&Boolean(options.discount);if(discount&&state.discountUsed>=values(actor).discounts)throw new Error('No cost reduction uses remain');
    const payment=cost(art,discount)+(finisher?.cost??0);if(state.chakra<payment)throw new Error('Not enough Planetary Chakra');
    await externalCosts(actor,art);if(finisher)await externalCosts(actor,finisher);
    state.chakra-=payment;if(discount)state.discountUsed++;
    const core={id:random(),hands,art:id,finisher:finisher?.id??null,partner:String(options.partner??''),compression:0,type:level(actor)>=2?options.type??'chakra':'chakra',paid:payment,formed:game.time.worldTime};
    state.cores.push(core);await write(actor,state);
    await message(actor,`<h3>${esc(art.name)} formed</h3><p>${payment} Planetary Chakra paid${discount?' (cost reduction used)':''}. ${maintain?'Maintained in one hand.':'Ready to release.'}</p>`);
    return core.id;
  });
}
async function evolve(actor,coreId){
  own(actor);if(level(actor)<2)throw new Error('Rasengan Evolution requires level 2');
  const state=read(actor),core=state.cores.find(c=>c.id===coreId);if(!core)return;
  const options=await form('Rasengan Evolution — Bonus Action',`<label>New Art<select name="art">${ARTS.filter(a=>state.learned.includes(a.id)&&!a.combo&&!a.partner).map(a=>`<option value="${a.id}">${esc(a.name)} (+${reshapeCost(artBy(core.art),a)} Planetary Chakra)</option>`).join('')}</select></label>`,'Reshape');
  if(!options||typeof options!=='object')return;
  await queue(actor,async()=>{
    const s=read(actor),c=s.cores.find(c=>c.id===coreId);if(!c)throw new Error('Core was already released');const art=artBy(options.art);if(!art)throw new Error('Unknown Art');checkUse(actor,s,art);
    const diff=reshapeCost(artBy(c.art),art);if(s.chakra<diff)throw new Error('Not enough Planetary Chakra');
    if(c.finisher||artBy(c.art).partner)throw new Error('Release the combination Art before forming a different Art.');
    if(art.celestialCost)await externalCosts(actor,art);
    const hands=art.id==='spiralling-serial-spheres-rasengan'?2:1;if(s.cores.filter(other=>other.id!==c.id).reduce((n,other)=>n+(other.hands??1),0)+hands>2)throw new Error('Reshaping this Art requires another free hand');
    s.chakra-=diff;c.art=art.id;c.hands=hands;c.paid+=diff;await write(actor,s);
    await message(actor,`<h3>Rasengan Evolution</h3><p>${esc(art.name)} · ${diff} extra Planetary Chakra · ${c.compression} Compression retained. Bonus Action used.</p>`);
  });
}
async function compress(actor,{manual=false,key=null}={}){return queue(actor,async()=>{
  own(actor);if(level(actor)<3)return;const s=read(actor),k=key??(game.combat?`${game.combat.id}:${game.combat.round}:${actor.uuid}`:'');
  if(k&&s.lastCompression===k)return;
  if(manual&&game.combat){const current=game.combat.combatant?.actor;if(current?.uuid!==actor.uuid)throw new Error('Manual compression is only available at the end of your current turn');}
  for(const c of s.cores)c.compression=Math.min(3,c.compression+1);
  if(k)s.lastCompression=k;await write(actor,s);
});}
async function rollD20(actor,bonus,label,{advantage=false,disadvantage=false,rerollOne=false}={}){
  const expression=advantage===disadvantage?'1d20':advantage?'2d20kh':'2d20kl';
  let roll=await new Roll(`${expression}+${bonus}`).evaluate();
  let natural=roll.dice[0].results.find(r=>r.active!==false&&!r.discarded)?.result;
  if(rerollOne&&natural===1){await roll.toMessage({speaker:ChatMessage.getSpeaker({actor}),flavor:`${label} — natural 1, Perfect Rotation reroll`});roll=await new Roll(`${expression}+${bonus}`).evaluate();natural=roll.dice[0].results.find(r=>r.active!==false&&!r.discarded)?.result;}
  await roll.toMessage({speaker:ChatMessage.getSpeaker({actor}),flavor:label});return {roll,natural};
}
async function save(target,ability,dc,source,label){
  // Prefer the system's save dialog so proficiency, effects and other modules participate.
  if(target.isOwner&&typeof target.rollSavingThrow==='function'){
    const result=await target.rollSavingThrow({ability,target:dc,disadvantage:level(source)>=4},{},{data:{flavor:`${label} — DC ${dc}${level(source)>=4?' (Perfect Rotation: disadvantage)':''}`}});
    const roll=Array.isArray(result)?result[0]:result;if(roll?.total!=null)return Number(roll.total)>=dc;
  }
  const result=await form(`${target.name} — ${label}`,`<p>${esc(ability.toUpperCase())} save DC ${dc}${level(source)>=4?' · Disadvantage (Perfect Rotation)':''}. Let the target/GM roll their system saving throw, then enter the final total.</p><label>Total<input name="total" type="number" required></label>`,'Record save');
  if(!result||typeof result!=='object'||String(result.total??'').trim()==='')throw new Error('Saving throw unresolved; the cast remains pending in the tracker.');
  return Number(result.total)>=dc;
}
async function releaseCore(actor,coreId){
  own(actor);const s=read(actor),core=s.cores.find(c=>c.id===coreId);if(!core)return;
  const art=artBy(core.art),refs=targets();if(!refs.length)throw new Error('Target at least one token before releasing the Art.');if(refs.length>art.maxTargets)throw new Error(`This Art allows up to ${art.maxTargets} target(s).`);
  const choices=await form(`Release ${art.name}`,`<p>${refs.map(t=>esc(t.name)).join(', ')} · ${core.compression} Compression</p><p>Confirm range, a free hand and the area on the scene. The tracker resolves every selected target.</p>
    <label>Attack mode<select name="mode"><option value="normal">Normal</option><option value="advantage">Advantage</option><option value="disadvantage">Disadvantage</option></select></label>
    ${art.mode==='save'&&!art.save?'<label>Save ability (the rule text does not specify it)<select name="save"><option value="con">Constitution</option><option value="str">Strength</option><option value="dex">Dexterity</option><option value="wis">Wisdom</option><option value="int">Intelligence</option><option value="cha">Charisma</option></select></label>':''}
    ${art.ranged&&level(actor)<4?'<label><input type="checkbox" name="close"> Hostile creature within 5 feet (Disadvantage)</label>':''}
    ${level(actor)>=4?'<label>Extra push/pull distance<input name="push" type="number" min="0" max="10" value="0"></label><label>Reduce area by (feet)<input name="area" type="number" min="0" max="5" value="0"></label>':''}`, 'Release');
  if(!choices||typeof choices!=='object')return;
  const castId=await queue(actor,async()=>{
    const state=read(actor),c=state.cores.find(c=>c.id===coreId);if(!c)throw new Error('Core was already released');checkUse(actor,state,art);
    const cast={...clone(c),id:random(),targets:refs.map(t=>({...t,status:'unresolved'})),choices:clone(choices),attack:values(actor).attack+c.compression,dc:values(actor).dc+c.compression,masteryRemaining:level(actor)>=4?Math.max(0,intelligence(actor)):0};
    state.cores=state.cores.filter(c=>c.id!==coreId);state.pending.push(cast);await write(actor,state);return cast.id;
  });
  await resolveCast(actor,castId);
}
async function resolveCast(actor,castId){
  // Serialize resolution too: double clicks may never roll or imprint the same cast twice.
  return queue(actor,async()=>{
    own(actor);let state=read(actor),cast=state.pending.find(c=>c.id===castId);if(!cast)return;const art=artBy(cast.art);
    for(const ref of cast.targets){
      if(ref.status==='resolved'&&!ref.effectsPending)continue;
      if(ref.status==='resolved'&&ref.effectsPending){const t=await resolveTarget(ref.uuid);if(!t)continue;await additionalEffects(actor,t,art,cast,ref,ref.hit);ref.effectsPending=false;await write(actor,state);continue;}
      const target=await resolveTarget(ref.uuid);if(!target){await message(actor,`<p>Missing target ${esc(ref.name)}. Pending cast retained.</p>`);continue;}
      let hit=ref.hit,critical=Boolean(ref.critical),half=Boolean(ref.half);
      if(hit===undefined){
        if(art.mode==='save'){const success=await save(target,art.save??cast.choices.save??'con',cast.dc,actor,art.name);hit=!success;half=success&&art.half;}
        else {
          const result=await rollD20(actor,cast.attack,`${art.name} → ${target.name}`,{advantage:cast.choices.mode==='advantage',disadvantage:cast.choices.mode==='disadvantage'||Boolean(cast.choices.close),rerollOne:level(actor)>=4});
          critical=result.natural===20;const ac=Number(target.system?.attributes?.ac?.value);const proposed=result.natural!==1&&(critical||(Number.isFinite(ac)&&Number(result.roll.total)>=ac));
          const confirm=await form('Resolve Rasengan hit',`<p>Attack ${result.roll.total} → ${esc(target.name)} (AC ${Number.isFinite(ac)?ac:'unknown'})</p><label><input type="checkbox" name="hit" ${proposed?'checked':''}> Hit (confirm after defenses/cover)</label><label><input type="checkbox" name="critical" ${critical?'checked':''}> Critical hit</label>`,'Record');
          if(!confirm||typeof confirm!=='object')throw new Error('Hit unresolved; pending cast retained');hit=Boolean(confirm.hit);critical=hit&&Boolean(confirm.critical);
        }
        ref.hit=hit;ref.critical=critical;ref.half=half;await write(actor,state);
      }
      if(!hit&&!half){ref.status='resolved';await write(actor,state);continue;}
      const parts=damageParts(art,cast.compression,critical,cast.type);
      if(cast.finisher){const f=artBy(cast.finisher);parts.push(...damageParts(f,cast.compression,critical,cast.type));}
      let echo=false;
      // Spiral Echo applies on a successful attack, as written; save-only Arts still resolve damage normally.
      if(hit&&art.mode==='attack'&&level(actor)>=3)echo=await yes('Spiral Echo',`<p>Store ${parts.map(p=>esc(p.formula)).join(' + ')} on ${esc(target.name)} instead of immediate damage?</p>`);
      if(echo){
        state.echoes.push({id:random(),target:ref.uuid,targetName:ref.name,tokenUuid:ref.tokenUuid,art:art.id,artName:art.name,parts:parts.map(p=>({...p,type:'chakra'})),created:game.time.worldTime,rerolls:cast.masteryRemaining??0});cast.masteryRemaining=0;
        ref.status='resolved';ref.effectsPending=true;await write(actor,state);await message(actor,`<h3>Spiral Echo → ${esc(target.name)}</h3><p>${parts.map(p=>esc(p.formula)).join(' + ')} stored permanently. No damage dealt now. Other Art effects still resolve.</p>`);
      } else {
        // Persist a delivery ID first; chat creation failures can be retried without another damage roll.
        ref.delivery??=random();
        if(!ref.damage){
          if(art.mode==='save'&&cast.sharedDamage)ref.damage=clone(cast.sharedDamage);
          else {ref.damage=await rollDamage(actor,parts,cast.masteryRemaining??0,`${art.name} → ${target.name}`);cast.masteryRemaining=Math.max(0,(cast.masteryRemaining??0)-(ref.damage.rerollsUsed??0));if(art.mode==='save')cast.sharedDamage=clone(ref.damage);}
        }
        await write(actor,state);
        await deliverDamage(actor,target,ref.damage,{delivery:ref.delivery,multiplier:half?0.5:1,label:art.name});
        ref.status='resolved';ref.effectsPending=true;await write(actor,state);
      }
      await additionalEffects(actor,target,art,cast,ref,hit);ref.effectsPending=false;await write(actor,state);
      await message(actor,`<details><summary>${esc(art.name)}: additional effects (${esc(target.name)})</summary>${art.description}<p>Mastered Rasengan: extra push/pull ${Number(cast.choices.push)||0} ft; area reduction ${Number(cast.choices.area)||0} ft. Resolve movement, conditions and any secondary saving throw on the scene.</p></details>`);
    }
    if(cast.targets.every(t=>t.status==='resolved'&&!t.effectsPending)){
      state.pending=state.pending.filter(c=>c.id!==cast.id);if(art.partner){state.comboAwaitingFullRest=true;state.chakraLocked=true;}await write(actor,state);
      if(art.id==='ultimate-rasengan'){
        if(typeof actor.toggleStatusEffect==='function')await actor.toggleStatusEffect('unconscious',{active:true});
        else await message(actor,'<p>Ultimate Rasengan: the user falls unconscious.</p>');
      }
      if(art.partner)await message(actor,`<p>${esc(art.name)}: both ${esc(actor.name)} and ${esc(cast.partner)} cannot mold Chakra until their Full Rest. The user's Chakra lock is tracked; record the partner's restriction on their sheet. The 30-day cooldown begins after the user's Full Rest; the GM can adjust the date to your calendar in the tracker.</p>`);
    }
  });
}
async function additionalEffects(source,target,art,cast,ref,hit){
  if(!hit)return;
  let prone=false,noHealing=false,push=0,saveAbility=null;
  if(art.id==='rasengan')push=30;
  if(art.id==='planetary-rasengan'){saveAbility='str';push=20;prone=true;}
  if(art.id==='spiral-rasengan'){saveAbility='con';noHealing=true;}
  if(art.id==='meteoriten-rasengan')push=20;
  if(art.id==='planetary-rasengan-cataclysm'){push=30;prone=true;}
  if(art.id==='ultimate-rasengan'){saveAbility='con';push=30;prone=true;}
  if(saveAbility){
    if(ref.secondarySave===undefined){ref.secondarySave=await save(target,saveAbility,cast.dc,source,`${art.name} secondary effect`);const state=read(source),pending=state.pending.find(p=>p.id===cast.id),r=pending?.targets.find(t=>t.uuid===ref.uuid);if(r){r.secondarySave=ref.secondarySave;await write(source,state);}}
    if(ref.secondarySave){prone=false;noHealing=false;push=art.id==='ultimate-rasengan'?15:0;}
  }
  if(push)push+=Math.min(10,Math.max(0,Number(cast.choices.push)||0));
  if(prone||noHealing)await message(source,`<p>${esc(art.name)} → ${esc(target.name)}: ${prone?'knocked Prone. ':''}${noHealing?'Cannot regain HP until the start of the user’s next turn.':''}</p><button type="button" data-rasengan-condition>Apply conditions (GM / owner)</button>`,{rasenganCondition:{target:target.uuid,source:source.uuid,prone,noHealing,applied:false,delivery:ref.delivery??ref.id??cast.id+ref.uuid}});
  if(push)await message(source,`<p>${esc(art.name)} → ${esc(target.name)}: push up to ${push} feet${art.id==='rasengan'?' if Large or smaller':''}. Place the token on the scene after resolving terrain and collisions.</p>`);
}
Hooks.on('renderChatMessageHTML',(m,element)=>{
  const p=m.flags?.[ID]?.rasenganCondition;if(!p)return;const button=element.querySelector?.('[data-rasengan-condition]');if(!button)return;
  if(!game.user.isGM&&!m.isOwner){button.remove();return;}button.disabled=Boolean(p.applied);if(p.applied)button.textContent='Conditions applied';
  button.addEventListener('click',async()=>{button.disabled=true;try{
    const target=await resolveTarget(p.target);if(!target?.isOwner)throw new Error('The GM / target owner must apply conditions.');
    if(p.prone&&typeof target.toggleStatusEffect==='function')await target.toggleStatusEffect('prone',{active:true});
    if(p.noHealing&&!Array.from(target.effects??[]).some(e=>e.flags?.[ID]?.spiralHealingSource===p.source))await target.createEmbeddedDocuments('ActiveEffect',[{name:'Spiral Rasengan — Healing Block',img:'modules/n5eb-classmod-library/assets/rasengan.svg',disabled:false,changes:[],flags:{[ID]:{spiralHealingSource:p.source}},description:'Cannot regain Hit Points until the start of the Rasengan user’s next turn.'}],internalOptions());
    await m.update({[`flags.${ID}.rasenganCondition.applied`]:true});
  }catch(error){button.disabled=false;ui.notifications.error(error.message);}});
});
Hooks.on('dnd5e.preApplyDamage',(actor,amount)=>{if(amount<0&&Array.from(actor.effects??[]).some(e=>!e.disabled&&e.flags?.[ID]?.spiralHealingSource)){ui.notifications.warn('Spiral Rasengan prevents this creature from regaining HP.');return false;}});
Hooks.on('updateCombat',async(combat,changes,options,userId)=>{
  if(userId!==game.user.id||(!Object.hasOwn(changes,'turn')&&!Object.hasOwn(changes,'round')))return;
  const source=combat.combatant?.actor;if(!source)return;
  const actors=[...Array.from(game.actors??[]),...Array.from(canvas.tokens?.placeables??[]).map(t=>t.actor).filter(Boolean)];
  for(const target of new Map(actors.map(a=>[a.uuid,a])).values())if(target.isOwner){const ids=Array.from(target.effects??[]).filter(e=>e.flags?.[ID]?.spiralHealingSource===source.uuid).map(e=>e.id);if(ids.length)await target.deleteEmbeddedDocuments('ActiveEffect',ids,internalOptions());}
});
async function rollDamage(actor,parts,budget,label){
  const results=[],dice=[];let rerollsUsed=0;
  for(const [index,p] of parts.entries()){
    const roll=await new Roll(p.formula).evaluate();await roll.toMessage({speaker:ChatMessage.getSpeaker({actor}),flavor:`${label} — ${p.type}`});
    results.push({value:Number(roll.total),type:p.type});
    for(const die of roll.dice)for(const [n,r] of die.results.entries())if(r.active!==false&&!r.discarded)dice.push({part:index,index:n,value:r.result,faces:die.faces});
  }
  if(budget>0){
    const selection=await form('Mastered Rasengan — Damage rerolls',`<p>Select up to ${budget} dice. You must keep the new results.</p>${dice.map((d,i)=>`<label><input type="checkbox" name="die${i}"> ${d.value} on d${d.faces} (${esc(parts[d.part].type)})</label>`).join('')}`,'Reroll selected');
    if(selection&&typeof selection==='object'){
      const chosen=dice.filter((d,i)=>selection['die'+i]);if(chosen.length>budget){ui.notifications.warn(`Only the first ${budget} selected dice can be rerolled.`);chosen.splice(budget);}
      rerollsUsed=chosen.length;for(const d of chosen){const roll=await new Roll(`1d${d.faces}`).evaluate();await roll.toMessage({speaker:ChatMessage.getSpeaker({actor}),flavor:`Mastered Rasengan — replacing ${d.value}`});results[d.part].value+=Number(roll.total)-d.value;}
    }
  }
  Object.defineProperty(results,'rerollsUsed',{value:rerollsUsed,enumerable:false});return results;
}
async function deliverDamage(source,target,damages,{delivery=random(),multiplier=1,label='Rasengan'}={}){
  const existing=Array.from(game.messages??[]).find(m=>m.flags?.[ID]?.rasenganDamage?.delivery===delivery);if(existing)return existing;
  return message(source,`<h3>${esc(label)} → ${esc(target.name)}</h3><p>${damages.map(d=>`${d.value} ${esc(d.type)}`).join(' + ')}${multiplier===0.5?' (half damage)':''}</p><button type="button" data-rasengan-apply>Apply damage to target (GM / owner)</button>`,{rasenganDamage:{target:target.uuid,source:source.uuid,damages,delivery,multiplier,applied:false}});
}
async function releaseEchoes(actor,targetUuid,{reaction=false,ids=null}={}){
  own(actor);const s=read(actor),available=s.echoes.filter(e=>e.target===targetUuid);if(!available.length)return {interrupted:false};
  if(reaction&&!reactionAvailable(actor,s))throw new Error('The tracked Rasengan reaction has already been used this round.');
  let chosenIds=ids;
  if(!chosenIds){
    const choice=await form(reaction?'Spiral Echo — Reaction':'Spiral Echo — Bonus Action',`<p>Release selected Echoes on ${esc(available[0].targetName)}. Three or more allow an interrupt CON save.</p>${available.map(e=>`<label><input type="checkbox" name="e${e.id}" checked> ${esc(e.artName)}: ${e.parts.map(p=>esc(p.formula)).join(' + ')}</label>`).join('')}`,'Release');
    if(!choice||typeof choice!=='object')return {interrupted:false,cancelled:true};chosenIds=available.filter(e=>choice['e'+e.id]).map(e=>e.id);
  }
  if(!chosenIds.length)return {interrupted:false,cancelled:true};
  return queue(actor,async()=>{
    const state=read(actor);if(state.pending.some(p=>p.echoRelease&&p.echoIds.some(id=>chosenIds.includes(id))))throw new Error('These Echoes already have a pending release. Resume it from Overview.');if(reaction&&!reactionAvailable(actor,state))throw new Error('Reaction already used');
    const selected=state.echoes.filter(e=>e.target===targetUuid&&chosenIds.includes(e.id));if(!selected.length)return {interrupted:false};
    const target=await resolveTarget(targetUuid);if(!target)throw new Error('Target no longer exists. Echoes are preserved; the GM can relink them.');
    const damages=[];for(const echo of selected){const d=await rollDamage(actor,echo.parts.map(p=>({...p,type:'chakra'})),echo.rerolls??0,'Spiral Echo');damages.push(...d);}
    const id=random();
    // Save the rolled release as a pending delivery before removing any Echoes.
    state.pending.push({id,echoRelease:true,target:targetUuid,damage:damages,delivery:id,echoIds:selected.map(e=>e.id),reaction,count:selected.length,dc:values(actor).dc});await write(actor,state);
    return finishEchoRelease(actor,id);
  });
}
async function finishEchoRelease(actor,id){
  const state=read(actor),release=state.pending.find(p=>p.id===id&&p.echoRelease);if(!release)return {interrupted:false};
  const target=await resolveTarget(release.target);if(!target)throw new Error('Target is missing; pending Echo release retained.');
  let interrupted=Boolean(release.interrupted);
  if(release.reaction&&release.count>=3&&release.interrupted===undefined){
    interrupted=!await save(target,'con',release.dc,actor,'Spiral Echo interrupt');release.interrupted=interrupted;await write(actor,state);
  }
  await deliverDamage(actor,target,release.damage,{delivery:release.delivery,label:'Spiral Echo'});
  state.echoes=state.echoes.filter(e=>!release.echoIds.includes(e.id));state.pending=state.pending.filter(p=>p.id!==id);
  if(release.reaction)state.reactionTurn=turnKey(actor);await write(actor,state);
  await message(actor,`<p>${release.count} Spiral Echoes released as a ${release.reaction?'Reaction':'Bonus Action'}.${release.reaction&&release.count>=3?` ${interrupted?'Triggering Attack / Technique interrupted.':'CON save succeeded: triggering action continues.'}`:''}</p>`);
  return {interrupted};
}
async function rest(actor,type){return queue(actor,async()=>{const s=read(actor);if(['long','full'].includes(type))s.discountUsed=0;if(type==='full'){s.chakra=values(actor).maximum;s.chakraLocked=false;if(s.comboAwaitingFullRest){s.comboAwaitingFullRest=false;s.cooldownUntil=game.time.worldTime+30*86400;}}s.cores=[];s.reactionTurn='';await write(actor,s);});}
function button(action,label,id='',disabled=false){return `<button type="button" data-action="${action}" data-id="${esc(id)}" ${disabled?'disabled':''}>${label}</button>`;}
function html(actor,tab='overview'){
  const s=read(actor),v=values(actor),points=remainingPoints(actor,s,ARTS),groups=new Map();
  for(const e of s.echoes){if(!groups.has(e.target))groups.set(e.target,[]);groups.get(e.target).push(e);}
  const overview=`<section class="rasengan-stats"><div><span>Planetary Chakra</span><strong>${s.chakra} / ${v.maximum}</strong></div><div><span>Rasengan Points</span><strong>${points} / ${v.points}</strong></div><div><span>Art Attack / Save DC</span><strong>+${v.attack} / ${v.dc}</strong></div><div><span>Cost reductions</span><strong>${Math.max(0,v.discounts-s.discountUsed)} / ${v.discounts}</strong></div></section>
    <section class="rasengan-card"><h3>Maintained cores</h3>${s.cores.map(c=>`<article class="rasengan-row"><div><strong>${esc(artBy(c.art)?.name)}</strong><small>${c.compression} / 3 Compression · ${esc(c.type)} · ${c.paid} Chakra paid${c.finisher?' · Finisher: '+esc(artBy(c.finisher)?.name):''}</small></div><div class="rasengan-actions">${button('release','Release',c.id)}${button('evolve','Reshape',c.id,v.level<2)}${button('dismiss','Dismiss',c.id)}</div></article>`).join('')||'<p>No Art currently maintained. Form an Art from the Rasengan Arts tab.</p>'}
      ${button('compress','End turn / +1 Compression','',v.level<3||!s.cores.length)}${button('control','Maintain control check','',v.level<2||!s.cores.length)}<small>Compression increments automatically when your combat turn ends. The end-turn button also works outside combat. Up to two cores, one in each free hand.</small></section>
    <section class="rasengan-card"><h3>Pending resolutions</h3>${s.pending.map(p=>`<div class="rasengan-row"><span>${esc(p.echoRelease?'Spiral Echo release':artBy(p.art)?.name)}${p.echoRelease?'':` · ${p.targets.filter(t=>t.status!=='resolved').length} target(s) unresolved`}</span>${button('resume','Resume',p.id)}</div>`).join('')||'<p>No unresolved casts.</p>'}</section>
    <section class="rasengan-card"><h3>Recovery & resources</h3><div class="rasengan-actions">${button('long-rest','Long Rest')}${button('full-rest','Full Rest')}${button('chakra','Adjust Planetary Chakra')}${game.user.isGM?button('reaction-reset','GM: Reset reaction'):''}${game.user.isGM?button('cooldown','GM: Set combo cooldown'):''}</div><small>Long Rest restores cost reductions. Full Rest also restores Planetary Chakra. Echoes and learned Arts persist.</small></section>
    <section class="rasengan-card"><h3>Features</h3>${['Rasengan Arts & Planetary Chakra',...(v.level>=2?['Advanced Chakra Control','Rasengan Evolution']:[]),...(v.level>=3?['Spiral Echo','Compressed Core']:[]),...(v.level>=4?['Perfect Rotation','Mastered Rasengan']:[])].map(n=>`<p>✓ ${esc(n)}</p>`).join('')}<p>Uzuhiko will be added separately.</p>${s.chakraLocked?'<p><strong>Chakra molding locked until Full Rest.</strong></p>':''}${s.cooldownUntil>game.time.worldTime?`<p>Combination Art cooldown: ${Math.ceil((s.cooldownUntil-game.time.worldTime)/86400)} days remaining.</p>`:''}</section>`;
  const arts=ARTS.map(a=>{
    const learned=s.learned.includes(a.id),reason=learned?usagePrerequisite(actor,s,a):canPurchase(actor,s,a,ARTS);
    return `<article class="rasengan-card rasengan-art"><details><summary><strong>${esc(a.name)}</strong> <span>${a.points} RP · ${esc(a.costText)}${learned?' · Learned':''}</span></summary>${a.description}</details><small>${esc(a.prerequisiteText??'No additional prerequisite')}${reason?' · '+esc(reason):''}</small><div class="rasengan-actions">${learned?button('use','Use',a.id,Boolean(reason))+button('form','Form & maintain',a.id,v.level<2||Boolean(reason)):button('buy',`Learn (${a.points} RP)`,a.id,Boolean(reason))}</div></article>`;
  }).join('');
  const echoes=Array.from(groups.entries()).map(([uuid,list])=>`<section class="rasengan-card"><h3>${esc(list[0].targetName)} <span>${list.length} Echoes</span></h3><details><summary>Stored dice: ${list.flatMap(e=>e.parts.map(p=>p.formula)).map(esc).join(' + ')}</summary>${list.map(e=>`<div class="rasengan-row"><span>${esc(e.artName)} · ${e.parts.map(p=>esc(p.formula)).join(' + ')}</span><small>${esc(e.id)}</small></div>`).join('')}</details><div class="rasengan-actions">${button('echo','Release (Bonus Action)',uuid,v.level<3)}${button('reaction','Release (Reaction)',uuid,v.level<3||!reactionAvailable(actor,s))}${game.user.isGM?button('relink','Relink target',uuid):''}</div></section>`).join('')||'<p>No Spiral Echoes stored. On a successful Art attack, choose to store its damage.</p>';
  return `<div class="n5eb-rasengan" data-rasengan-root data-tab="${tab}"><aside class="n5eb-tracker-sidebar" aria-label="Rasengan tracker"><img class="tracker-emblem" src="modules/n5eb-classmod-library/assets/rasengan.svg" alt=""><h2>Rasengan</h2><p>Level ${v.level} / 4</p>${['overview','arts','echoes'].map(t=>`<button type="button" data-tab-button="${t}" class="${tab===t?'active':''}">${{overview:'Overview',arts:'Rasengan Arts',echoes:'Spiral Echoes'}[t]}${t==='echoes'?` (${s.echoes.length})`:''}</button>`).join('')}<p>${s.chakra} / ${v.maximum}<br>Planetary Chakra</p></aside><main class="n5eb-tracker-body"><header><h2>${esc(actor.name)}</h2><p>${points} Rasengan Points available · Attack +${v.attack} · DC ${v.dc}</p></header><div data-panel="overview" ${tab!=='overview'?'hidden':''}>${overview}</div><div data-panel="arts" ${tab!=='arts'?'hidden':''}>${arts}</div><div data-panel="echoes" ${tab!=='echoes'?'hidden':''}>${echoes}</div></main></div>`;
}
function refresh(actor){
  const dialog=dialogs.get(actor.uuid),root=dialog?.element?.querySelector('[data-rasengan-root]');if(!root)return;
  const tab=root.dataset.tab,scroll=root.querySelector('main')?.scrollTop??0;
  const temp=document.createElement('div');temp.innerHTML=html(actor,tab);root.innerHTML=temp.firstElementChild.innerHTML;root.querySelector('main').scrollTop=scroll;
}
async function act(actor,action,id){
  if(action==='buy')return purchase(actor,id);
  if(action==='form')return formArt(actor,id);
  if(action==='use'){const core=await formArt(actor,id,{maintain:false});if(core)await releaseCore(actor,core);return;}
  if(action==='release')return releaseCore(actor,id);
  if(action==='evolve')return evolve(actor,id);
  if(action==='compress')return compress(actor,{manual:true});
  if(action==='dismiss')return queue(actor,async()=>{const s=read(actor);s.cores=s.cores.filter(c=>c.id!==id);await write(actor,s);});
  if(action==='resume'){
    const p=read(actor).pending.find(p=>p.id===id);if(p?.echoRelease)return queue(actor,()=>finishEchoRelease(actor,id));
    return resolveCast(actor,id);
  }
  if(action==='echo'||action==='reaction')return releaseEchoes(actor,id,{reaction:action==='reaction'});
  if(action==='long-rest'||action==='full-rest'){
    if(await yes('Record rest',`<p>Record a ${action==='full-rest'?'Full':'Long'} Rest for Rasengan? Maintained cores will be dismissed.</p>`))return rest(actor,action==='full-rest'?'full':'long');return;
  }
  if(action==='chakra'){
    const result=await form('Planetary Chakra',`<label>Current Planetary Chakra<input name="chakra" type="number" min="0" max="${values(actor).maximum}" value="${read(actor).chakra}"></label>`);
    if(result&&typeof result==='object')return queue(actor,()=>write(actor,{...read(actor),chakra:Number(result.chakra)}));return;
  }
  if(action==='control'){
    const result=await form('Maintain Rasengan — Ability check',`<p>Advanced Chakra Control grants Advantage. Choose the ability and DC established by the DM.</p><label>Ability<select name="ability">${['int','wis','con','dex','str','cha'].map(a=>`<option>${a}</option>`).join('')}</select></label><label>DC<input name="dc" type="number" value="20"></label>`);
    if(!result||typeof result!=='object')return;
    const ability=actor.system?.abilities?.[result.ability],roll=typeof actor.rollAbilityCheck==='function'?await actor.rollAbilityCheck({ability:result.ability,advantage:true}):[(await rollD20(actor,Number(ability?.mod??0),'Maintain Rasengan',{advantage:true})).roll];
    const r=Array.isArray(roll)?roll[0]:roll;if(r?.total!=null&&Number(r.total)<Number(result.dc)&&await yes('Lost control?',`<p>Check ${r.total} failed DC ${Number(result.dc)}. Dismiss all maintained cores?</p>`))await queue(actor,()=>write(actor,{...read(actor),cores:[]}));return;
  }
  if(action==='relink'&&game.user.isGM){
    const refs=targets();if(refs.length!==1)throw new Error('Target exactly one replacement token.');
    if(await yes('Relink persistent Echoes',`<p>Move Echoes from the old target to ${esc(refs[0].name)}? Use this only for the same NPC recreated on the scene.</p>`))return queue(actor,async()=>{
      const s=read(actor);s.echoes=s.echoes.map(e=>e.target===id?{...e,target:refs[0].uuid,targetName:refs[0].name,tokenUuid:refs[0].tokenUuid}:e);
      for(const p of s.pending){if(p.echoRelease&&p.target===id)p.target=refs[0].uuid;else if(p.targets)for(const t of p.targets)if(t.uuid===id)Object.assign(t,refs[0]);}
      await write(actor,s);
    });return;
  }
  if(action==='reaction-reset'&&game.user.isGM)return queue(actor,()=>write(actor,{...read(actor),reactionTurn:''}));
  if(action==='cooldown'&&game.user.isGM){const result=await form('Combo cooldown',`<label>Days remaining<input name="days" type="number" min="0" value="${Math.max(0,Math.ceil((read(actor).cooldownUntil-game.time.worldTime)/86400))}"></label>`);if(result&&typeof result==='object')return queue(actor,()=>write(actor,{...read(actor),cooldownUntil:game.time.worldTime+Math.max(0,Number(result.days))*86400}));}
}
async function openTracker(context){
  const actor=getActor(context);own(actor);
  const previous=dialogs.get(actor.uuid);if(previous?.rendered){previous.bringToFront();return previous;}
  await queue(actor,()=>ensureActor(actor));
  const opened=dialogs.get(actor.uuid);if(opened){opened.bringToFront();return opened;}
  const dialog=createTrackerWindow({window:{title:`Rasengan — ${actor.name}`,icon:'fa-solid fa-hurricane',resizable:true},position:{width:950,height:Math.min(760,window.innerHeight-80)},classes:['n5eb-tracker-window','n5eb-rasengan-window']},()=>html(actor),app=>{
    const root=app.element.querySelector('[data-rasengan-root]');if(!root||root.dataset.bound)return;root.dataset.bound='true';
    root.addEventListener('click',async e=>{
      const tab=e.target.closest('[data-tab-button]');if(tab){e.preventDefault();e.stopPropagation();trackerTabs(root,tab.dataset.tabButton);return;}
      const b=e.target.closest('[data-action]');if(!b||b.disabled||root.dataset.busy)return;
      e.preventDefault();e.stopPropagation();const action=b.dataset.action,id=b.dataset.id;root.dataset.busy='true';b.disabled=true;
      try{await act(actor,action,id);}catch(error){console.error(`${ID} | Rasengan`,error);ui.notifications.error(error.message);}finally{delete root.dataset.busy;refresh(actor);}
    });
  });
  dialogs.set(actor.uuid,dialog);
  dialog.addEventListener('close',()=>dialogs.delete(actor.uuid),{once:true});await dialog.render({force:true});return dialog;
}
function renderStrip(app,element){
  const actor=app.actor??app.document;if(actor?.documentName!=='Actor'||!level(actor))return;
  const root=element?.querySelector?element:element?.[0]??app.element;if(!root?.querySelector||root.querySelector('[data-rasengan-strip]'))return;
  const target=root.querySelector('.jutsu-casting-overview')??root.querySelector('.sheet-body');if(!target)return;
  const v=values(actor),s=read(actor),strip=document.createElement('section');strip.className='n5eb-rasengan-strip';strip.dataset.rasenganStrip='true';
  strip.innerHTML=`<button type="button"><i class="fas fa-hurricane"></i> Rasengan Tracker</button><span>Planetary Chakra <strong>${s.chakra}/${v.maximum}</strong></span><span>RP <strong>${remainingPoints(actor,s,ARTS)}/${v.points}</strong></span><span>Echoes <strong>${s.echoes.length}</strong></span>`;
  strip.querySelector('button').addEventListener('click',()=>openTracker(actor).catch(e=>ui.notifications.error(e.message)));target.prepend(strip);
}
function refreshStrip(actor){
  for(const app of Object.values(actor.apps??{})){
    const root=app.element?.querySelector?app.element:app.element?.[0],strip=root?.querySelector('[data-rasengan-strip]');if(!strip)continue;
    const state=read(actor),v=values(actor),numbers=strip.querySelectorAll('strong');
    if(numbers[0])numbers[0].textContent=`${state.chakra}/${v.maximum}`;
    if(numbers[1])numbers[1].textContent=`${remainingPoints(actor,state,ARTS)}/${v.points}`;
    if(numbers[2])numbers[2].textContent=state.echoes.length;
  }
}
async function applyChatDamage(message,button){
  if(damageQueues.has(message.id))return;button.disabled=true;damageQueues.set(message.id,true);
  try {
  const payload=message.flags?.[ID]?.rasenganDamage;if(!payload||payload.applied)return;
  const target=await resolveTarget(payload.target);if(!target?.isOwner)throw new Error('Only the target owner or GM can apply damage.');
  if(typeof target.applyDamage!=='function')throw new Error('The system damage API is unavailable. Apply the displayed typed damage manually.');
  if(!await yes('Apply Rasengan damage',`<p>Apply damage to ${esc(target.name)} using the system (resistances/immunities and temporary HP)?</p>`))return;
  button.disabled=true;
  await target.applyDamage(payload.damages,{multiplier:payload.multiplier});
  // GM owns all chat messages; source owners own their own. A target owner can apply damage
  // but cannot mark another user's message, so only GM/source are offered the button below.
  await message.update({[`flags.${ID}.rasenganDamage.applied`]:true});
  } finally {damageQueues.delete(message.id);button.disabled=Boolean(message.flags?.[ID]?.rasenganDamage?.applied);}
}
Hooks.on('renderChatMessageHTML',(m,element)=>{
  const p=m.flags?.[ID]?.rasenganDamage;if(!p)return;const b=element.querySelector?.('[data-rasengan-apply]');if(!b)return;
  if(!game.user.isGM&&!m.isOwner){b.remove();return;}b.disabled=p.applied;b.textContent=p.applied?'Damage applied':'Apply damage (GM / owner)';
  b.addEventListener('click',()=>applyChatDamage(m,b).catch(e=>{b.disabled=false;ui.notifications.error(e.message);}));
});
Hooks.on('renderActorSheet',renderStrip);Hooks.on('renderCharacterActorSheet',renderStrip);Hooks.on('renderApplicationV2',renderStrip);
Hooks.once('ready',async()=>{
  globalThis.N5eBRasengan=Object.freeze({resumeResolution:(actor,id)=>read(actor).pending.find(p=>p.id===id)?.echoRelease?queue(actor,()=>finishEchoRelease(actor,id)):resolveCast(actor,id),openTracker,getTracker:read,purchase,formArt,evolve,releaseCore,releaseEchoes,compress,rest,arts:ARTS});
  if(game.system.id!=='n5eb')return;
  // One authority migrates shared documents; token Actors are handled on sheet open / item update.
  const activeGM=game.users?.activeGM??Array.from(game.users??[]).find(u=>u.active&&u.isGM);
  if(activeGM?.id===game.user.id)for(const actor of game.actors)if(level(actor))await queue(actor,()=>ensureActor(actor));
  for(const c of game.combats??[])if(c.combatant?.actor)combatActors.set(c.id,{uuid:c.combatant.actor.uuid,key:`${c.id}:${c.round}:${c.combatant.actor.uuid}`});
});
function rasenganClassMod(item){return item?.type==='classmod'&&item.system?.identifier==='rasengan';}
Hooks.on('createItem',(item,options,userId)=>{
  if(options?.[ID]||userId!==game.user.id||item.parent?.documentName!=='Actor'||!rasenganClassMod(item))return;
  queue(item.parent,()=>ensureActor(item.parent)).catch(e=>ui.notifications.error(e.message));
});
Hooks.on('updateItem',(item,changes,options,userId)=>{
  if(options?.[ID]||userId!==game.user.id||item.parent?.documentName!=='Actor'||!rasenganClassMod(item))return;
  if(changes['system.levels']===undefined&&foundry.utils.getProperty(changes,'system.levels')===undefined)return;
  queue(item.parent,()=>ensureActor(item.parent)).then(()=>refresh(item.parent)).catch(e=>ui.notifications.error(e.message));
});
Hooks.on('updateActor',(actor,changes,options)=>{
  if(options?.[ID]?.rasengan)return; // write() already refreshes once after the save.
  if(actor.isOwner&&level(actor)&&(changes.system||Object.keys(changes).some(key=>key.startsWith('system.'))))queue(actor,()=>ensureSheetValues(actor)).catch(e=>console.error(`${ID} | Rasengan values`,e));
  if(Object.keys(changes).some(key=>key==='system'||key==='name'||key.startsWith('system.')||key==='flags'||key.startsWith(`flags.${ID}.${TRACKER_FLAG}`)))refresh(actor);
});
Hooks.on('dnd5e.restCompleted',(actor,result)=>{if(actor.isOwner&&level(actor)&&['long','full'].includes(result?.type))queue(actor,async()=>{const s=read(actor);s.discountUsed=0;s.cores=[];s.reactionTurn='';if(result.type==='full'){s.chakra=values(actor).maximum;s.chakraLocked=false;if(s.comboAwaitingFullRest){s.comboAwaitingFullRest=false;s.cooldownUntil=game.time.worldTime+30*86400;}}await write(actor,s);});});
Hooks.on('updateCombat',async(combat,changes,options,userId)=>{
  if(!Object.hasOwn(changes,'turn')&&!Object.hasOwn(changes,'round'))return;
  const old=combatActors.get(combat.id),current=combat.combatant?.actor;combatActors.set(combat.id,{uuid:current?.uuid,key:`${combat.id}:${combat.round}:${current?.uuid}`});
  if(userId!==game.user.id||!old)return;const previous=await resolveTarget(old.uuid);if(previous?.isOwner&&level(previous)>=3)await compress(previous,{key:old.key});
});
Hooks.on('deleteCombat',combat=>combatActors.delete(combat.id));
// Never let a native activity spend an undefined resource or bypass the point ledger.
Hooks.on('dnd5e.preUseActivity',(activity,usageConfig={},dialogConfig={},messageConfig={})=>{
  if(bypass.has(activity))return;
  const item=activity.item??activity.parent?.item,actor=activity.actor??item?.actor;
  if(actor&&read(actor).chakraLocked&&(item?.type==='spell'||item?.flags?.[ID]?.rasenganArt)){ui.notifications.warn('Cannot mold Chakra until a Full Rest after the combination Art.');return false;}
  if(item?.flags?.[ID]?.rasenganArt){
    openTracker(actor).catch(e=>ui.notifications.error(e.message));return false;
  }
  // This hook is synchronous: stop first, await a decision, and resume only after the save.
  // Only the acting GM or an owner of the imprinting Actor can make this decision.
  if(!actor||(!['attack','save','cast'].includes(activity.type)&&item?.type!=='spell'))return;
  const sources=Array.from(game.actors??[]).filter(a=>a.isOwner&&level(a)>=3&&read(a).echoes.some(e=>e.target===actor.uuid)&&reactionAvailable(a,read(a)));
  if(!sources.length)return;
  const source=sources[0];
  (async()=>{
    let interrupted=false;
    if(await yes('Spiral Echo reaction window',`<p>${esc(actor.name)} is using ${esc(item?.name??'a Technique')}. Release ${esc(source.name)}'s Echoes before it resolves?</p>`)){
      const result=await releaseEchoes(source,actor.uuid,{reaction:true});interrupted=Boolean(result?.interrupted);
    }
    if(!interrupted){bypass.add(activity);try{await activity.use(usageConfig,dialogConfig,messageConfig);}finally{bypass.delete(activity);}}
  })().catch(e=>ui.notifications.error(`Reaction window paused: ${e.message}. Resolve the pending release, then retry the triggering action.`));
  return false;
});
function validateRasenganLevel(item,changes={}){
  if(item?.type!=='classmod'||item.system?.identifier!=='rasengan'||item.parent?.documentName!=='Actor')return;
  const next=Number(changes['system.levels']??foundry.utils.getProperty(changes,'system.levels')??item.system.levels);
  if(next>4||next<1){ui.notifications.warn('This release implements Rasengan levels 1–4. Uzuhiko will be added separately.');return false;}
}
Hooks.on('preCreateItem',item=>validateRasenganLevel(item));
Hooks.on('preUpdateItem',(item,changes)=>validateRasenganLevel(item,changes));
