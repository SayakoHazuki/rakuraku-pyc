import LoadingAnimation from "@/components/shared/loadingAnimation";
import styles from "./mobile-global.module.css";

export default function Loading() {
  return (
    <div className={styles.mobileLoaderContainer}>
      <div className={styles.mobileLoaderContent}>
        <LoadingAnimation />
        <div>Loading</div>
      </div>
    </div>
  );
}
