import hasAbilityOnParent from './has-ability-on-parent';

export default function injectedOnParent(aClass: Function, aName: string) {
  return hasAbilityOnParent(aClass, '$' + aName);
};

