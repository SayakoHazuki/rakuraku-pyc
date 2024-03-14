import { classNames } from "@/util/classnames";
import Link from "next/link";
import styles from "./index.module.css";

export default function MFooterItem(props: {
  icon: React.ReactNode;
  text: string;
  active?: boolean | null;
  link: string;
}) {
  const containerClasses = [styles.footerItem];
  if (props.active) containerClasses.push(styles.active);
  return (
    <Link href={`/mobile${props.link}`}>
      <div className={classNames(...containerClasses)}>
        <div className={styles.footerItemIcon}>{props.icon}</div>
        <div className={styles.footerItemText}>{props.text}</div>
      </div>
    </Link>
  );
}
