"use client";
import { createContext, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Stages } from "gakumas-data";
import { usePathname } from "@/i18n/routing";
import {
  loadoutFromSearchParams,
  getSimulatorUrl,
  loadoutToSearchParams,
} from "@/utils/simulator";
import { FALLBACK_STAGE } from "@/simulator/constants";
import { fixCustomizations } from "@/utils/customizations";

const LOADOUT_HISTORY_STORAGE_KEY = "gakumas-tools.loadout-history";

const LoadoutContext = createContext();

export function LoadoutContextProvider({ children }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const initial = useMemo(() => loadoutFromSearchParams(searchParams), []);

  const [loaded, setLoaded] = useState(false);
  const [memoryParams, setMemoryParams] = useState([null, null]);
  const [stageId, setStageId] = useState(initial.stageId);
  const [customStage, setCustomStage] = useState(null);
  const [supportBonus, setSupportBonus] = useState(initial.supportBonus);
  const [params, setParams] = useState(initial.params);
  const [pItemIds, setPItemIds] = useState(initial.pItemIds);
  const [skillCardIdGroups, setSkillCardIdGroups] = useState(
    initial.skillCardIdGroups
  );
  const [customizationGroups, setCustomizationGroups] = useState(
    initial.customizationGroups
  );
  const [skillCardIdOrderGroups, setSkillCardIdOrderGroups] = useState(
    initial.skillCardIdOrderGroups
  );
  const [customizationOrderGroups, setCustomizationOrderGroups] = useState(
    initial.customizationOrderGroups
  );
  const [turnTypeOrder, setTurnTypeOrder] = useState(initial.turnTypeOrder);
  const [loadoutHistory, setLoadoutHistory] = useState([]);

  let stage = FALLBACK_STAGE;
  if (stageId == "custom") {
    stage = customStage;
  } else if (stageId) {
    stage = Stages.getById(stageId);
  }

  const loadout = useMemo(
    () => ({
      stageId,
      customStage: stageId == "custom" ? customStage : {},
      supportBonus,
      params,
      pItemIds,
      skillCardIdGroups,
      customizationGroups,
      skillCardIdOrderGroups,
      customizationOrderGroups,
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
      skillCardIdOrderGroups,
      customizationOrderGroups,
      turnTypeOrder,
    ]
  );

  const simulatorUrl = getSimulatorUrl(loadout);

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
    if (loadout.skillCardIdOrderGroups) {
      setSkillCardIdOrderGroups(loadout.skillCardIdOrderGroups);
    } else {
      setSkillCardIdOrderGroups([new Array(loadout.skillCardIdGroups.length * 6 + 8).fill(0)]);
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
      setCustomizationOrderGroups([new Array(loadout.customizationGroups.length * 6 + 8).fill({})]);
    }
    if (loadout.turnTypeOrder) {
      setTurnTypeOrder(loadout.turnTypeOrder);
    } else {
      const turnCounts = loadout.stageId == "custom" ? loadout.customStage.turnCounts : Stages.getById(loadout.stageId).turnCounts; 
      setTurnTypeOrder(new Array(turnCounts.vocal + turnCounts.dance + turnCounts.visual).fill("none"));
    }
  };

  // Load history and latest loadout from local storage on mount
  useEffect(() => {
    const loadoutHistoryString = localStorage.getItem(
      LOADOUT_HISTORY_STORAGE_KEY
    );
    if (loadoutHistoryString) {
      const data = JSON.parse(loadoutHistoryString);
      setLoadoutHistory(data);
      if (!initial.hasDataFromParams) setLoadout(data[0]);
    }
    setLoaded(true);
  }, []);

  // Update local storage when history changed
  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem(
      LOADOUT_HISTORY_STORAGE_KEY,
      JSON.stringify(loadoutHistory)
    );
  }, [loadoutHistory]);

  // Update browser URL when the loadout changes
  useEffect(() => {
    if (!loaded || pathname !== "/simulator") return;
    const url = new URL(window.location);
    url.search = loadoutToSearchParams(loadout).toString();
    window.history.replaceState(null, "", url);
  }, [loadout]);

  useEffect(() => {
    // If fewer than 4 pItems, pad with 0s
    if (pItemIds.length < 4) {
      setPItemIds((cur) => cur.concat(new Array(4 - cur.length).fill(0)));
    }
  }, [pItemIds]);

  function clear() {
    setMemoryParams([null, null]);
    setParams([null, null, null, null]);
    setPItemIds([0, 0, 0, 0]);
    setSkillCardIdGroups([
      [0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0],
    ]);
    setCustomizationGroups([[], []]);
    setSkillCardIdOrderGroups([new Array(20).fill(0)]);
    setCustomizationOrderGroups([new Array(20).fill({})]);
    setTurnTypeOrder(new Array(turnTypeOrder.length).fill("none"));
  }

  function replacePItemId(index, itemId) {
    setPItemIds((cur) => {
      const next = [...cur];
      next[index] = itemId;
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
      let chunks = [];
      for (let i = 0; i < updatedSkillCardIds.length; i += 6) {
        chunks.push(updatedSkillCardIds.slice(i, i + 6));
      }
      return chunks;
    });
    if (changed) {
      replaceCustomizations(index, []);
    }
  }

  function replaceCustomizations(index, customizations) {
    setCustomizationGroups((cur) => {
      const curCustomizations = [].concat(...cur);
      const updatedCustomizations = [...curCustomizations];
      updatedCustomizations[index] = customizations;
      let chunks = [];
      for (let i = 0; i < updatedCustomizations.length; i += 6) {
        chunks.push(updatedCustomizations.slice(i, i + 6));
      }
      return chunks;
    });
  }

  function replaceSkillCardOrder(groupIndex, index, cardId, customizations) {
    console.log("replaceSkillCardOrder", groupIndex, index, cardId, customizations);
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
      const updatedSkillCardIdOrderGroups = [...cur];
      updatedSkillCardIdOrderGroups = updatedSkillCardIdOrderGroups.map((skillCardIdOrderGroup) => {
         return [...skillCardIdOrderGroup, 0, 0, 0, 0, 0, 0];
      });
      console.log("insertSkillCardIdGroup updatedSkillCardIdOrderGroups", updatedSkillCardIdOrderGroups);
      return updatedSkillCardIdOrderGroups;
    });
    setCustomizationOrderGroups((cur) => {
      const updatedCustomizationOrderGroups = [...cur];
      updatedCustomizationOrderGroups = updatedCustomizationOrderGroups.map((customizationOrderGroup) => {
         return [...customizationOrderGroup, {}, {}, {}, {}, {}, {}];
      });
      console.log("insertSkillCardIdGroup updatedCustomizationOrderGroups", updatedCustomizationOrderGroups);
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
      const updatedSkillCardIdOrderGroups = [...cur];
      updatedSkillCardIdOrderGroups = updatedSkillCardIdOrderGroups.map((skillCardIdOrderGroup) => {
        skillCardIdOrderGroup.splice(skillCardIdOrderGroup.length-6, 6);
        return skillCardIdOrderGroup;
      });
      console.log("deleteSkillCardIdGroup updatedSkillCardIdOrderGroups", updatedSkillCardIdOrderGroups);
      return updatedSkillCardIdOrderGroups;
    });
    setCustomizationOrderGroups((cur) => {
      const updatedCustomizationOrderGroups = [...cur];
      updatedCustomizationOrderGroups = updatedCustomizationOrderGroups.map((customizationOrderGroup) => {
        customizationOrderGroup.splice(customizationOrderGroup.length-6, 6);
        return customizationOrderGroup;
      });
      console.log("deleteSkillCardIdGroup updatedCustomizationOrderGroups", updatedCustomizationOrderGroups);
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
    console.log("insertSkillCardOrderGroup", groupIndex);
    setSkillCardIdOrderGroups((cur) => {
      const size = skillCardIdGroups.length * 6 + 8;//cur[0].length;
      const updatedSkillCardIdOrderGroups = [...cur];
      updatedSkillCardIdOrderGroups.splice(groupIndex, 0, new Array(size).fill(0));
      console.log("insertSkillCardOrderGroup updatedSkillCardIdOrderGroups", updatedSkillCardIdOrderGroups);
      return updatedSkillCardIdOrderGroups;
    });
    setCustomizationOrderGroups((cur) => {
      const size = skillCardIdGroups.length * 6 + 8;//cur[0].length;
      const updatedCustomizationOrderGroups = [...cur];
      updatedCustomizationOrderGroups.splice(groupIndex, 0, new Array(size).fill({}));
      console.log("insertSkillCardOrderGroup updatedCustomizationOrderGroups", updatedCustomizationOrderGroups);
      return updatedCustomizationOrderGroups;
    });
  };

  const deleteSkillCardOrderGroup = (groupIndex) => {
    console.log("deleteSkillCardOrderGroup", groupIndex);
    setSkillCardIdOrderGroups((cur) => {
      const updatedSkillCardIdOrderGroups = [...cur];
      updatedSkillCardIdOrderGroups.splice(groupIndex, 1);
      console.log("deleteSkillCardOrderGroup updatedSkillCardIdOrderGroups", updatedSkillCardIdOrderGroups);
      return updatedSkillCardIdOrderGroups;
    });
    setCustomizationOrderGroups((cur) => {
      const updatedCustomizationOrderGroups = [...cur];
      updatedCustomizationOrderGroups.splice(groupIndex, 1);
      console.log("deleteSkillCardOrderGroup updatedCustomizationOrderGroups", updatedCustomizationOrderGroups);
      return updatedCustomizationOrderGroups;
    });
  };

  const updateStage = (stageId, customStage) => {
    console.log("updateStage", {stageId, customStage});
    setStageId(stageId);
    setCustomStage(customStage);
    
    setTurnTypeOrder((cur) => {
      const updatedTurnTypeOrder = [...cur];
      const turnCounts = stageId == "custom" ? customStage.turnCounts : Stages.getById(stageId).turnCounts; 
      const totalTurns = turnCounts.vocal + turnCounts.dance + turnCounts.visual;
      if (updatedTurnTypeOrder.length < totalTurns) {
        updatedTurnTypeOrder.push(...Array(totalTurns - updatedTurnTypeOrder.length).fill("none"));
      } else if (updatedTurnTypeOrder.length > totalTurns) {
        updatedTurnTypeOrder.length = totalTurns;
      }
      console.log("updateStage updatedTurnTypeOrder", updatedTurnTypeOrder);
      return updatedTurnTypeOrder;
    });
  };

  const replaceTurnTypeOrder = (index, turnType) => {
    setTurnTypeOrder((cur) => {
      const updatedTurnTypeOrder = [...cur];
      updatedTurnTypeOrder[index] = turnType;
      console.log("replaceTurnTypeOrder updatedTurnTypeOrder", updatedTurnTypeOrder);
      return updatedTurnTypeOrder;
    });
  };

  function setMemory(memory, index) {
    const multiplier = index ? 0.2 : 1;

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

  const pushLoadoutHistory = () => {
    if (JSON.stringify(loadout) == JSON.stringify(loadoutHistory[0])) return;
    setLoadoutHistory((cur) => [loadout, ...cur].slice(0, 10));
  };

  async function saveLoadout(name) {
    const response = await fetch("/api/loadout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...loadout, name }),
    });
    const data = await response.json();
    return data.id;
  }

  async function fetchLoadouts() {
    const response = await fetch("/api/loadout");
    return response.json();
  }

  async function deleteLoadouts(ids) {
    await fetch("/api/loadout", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids }),
    });
  }

  console.log("LoadoutContext", loadout);
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
        replaceSkillCardId,
        replaceCustomizations,
        replaceSkillCardOrder,
        clear,
        insertSkillCardIdGroup,
        deleteSkillCardIdGroup,
        swapSkillCardIdGroups,
        insertSkillCardOrderGroup,
        deleteSkillCardOrderGroup,
        replaceTurnTypeOrder,
        stage,
        simulatorUrl,
        loadoutHistory,
        pushLoadoutHistory,
        saveLoadout,
        fetchLoadouts,
        deleteLoadouts,
      }}
    >
      {children}
    </LoadoutContext.Provider>
  );
}

export default LoadoutContext;
