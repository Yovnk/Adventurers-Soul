import { paladinClass } from "./Paladin/paladinClass.js";
import { personaldata } from "./Paladin/personaldata.js";

export class Character {
  constructor(classData, skinData, options = {}){
    const c = classData||{}, s = skinData||{};
    const opts = options||{};
    this.data = {...c,...s};
    this.data.stats = c.stats||s.stats||{};
    this.data.skills = c.skills||s.skills||[];
    this.data.sprites = s.sprites||c.sprites||{};
    this.data.basicAttack = s.basicAttack||c.basicAttack;
    this.className = this.data.className||this.data.name||"SinClase";
    this.baseStats = {...this.data.stats};
    this.equipmentStats = opts.equipmentStats||{};
    this.bonusStats = opts.bonusStats||{};
    this.bonusSecondary = opts.bonusSecondary||{};
    this.recalculate();
    this.hp=this.secondary.maxHP; this.mp=this.secondary.maxMP;
  }
  getTotalPrimary(){
    const t={}; for(const k of ["str","vit","vol","agi","int"]) t[k]=(this.baseStats[k]||0)+(this.equipmentStats[k]||0)+(this.bonusStats[k]||0);
    return t;
  }
  recalculate(){
    const p=this.getTotalPrimary(), per50=v=>Math.floor(v/50), s={};
    s.atk=p.str*4; s.def=p.str*3+p.vit*4; s.maxHP=p.vit*10; s.dAtk=p.agi*4; s.mAtk=p.int*4; s.mDef=p.int*3+p.vol*4; s.maxMP=p.vol*5;
    s.bloq=per50(p.str); s.dCrit=per50(p.str); s.hit=per50(p.agi); s.eva=per50(p.agi); s.crit=per50(p.agi); s.sAtk=per50(p.agi); s.dmc=per50(p.int); s.mCrit=per50(p.int); s.cd=per50(p.vol);
    for(const k in this.bonusSecondary) s[k]=(s[k]||0)+this.bonusSecondary[k];
    this.primary=p; this.secondary=s;
    if(this.hp!==undefined) this.hp=Math.min(this.hp,s.maxHP);
    if(this.mp!==undefined) this.mp=Math.min(this.mp,s.maxMP);
    return s;
  }
  setEquipment(equipmentStats, bonusSecondary){
    this.equipmentStats = equipmentStats||{};
    this.bonusSecondary = bonusSecondary||{};
    this.recalculate();
  }
  getHPText(){ return Math.floor(this.hp)+" / "+this.secondary.maxHP; }
  getMPText(){ return Math.floor(this.mp)+" / "+this.secondary.maxMP; }
}
export function createAllCharacters(){
  return { Paladin: new Character(paladinClass, personaldata) };
}
export const CLASS_LIST = [{ className:"Paladin" }];
