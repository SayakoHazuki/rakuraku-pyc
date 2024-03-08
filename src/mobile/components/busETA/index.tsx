"use client";

import styles from "./index.module.css";
import MBusETA_Item from "./_item";
import stops from "../../../data/fetched/stops.json";
import stopRouteData from "../../../data/fetched/route-stops.json";
import targetStops from "../../../data/bus/target-stops.json";
import { useEffect, useState } from "react";

interface RakurakuRoute {
  stopId: string;
  stop: string;
  distance: number;
  route: string;
  type: string;
  bound: string;
  destinationId: string;
  destination: string;
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

    const loadCoords = () =>
      new Promise<[number, number]>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition((position) => {
          resolve([position.coords.latitude, position.coords.longitude]);
        });
      });
    loadCoords().then((coords) => {
      console.log(coords);
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

      console.log(closestStopsData);

      const targetedRoutes: {
        bus: string;
        bound: string;
        type: string;
        seq: string;
        arrivalStop: string;
      }[] = [];

      const filteredStops = stopRouteData.data.filter((stop) =>
        targetStops.includes(stop.stop)
      );
      for (const stop of filteredStops) {
        const route = {
          bus: stop.route,
          bound: stop.bound,
          type: stop.service_type,
          seq: stop.seq,
          arrivalStop: stop.stop,
        };
        if (!targetedRoutes.find((r) => r.bus === route.bus)) {
          targetedRoutes.push(route);
        }
      }

      console.log(targetedRoutes);

      let result: RakurakuRoute[] = [];
      for (const stop of closestStopsData) {
        const stopRoutes = stopRouteData.data.filter(
          (route) => route.stop === stop.stop
        );
        const filteredStopRoutes = stopRoutes.filter((route) =>
          targetedRoutes.find((r) => r.bus === route.route && r.seq > route.seq)
        );
        for (const route of filteredStopRoutes) {
          const routeData = targetedRoutes.find((r) => r.bus === route.route);
          if (routeData) {
            result.push({
              stopId: stop.stop,
              stop: stop.name_tc,
              distance: stop.distance,
              route: routeData.bus,
              type: routeData.type,
              bound: routeData.bound,
              destinationId: routeData.arrivalStop,
              destination:
                stops.data.find((r) => r.stop === routeData.arrivalStop)
                  ?.name_tc ?? "Unknown",
              eta: [],
              arrivalEta: null,
            });
          }
        }
      }
      result = result.sort((a, b) => a.distance - b.distance);

      console.log(result);
      setRoutes(result);

      // for (const route of result) {
      //   // https://data.etabus.gov.hk/v1/transport/kmb/eta/{stop_id}/{route}/{service_type}
      //   const url = `https://data.etabus.gov.hk/v1/transport/kmb/eta/${route.stopId}/${route.route}/${route.type}`;
      //   fetch(url)
      //     .then((res) => res.json())
      //     .then((data: IApiBusEta) => {
      //       const eta = data.data.map((d) => d.eta ?? "No Service");
      //       console.log(route.route, eta);
      //       const i = result.findIndex(
      //         (r) =>
      //           r.route === route.route &&
      //           r.bound === route.bound &&
      //           r.type === route.type &&
      //           r.stopId === route.stopId
      //       );
      //       console.log(i);
      //       result[i] = {
      //         ...route,
      //         eta,
      //       };
      //       setRoutes(result);
      //     });
      //   const url2 = `https://data.etabus.gov.hk/v1/transport/kmb/eta/${route.destinationId}/${route.route}/${route.type}`;
      //   fetch(url2)
      //     .then((res) => res.json())
      //     .then((data: IApiBusEta) => {
      //       const arrivalEta = data.data.map((d) => d.eta ?? "N/A")[0];
      //       const i = result.findIndex(
      //         (r) =>
      //           r.route === route.route &&
      //           r.bound === route.bound &&
      //           r.type === route.type &&
      //           r.stopId === route.stopId
      //       );
      //       result[i] = {
      //         ...route,
      //         arrivalEta,
      //       };
      //       setRoutes(result);
      //     });
      // }
      const etaMap = result.map((route) => {
        return {
          route,
          url: `https://data.etabus.gov.hk/v1/transport/kmb/eta/${route.stopId}/${route.route}/${route.type}`,
        };
      });
      const arrivalEtaMap = result.map((route) => {
        return {
          route,
          url: `https://data.etabus.gov.hk/v1/transport/kmb/eta/${route.destinationId}/${route.route}/${route.type}`,
        };
      });
      const etaPromises = etaMap.map((route) =>
        fetch(route.url).then((res) => res.json())
      );
      const arrivalEtaPromises = arrivalEtaMap.map((route) =>
        fetch(route.url).then((res) => res.json())
      );
      Promise.all(etaPromises).then((data) => {
        const eta = data.map((d:IApiBusEta) => d.data.map((d) => d.eta ?? "No Service"));
        result = result.map((route, i) => {
          return {
            ...route,
            eta: eta[i],
          };
        });
        console.log(result);
        setRoutes(result);
      });
      Promise.all(arrivalEtaPromises).then((data) => {
        const arrivalEta = data.map(
          (d:IApiBusEta) => d.data.map((d) => d.eta ?? "N/A")[0]
        );
        result = result.map((route, i) => {
          return {
            ...route,
            arrivalEta: arrivalEta[i],
          };
        });
        console.log(result);
        setRoutes(result);
      });
    });
  }, []);

  return (
    <div className={styles.container}>
      {routes.map((route: RakurakuRoute, i) => (
        <MBusETA_Item
          key={`${route.stopId}-${route.route}-${route.bound}-${route.destinationId}-${route.type}-${i}`}
          bus={route.route}
          boarding={route.stop}
          destination={route.destination}
          eta={[route.eta[0] || "- - -", route.eta[1] || "- - -"]}
          arrivalEta={route.arrivalEta || "23:59"}
        />
      ))}
    </div>
  );
}

