import allStops from "@/data/fetched/stops.json";
import routeStopsData from "@/data/fetched/route-stops.json";
import targetStops from "@/data/bus/target-stops.json";
import { getDistanceFromLatLonInKm } from "@/util/misc/coords";
import { formatTime } from "./misc/datetime";

declare global {
  interface Window {
    bus?: BusInstance;
  }
}

/* stops.json */
interface IApiBusAllStops {
  type: string;
  version: string;
  generated_timestamp: string;
  data: IApiBusStop[];
}

interface IApiBusStop {
  stop: string;
  name_en: string;
  name_tc: string;
  name_sc: string;
  lat: string;
  long: string;
}

interface IDistancedBusStop extends IApiBusStop {
  distance: number;
}

/* route-stops.json */
interface IApiRouteStopList {
  type: string;
  version: string;
  generated_timestamp: string;
  data: IApiRouteStop[];
}

interface IApiRouteStop {
  route: string;
  bound: string;
  service_type: string;
  seq: string;
  stop: string;
}

/* Rakuraku-pyc Interfaces */
interface IApiBusEta {
  type: string;
  version: string;
  generated_timestamp: string;
  data: IApiBusEtaData[];
}

interface IApiBusEtaData {
  co: string;
  route: string;
  dir: string;
  service_type: number;
  seq: number;
  dest_tc: string;
  dest_en: string;
  dest_sc: string;
  eta_seq: string;
  eta: string | null;
  rmk_tc: string;
  rmk_en: string;
  rmk_sc: string;
  data_timestamp: string;
}

interface IStopInfo {
  id: string;
  name_tc: string;
  name_en: string;
  name_sc: string;
}

interface IBasicRouteResolvable {
  route: string;
  bound: string;
  service_type: string;
  [key: string]: any;
}

function isSameRoute(a: IBasicRouteResolvable, b: IBasicRouteResolvable) {
  return a.route === b.route && a.bound === b.bound && a.type === b.type;
}

class BusETAAPI {
  static allStops: IApiBusAllStops = allStops;
  static stopRouteData: IApiRouteStopList = routeStopsData;
  static targetStops: IApiBusStop[] = targetStops.map((stop) => {
    const found = BusETAAPI.allStops.data.find((s) => s.stop === stop);
    if (found) return found;

    return {
      stop: stop,
      name_en: "Unknown",
      name_tc: "未知",
      name_sc: "未知",
      lat: "0",
      long: "0",
    };
  });

  static groupStops<T extends IApiBusStop | IDistancedBusStop>(
    stops: T[],
    extraConditions: ((stop: T) => boolean)[] = []
  ) {
    const nameSet = new Set(stops.map((stop) => stop.name_en));
    const nameArr = Array.from(nameSet);
    const distanceMap = nameArr.map((name) => {
      const sample = stops.find((stop) => stop.name_en === name);
      if (!sample) return null;
      if ("distance" in sample) {
        return {
          name: name,
          distance: sample.distance,
        };
      }
    });
    const result = stops.filter(
      (stop) =>
        nameArr.includes(stop.name_en) &&
        extraConditions.every((condition) => condition(stop))
    );
    if (distanceMap.length > 0) {
      result.forEach((stop) => {
        const distance = distanceMap.find((d) => d && d.name === stop.name_en);
        if (distance) {
          (stop as IDistancedBusStop).distance = distance.distance;
        }
      });
    }
    return result;
  }

  static get targetedStops() {
    return allStops.data.filter((stop) => targetStops.includes(stop.stop));
  }

  static get targetedRouteStopList() {
    const results: IApiRouteStop[] = [];

    const targetedArrivingRouteStops: IApiRouteStop[] =
      routeStopsData.data.filter((stop) => targetStops.includes(stop.stop));

    for (const routeStop of targetedArrivingRouteStops) {
      // Push if not in result array
      if (!results.find((r) => r.route === routeStop.route)) {
        results.push(routeStop);
      }
    }
    return results;
  }
}

export class BusInstance {
  currentCords: [number, number];
  private sortedNearbyStops: IDistancedBusStop[];
  private sortedNearbyGroupedStops: IDistancedBusStop[];
  nearbyRoutes: BusRoute[];

  constructor(currentCords: [number, number]) {
    this.currentCords = currentCords;
    this.sortedNearbyStops = this.getSortedNearbyStops(15);
    this.sortedNearbyGroupedStops = BusETAAPI.groupStops(
      this.sortedNearbyStops,
      [(stop) => stop.distance < 5]
    );
    this.nearbyRoutes = this.getNearbyRoutes();

    window.bus = this;
  }

  getSortedNearbyStops(count: number): IDistancedBusStop[] {
    return BusETAAPI.allStops.data
      .map((stop) => ({
        ...stop,
        distance: getDistanceFromLatLonInKm(
          this.currentCords[0],
          this.currentCords[1],
          Number(stop.lat),
          Number(stop.long)
        ),
      }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, count);
  }

  getNearbyRoutes() {
    let result: BusRoute[] = [];

    for (const nearbyStop of this.sortedNearbyGroupedStops) {
      const allRoutesOfStop = BusETAAPI.stopRouteData.data.filter(
        (route) => route.stop === nearbyStop.stop
      );

      const filteredRSsOfStop = allRoutesOfStop.filter((thisRS) =>
        BusETAAPI.targetedRouteStopList.find(
          (targetRS) =>
            isSameRoute(targetRS, thisRS) && targetRS.seq > thisRS.seq
        )
      );

      for (const routeStop of filteredRSsOfStop) {
        const targetRS = BusETAAPI.targetedRouteStopList.find((targetRS) => {
          return isSameRoute(targetRS, routeStop);
        });
        const route = new BusRoute({
          ...routeStop,
          arrivalSeq: targetRS?.seq || "99",
          arrivalStop: targetRS?.stop || "Unknown",
          boardingStopDistance: nearbyStop.distance,
        });
        // Push if not in result array
        if (!result.find((r) => isSameRoute(r, route))) {
          result.push(route);
        }
      }
    }

    return result.sort(
      (a, b) => a.boardingStopDistance - b.boardingStopDistance
    );
  }

  async loadEtas() {
    for (const route of this.nearbyRoutes) {
      const etaData = await route.fetchEtaData();
    }
  }
}

interface IBusRouteConstructorData {
  route: string;
  bound: string;
  service_type: string;
  seq: string;
  stop: string;
  arrivalSeq: string;
  arrivalStop: string;
  boardingStopDistance: number;
}

export class BusRoute implements IBasicRouteResolvable {
  route: string;
  bound: string;
  service_type: string;
  boardingSeq: string;
  private _boardingStop: string;
  boardingStopDistance: number;
  arrivalSeq: string;
  private _arrivalStop: string;

  private eta: RouteAllEta | null = null;
  etaLoaded: boolean = false;

  boardingEtaLoadedCallback: () => void = () => {};
  arrivalEtaLoadedCallback: () => void = () => {};

  constructor(data: IBusRouteConstructorData) {
    this.route = data.route;
    this.bound = data.bound;
    this.service_type = data.service_type;
    this.boardingSeq = data.seq;
    this._boardingStop = data.stop;
    this.boardingStopDistance = data.boardingStopDistance;
    this.arrivalSeq = data.arrivalSeq;
    this._arrivalStop = data.arrivalStop;
  }

  onBoardingEtaLoaded(callback: () => void) {
    this.boardingEtaLoadedCallback = callback;
  }

  onArrivalEtaLoaded(callback: () => void) {
    this.arrivalEtaLoadedCallback = callback;
  }

  get data(): IBusRouteConstructorData {
    return {
      route: this.route,
      bound: this.bound,
      service_type: this.service_type,
      seq: this.boardingSeq,
      stop: this._boardingStop,
      boardingStopDistance: this.boardingStopDistance,
      arrivalSeq: this.arrivalSeq,
      arrivalStop: this._arrivalStop,
    };
  }

  get boardingStop(): IStopInfo {
    const stop = BusETAAPI.allStops.data.find(
      (s) => s.stop === this._boardingStop
    );
    return {
      id: this._boardingStop,
      name_tc: stop?.name_tc || "未知",
      name_en: stop?.name_en || "Unknown",
      name_sc: stop?.name_sc || "未知",
    };
  }

  get arrivalStop(): IStopInfo {
    const stop = BusETAAPI.allStops.data.find(
      (s) => s.stop === this._arrivalStop
    );
    return {
      id: this._arrivalStop,
      name_tc: stop?.name_tc || "未知",
      name_en: stop?.name_en || "Unknown",
      name_sc: stop?.name_sc || "未知",
    };
  }

  fetchEtaData() {
    const url = `https://data.etabus.gov.hk/v1/transport/kmb/route-eta/${this.route}/${this.service_type}`;

    return new Promise<RouteAllEta>((resolve, reject) => {
      fetch(url)
        .then((res) => res.json())
        .then((data: IApiBusEta) => {
          console.log(this.route);
          console.log("Fetched ETA data", data.data.length, "items", data.data);
          const result = data.data.filter(
            (d) =>
              d.route === this.route &&
              d.dir === this.bound &&
              Number(d.service_type) === Number(this.service_type)
          );
          console.log("Filtered ETA data", result.length, "items");
          const etas = new RouteAllEta(this.data, result);
          this.etaLoaded = true;
          this.eta = etas;
          resolve(etas);
        });
    });
  }

  get boardingEtas() {
    if (!this.etaLoaded) return null;
    if (!this.eta) return null;

    return this.eta.boardingEtas;
  }

  get arrivalEtas() {
    if (!this.etaLoaded) return null;
    if (!this.eta) return null;

    return this.eta.arrivalEtas;
  }
}

class RouteAllEta {
  routeData: IBusRouteConstructorData;
  raw: IApiBusEtaData[];

  constructor(routeData: IBusRouteConstructorData, etaData: IApiBusEtaData[]) {
    this.routeData = routeData;
    this.raw = etaData;
  }

  get boardingEtas() {
    const result = this.raw
      .filter((d) => d.seq.toString() === this.routeData.seq)
      .map((d) => new ETA(this.routeData, d));
    const numOfResults = Math.max(3 - result.length, 1);
    return [...result, ...Array(numOfResults).fill(null)].slice(0, 3);
  }

  get arrivalEtas() {
    let currentSeq = this.routeData.seq;
    let currentEta: string | null = this.boardingEtas[0]?.raw.eta || null;
    let possibleEtas: IApiBusEtaData[] = [];
    for (const eta of this.raw) {
      if (eta.seq <= Number(this.routeData.seq)) continue;
      if (!(currentEta && eta.eta && new Date(eta.eta) >= new Date(currentEta)))
        continue;

      if (eta.seq === Number(this.routeData.arrivalSeq)) {
        possibleEtas.push(eta);
      }

      if (eta.seq > Number(currentSeq)) {
        currentEta = eta.eta;
        currentSeq = eta.seq;
      }
    }
    if (!possibleEtas.length) return null;

    const firstArrivalEta = possibleEtas.sort((a, b) =>
      new Date(a.eta ?? 0) > new Date(b.eta ?? 0) ? 1 : -1
    )[0];

    return this.raw
      .filter(
        (d) =>
          d.seq.toString() === this.routeData.arrivalSeq &&
          d.eta_seq >= (firstArrivalEta?.eta_seq || 4)
      )
      .map((d) => new ETA(this.routeData, d));
  }
}

class ETA {
  routeData: IBusRouteConstructorData;
  raw: IApiBusEtaData;
  constructor(routeData: IBusRouteConstructorData, etaData: IApiBusEtaData) {
    this.routeData = routeData;
    this.raw = etaData;
  }

  get stop(): IStopInfo & { seq: string } {
    const routeStop = routeStopsData.data.find(
      (r) =>
        r.route === this.routeData.route && r.seq === this.raw.seq.toString()
    );
    const stop = BusETAAPI.allStops.data.find(
      (s) => s.stop === routeStop?.stop
    );
    if (!routeStop) {
      return {
        seq: "-1",
        id: "Unknown",
        name_tc: "未知",
        name_en: "Unknown",
        name_sc: "未知",
      };
    } else {
      return {
        seq: routeStop.seq,
        id: routeStop.stop,
        name_tc: stop?.name_tc || "未知",
        name_en: stop?.name_en || "Unknown",
        name_sc: stop?.name_sc || "未知",
      };
    }
  }

  get date() {
    return this.raw.eta ? new Date(this.raw.eta) : null;
  }

  get readableTime() {
    return this.date ? formatTime(this.date) : "---";
  }
}
