import styles from "./index.module.css";
import MBusETA_Item from "./_item";

export default function MBusETA() {
  return (
    <div className={styles.container}>
      {new Array(5).fill(0).map((_, i) => (
        <MBusETA_Item key={i} />
      ))}
    </div>
  );
}
