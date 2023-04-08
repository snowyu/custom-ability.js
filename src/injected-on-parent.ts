import hasAbilityOnParent from './has-ability-on-parent';

export function injectedOnParent(aClass: Function, aName: string) {
  return hasAbilityOnParent(aClass, '$' + aName)
}

export default injectedOnParent
