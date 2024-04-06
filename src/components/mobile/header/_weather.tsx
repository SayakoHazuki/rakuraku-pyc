"use client";

import styles from "./index.module.css";

export default function MHeader_Weather() {
  return fetch(
    "https://data.weather.gov.hk/weatherAPI/opendata/weather.php?dataType=rhrread&lang=tc"
  ).then((res) => res.json().then(handleData));

  function handleData(data: any) {
    const temp = data.temperature.data[1].value;

    return (
      <div className={styles.headerWeather}>
        <div className={styles.temp}>
          <span>{temp ? temp.toString() + "°C" : "..."}</span>
        </div>
      </div>
    );
  }
}
