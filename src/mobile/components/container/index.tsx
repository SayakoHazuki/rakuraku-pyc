import styles from "./index.module.css";

interface IMContainerProps {
  children: React.ReactNode | React.ReactNode[];
}

export default function MContainer(props: IMContainerProps) {
  return <div className={styles.container}>{props.children}</div>;
}
