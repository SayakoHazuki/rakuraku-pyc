"use client";

import styles from "./index.module.css";
import MBusETA_Item from "./_item";
import stops from "../../../data/fetched/stops.json";
import stopRouteData from "../../../data/fetched/route-stops.json";
import targetStops from "../../../data/bus/target-stops.json";
import { useEffect, useState } from "react";

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
  const [coords, setCoords] = useState({ lat: 0, lon: 0 });
  const [routes, setRoutes] = useState<RakurakuRoute[]>([]);

  useEffect(() => {
    function getDistanceFromLatLonInKm(
      lat1: number,
      lon1: number,
      lat2: number,
      lon2: number
    ) {
      var R = 6371; // Radius of the earth in km
      var dLat = deg2rad(lat2 - lat1); // deg2rad below
      var dLon = deg2rad(lon2 - lon1);
      var a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) *
          Math.cos(deg2rad(lat2)) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      var d = R * c; // Distance in km
      return d;
    }

    function deg2rad(deg: number) {
      return deg * (Math.PI / 180);
    }

    function formatTime(date: Date) {
      const hours = date.getHours();
      const minutes = date.getMinutes();
      if (!isNaN(hours) && !isNaN(minutes)) {
        return `${hours}:${minutes}`;
      }
      return `---`;
    }

    const loadCoords = () =>
      new Promise<[number, number]>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition((position) => {
          resolve([position.coords.latitude, position.coords.longitude]);
        });
      });

    loadCoords().then((coords) => {
      console.log("You are at", coords);

      /* Nearby stops processing */
      const calculatedStops = stops.data.map((stop) => ({
        ...stop,
        distance: getDistanceFromLatLonInKm(
          coords[0],
          coords[1],
          Number(stop.lat),
          Number(stop.long)
        ),
      }));
      const sortedStops = calculatedStops.sort(
        (a, b) => a.distance - b.distance
      );
      const sortedStopNamesSet = new Set(
        sortedStops.map((stop) => stop.name_en)
      );

      const closestStops = Array.from(sortedStopNamesSet).slice(0, 15);
      const closestStopsData = calculatedStops.filter(
        (stop) => closestStops.includes(stop.name_en) && stop.distance < 5
      );

      console.log("Closest stops", closestStopsData);

      /* Getting all routes to targeted stops */
      const targetedArrivalRoutes: IArrivalRoute[] = [];

      const targetedArrivingRouteStops = stopRouteData.data.filter((stop) =>
        targetStops.includes(stop.stop)
      );
      for (const routeStop of targetedArrivingRouteStops) {
        const route = {
          bus: routeStop.route,
          bound: routeStop.bound,
          type: routeStop.service_type,
          arrivalSeq: routeStop.seq,
          arrivalStop: routeStop.stop,
        };
        // Push if not in result array
        if (!targetedArrivalRoutes.find((r) => r.bus === route.bus)) {
          targetedArrivalRoutes.push(route);
        }
      }

      console.log(targetedArrivalRoutes);

      /* Filtering nearby routes */
      let result: RakurakuRoute[] = [];

      for (const stop of closestStopsData) {
        const stopRoutes = stopRouteData.data.filter(
          (route) => route.stop === stop.stop
        );
        const filteredStopRoutes = stopRoutes.filter((route) =>
          targetedArrivalRoutes.find(
            (r) => r.bus === route.route && r.arrivalSeq > route.seq
          )
        );

        for (const boardingRt of filteredStopRoutes) {
          const arrivalRtData = targetedArrivalRoutes.find(
            (arrRt) => arrRt.bus === boardingRt.route
          );
          if (arrivalRtData) {
            result.push({
              boardingId: stop.stop,
              boardingStop: stop.name_tc,
              boardingSeq: boardingRt.seq,
              distance: stop.distance,
              route: arrivalRtData.bus,
              type: arrivalRtData.type,
              bound: arrivalRtData.bound,
              destinationId: arrivalRtData.arrivalStop,
              destinationStop:
                stops.data.find((r) => r.stop === arrivalRtData.arrivalStop)
                  ?.name_tc ?? "---",
              destinationSeq: arrivalRtData.arrivalSeq,
              eta: [],
              arrivalEta: null,
            });
          }
        }
      }
      result = result.sort((a, b) => a.distance - b.distance);

      console.log(result);
      setRoutes(result);

      /* Getting ETAs */
      const etaMap = result.map((route) => {
        return {
          route,
          url: `https://data.etabus.gov.hk/v1/transport/kmb/eta/${route.boardingId}/${route.route}/${route.type}`,
        };
      });
      const arrivalEtaMap = result.map((route) => {
        return {
          route,
          url: `https://data.etabus.gov.hk/v1/transport/kmb/route-eta/${route.route}/${route.type}`,
        };
      });
      const etaPromises = etaMap.map((route) =>
        fetch(route.url).then((res) => res.json())
      );
      const arrivalEtaPromises = arrivalEtaMap.map((route) =>
        fetch(route.url).then((res) => res.json())
      );
      Promise.all(etaPromises).then((data: IApiBusEta[]) => {
        const etas = data.map((d) => d.data.map((d) => d.eta ?? "--"));
        result = result.map((route, i) => {
          return {
            ...route,
            eta: etas[i].map((d) => formatTime(new Date(d))),
          };
        });
        console.log(result);
        setRoutes(result);
      });
      Promise.all(arrivalEtaPromises).then((_data: IApiLessBusEta[]) => {
        const allData = _data.map((d) => d.data);

        const processedAllData = allData.map((routeEtas) => {
          const sortedRouteEtas = routeEtas.sort(
            (a, b) =>
              new Date(a.eta || 0).getTime() - new Date(b.eta || 0).getTime()
          );
          let resultingEta: IApiLessBusEtaData[] = [];
          const boardingEta = sortedRouteEtas.find(
            (eta) => eta.seq === result[0].boardingSeq && eta.eta_seq == 1
          );
          if (!boardingEta) return;
          resultingEta.push(boardingEta);
        });

        // const arrivalEta = data.map(
        //   (d: IApiBusEta) => d.data.map((d) => d.eta ?? "N/A")[0]
        // );
        // result = result.map((route, i) => {
        //   return {
        //     ...route,
        //     arrivalEta: formatTime(new Date(arrivalEta[i])),
        //   };
        // });
        // console.log(result);
        // setRoutes(result);
      });
    });
  }, []);

  return (
    <div className={styles.container}>
      {routes
        .sort((a, b) => a.distance - b.distance)
        .sort((a, b) => (a.eta.length >= 2 && b.eta.length < 2 ? -1 : 0))
        .map((route: RakurakuRoute, i) => (
          <MBusETA_Item
            key={`${route.boardingId}-${route.route}-${route.bound}-${route.destinationId}-${route.type}-${i}`}
            bus={route.route}
            boarding={route.boardingStop}
            destination={route.destinationStop}
            eta={[route.eta[0] || "--", route.eta[1] || "-"]}
            arrivalEta={route.arrivalEta || "23:59"}
          />
        ))}
    </div>
  );
}
