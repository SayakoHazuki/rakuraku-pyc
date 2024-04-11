import { EventCollection, EventDate } from "@/util/events";
import styles from "./index.module.css";
import { GSheetRow } from "./types";

interface IMEventListProps {
  events?: EventCollection;
  targetForm: number;
}

function eventDateToString(date?: EventDate) {
  if (!date) return "Unknown Date";
  if (date.cycleNumber === -1)
    return `${date.day}/${date.month}/${date.year} (${date.dayOfWeek}. School Holiday)`;
  return `${date.day}/${date.month}/${date.year} (${date.dayOfWeek}. Cycle ${date.cycleNumber} Day ${date.cycleDay})`;
}

export default function MEventList(props: IMEventListProps) {
  if (!(props.targetForm >= 1 && props.targetForm <= 6)) props.targetForm = 1;
  const targetForm = Math.floor(props.targetForm);

  const { events } = props;
  if (!events) return null;

  return (
    <div className={styles.containerInner}>
      {events.eventsGroupBySession().map((session, i) => {
        const targetEvents = session.events.filter(
          (e) => e.form === targetForm
        );
        if (targetEvents.length === 0) return null;

        return (
          <div key={i} className={styles.session}>
            <div className={styles.sessionTitle}>
              {eventDateToString(session.date)} ({session.session})
            </div>
            <div className={styles.events}>
              {targetEvents.map((event, j) => {
                return (
                  <div key={j} className={styles.event}>
                    {event.title}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
