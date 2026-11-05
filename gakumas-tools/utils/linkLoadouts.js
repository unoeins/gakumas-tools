// Link phases share the stage and Vo/Da/Vi; each keeps its own stamina,
// deck, items and support bonus.
export function synchronizeLinkLoadouts(loadouts, loadout, index, phaseCount) {
  const activeIndex = Math.min(index, phaseCount - 1);
  return Array.from({ length: phaseCount }, (_, i) => {
    const phase = i == activeIndex ? loadout : loadouts[i] || loadout;
    return {
      ...phase,
      stageId: loadout.stageId,
      enterPercents: loadout.enterPercents,
      customStage: loadout.customStage,
      params: [...loadout.params.slice(0, 3), phase.params[3]],
      enableSkillCardOrder: loadout.enableSkillCardOrder,
      removedCardOrder: loadout.removedCardOrder,
      turnTypeOrder: loadout.turnTypeOrder,
      ...(phase.skillCardIdOrderGroups[0].length !== loadout.skillCardIdOrderGroups[0].length && {
            skillCardIdOrderGroups: phase.skillCardIdOrderGroups.map((group) => {
              const size = loadout.skillCardIdOrderGroups[0].length;
              if (group.length < size) {
                return [...group, ...new Array(size - group.length).fill(0)];
              } else if (group.length > size) {
                return group.slice(0, size);
              }
              return group;
            })
          }),
      ...(phase.customizationOrderGroups[0].length !== loadout.customizationOrderGroups[0].length && {
            customizationOrderGroups: phase.customizationOrderGroups.map((group) => {
              const size = loadout.customizationOrderGroups[0].length;
              if (group.length < size) {
                return [...group, ...new Array(size - group.length).fill({})];
              } else if (group.length > size) {
                return group.slice(0, size);
              }
              return group;
            })
          }),
    };
  });
}
