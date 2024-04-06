import React, {
  useState,
  useContext,
  useMemo,
  useEffect,
  createContext,
  Suspense,
} from "react";

interface IIndicatorProvider {
  active: boolean;
  setActive: React.Dispatch<React.SetStateAction<boolean>>;
  step: string;
  setStep: React.Dispatch<React.SetStateAction<string>>;
}

export const MBusEtaIndicatorCtx = createContext<IIndicatorProvider>({
  active: true,
  setActive: () => {},
  step: "testing msg",
  setStep: () => {},
});

interface IIndicatorProviderProps {
  children: React.ReactNode;
}
function IndicatorProvider({ children }: IIndicatorProviderProps) {
  const [active, setActive] = useState(true);
  const [step, setStep] = useState("testing msg2");
  const value = useMemo(
    () => ({
      active,
      setActive,
      step,
      setStep,
    }),
    [active, step]
  );
  return (
    <MBusEtaIndicatorCtx.Provider value={value}>
      {children}
    </MBusEtaIndicatorCtx.Provider>
  );
}

function Indicator() {
  const { active, step } = useContext(MBusEtaIndicatorCtx);
  return active ? (
    <div>
      <br />
      {step}
    </div>
  ) : null;
}

interface IBusEtaLoaderProps {
  children: React.ReactNode;
}
export function MBusEtaLoader({ children }: IBusEtaLoaderProps) {
  return (
    <IndicatorProvider>
      <Indicator />
      {children}
    </IndicatorProvider>
  );
}
