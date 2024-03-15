import "@/styles/globals.css";
import styles from "./page.module.css";

import MContainer from "@/mobile/components/container";
import MFooter from "@/mobile/components/footer";
import { MEvents } from "@/mobile/components/events";

export default function MPage_Timetable() {
  return (
    <>
      <MContainer>
        <MEvents />
      </MContainer>
      <MFooter />
    </>
  );
}
