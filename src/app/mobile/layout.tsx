import MHeader from "@/components/mobile/header";

import styles from "./mobile-global.module.css";
import { Suspense } from "react";
import Loading from "./loading";

interface IMobileLayoutProps {
  children: React.ReactNode | React.ReactNode[];
}

export default function MobileLayout(props: IMobileLayoutProps) {
  return (
    <Suspense fallback={<Loading />}>
      <div className={styles["m-layout"]}>
        <MHeader />
        {props.children}
      </div>
    </Suspense>
  );
}
