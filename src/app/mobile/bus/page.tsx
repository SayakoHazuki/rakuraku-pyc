import "@/styles/globals.css";
import styles from "./page.module.css";

import MContainer from "@/mobile/components/container";
import MFooter from "@/mobile/components/footer";
import MBusETA from "@/mobile/components/busETA";

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
