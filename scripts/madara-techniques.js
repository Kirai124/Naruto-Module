/** Persistent ongoing techniques and source-bound removal checks. No compendium scans. */
const ID='n5eb-classmod-library',ONGOING='madaraOngoing',RED_STAR='madaraRedStar',REMOVAL='madaraRemoval';
const list=value=>Array.from(value??[]);
const flag=(doc,key)=>doc?.getFlag?.(ID,key)??doc?.flags?.[ID]?.[key];
const options=()=>({[ID]:{madaraTechnique:true},render:false});
const esc=value=>foundry.utils.escapeHTML(String(value??''));
const now=()=>Number(game.time.worldTime)||0;
const active=effect=>effect&&!effect.disabled&&!effect.isSuppressed&&(!(effect.duration?.remaining!==undefined&&effect.duration?.remaining!==null)||effect.duration.remaining>0);
const roundKey=()=>game.combat?`${game.combat.id}:${game.combat.round??0}`:'';

export function flowerAttackData(source,{attack,mode='free',apex=true}){
  const data=structuredClone(source);data.effects=(data.effects??[]).filter(effect=>effect.flags?.n5eb?.condition?.id==='burned');
  const part={number:apex?5:4,denomination:8,bonus:'4',types:['fire'],custom:{enabled:false,formula:''},scaling:{mode:'',number:0,formula:''}};
  data.system.activities={MadaraFlowerAtk1:{type:'attack',name:'Flame Flower sphere',activation:{type:mode==='free'?'special':'bonus',value:1},
    attack:{flat:true,bonus:String(attack),ability:'none',type:{value:'ranged',classification:'spell'}},
    damage:{includeBase:false,parts:[part]},range:{override:true,value:'120',units:'ft'},
    target:{template:{type:''},affects:{type:'creature',count:'1'}},consumption:{targets:[]},effects:data.effects.map(effect=>({_id:effect._id}))}};
  data.system.chakra={...data.system.chakra,cost:'0',scaling:{mode:'none',value:0}};
  data.system.properties=(data.system.properties??[]).filter(key=>key!=='concentration');
  return data;
}

export function createTechniqueAutomation({refresh}){
  const localQueues=new Map();
  const locked=(actor,task)=>{
    const key=actor.uuid,previous=localQueues.get(key)??Promise.resolve(),current=previous.catch(()=>{}).then(task);
    localQueues.set(key,current);return current.finally(()=>{if(localQueues.get(key)===current)localQueues.delete(key);});
  };
  const actorByUuid=async uuid=>{
    if(!uuid)return null;
    const world=list(game.actors).find(actor=>actor.uuid===uuid);if(world)return world;
    const doc=await globalThis.fromUuid?.(uuid);return doc?.documentName==='Actor'?doc:doc?.actor??null;
  };
  const allActors=()=>[...new Map([...list(game.actors),...list(globalThis.canvas?.tokens?.placeables).map(token=>token.actor)].filter(Boolean).map(actor=>[actor.uuid,actor])).values()];
  const alive=effect=>active(effect)&&(!flag(effect,ONGOING)?.expires||flag(effect,ONGOING).expires>now());
  const requireControl=(actor,id,kind)=>{
    if(!actor?.isOwner)throw new Error('The character owner or GM must use this control.');
    const effect=actor.effects.get(id);if(!alive(effect)||flag(effect,ONGOING)?.kind!==kind)throw new Error('This technique is no longer active.');return effect;
  };
  async function sourceControl(meta){
    const caster=await actorByUuid(meta.casterUuid);return list(caster?.effects).find(effect=>alive(effect)&&flag(effect,ONGOING)?.castId===meta.castId);
  }
  function prepareConcentration(actor,item,data){
    const cast=flag(item,'madaraCast');if(!cast?.mastered||!['uchiha-flame-flower','genjutsu-red-star'].includes(cast.identifier))return;
    data.flags??={};data.flags[ID]??={};
    data.flags[ID][ONGOING]={kind:cast.identifier,castId:cast.castId??flag(item,'madaraCastId'),casterUuid:actor.uuid,sourceUuid:item.uuid,sourceId:item.id,
      attack:cast.attack,dc:cast.dc,expires:now()+60,spheres:cast.identifier==='uchiha-flame-flower'?8:0,freeRound:'',bonusTurn:'',data:item.toObject()};
  }
  async function launchFlower(actor,id,{mode='free'}={}){
    if(!['free','bonus'].includes(mode))throw new Error('Choose Free Action or Bonus Action.');
    return locked(actor,async()=>{
      const effect=requireControl(actor,id,'uchiha-flame-flower'),state=flag(effect,ONGOING),key=roundKey(),turn=game.combat?`${key}:${game.combat.turn??0}`:'';
      if(state.spheres<1)throw new Error('All Flame Flower spheres have been used.');
      if(mode==='free'&&!key)throw new Error('Start combat to track the free attack per round.');
      if(mode==='free'&&state.freeRound===key)throw new Error('The free Flame Flower attack was already used this round.');
      if(mode==='bonus'&&game.combat&&game.combat.combatant?.actor?.uuid!==actor.uuid)throw new Error('The bonus-action attack is available on your turn.');
      if(mode==='bonus'&&turn&&state.bonusTurn===turn)throw new Error('The Flame Flower bonus-action attack was already used this turn.');
      const targets=list(game.user.targets).filter(token=>token.actor);if(targets.length!==1)throw new Error('Target exactly one creature before launching a sphere.');
      const base=actor.items.get(state.sourceId);if(!base)throw new Error('The source Jutsu is no longer owned.');
      const data=flowerAttackData(state.data,{attack:state.attack,mode});
      data.name='Mastered Flame Flower — sphere';
      const item=base.clone(data,{keepId:true,parent:actor}),activity=list(item.system.activities).find(activity=>activity.type==='attack');
      if(!activity?.rollAttack||!activity._createUsageMessage)throw new Error('Native Flame Flower attack APIs are unavailable.');
      const card=await activity._createUsageMessage({data:{flags:{n5eb:activity.messageFlags,[ID]:{madaraFlower:{phase:'pending',casterUuid:actor.uuid,controlId:id}}},system:{effects:[]}}});
      let rolls;
      try{rolls=await activity.rollAttack({}, {}, {data:{flags:{n5eb:{originatingMessage:card.id},[ID]:{madaraFlower:{phase:'attack',casterUuid:actor.uuid,controlId:id}}}}});}
      catch(error){await card.update({[`flags.${ID}.madaraFlower.phase`]:'cancelled'},options());throw error;}
      if(!rolls?.length){await card.update({[`flags.${ID}.madaraFlower.phase`]:'cancelled'},options());return;}
      // Consume a sphere only after a real attack roll; hit and miss both consume it.
      if(!alive(effect)){await card.update({[`flags.${ID}.madaraFlower.phase`]:'cancelled'},options());throw new Error('Concentration ended while the attack dialog was open.');}
      if(game.combat&&(roundKey()!==key||(mode==='bonus'&&`${roundKey()}:${game.combat.turn??0}`!==turn))){await card.update({[`flags.${ID}.madaraFlower.phase`]:'cancelled'},options());throw new Error('Combat advanced while the attack dialog was open. Start the attack again.');}
      await effect.update({[`flags.${ID}.${ONGOING}.spheres`]:state.spheres-1,...(mode==='free'?{[`flags.${ID}.${ONGOING}.freeRound`]:key}:turn?{[`flags.${ID}.${ONGOING}.bonusTurn`]:turn}:{})},options());
      await card.update({[`flags.${ID}.madaraFlower`]:{phase:'resolved',critical:Boolean(rolls[0].isCritical),casterUuid:actor.uuid,controlId:id},'system.effects':activity.applicableEffects?.map(effect=>`.ActiveEffect.${effect.id}`)??[]},options());
      refresh(actor);return card;
    });
  }
  async function removeCondition(actor,effectId){
    return locked(actor,async()=>{
      if(!actor?.isOwner)throw new Error('The target owner or GM must make this removal check.');
      const effect=actor.effects.get(effectId),meta=flag(effect,REMOVAL);if(!active(effect)||!meta)throw new Error('This source-bound condition is no longer active.');
      const rolls=meta.kind==='restrained'?await actor.rollSavingThrow({ability:'str',target:meta.dc}):
        await actor.rollSkill({skill:'sur',ability:'dex',target:meta.dc});
      if(!rolls?.length)return;
      const success=Number(rolls[0].total)>=meta.dc;
      if(success&&actor.effects.get(effectId)===effect)await effect.delete(options());
      refresh(actor);const caster=await actorByUuid(meta.casterUuid);if(caster)refresh(caster);return success;
    });
  }
  async function endTechnique(actor,id){
    if(!actor?.isOwner)throw new Error('The character owner or GM must end the technique.');
    const effect=actor.effects.get(id);if(!effect||!flag(effect,ONGOING))return;
    if(typeof actor.endConcentration==='function')await actor.endConcentration(effect);else await effect.delete(options());refresh(actor);
  }
  async function cleanupTargets(control){
    const source=flag(control,ONGOING);if(!source)return;
    for(const target of allActors())if(target.isOwner)for(const effect of list(target.effects)){
      const meta=flag(effect,RED_STAR);if(meta?.casterUuid!==source.casterUuid||meta.castId!==source.castId)continue;
      if(!effect.origin||effect.origin===source.sourceUuid||effect.origin===target.uuid)await effect.delete(options());
      else await effect.update({[`flags.${ID}.-=${RED_STAR}`]:null},options());
    }
  }
  async function redStarTurn(actor,key){
    return locked(actor,async()=>{
      for(const effect of list(actor.effects)){
        const meta=flag(effect,RED_STAR);if(!meta||!active(effect)||meta.lastTurn===key)continue;
        if(!await sourceControl(meta))continue;
        const rank=Number(effect.flags?.n5eb?.condition?.rank??0);if(rank<1||actor.getConditionRank?.('demoralized')===0)continue;
        const changes={[`flags.${ID}.${RED_STAR}.lastTurn`]:key,'flags.n5eb.condition.rank':Math.min(5,rank+1)};
        if(rank>=5)changes[`flags.${ID}.${RED_STAR}.crash`]={key,phase:'pending'};
        await effect.update(changes,options());
        if(rank>=5)await resolveCrash(actor,effect.id);
        const caster=await actorByUuid(meta.casterUuid);if(caster)refresh(caster);
      }
    });
  }
  async function resolveCrash(actor,id){
    if(!actor?.isOwner)throw new Error('The target owner or GM must resolve Red Star damage.');
    const effect=actor.effects.get(id),meta=flag(effect,RED_STAR),crash=meta?.crash;
    if(!crash||crash.phase==='applied')return;
    if(crash.phase==='applying')throw new Error('Damage application was interrupted. The GM must verify HP before retrying; automatic reapplication is blocked.');
    if(typeof actor.applyDamage!=='function')throw new Error('The native damage API is unavailable.');
    let total=crash.total;
    if(total===undefined){
      const roll=await new Roll('10d8').evaluate();total=Number(roll.total);
      await effect.update({[`flags.${ID}.${RED_STAR}.crash`]:{...crash,phase:'rolled',total}},options());
      await roll.toMessage({speaker:ChatMessage.getSpeaker({actor}),flavor:'Mastered Red Star — sun crash, 10d8 psychic (applied automatically)'});
    }
    await effect.update({[`flags.${ID}.${RED_STAR}.crash.phase`]:'applying'},options());
    await actor.applyDamage([{type:'psychic',value:total}],{multiplier:1});
    await effect.update({[`flags.${ID}.${RED_STAR}.crash.phase`]:'applied'},options());return total;
  }
  function related(actor){
    return allActors().flatMap(target=>list(target.effects).filter(effect=>active(effect)&&(flag(effect,REMOVAL)?.casterUuid===actor.uuid||flag(effect,RED_STAR)?.casterUuid===actor.uuid)).map(effect=>({target,effect})));
  }
  function panel(actor){
    const ongoing=list(actor.effects).filter(effect=>flag(effect,ONGOING)&&alive(effect));
    const cards=ongoing.map(effect=>{
      const state=flag(effect,ONGOING),flower=state.kind==='uchiha-flame-flower';
      return `<section class="madara-tracker-card"><h3>${flower?'Flame Flower':'Red Star'}</h3><p>${flower?`${state.spheres} / 8 spheres · Free Action once per round`: 'Affected targets gain a Demoralized rank at turn start.'}</p><div class="tracker-controls">${flower?`<button type="button" data-action="flower-free" data-id="${esc(effect.id)}" ${!state.spheres||!roundKey()||state.freeRound===roundKey()?'disabled':''}>Free attack</button><button type="button" data-action="flower-bonus" data-id="${esc(effect.id)}" ${!state.spheres?'disabled':''}>Bonus-action attack</button>`:''}<button type="button" data-action="end-technique" data-id="${esc(effect.id)}">End concentration</button></div></section>`;
    }).join('');
    const targets=related(actor).map(({target,effect})=>{
      const removal=flag(effect,REMOVAL),red=flag(effect,RED_STAR);
      return `<section class="madara-tracker-card"><h3>${esc(target.name)} · ${esc(effect.name)}</h3><p>${removal?`${removal.kind==='restrained'?'STR save':'DEX (Survival)'} · DC ${removal.dc}`:`Demoralized rank ${effect.flags?.n5eb?.condition?.rank??0}`}</p>${removal?`<button type="button" data-action="remove-condition" data-id="${esc(effect.id)}" data-target="${esc(target.uuid)}" ${target.isOwner?'':'disabled'}>Attempt removal</button>`:''}${red?.crash&&['pending','rolled'].includes(red.crash.phase)?`<button type="button" data-action="redstar-crash" data-id="${esc(effect.id)}" data-target="${esc(target.uuid)}" ${target.isOwner?'':'disabled'}>Resolve pending crash</button>`:''}${!target.isOwner?'<small>The target owner or GM makes removal checks.</small>':''}</section>`;
    }).join('');
    return cards+targets||'<p>No ongoing Mastered technique or source-bound condition is active.</p>';
  }
  async function perform(actor,action,id,targetUuid){
    if(action==='flower-free'||action==='flower-bonus')return launchFlower(actor,id,{mode:action==='flower-free'?'free':'bonus'});
    if(action==='end-technique')return endTechnique(actor,id);
    if(action==='remove-condition'||action==='redstar-crash'){
      const target=await actorByUuid(targetUuid),effect=target?.effects.get(id);
      const meta=flag(effect,action==='remove-condition'?REMOVAL:RED_STAR);if(meta?.casterUuid!==actor.uuid)throw new Error('This effect belongs to a different caster.');
      return action==='remove-condition'?removeCondition(target,id):locked(target,()=>resolveCrash(target,id));
    }
  }
  Hooks.on('dnd5e.preBeginConcentrating',prepareConcentration);
  Hooks.on('updateCombat',async(combat,changes,opts,userId)=>{
    if(!Object.hasOwn(changes,'turn')&&!Object.hasOwn(changes,'round'))return;
    const gm=game.users?.activeGM;if(gm?gm.id!==game.user.id:userId!==game.user.id)return;
    const actor=combat.combatant?.actor;if(actor?.isOwner)await redStarTurn(actor,`${combat.id}:${combat.round??0}:${combat.turn??0}`);
  });
  async function expireTechniques(){
    const gm=game.users?.activeGM;if(gm&&gm.id!==game.user.id)return;
    for(const actor of allActors())for(const effect of list(actor.effects))if(actor.isOwner&&flag(effect,ONGOING)?.expires<=now())await locked(actor,()=>endTechnique(actor,effect.id));
  }
  Hooks.on('updateWorldTime',expireTechniques);Hooks.once('ready',expireTechniques);
  Hooks.on('renderChatMessageHTML',(message,element)=>{
    const flower=flag(message,'madaraFlower');if(!flower)return;
    for(const button of element.querySelectorAll('[data-action="rollAttack"],[data-action="consumeResource"],[data-action="refundResource"]'))button.remove();
    if(flower.phase!=='resolved')for(const button of element.querySelectorAll('[data-action="rollDamage"],[data-action="applyEffects"]'))button.remove();
    if(flower.phase==='resolved'&&flower.critical){
      const damage=element.querySelector('[data-action="rollDamage"]');damage?.addEventListener('click',async event=>{
        event.preventDefault();event.stopImmediatePropagation();
        await message.getAssociatedActivity()?.rollDamage({isCritical:true},{options:{defaultButton:'critical'}});
      },{capture:true});
    }
  });
  for(const hook of ['createActiveEffect','updateActiveEffect','deleteActiveEffect'])Hooks.on(hook,async(effect)=>{
    if(!flag(effect,ONGOING)&&!flag(effect,RED_STAR)&&!flag(effect,REMOVAL))return;
    const gm=game.users?.activeGM;
    if(flag(effect,ONGOING)&&(hook==='deleteActiveEffect'||effect.disabled)&&(!gm||gm.id===game.user.id))await cleanupTargets(effect);
    const actor=effect.parent;if(actor?.documentName==='Actor')refresh(actor);
  });
  return {panel,perform,launchFlower,removeCondition,endTechnique,redStarTurn,resolveCrash,prepareConcentration};
}
