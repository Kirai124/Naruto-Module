/** Cast-local Madara changes; never rewrite the owned Jutsu or shared system config. */
export function castPayment({level, cost, kind='uchiha', source='legacy', mastered=false, legacy, chakra, temporary=0}) {
  if(!['legacy','normal'].includes(source))throw new Error('Select Legacy Chakra or normal Chakra.');
  const base=Math.max(0,Math.floor(Number(cost)||0));
  let legacyCost=source==='legacy'?(kind==='uchiha'?Math.ceil(base/2):base):0;
  let normalCost=source==='normal'?base:0;
  // Mastered benefits always require 2 Legacy Chakra. Perfect Match permits 6 normal Chakra instead.
  if(mastered){if(source==='normal'&&level>=5)normalCost+=6;else legacyCost+=2;}
  const legacySpent=Math.min(legacy,legacyCost),shortfall=legacyCost-legacySpent;
  if(shortfall&&level<5)throw new Error(`Requires ${legacyCost} Legacy Chakra; ${legacy} available.`);
  normalCost+=shortfall*3;
  if(normalCost>chakra+temporary)throw new Error(`Requires ${normalCost} normal Chakra; ${chakra+temporary} available.`);
  return {legacyCost,legacySpent,normalCost};
}

export function modifyTechniqueData(data,{attack,dc,mastered='',apex=true,extraRange=false,searing=false,level=1,casterUuid='',castId='',sourceUuid=''}) {
  const result=structuredClone(data),system=result.system;
  if(mastered==='uchiha-flame-ball'){
    if(system.damage?.parts?.[0])system.damage.parts[0][0]='6d10+6';
    if(system.scaling)system.scaling.formula='2d6+2';
    for(const activity of Object.values(system.activities??{})){
      const part=activity.damage?.parts?.[0];
      if(part){part.number=6;part.denomination=10;part.bonus='6';part.custom={enabled:false,formula:''};part.scaling={mode:'whole',number:0,formula:'2d6+2'};}
      if(activity.target?.template?.type){activity.target.template.size=String(Number(activity.target.template.size||0)+10);if(activity.target.template.width)activity.target.template.width=String(Number(activity.target.template.width)+5);}
      if(activity.range?.value)activity.range.value=String(Number(activity.range.value)+30);
    }
    if(system.range?.value)system.range.value=Number(system.range.value)+30;
    if(system.target){system.target.value=String(Number(system.target.value||0)+10);system.target.width=Number(system.target.width||5)+5;}
  }
  const nextDie=faces=>({4:6,6:8,8:10,10:12,12:20}[faces]??faces);
  const changePart=part=>{
    if(Array.isArray(part)){part[0]=String(part[0]).replace(/(\d+)d(\d+)/,(m,n,d)=>`${Number(n)+(apex?1:0)}d${mastered==='uchiha-shuriken-rain'?nextDie(Number(d)):d}`);return;}
    if(part.custom?.enabled)part.custom.formula=String(part.custom.formula??'').replace(/(\d+)d(\d+)/,(m,n,d)=>`${Number(n)+(apex?1:0)}d${mastered==='uchiha-shuriken-rain'?nextDie(Number(d)):d}`);
    else if(part.number>0&&part.denomination){if(apex)part.number++;if(mastered==='uchiha-shuriken-rain')part.denomination=nextDie(part.denomination);}
  };
  for(const activity of Object.values(system.activities??{})){
    if(activity.attack){activity.attack.flat=true;activity.attack.bonus=String(attack);}
    if(activity.save?.dc){activity.save.dc.calculation='';activity.save.dc.formula=String(dc);}
    for(const part of activity.damage?.parts??[])changePart(part);
    if(extraRange&&Number(activity.range?.value)>=30)activity.range.value=Number(activity.range.value)+30;
    if(mastered==='uchiha-shuriken-rain'){
      if(activity.target?.template){activity.target.template.type='sphere';activity.target.template.size='10';activity.target.template.count='2';}
      if(activity.consumption?.targets)activity.consumption.targets=activity.consumption.targets.filter(target=>target.type!=='itemQuantity'&&!(target.type==='itemUses'&&target.target));
    }
  }
  // Legacy data are also supported; native migration creates Activities from these fields.
  if(Array.isArray(system.damage?.parts))for(const part of system.damage.parts)changePart(part);
  if(system.attack){system.attack.flat=true;system.attack.bonus=String(attack);}
  if(system.save){system.save.dc=dc;system.save.scaling='flat';}
  if(extraRange&&Number(system.range?.value)>=30)system.range.value=Number(system.range.value)+30;
  if(mastered==='genjutsu-sharingan'){
    if(system.jutsu){system.jutsu.components=[];system.jutsu.keywords=(system.jutsu.keywords??[]).filter(key=>key!=='visual');}
    system.properties=(system.properties??[]).filter(key=>!['visual','handseals','chakramolding','hs','cm'].includes(key));
  }
  if(mastered==='uchiha-shuriken-rain'){
    if(system.scaling?.formula)system.scaling.formula=system.scaling.formula.replace(/d(\d+)/g,(m,d)=>`d${nextDie(Number(d))}`);
    if(system.materials){system.materials.value='';system.materials.consumed=false;}
    if(system.consume){system.consume.type='';system.consume.target=null;system.consume.amount=0;}
    if(system.jutsu)system.jutsu.components=(system.jutsu.components??[]).filter(key=>!['m','w','nt'].includes(key));
  }
  for(const activity of Object.values(system.activities??{}))if(mastered==='uchiha-shuriken-rain'){
    for(const part of activity.damage?.parts??[])if(part.scaling?.formula)part.scaling.formula=part.scaling.formula.replace(/d(\d+)/g,(m,d)=>`d${nextDie(Number(d))}`);
  }
  if(mastered==='uchiha-flame-spiral'){
    for(const activity of Object.values(system.activities??{}))if(activity.target?.template)Object.assign(activity.target.template,{type:'cylinder',count:'4',size:'5',height:'30',units:'ft'});
  }
  if(mastered==='uchiha-great-assault'&&!(result.effects??[]).some(effect=>effect.flags?.n5eb?.condition?.id==='bruised')){
    (result.effects??=[]).push({_id:'MadaraBruised001',name:'Bruised',transfer:false,disabled:false,changes:[],statuses:['bruised'],flags:{n5eb:{condition:{id:'bruised',rank:1,maxRank:5}}}});
  }
  if(mastered==='uchiha-flame-flower'&&!(result.effects??[]).some(effect=>effect.flags?.n5eb?.condition?.id==='burned'||/^burned$/i.test(effect.name??''))){
    (result.effects??=[]).push({_id:'MadaraBurned0001',name:'Burned',transfer:false,disabled:false,changes:[],duration:{seconds:60},statuses:['burned'],flags:{n5eb:{condition:{id:'burned',rank:1,maxRank:5}}}});
  }
  for(const activity of Object.values(system.activities??{}))for(const effect of result.effects??[]){
    if(!['MadaraBruised001','MadaraBurned0001'].includes(effect._id))continue;
    activity.effects??=[];if(!activity.effects.some(reference=>reference._id===effect._id))activity.effects.push({_id:effect._id});
  }
  for(const effect of result.effects??[]){
    let condition=effect.flags?.n5eb?.condition;
    if(!condition&&/^burned$/i.test(effect.name??'')&&(searing||mastered==='uchiha-ember-bullet')){
      // Replace legacy DAE/Midi Burned mechanics with native ranked-condition data.
      effect.flags??={};effect.flags.n5eb??={};condition=effect.flags.n5eb.condition={id:'burned',rank:1,maxRank:5};
      effect.statuses=[...new Set([...(effect.statuses??[]),'burned'])];effect.changes=[];
    }
    if(condition?.id==='burned'){
      condition.rank=Number(condition.rank??1)+(searing?1:0)+(mastered==='uchiha-ember-bullet'?1:0);
      if(searing){effect.flags['n5eb-classmod-library']??={};effect.flags['n5eb-classmod-library'].burnedRemovalDC=15+level;effect.flags['n5eb-classmod-library'].madaraRemoval={kind:'burned',dc:15+level,casterUuid,castId};}
    }
    if(mastered==='uchiha-shuriken-rain'&&(condition?.id==='restrained'||/^restrained$/i.test(effect.name??''))){
      effect.flags??={};effect.flags.n5eb??={};effect.flags.n5eb.condition={id:'restrained',rank:1,maxRank:1};effect.changes=[];effect.statuses=['restrained'];
      effect.flags['n5eb-classmod-library']??={};effect.flags['n5eb-classmod-library'].madaraRemoval={kind:'restrained',dc,casterUuid,castId};
    }
    if(mastered==='genjutsu-red-star'&&(condition?.id==='demoralized'||/fear|demoralized/i.test(effect.name??''))){
      effect.flags??={};effect.flags.n5eb??={};effect.flags.n5eb.condition={id:'demoralized',rank:2,maxRank:5};effect.changes=[];effect.statuses=['demoralized'];
      effect.duration={seconds:60,rounds:null,turns:null};
      if(sourceUuid)effect.origin=sourceUuid;
      effect.flags['n5eb-classmod-library']??={};effect.flags['n5eb-classmod-library'].madaraRedStar={casterUuid,castId,dc,lastTurn:''};
    }
  }
  return result;
}
