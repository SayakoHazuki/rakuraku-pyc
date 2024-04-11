import { EventCollection, EventData } from "./events";

type JsonSerialized<T> = string & {
  __json_seralized: T;
};

interface IAppCacheData {
  schoolEvents: JsonSerialized<EventData[]>;
  schoolEventsExpiry: string;
}

export class AppCache {
  constructor() {
    throw new Error("This class is not meant to be instantiated.");
  }

  private static get(key: string): string | null {
    return window.localStorage.getItem(key);
  }

  private static set(key: string, value: string): void {
    window.localStorage.setItem(key, value);
  }

  private static getJSON<T = "schoolEvents">(key: string): EventData[] | null;
  private static getJSON<T>(key: string): T | null {
    const value = AppCache.get(key);
    return value ? JSON.parse(value) : null;
  }

  private static setJSON<T>(key: string, value: T): void {
    AppCache.set(key, JSON.stringify(value));
  }

  static getSchoolEvents(): EventCollection | null {
    const events = AppCache.getJSON("schoolEvents");
    const expiry = AppCache.get("schoolEventsExpiry");
    if (!events || !expiry) return null;
    if (new Date(expiry) < new Date()) return null;
    return new EventCollection([], { jsonOverride: events });
  }

  static saveSchoolEvents(events: EventCollection) {
    AppCache.set("schoolEvents", JSON.stringify(events.data));
    AppCache.set(
      "schoolEventsExpiry",
      new Date(Date.now() + 86400000).toISOString()
    );
  }
}
