"use client";

import { useEffect, useState } from "react";
import styles from "./index.module.css";
import { formatTime } from "@/util/misc/datetime";

export default function MHeader_Clock() {
  const [dateNow, setDateNow] = useState(new Date());
  useEffect(() => {
    const interval = setInterval(() => {
      setDateNow(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={styles.headerClock}>
      <div className={styles.time}>{formatTime(dateNow)}</div>
    </div>
  );
}
