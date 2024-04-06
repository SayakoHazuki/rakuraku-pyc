"use client";

import GApiClient from "@/util/googleapi";
import styles from "./index.module.css";
import { useEffect, useState } from "react";
import useScript from "@/util/misc/useScript";
import GoogleAuthButton from "@/components/shared/google/GAuthButton";
import MEventList from "./eventList";
import { GSheetRow } from "./types";

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

  const [gAuthButtonShown, setGAuthButtonShown] = useState(false);
  const [gAuthButtonTxt, setGAuthButtonTxt] = useState("Loading...");
  const [gAuthSignoutButtonShown, setGAuthSignoutButtonShown] = useState(false);
  const [gAuthMessage, setGAuthMessage] = useState("");
  const [gAuthError, setGAuthError] = useState("");
  const [ESSData, setESSData] = useState<GSheetRow[]>([]);
  const [targetForm, setTargetForm] = useState(1);

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

  gClient.ESSDataCallback = (data: GSheetRow[]) => {
    setESSData(data);
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

  const handleFormSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTargetForm(parseInt(e.target.value));
  };

  return (
    <div className={styles.container}>
      <div className={styles.title}>Upcoming Events</div>
      <select onChange={handleFormSelect}>
        <option value="1">Form 1</option>
        <option value="2">Form 2</option>
        <option value="3">Form 3</option>
        <option value="4">Form 4</option>
        <option value="5">Form 5</option>
        <option value="6">Form 6</option>
      </select>
      {gAuthButtonShown ? <GoogleAuthButton text={gAuthButtonTxt} /> : null}
      <div>{gAuthMessage}</div>
      <div>{gAuthError}</div>
      <MEventList rowData={ESSData} targetForm={targetForm} />
    </div>
  );
}
