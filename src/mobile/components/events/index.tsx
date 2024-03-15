"use client";

import GApiClient from "@/util/googleapi";
import styles from "./index.module.css";
import { useEffect, useState } from "react";
import useScript from "@/util/misc/useScript";

declare global {
  interface Window {
    client: GApiClient;
  }
}

export function MEvents() {
  const gClient = new GApiClient(
    process.env.NEXT_PUBLIC_GAPI_CLIENT_ID,
    process.env.NEXT_PUBLIC_GAPI_API_KEY,
    ["https://sheets.googleapis.com/$discovery/rest?version=v4"],
    "https://www.googleapis.com/auth/spreadsheets.readonly"
  );

  const [gAuthButtonShown, setGAuthButtonShown] = useState(true);
  const [gAuthButtonTxt, setGAuthButtonTxt] = useState("");
  const [gAuthSignoutButtonShown, setGAuthSignoutButtonShown] = useState(false);
  const [gAuthMessage, setGAuthMessage] = useState("");
  const [gAuthError, setGAuthError] = useState("");
  const [handleAuthClick, setHandleAuthClick] = useState(() => {});
  const [handleSignoutClick, setHandleSignoutClick] = useState(() => {});

  gClient.displayGAuthButton = (text: string) => {
    setGAuthButtonTxt(text);
    setGAuthButtonShown(true);
  };
  gClient.displayGAuthSignoutButton = () => {
    setGAuthSignoutButtonShown(true);
  };
  gClient.hideGAuthButton = () => {
    setGAuthButtonShown(false);
  };
  gClient.hideGAuthSignoutButton = () => {
    setGAuthSignoutButtonShown(false);
  };
  gClient.displayGAuthMessage = (text: string) => {
    setGAuthMessage(text);
  };
  gClient.displayGAuthError = (err: any) => {
    setGAuthError(err);
  };

  useEffect(() => {
    window.client = gClient;
  }, []);

  useScript("https://apis.google.com/js/api.js", true, () => {
    window.client.onGapiLoaded();
  });
  useScript("https://accounts.google.com/gsi/client", true, () => {
    window.client.onGisLoaded();
  });

  return (
    <div className={styles.container}>
      <div>Events</div>
      {gAuthButtonShown && (
        <button
          onClick={() => {
            console.log("authorizing");
            window.client.handleAuthClick();
          }}
        >
          {gAuthButtonTxt}
        </button>
      )}
      {gAuthSignoutButtonShown && (
        <button
          onClick={() => {
            window.client.handleSignoutClick();
          }}
        >
          Sign out
        </button>
      )}
      <div>{gAuthMessage}</div>
      <div>{gAuthError}</div>
    </div>
  );
}
