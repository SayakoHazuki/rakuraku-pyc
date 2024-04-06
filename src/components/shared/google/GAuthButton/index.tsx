import styles from "./index.module.css";

interface IGoogleAuthButtonProps {
  text: string;
}

export default function GoogleAuthButton(props: IGoogleAuthButtonProps) {
  return (
    <button
      className={styles.gAuthButton}
      onClick={() => {
        console.log("authorizing");
        window.client.handleAuthClick();
      }}
    >
      <span className={styles.icon}></span>
      <span className={styles.text}>{props.text}</span>
    </button>
  );
}
