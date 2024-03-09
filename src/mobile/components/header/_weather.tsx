"use client";

import { useEffect, useState } from "react";
import styles from "./index.module.css";

export default function MHeader_Weather() {
  const [temp, setTemp] = useState(0);
  useEffect(() => {
    fetch(
      "https://data.weather.gov.hk/weatherAPI/opendata/weather.php?dataType=rhrread&lang=tc"
    ).then((res) => {
      res.json().then((data) => {
        setTemp(data.temperature.data[1].value);
      });
    });
  }, []);

  return (
    <div className={styles.headerWeather}>
      <div className={styles.temp}>
        <span>{temp}</span>°C
      </div>
    </div>
  );
}
