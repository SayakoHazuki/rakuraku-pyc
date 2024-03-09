"use client";

import styles from "./index.module.css";
import MBusETA_Item from "./_item";
import stops from "../../../data/fetched/stops.json";
import stopRouteData from "../../../data/fetched/route-stops.json";
import targetStops from "../../../data/bus/target-stops.json";
import { useEffect, useState } from "react";
import {
  getCurrentPosition,
  getDistanceFromLatLonInKm,
} from "@/util/misc/coords";
import { BusInstance, BusRoute } from "@/util/buseta";

interface IArrivalRoute {
  bus: string;
  bound: string;
  type: string;
  arrivalSeq: string;
  arrivalStop: string;
}

interface RakurakuRoute {
  boardingId: string;
  boardingStop: string;
  boardingSeq: string;
  distance: number;
  route: string;
  type: string;
  bound: string;
  destinationId: string;
  destinationStop: string;
  destinationSeq: string;
  eta: string[];
  arrivalEta: string | null;
}

interface IApiBusEta {
  type: string;
  version: string;
  generated_timestamp: string;
  data: {
    co: string;
    route: string;
    dir: string;
    service_type: string;
    seq: string;
    dest_tc: string;
    dest_en: string;
    dest_sc: string;
    eta_seq: string;
    eta: string | null;
    rmk_tc: string;
    rmk_en: string;
    rmk_sc: string;
    data_timestamp: string;
  }[];
}

interface IApiLessBusEta {
  type: string;
  version: string;
  generated_timestamp: string;
  data: IApiLessBusEtaData[];
}

interface IApiLessBusEtaData {
  co: string;
  route: string;
  dir: string;
  service_type: string;
  seq: string;
  dest_tc: string;
  dest_en: string;
  dest_sc: string;
  eta_seq: number;
  eta: string | null;
  data_timestamp: string;
}

export default function MBusETA() {
  const [items, setItems] = useState<JSX.Element[]>([]);

  useEffect(() => {
    getCurrentPosition().then((pos) => {
      const bus = new BusInstance([pos[0], pos[1]]);
      bus.loadEtas().then(() => {
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
          return 0
        });
        setItems(items);
      });
    });
  }, []);

  return <div className={styles.container}>{items}</div>;
}
