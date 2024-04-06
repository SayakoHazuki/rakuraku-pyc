import "@/styles/globals.css";
import styles from "./page.module.css";

import MContainer from "@/components/mobile/container";
import MFooter from "@/components/mobile/footer";
import MBusETA from "@/components/mobile/busETA";

export default function MPage_Bus() {
  return (
    <>
      <MContainer>
        <MBusETA />
      </MContainer>
      <MFooter />
    </>
  );
}
