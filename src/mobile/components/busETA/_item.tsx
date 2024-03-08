import styles from "./index.module.css";

export default function MBusETA_Item() {
  return (
    <div className={styles.item}>
      <div className={styles.bus}>
        <span>40X</span>
      </div>
      <div className={styles.route}>
        <div className={styles.boarding}>
          <span>Ma On Shan Sports Ground</span>
        </div>
        <div className={styles.destination}>
          <span className={styles.destinationTip}>&nbsp;to&nbsp;</span>
          <span className={styles.destinationText}>Wo Che</span>
          <span className={styles.destinationTip}>&nbsp;@&nbsp;</span>
          <span className={styles.destinationEta}>23:30</span>
        </div>
      </div>
      <div className={styles.timelist}>
        <span className={styles.timePrimary}>
          <span className={styles.timeVal}>00:00</span>
        </span>
        <span className={styles.timeSecondary}>
          <span className={styles.timeTip}>also&nbsp;</span>
          <span className={styles.timeVal}>00:00</span>
        </span>
      </div>
    </div>
  );
}
