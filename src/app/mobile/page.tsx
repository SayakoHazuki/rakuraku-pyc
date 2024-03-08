import { redirect } from "next/navigation";
import "../../styles/globals.css";
import styles from "./page.module.css";
import MHeader from "@/mobile/components/header";
import MBusETA from "@/mobile/components/busETA";

export default function Home() {
  return <div className={styles.container}>
    <MHeader />
    <MBusETA />
  </div>;
}
