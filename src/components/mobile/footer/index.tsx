"use client";

import styles from "./index.module.css";
import { FaBus, FaCalendarWeek, FaExternalLinkAlt } from "react-icons/fa";
import MFooterItem from "./item";
import { FaGear } from "react-icons/fa6";
import { useEffect, useState } from "react";

export default function MFooter() {
  const links = [
    { icon: <FaBus />, text: "Bus ETA", path: "/bus" },
    { icon: <FaCalendarWeek />, text: "Timetable", path: "/timetable" },
    { icon: <FaGear />, text: "Settings", path: "/settings" },
    { icon: <FaExternalLinkAlt />, text: "PYC Net", path: "/pycnet" },
  ];
  const [activeLink, setActiveLink] = useState<string | null>(null);
  useEffect(() => {
    setActiveLink(
      "/" +
        window.location.pathname.replace("/mobile/", "").replace(/[\/\?].*/, "")
    );
    console.log(
      "/" +
        window.location.pathname.replace("/mobile/", "").replace(/[\/\?].*/, "")
    );
  }, []);
  return (
    <div className={styles.container}>
      {links.map((link, i) => (
        <MFooterItem
          key={i}
          icon={link.icon}
          text={link.text}
          active={activeLink === link.path}
          link={link.path}
        />
      ))}
    </div>
  );
}
