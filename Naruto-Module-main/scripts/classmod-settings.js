import {CHARACTER_LEVELS} from "./classmod-levels.js";
const ID='n5eb-classmod-library';
export function enforceMinimumLevels(){return game.settings.get(ID,'enforceMinimumLevels')===true;}
export function meetsMinimumLevel(actor,required){return !enforceMinimumLevels()||Number(actor?.system?.details?.level??0)>=Number(required??0);}
function managed(item){return item?.type==='classmod'||Boolean(item?.flags?.[ID]?.classMod)||Boolean(item?.flags?.[ID]?.managed);}
function patchPreparedPrerequisites(){
  const prototype=CONFIG.Item?.documentClass?.prototype;
  if(!prototype||prototype.__n5ebOptionalLevels)return;
  const original=prototype.prepareDerivedData;if(typeof original!=='function')return;
  prototype.prepareDerivedData=function(...args){const result=original.apply(this,args);if(managed(this)&&!enforceMinimumLevels()&&this.system?.prerequisites)this.system.prerequisites.level=0;return result;};
  Object.defineProperty(prototype,'__n5ebOptionalLevels',{value:true});
}
Hooks.once('init',()=>{
  game.settings.register(ID,'enforceMinimumLevels',{name:'Mindest-Charakterlevel für Class Mods erzwingen',hint:'Aus: Class Mods und ihre Features dürfen früher erhalten werden. Class-Mod-Stufen, Ressourcen und andere Voraussetzungen bleiben gültig.',scope:'world',config:true,type:Boolean,default:false,requiresReload:true});
  patchPreparedPrerequisites();
});
function check(item,changes){
  if(item?.type!=='classmod'||item.parent?.documentName!=='Actor'||!enforceMinimumLevels())return;
  const next=Number(changes['system.levels']??foundry.utils.getProperty(changes,'system.levels')??item.system?.levels??1);
  if(next<Number(item.system?.levels??1))return;
  const required=item.flags?.[ID]?.minimumCharacterLevels?.[next]??CHARACTER_LEVELS[item.system?.identifier]?.[next]??item.system?.prerequisites?.level??0;
  if(!meetsMinimumLevel(item.parent,required)){ui.notifications.warn(`${item.name}: character level ${required}+ is required.`);return false;}
}
Hooks.on('preCreateItem',item=>check(item,{}));
Hooks.on('preUpdateItem',(item,changes)=>check(item,changes));
