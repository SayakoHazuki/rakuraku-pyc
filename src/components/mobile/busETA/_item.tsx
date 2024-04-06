import styles from "./index.module.css";

interface MBusETA_ItemProps {
  bus: string;
  boarding: string;
  destination: string;
  eta: string[];
  arrivalEta: string;
}

export default function MBusETA_Item(props: MBusETA_ItemProps) {
  return (
    <div className={styles.item}>
      <div className={styles.bus}>
        <span>{props.bus}</span>
      </div>
      <div className={styles.route}>
        <div className={styles.boarding}>
          <span>{props.boarding}</span>
        </div>
        <div className={styles.destination}>
          <span className={styles.destinationTip}>&nbsp;to&nbsp;</span>
          <span className={styles.destinationText}>{props.destination}</span>
          <span className={styles.destinationTip}>&nbsp;@&nbsp;</span>
          <span className={styles.destinationEta}>{props.arrivalEta}</span>
        </div>
      </div>
      <div className={styles.timelist}>
        <span className={styles.timePrimary}>
          <span className={styles.timeVal}>{props.eta[0]}</span>
        </span>
        <span className={styles.timeSecondary}>
          <span className={styles.timeTip}>also&nbsp;</span>
          <span className={styles.timeVal}>{props.eta[1]}</span>
        </span>
      </div>
    </div>
  );
}
