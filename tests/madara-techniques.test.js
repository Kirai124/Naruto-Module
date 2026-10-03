// Native cast-local data transformations are intentionally independent of Foundry globals.
import test from 'node:test';
import assert from 'node:assert/strict';
import {flowerAttackData} from '../scripts/madara-techniques.js';
import {modifyTechniqueData} from '../scripts/madara-rules.js';
const ID='n5eb-classmod-library';
test('Flame Flower follow-up is a free native ranged attack with Apex dice, no Chakra or concentration',()=>{
 const source={system:{properties:['concentration'],chakra:{cost:'14'},activities:{cast:{type:'utility'}}},effects:[{_id:'burned',flags:{n5eb:{condition:{id:'burned',rank:2}}}},{name:'Legacy macro'}]};
 const data=flowerAttackData(source,{attack:12});const activity=Object.values(data.system.activities)[0];
 assert.equal(activity.type,'attack');assert.equal(activity.attack.bonus,'12');assert.equal(activity.damage.parts[0].number,5);assert.equal(activity.damage.parts[0].denomination,8);assert.equal(data.system.chakra.cost,'0');assert.deepEqual(data.system.properties,[]);assert.equal(data.effects.length,1);assert.equal(source.system.chakra.cost,'14');
});
test('Red Star native condition binds the correct caster, cast and DC and drops duplicate legacy penalties',()=>{
 const source={system:{activities:{}},effects:[{name:'Fear/Demoralized',changes:[{key:'legacy.penalty',value:'-1'}],flags:{}}]};
 const result=modifyTechniqueData(source,{attack:10,dc:18,mastered:'genjutsu-red-star',casterUuid:'Actor.caster',castId:'cast-a'}),effect=result.effects[0];
 assert.deepEqual(effect.flags.n5eb.condition,{id:'demoralized',rank:2,maxRank:5});assert.deepEqual(effect.changes,[]);assert.equal(effect.duration.seconds,60);assert.equal(effect.flags[ID].madaraRedStar.casterUuid,'Actor.caster');assert.equal(effect.flags[ID].madaraRedStar.castId,'cast-a');
});
test('Shuriken and Searing removal checks retain their own DC and source, without changing originals',()=>{
 const source={system:{activities:{}},effects:[{name:'Restrained',changes:[]},{name:'Burned',flags:{n5eb:{condition:{id:'burned',rank:1}}}}]};
 const result=modifyTechniqueData(source,{attack:10,dc:19,mastered:'uchiha-shuriken-rain',searing:true,level:3,casterUuid:'Actor.caster',castId:'cast-b'});
 assert.deepEqual(result.effects[0].flags[ID].madaraRemoval,{kind:'restrained',dc:19,casterUuid:'Actor.caster',castId:'cast-b'});
 assert.deepEqual(result.effects[1].flags[ID].madaraRemoval,{kind:'burned',dc:18,casterUuid:'Actor.caster',castId:'cast-b'});assert.equal(source.effects[0].flags,undefined);
});
