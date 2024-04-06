import "@/styles/globals.css";
import styles from "./page.module.css";

import MContainer from "@/components/mobile/container";
import MFooter from "@/components/mobile/footer";
import { MEvents } from "@/components/mobile/events";

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
