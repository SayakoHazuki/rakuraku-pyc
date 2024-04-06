import styles from "./index.module.css";
import MHeader_Weather from "./_weather";
import MHeader_Clock from "./_clock";
import MHeader_Date from "./_date";

export default function MHeader() {
  return (
    <div className={styles.container}>
      <MHeader_Weather />
      <MHeader_Clock />
      <MHeader_Date />
    </div>
  );
}
