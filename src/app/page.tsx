import { redirect } from "next/navigation";
import "../styles/globals.css";
import styles from "./page.module.css";

export default function Home() {
  redirect("/mobile")
}
