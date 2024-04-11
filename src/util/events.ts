import { GSheetRow } from "@/components/mobile/events/types";
import { AppCache } from "./cache";

export interface EventData {
  date?: EventDate;
  session: string;
  title: string;
  form: number;
}

export interface EventDate {
  day: number;
  month: number;
  year: number;
  dayOfWeek: string;
  cycleNumber: number;
  cycleDay: string;
  identifier: string;
}

interface EventCollectionOptions {
  jsonOverride?: EventData[];
}
export class EventCollection {
  raw?: GSheetRow[];
  data: EventData[];

  constructor(data: GSheetRow[], options: EventCollectionOptions = {}) {
    if (options.jsonOverride) {
      this.raw = [];
      this.data = options.jsonOverride;
      return;
    }

    this.raw = data;
    this.data = [];

    for (let i = 0; i < data.length; i++) {
      const values = data[i].values;
      const [
        _date,
        _,
        _session,
        eventsS1,
        eventsS2,
        eventsS3,
        eventsS4,
        eventsS5,
        eventsS6,
        remarks,
        eventsAll,
      ] = values.map((v) => v.formattedValue?.split("\n"));
      /* date = `\n
16/3/2024 (SAT)
Cycle 1 Day A \n`
*/
      const dateRegex =
        /(\d{1,2})\/(\d{1,2})\/(\d{4})\s*\((\w{3})\)\nCycle\s*(\d*)\s*Day\s*(\w*)/gm;
      const dateMatch = dateRegex.exec(_date?.join("\n") || "");
      console.log("datematch", dateMatch, _date?.join("\n"));
      const date = dateMatch
        ? {
            day: parseInt(dateMatch[1]),
            month: parseInt(dateMatch[2]),
            year: parseInt(dateMatch[3]),
            dayOfWeek: dateMatch[4],
            cycleNumber: dateMatch[5]?.length ? parseInt(dateMatch[5]) : -1,
            cycleDay: dateMatch[6],
            identifier: `${dateMatch[1]}/${dateMatch[2]}/${dateMatch[3]}`,
          }
        : undefined;
      const session = _session?.[0];

      const events = [
        { form: 1, events: eventsS1 },
        { form: 2, events: eventsS2 },
        { form: 3, events: eventsS3 },
        { form: 4, events: eventsS4 },
        { form: 5, events: eventsS5 },
        { form: 6, events: eventsS6 },
        { form: -1, events: eventsAll },
      ];

      for (let j = 0; j < events.length; j++) {
        const event = events[j];
        if (event.events) {
          const lines = event.events;
          for (let k = 0; k < lines.length; k++) {
            const line = lines[k];
            if (line) {
              this.data.push({
                date: date,
                session: session || "",
                title: line,
                form: event.form,
              });
            }
          }
        }
      }
    }
  }

  eventsGroupBySession() {
    const sessions: {
      date?: EventDate;
      session: string;
      events: EventData[];
    }[] = [];
    const data = this.data;
    for (let i = 0; i < data.length; i++) {
      const event = data[i];
      const session = sessions.find(
        (s) =>
          s.date &&
          s.date.identifier === event.date?.identifier &&
          s.session === event.session
      );
      if (session) {
        session.events.push(event);
      } else {
        sessions.push({
          date: event.date,
          session: event.session,
          events: [event],
        });
      }
    }
    return sessions;
  }

  saveToCache() {
    AppCache.saveSchoolEvents(this);
  }

  static fromJSON(data: EventData[]) {
    return new EventCollection([], { jsonOverride: data });
  }
}
