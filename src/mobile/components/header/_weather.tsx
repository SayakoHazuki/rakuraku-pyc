import styles from "./index.module.css";

export default function MHeader_Weather() {
  return (
    <div className={styles.headerWeather}>
      <div className={styles.temp}>
        <span>27</span>°C
      </div>
    </div>
  );
}
