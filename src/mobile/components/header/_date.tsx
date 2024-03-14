"use client";

import { formatDateLong } from "@/util/misc/datetime";
import styles from "./index.module.css";
import { useEffect, useState } from "react";

export default function MHeader_Date() {
  const [dateNow, setDateNow] = useState<Date | null>(null);
  useEffect(() => {
    const interval = setInterval(() => {
      setDateNow(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={styles.headerDate}>
      <div className={styles.date}>
        {dateNow ? formatDateLong(dateNow) : "..."}
      </div>
    </div>
  );
}
