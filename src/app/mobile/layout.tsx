import MHeader from "@/mobile/components/header";

import styles from "./layout.module.css";

interface IMobileLayoutProps {
  children: React.ReactNode | React.ReactNode[];
}

export default function MobileLayout(props: IMobileLayoutProps) {
  return (
    <div className={styles["m-layout"]}>
      <MHeader />
      {props.children}
    </div>
  );
}
