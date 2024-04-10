"use client";

import { useState } from "react";
import styles from "./index.module.css";

export default function MHeader_Weather() {
  const [loaded, setLoaded] = useState(false);
  const [temp, setTemp] = useState("");

  fetch(
    "https://data.weather.gov.hk/weatherAPI/opendata/weather.php?dataType=rhrread&lang=tc"
  ).then((res) => res.json().then(handleData));

  function handleData(data: any) {
    setTemp(data.temperature.data[1].value);
    setLoaded(true);
  }

  return loaded ? (
    <div className={styles.headerWeather}>
      <div className={styles.temp}>
        <span>{temp ? temp.toString() + "°C" : "..."}</span>
      </div>
    </div>
  ) : null;
}
