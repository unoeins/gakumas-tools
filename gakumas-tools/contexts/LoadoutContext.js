"use client";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { STARTING_EFFECTS } from "gakumas-engine/constants";
import { Stages } from "gakumas-data";
import { usePathname } from "@/i18n/routing";
import LoadoutUrlContext from "@/contexts/LoadoutUrlContext";
import WorkspaceContext from "@/contexts/WorkspaceContext";
import { getSimulatorUrl } from "@/utils/simulator";
import { FALLBACK_STAGE } from "@/simulator/constants";
import { fixCustomizations } from "@/utils/customizations";
import { inferPIdolId, getExamStage } from "@/utils/exams";

const LoadoutContext = createContext();

export function LoadoutContextProvider({ children }) {
  const pathname = usePathname();
  const { loadoutFromUrl, loadoutsFromUrl, updateUrl } =
    useContext(LoadoutUrlContext);
  const { setPlan } = useContext(WorkspaceContext);

  const initialLoadout = loadoutsFromUrl[0] || loadoutFromUrl;

  const [memoryParams, setMemoryParams] = useState([null, null]);
  const [stageId, setStageId] = useState(initialLoadout.stageId);
  const [customStage, setCustomStage] = useState(null);
  const [supportBonus, setSupportBonus] = useState(initialLoadout.supportBonus);
  const [params, setParams] = useState(initialLoadout.params);
  const [pItemIds, setPItemIds] = useState(initialLoadout.pItemIds);
  const [skillCardIdGroups, setSkillCardIdGroups] = useState(
    initialLoadout.skillCardIdGroups
  );
  const [customizationGroups, setCustomizationGroups] = useState(
    initialLoadout.customizationGroups
  );
  const [pDrinkIds, setPDrinkIds] = useState(initialLoadout.pDrinkIds);
  const [startingEffects, setStartingEffects] = useState(
    initialLoadout.startingEffects
  );

  const [enableSkillCardOrder, setEnableSkillCardOrder] = useState(
    initialLoadout.enableSkillCardOrder
  );
  const [skillCardIdOrderGroups, setSkillCardIdOrderGroups] = useState(
    initialLoadout.skillCardIdOrderGroups
  );
  const [customizationOrderGroups, setCustomizationOrderGroups] = useState(
    initialLoadout.customizationOrderGroups
  );
  const [removedCardOrder, setRemovedCardOrder] = useState(initialLoadout.removedCardOrder);
  const [turnTypeOrder, setTurnTypeOrder] = useState(initialLoadout.turnTypeOrder);

  // console.log("skillCardIdOrderGroups", skillCardIdOrderGroups);
  // console.log("customizationOrderGroups", customizationOrderGroups);
  const pIdolId = inferPIdolId(pItemIds, skillCardIdGroups);

  const stage = useMemo(() => {
    let stage = FALLBACK_STAGE;
    if (stageId == "custom") {
      stage = customStage;
    } else if (stageId) {
      stage = Stages.getById(stageId);
      if (stage.type == "exam") {
        stage = getExamStage(stageId, pIdolId);
      }
    }
    return stage;
  }, [stageId, customStage, pIdolId]);

  const loadout = useMemo(
    () => ({
      stageId,
      customStage: stageId == "custom" ? customStage : {},
      supportBonus,
      params,
      pItemIds,
      skillCardIdGroups,
      customizationGroups,
      pDrinkIds,
      startingEffects,
      enableSkillCardOrder,
      skillCardIdOrderGroups,
      customizationOrderGroups,
      removedCardOrder,
      turnTypeOrder,
    }),
    [
      stageId,
      customStage,
      supportBonus,
      params,
      pItemIds,
      skillCardIdGroups,
      customizationGroups,
      pDrinkIds,
      startingEffects,
      enableSkillCardOrder,
      skillCardIdOrderGroups,
      customizationOrderGroups,
      removedCardOrder,
      turnTypeOrder,
    ]
  );

  const [currentLoadoutIndex, setCurrentLoadoutIndex] = useState(0);
  const [loadouts, setLoadouts] = useState(
    loadoutsFromUrl.length ? loadoutsFromUrl : [loadout]
  );

  const simulatorUrl = getSimulatorUrl(loadout, loadouts);

  const setLoadout = (loadout) => {
    setStageId(loadout.stageId);
    if (loadout.stageId == "custom") {
      let custom = loadout.customStage;
      if (Array.isArray(custom.firstTurns)) {
        const length = custom.firstTurns.length;
        custom.firstTurns = custom.firstTurns.reduce((acc, cur) => {
          acc[cur] = 1 / length;
          return acc;
        }, {});
      }
      setCustomStage(custom);
    }
    setSupportBonus(loadout.supportBonus);
    setParams(loadout.params);
    setPItemIds(loadout.pItemIds);
    setPDrinkIds(loadout.pDrinkIds);
    setStartingEffects(loadout.startingEffects);
    setSkillCardIdGroups(loadout.skillCardIdGroups);
    if (loadout.customizationGroups) {
      try {
        setCustomizationGroups(
          loadout.customizationGroups.map((g) => g.map(fixCustomizations))
        );
      } catch (e) {
        console.error(e);
      }
    }
    setEnableSkillCardOrder(!!loadout.enableSkillCardOrder);
    if (loadout.skillCardIdOrderGroups) {
      setSkillCardIdOrderGroups(loadout.skillCardIdOrderGroups);
    } else {
      if (loadout.stageId === "custom" || Stages.getById(loadout.stageId)?.type !== "linkContest") {
        setSkillCardIdOrderGroups([new Array(loadout.skillCardIdGroups.length * 6 + 8).fill(0)]);
      } else {
        setSkillCardIdOrderGroups([new Array(loadout.skillCardIdGroups.length * 6).fill(0)]);
      }
    }
    if (loadout.customizationOrderGroups) {
      try {
        setCustomizationOrderGroups(
          loadout.customizationOrderGroups.map((g) => g.map(fixCustomizations))
        );
      } catch (e) {
        console.error(e);
      }
    } else {
      if (loadout.stageId === "custom" || Stages.getById(loadout.stageId)?.type !== "linkContest") {
        setCustomizationOrderGroups([new Array(loadout.customizationGroups.length * 6 + 8).fill({})]);
      } else {
        setCustomizationOrderGroups([new Array(loadout.customizationGroups.length * 6).fill({})]);
      }
    }
    setRemovedCardOrder(loadout.removedCardOrder || "random");
    if (loadout.turnTypeOrder) {
      setTurnTypeOrder(loadout.turnTypeOrder);
    } else {
      const turnCounts = loadout.stageId === "custom" ? loadout.customStage.turnCounts :
        Stages.getById(loadout.stageId).turnCounts; 
      setTurnTypeOrder(new Array(turnCounts.vocal + turnCounts.dance + turnCounts.visual).fill("none"));
    }
  };

  useEffect(() => {
    if (["sense", "logic", "anomaly"].includes(stage.plan)) {
      setPlan(stage.plan);
    }

    if (stage.type !== "linkContest") return;
    if (loadouts.length == stage.linkTurnCounts.length) return;

    setLoadouts((cur) => {
      const next = [...cur];
      while (next.length < stage.linkTurnCounts.length) {
        next.push(loadout);
      }
      return next;
    });
  }, [stage]);

  // Update browser URL when the loadout changes
  useEffect(() => {
    if (pathname !== "/simulator" && pathname !== "/contest-player") return;
    updateUrl(loadout, loadouts);
  }, [loadout]);

  // Update link loadouts when loadout changes
  useEffect(() => {
    if (stage.type == "linkContest") {
      setLoadouts((cur) => {
        const next = [...cur];
        next[currentLoadoutIndex] = loadout;
        for (let i = 0; i < next.length; i++) {
          next[i].stageId = loadout.stageId;
          next[i].params = [...loadout.params.slice(0, 3), next[i].params[3]];
          next[i].enableSkillCardOrder = loadout.enableSkillCardOrder;
          next[i].removedCardOrder = loadout.removedCardOrder;
          next[i].turnTypeOrder = loadout.turnTypeOrder;
          if (next[i].skillCardIdOrderGroups[0].length !== loadout.skillCardIdOrderGroups[0].length) {
            next[i].skillCardIdOrderGroups = next[i].skillCardIdOrderGroups.map((group) => {
              const size = loadout.skillCardIdOrderGroups[0].length;
              if (group.length < size) {
                return [...group, ...new Array(size - group.length).fill(0)];
              } else if (group.length > size) {
                return group.slice(0, size);
              }
              return group;
            });
          }
          if (next[i].customizationOrderGroups[0].length !== loadout.customizationOrderGroups[0].length) {
            next[i].customizationOrderGroups = next[i].customizationOrderGroups.map((group) => {
              const size = loadout.customizationOrderGroups[0].length;
              if (group.length < size) {
                return [...group, ...new Array(size - group.length).fill({})];
              } else if (group.length > size) {
                return group.slice(0, size);
              }
              return group;
            });
          }
        }
        return next;
      });
    }
  }, [loadout]);

  useEffect(() => {
    // If fewer than 4 pItems, pad with 0s
    if (pItemIds.length < 4) {
      setPItemIds((cur) => cur.concat(new Array(4 - cur.length).fill(0)));
    }
  }, [pItemIds]);

  useEffect(() => {
    const size = STARTING_EFFECTS.length;
    if (startingEffects.length < size) {
      setStartingEffects((cur) => cur.concat(new Array(size - cur.length).fill(0)));
    }
  }, [startingEffects]);

  function clear() {
    setMemoryParams([null, null]);
    setParams([null, null, null, null]);
    setPItemIds(new Array(pItemIds.length).fill(0));
    if (stage.type === "exam") {
      setSkillCardIdGroups([[0]]);
      setCustomizationGroups([[{}]]);
    } else {
      setSkillCardIdGroups([
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
      ]);
      setCustomizationGroups([
        [{}, {}, {}, {}, {}, {}],
        [{}, {}, {}, {}, {}, {}],
      ]);
    }
    setPDrinkIds(new Array(pDrinkIds.length).fill(0));
    setStartingEffects(new Array(startingEffects.length).fill(0));
    const size = stage.type === "linkContest" ? 12 : stage.type === "exam" ? 1 : 20;
    setSkillCardIdOrderGroups([new Array(size).fill(0)]);
    setCustomizationOrderGroups([new Array(size).fill({})]);
    setRemovedCardOrder("random");
    setTurnTypeOrder(new Array(turnTypeOrder.length).fill("none"));
  }

  function clearOrders() {
    const size = stage.type === "exam" ? skillCardIdGroups[0].length : 
      skillCardIdGroups.length * 6 + (stage.type !== "linkContest" ? 8 : 0);
    setSkillCardIdOrderGroups([new Array(size).fill(0)]);
    setCustomizationOrderGroups([new Array(size).fill({})]);
    setRemovedCardOrder("random");
    setTurnTypeOrder(new Array(turnTypeOrder.length).fill("none"));
  }

  function replacePItemId(index, itemId) {
    setPItemIds((cur) => {
      const next = [...cur];
      next[index] = itemId;
      return next;
    });
  }

  function swapPItemIds(indexA, indexB) {
    setPItemIds((cur) => {
      const next = [...cur];
      [next[indexA], next[indexB]] = [next[indexB], next[indexA]];
      return next;
    });
  }

  function replacePDrinkId(index, drinkId) {
    setPDrinkIds((cur) => {
      const next = [...cur];
      next[index] = drinkId;
      return next;
    });
  }

  function swapPDrinkIds(indexA, indexB) {
    setPDrinkIds((cur) => {
      const next = [...cur];
      [next[indexA], next[indexB]] = [next[indexB], next[indexA]];
      return next;
    });
  }

  function replaceStartingEffect(index, value) {
    setStartingEffects((cur) => {
      const next = [...cur];
      next[index] = value;
      return next;
    });
  }

  function replaceSkillCardId(index, cardId) {
    let changed = false;
    setSkillCardIdGroups((cur) => {
      const skillCardIds = [].concat(...cur);
      const updatedSkillCardIds = [...skillCardIds];
      if (cardId != updatedSkillCardIds[index]) {
        changed = true;
      }
      updatedSkillCardIds[index] = cardId;
      console.log("replaceSkillCardId", index, cardId, stage, updatedSkillCardIds);
      if (stage.type === "exam" && index === updatedSkillCardIds.length - 1 && !!cardId) {
        updatedSkillCardIds.push(0);
        setCustomizationGroups((cur) => {
          return [[...cur[0], []]];
        });
        setSkillCardIdOrderGroups((cur) => {
          const groups = [...cur];
          groups.forEach((group) => group.push(0));
          return groups;
        });
        setCustomizationOrderGroups((cur) => {
          const groups = [...cur];
          groups.forEach((group) => group.push({}));
          return groups;
        });
      }
      if (stage.type === "exam" && index !== updatedSkillCardIds.length - 1 && !cardId) {
        updatedSkillCardIds.splice(index, 1);
        changed = false;
        setCustomizationGroups((cur) => {
          return [cur[0].toSpliced(index, 1)];
        });
        setSkillCardIdOrderGroups((cur) => {
          const groups = [...cur];
          groups.forEach((group) => group.splice(group.length - 1, 1));
          return groups;
        });
        setCustomizationOrderGroups((cur) => {
          const groups = [...cur];
          groups.forEach((group) => group.splice(group.length - 1, 1));
          return groups;
        });
      }
      let chunks = [];
      const chunkSize = stage.type === "exam" ? updatedSkillCardIds.length : 6;
      for (let i = 0; i < updatedSkillCardIds.length; i += chunkSize) {
        chunks.push(updatedSkillCardIds.slice(i, i + chunkSize));
      }
      return chunks;
    });
    if (changed) {
      replaceCustomizations(index, []);
    }
  }

  function swapSkillCardIds(indexA, indexB) {
    setSkillCardIdGroups((cur) => {
      const skillCardIds = [].concat(...cur);
      const temp = skillCardIds[indexA];
      skillCardIds[indexA] = skillCardIds[indexB];
      skillCardIds[indexB] = temp;
      let chunks = [];
      const chunkSize = stage.type === "exam" ? skillCardIds.length : 6;
      for (let i = 0; i < skillCardIds.length; i += chunkSize) {
        chunks.push(skillCardIds.slice(i, i + chunkSize));
      }
      return chunks;
    });

    setCustomizationGroups((cur) => {
      const curCustomizations = [].concat(...cur);
      const temp = curCustomizations[indexA];
      curCustomizations[indexA] = curCustomizations[indexB];
      curCustomizations[indexB] = temp;
      let chunks = [];
      const chunkSize = stage.type === "exam" ? curCustomizations.length : 6;
      for (let i = 0; i < curCustomizations.length; i += chunkSize) {
        chunks.push(curCustomizations.slice(i, i + chunkSize));
      }
      return chunks;
    });
  }

  function replaceCustomizations(index, customizations) {
    setCustomizationGroups((cur) => {
      const curCustomizations = [].concat(...cur);
      const updatedCustomizations = [...curCustomizations];
      updatedCustomizations[index] = customizations;
      let chunks = [];
      const chunkSize = stage.type === "exam" ? updatedCustomizations.length : 6;
      for (let i = 0; i < updatedCustomizations.length; i += chunkSize) {
        chunks.push(updatedCustomizations.slice(i, i + chunkSize));
      }
      return chunks;
    });
  }

  function replaceSkillCardOrder(groupIndex, index, cardId, customizations) {
    setSkillCardIdOrderGroups((cur) => {
      const updatedSkillCardIdOrderGroups = [...cur];
      updatedSkillCardIdOrderGroups[groupIndex][index] = cardId;
      return updatedSkillCardIdOrderGroups;
    });
    setCustomizationOrderGroups((cur) => {
      const updatedCustomizationOrderGroups = [...cur];
      updatedCustomizationOrderGroups[groupIndex][index] = customizations;
      return updatedCustomizationOrderGroups;
    });
  }

  function swapSkillCardOrder(indexA, indexB) {
    const groupIndexA = Math.floor(indexA / skillCardIdOrderGroups[0].length);
    const groupIndexB = Math.floor(indexB / skillCardIdOrderGroups[0].length);
    const arrayIndexA = indexA % skillCardIdOrderGroups[0].length;
    const arrayIndexB = indexB % skillCardIdOrderGroups[0].length;
    setSkillCardIdOrderGroups((cur) => {
      const updated = [...cur];
      const temp = updated[groupIndexA][arrayIndexA];
      updated[groupIndexA][arrayIndexA] = updated[groupIndexB][arrayIndexB];
      updated[groupIndexB][arrayIndexB] = temp;
      return updated;
    });
    setCustomizationOrderGroups((cur) => {
      const updated = [...cur];
      const temp = updated[groupIndexA][arrayIndexA];
      updated[groupIndexA][arrayIndexA] = updated[groupIndexB][arrayIndexB];
      updated[groupIndexB][arrayIndexB] = temp;
      return updated;
    });
  }

  const insertSkillCardIdGroup = (groupIndex) => {
    setSkillCardIdGroups((cur) => {
      const updatedSkillCardIds = [...cur];
      updatedSkillCardIds.splice(groupIndex, 0, [0, 0, 0, 0, 0, 0]);
      return updatedSkillCardIds;
    });
    setCustomizationGroups((cur) => {
      const updatedCustomizations = [...cur];
      updatedCustomizations.splice(groupIndex, 0, []);
      return updatedCustomizations;
    });
    setSkillCardIdOrderGroups((cur) => {
      let updatedSkillCardIdOrderGroups = [...cur];
      updatedSkillCardIdOrderGroups = updatedSkillCardIdOrderGroups.map((skillCardIdOrderGroup) => {
         return [...skillCardIdOrderGroup, 0, 0, 0, 0, 0, 0];
      });
      return updatedSkillCardIdOrderGroups;
    });
    setCustomizationOrderGroups((cur) => {
      let updatedCustomizationOrderGroups = [...cur];
      updatedCustomizationOrderGroups = updatedCustomizationOrderGroups.map((customizationOrderGroup) => {
         return [...customizationOrderGroup, {}, {}, {}, {}, {}, {}];
      });
      return updatedCustomizationOrderGroups;
    });
  };

  const deleteSkillCardIdGroup = (groupIndex) => {
    setSkillCardIdGroups((cur) => {
      const updatedSkillCardIds = [...cur];
      updatedSkillCardIds.splice(groupIndex, 1);
      return updatedSkillCardIds;
    });
    setCustomizationGroups((cur) => {
      const updatedCustomizations = [...cur];
      updatedCustomizations.splice(groupIndex, 1);
      return updatedCustomizations;
    });
    setSkillCardIdOrderGroups((cur) => {
      let updatedSkillCardIdOrderGroups = [...cur];
      updatedSkillCardIdOrderGroups = updatedSkillCardIdOrderGroups.map((skillCardIdOrderGroup) => {
        skillCardIdOrderGroup.splice(skillCardIdOrderGroup.length-6, 6);
        return skillCardIdOrderGroup;
      });
      return updatedSkillCardIdOrderGroups;
    });
    setCustomizationOrderGroups((cur) => {
      let updatedCustomizationOrderGroups = [...cur];
      updatedCustomizationOrderGroups = updatedCustomizationOrderGroups.map((customizationOrderGroup) => {
        customizationOrderGroup.splice(customizationOrderGroup.length-6, 6);
        return customizationOrderGroup;
      });
      return updatedCustomizationOrderGroups;
    });
  };

  const swapSkillCardIdGroups = (groupIndexA, groupIndexB) => {
    setSkillCardIdGroups((cur) => {
      const updatedSkillCardIds = [...cur];
      const temp = updatedSkillCardIds[groupIndexA];
      updatedSkillCardIds[groupIndexA] = updatedSkillCardIds[groupIndexB];
      updatedSkillCardIds[groupIndexB] = temp;
      return updatedSkillCardIds;
    });
    setCustomizationGroups((cur) => {
      const updatedCustomizations = [...cur];
      const temp = updatedCustomizations[groupIndexA];
      updatedCustomizations[groupIndexA] = updatedCustomizations[groupIndexB];
      updatedCustomizations[groupIndexB] = temp;
      return updatedCustomizations;
    });
  };

  const insertSkillCardOrderGroup = (groupIndex) => {
    setSkillCardIdOrderGroups((cur) => {
      const size = cur[0].length; //skillCardIdGroups.length * 6 + 8;
      const updatedSkillCardIdOrderGroups = [...cur];
      updatedSkillCardIdOrderGroups.splice(groupIndex, 0, new Array(size).fill(0));
      return updatedSkillCardIdOrderGroups;
    });
    setCustomizationOrderGroups((cur) => {
      const size = cur[0].length; //skillCardIdGroups.length * 6 + 8;
      const updatedCustomizationOrderGroups = [...cur];
      updatedCustomizationOrderGroups.splice(groupIndex, 0, new Array(size).fill({}));
      return updatedCustomizationOrderGroups;
    });
  };

  const deleteSkillCardOrderGroup = (groupIndex) => {
    setSkillCardIdOrderGroups((cur) => {
      const updatedSkillCardIdOrderGroups = [...cur];
      updatedSkillCardIdOrderGroups.splice(groupIndex, 1);
      return updatedSkillCardIdOrderGroups;
    });
    setCustomizationOrderGroups((cur) => {
      const updatedCustomizationOrderGroups = [...cur];
      updatedCustomizationOrderGroups.splice(groupIndex, 1);
      return updatedCustomizationOrderGroups;
    });
  };

  const updateStage = (stageId, customStage) => {
    setStageId(stageId);
    setCustomStage(customStage);
    let updatedStage = stageId === "custom" ? customStage : Stages.getById(stageId);
    if (updatedStage.type === "exam") {
      updatedStage = getExamStage(stageId, pIdolId);
      if (stage.type !== "exam") {
        const MAX_P_ITEMS = 9;
        setPItemIds((cur) => {
          let next = [...cur];
          if (next.length < MAX_P_ITEMS) {
            next = next.concat(new Array(MAX_P_ITEMS - next.length).fill(0));
          } else if (next.length > MAX_P_ITEMS) {
            next = next.slice(0, MAX_P_ITEMS);
          }
          return next;
        });
        setSkillCardIdGroups((cur) => {
          let skillCardIds = [].concat(...cur);
          let appendLast = false;
          if (skillCardIds[skillCardIds.length - 1] !== 0) {
            skillCardIds.push(0);
            appendLast = true;
          }
          let removedIndices = [];
          skillCardIds = skillCardIds.filter((id, i) => {
            if (id === 0 && i < skillCardIds.length - 1) {
              removedIndices.push(i);
              return false;
            } else {
              return true;
            }
          });
          setCustomizationGroups((curCustomizations) => {
            let customizations = [].concat(...curCustomizations);
            if (appendLast) {
              customizations.push({});
            }
            for (const index of removedIndices) {
              customizations.splice(index, 1);
            }
            return [customizations];
          });
          console.log("updateStage skillCardIds", skillCardIds);
          setSkillCardIdOrderGroups((curGroups) => {
            let updatedGroups = curGroups.map((group) => {
              if (group.length > skillCardIds.length - 1) {
                return group.slice(0, skillCardIds.length - 1);
              } else {
                return group.concat(new Array(skillCardIds.length - 1 - group.length).fill(0));
              }
            });
            return updatedGroups;
          });
          setCustomizationOrderGroups((curGroups) => {
            let updatedGroups = curGroups.map((group) => {
              if (group.length > skillCardIds.length - 1) {
                return group.slice(0, skillCardIds.length - 1);
              } else {
                return group.concat(new Array(skillCardIds.length - 1 - group.length).fill({}));
              }
            });
            return updatedGroups;
          });
          return [skillCardIds];
        });
      }
    } else if (stage.type === "exam") {
      // From exam to non-exam, reset to 2 skill card groups
      const MAX_P_ITEMS = 4;
      setPItemIds((cur) => {
        let next = [...cur];
        if (next.length < MAX_P_ITEMS) {
          next = next.concat(new Array(MAX_P_ITEMS - next.length).fill(0));
        } else if (next.length > MAX_P_ITEMS) {
          next = next.slice(0, MAX_P_ITEMS);
        }
        return next;
      });
      setSkillCardIdGroups((cur) => {
        let skillCardIds = [].concat(...cur);
        const size = Math.ceil(skillCardIds.length / 6) * 6;
        skillCardIds = skillCardIds.concat(new Array(size - skillCardIds.length).fill(0));
        let chunks = [];
        const chunkSize = 6;
        for (let i = 0; i < skillCardIds.length; i += chunkSize) {
          chunks.push(skillCardIds.slice(i, i + chunkSize));
        }
        setCustomizationGroups((curCustomizations) => {
          let customizations = [].concat(...curCustomizations);
          customizations = customizations.concat(new Array(size - customizations.length).fill({}));
          let chunks = [];
          const chunkSize = 6;
          for (let i = 0; i < customizations.length; i += chunkSize) {
            chunks.push(customizations.slice(i, i + chunkSize));
          }
          return chunks;
        });
        const deckSize = size + (updatedStage.type !== "linkContest" ? 8 : 0);
        setSkillCardIdOrderGroups((curGroups) => {
          let updatedGroups = curGroups.map((group) => {
            return group.concat(new Array(deckSize - group.length).fill(0));
          });
          return updatedGroups;
        });
        setCustomizationOrderGroups((curGroups) => {
          let updatedGroups = curGroups.map((group) => {
            return group.concat(new Array(deckSize - group.length).fill({}));
          });
          return updatedGroups;
        });
        return chunks;
      });
    }

    setSkillCardIdOrderGroups((cur) => {
      const size = updatedStage.type === "exam" ? skillCardIdGroups[0].length : 
        skillCardIdGroups.length * 6 + (updatedStage.type !== "linkContest" ? 8 : 0);
      let updatedSkillCardIdOrderGroups = [...cur];
      updatedSkillCardIdOrderGroups = updatedSkillCardIdOrderGroups.map((group) => {
        if (group.length < size) {
          return [...group, ...new Array(size - group.length).fill(0)];
        } else if (group.length > size) {
          return group.slice(0, size);
        }
        return group;
      });
      return updatedSkillCardIdOrderGroups;
    });
    setCustomizationOrderGroups((cur) => {
      const size = updatedStage.type === "exam" ? skillCardIdGroups[0].length : 
        skillCardIdGroups.length * 6 + (updatedStage.type !== "linkContest" ? 8 : 0);
      let updatedCustomizationOrderGroups = [...cur];
      updatedCustomizationOrderGroups = updatedCustomizationOrderGroups.map((group) => {
         if (group.length < size) {
           return [...group, ...new Array(size - group.length).fill({})];
         } else if (group.length > size) {
           return group.slice(0, size);
         }
         return group;
      });
      return updatedCustomizationOrderGroups;
    });
    setTurnTypeOrder((cur) => {
      const updatedTurnTypeOrder = [...cur];
      const turnCounts = updatedStage.turnCounts;
      const totalTurns = turnCounts.vocal + turnCounts.dance + turnCounts.visual;
      if (updatedTurnTypeOrder.length < totalTurns) {
        updatedTurnTypeOrder.push(...Array(totalTurns - updatedTurnTypeOrder.length).fill("none"));
      } else if (updatedTurnTypeOrder.length > totalTurns) {
        updatedTurnTypeOrder.length = totalTurns;
      }
      return updatedTurnTypeOrder;
    });
  };

  const replaceTurnTypeOrder = (index, turnType) => {
    setTurnTypeOrder((cur) => {
      const updatedTurnTypeOrder = [...cur];
      updatedTurnTypeOrder[index] = turnType;
      return updatedTurnTypeOrder;
    });
  };

  const swapTurnTypeOrder = (indexA, indexB) => {
    setTurnTypeOrder((cur) => {
      const updatedTurnTypeOrder = [...cur];
      const temp = updatedTurnTypeOrder[indexA];
      updatedTurnTypeOrder[indexA] = updatedTurnTypeOrder[indexB];
      updatedTurnTypeOrder[indexB] = temp;
      return updatedTurnTypeOrder;
    });
  };

  function setMemory(memory, index) {
    const multiplier = stage.type !== "linkContest" && index ? 0.2 : 1;

    if (!memoryParams.some((p) => p)) {
      setParams([0, 0, 0, 0]);
    } else if (memoryParams[index]) {
      // If there is currently a memory in that slot, remove its params
      setParams((curParams) =>
        curParams.map(
          (p, i) => (p || 0) - Math.floor(memoryParams[index][i] * multiplier)
        )
      );
    }

    // Set memory
    setMemoryParams((cur) => {
      const next = [...cur];
      next[index] = memory.params;
      return next;
    });
    setParams((curParams) =>
      curParams.map(
        (p, i) => (p || 0) + Math.floor(memory.params[i] * multiplier)
      )
    );
    if (index == 0) {
      setPItemIds(memory.pItemIds);
    }
    setSkillCardIdGroups((cur) => {
      const next = [...cur];
      next[index] = memory.skillCardIds;
      return next;
    });
    setCustomizationGroups((cur) => {
      const next = [...cur];
      next[index] = memory.customizations || [];
      return next;
    });
  }

  return (
    <LoadoutContext.Provider
      value={{
        loadout,
        setLoadout,
        setMemory,
        setStageId,
        setCustomStage,
        updateStage,
        setSupportBonus,
        setParams,
        replacePItemId,
        swapPItemIds,
        replacePDrinkId,
        swapPDrinkIds,
        replaceStartingEffect,
        replaceSkillCardId,
        swapSkillCardIds,
        replaceCustomizations,
        clear,
        setEnableSkillCardOrder,
        replaceSkillCardOrder,
        swapSkillCardOrder,
        insertSkillCardIdGroup,
        deleteSkillCardIdGroup,
        swapSkillCardIdGroups,
        insertSkillCardOrderGroup,
        deleteSkillCardOrderGroup,
        setRemovedCardOrder,
        replaceTurnTypeOrder,
        swapTurnTypeOrder,
        clearOrders,
        stage,
        simulatorUrl,
        loadouts,
        setLoadouts,
        currentLoadoutIndex,
        setCurrentLoadoutIndex,
      }}
    >
      {children}
    </LoadoutContext.Provider>
  );
}

export default LoadoutContext;
