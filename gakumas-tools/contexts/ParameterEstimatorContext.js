"use client";
import { createContext, useState } from "react";

const ParameterEstimatorContext = createContext();

export function ParameterEstimatorContextProvider({ children }) {
  const [supportBonus, setSupportBonus] = useState(0.04);
  const [totalParams, setTotalParams] = useState(6000);
  const [maxParams, setMaxParams] = useState([3360, 3360, 3360]);
  const [minParams, setMinParams] = useState([0, 0, 0]);
  const [extraTurns, setExtraTurns] = useState(0);
  const [scores, setScores] = useState([]);
  const [estimatedParams, setEstimatedParams] = useState([0, 0, 0]);
  const [estimatedScore, setEstimatedScore] = useState(null);

  return (
    <ParameterEstimatorContext.Provider
      value={{
        supportBonus,
        setSupportBonus,
        totalParams,
        setTotalParams,
        maxParams,
        setMaxParams,
        minParams,
        setMinParams,
        extraTurns,
        setExtraTurns,
        scores,
        setScores,
        estimatedParams,
        setEstimatedParams,
        estimatedScore,
        setEstimatedScore,
      }}
    >
      {children}
    </ParameterEstimatorContext.Provider>
  );
}

export default ParameterEstimatorContext;
