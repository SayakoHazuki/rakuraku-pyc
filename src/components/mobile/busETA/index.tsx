"use client";

import styles from "./index.module.css";
import MBusETA_Item from "./_item";
import { useContext, useEffect, useState } from "react";
import { getCurrentPosition } from "@/util/misc/coords";
import { BusInstance } from "@/util/buseta";
import { MBusEtaIndicatorCtx, MBusEtaLoader } from "./loader";

function _MBusETA() {
  const [items, setItems] = useState<JSX.Element[]>([]);
  const [loaded, setLoaded] = useState(false);

  const { setStep, setActive, step } = useContext(MBusEtaIndicatorCtx);
  useEffect(() => {
    getCurrentPosition().then((pos) => {
      const bus = new BusInstance([pos[0], pos[1]]);
      busInstanceInit(bus);
    });

    function busInstanceInit(bus: BusInstance) {
      bus
        .searchNearbyStops((stepMsg) => setStep(stepMsg))
        .then(() => {
          busInstanceAfterInit(bus);
        });
    }

    function busInstanceAfterInit(bus: BusInstance) {
      const counterCallback = (count: number, total: number) => {
        setStep(`Fetching bus ETAs (${count}/${total})...`);
      };
      setStep("Fetching bus ETAs...");

      bus.loadEtas({ counterCallback }).then(() => {
        busInstanceEtaOnLoad(bus);
      });
    }

    function busInstanceEtaOnLoad(bus: BusInstance) {
      let items: JSX.Element[] = [];
      for (const route of bus.nearbyRoutes) {
        items.push(
          <MBusETA_Item
            key={`${route.route}${route.service_type}${route.bound}${route.boardingStop.id}${route.arrivalStop.id}`}
            bus={route.route}
            boarding={route.boardingStop.name_tc}
            destination={route.arrivalStop.name_tc}
            eta={
              route.boardingEtas?.map((eta) =>
                eta ? eta.readableTime : "---"
              ) || ["---", "---"]
            }
            arrivalEta={route.arrivalEtas?.[0]?.readableTime || "---"}
          />
        );
      }
      items = items.sort((a, b) => {
        // if eta[0] is "---", it should be placed at the end
        if (a.props?.eta?.[0] === "---" && b.props?.eta?.[0] !== "---") {
          return 1;
        }
        if (a.props?.eta?.[0] !== "---" && b.props?.eta?.[0] === "---") {
          return -1;
        }
        return 0;
      });

      setItems(items);
      setLoaded(true);
      setActive(false);
    }
  }, []);

  return loaded ? <div className={styles.container}>{items}</div> : null;
}

export default function MBusETA() {
  return (
    <MBusEtaLoader>
      <_MBusETA />
    </MBusEtaLoader>
  );
}
