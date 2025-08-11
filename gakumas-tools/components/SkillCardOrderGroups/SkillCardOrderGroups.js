import { memo } from "react";
import LoadoutSkillCardOrderGroup from "./LoadoutSkillCardOrderGroup";

function SkillCardOrderGroups({
  skillCardIdOrderGroups,
  customizationOrderGroups,
  idolId,
  defaultCardIds,
}) {
  return (
    <>
        <div id="skillCardOrderGroups" >
            {skillCardIdOrderGroups.map((skillCardIdOrderGroup, i) => (
              <LoadoutSkillCardOrderGroup
                key={i}
                skillCardIdOrderGroup={skillCardIdOrderGroup}
                customizationOrderGroup={customizationOrderGroups[i]}
                groupIndex={i}
                idolId={idolId}
                defaultCardIds={defaultCardIds}
              />
            ))}
        </div>
    </>
  );
}

export default memo(SkillCardOrderGroups);
