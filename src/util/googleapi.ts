import { GSheetRow } from "@/components/mobile/events/types";
import { AppCache } from "./cache";

interface ITokenClient extends google.accounts.oauth2.TokenClient {
  callback: (resp: any) => void;
}

export default class GApiClient {
  client_id: string;
  apiKey: string;
  discoveryDocs: string[];
  scopes: string;
  onceAuthed: boolean = false;

  tokenClient: ITokenClient | undefined;
  gapiInited: boolean;
  gisInited: boolean;

  ESSDataCallback: (data: GSheetRow[]) => void;

  displayGAuthButton: (text: string) => void;
  displayGAuthSignoutButton: () => void;
  hideGAuthButton: () => void;
  hideGAuthSignoutButton: () => void;
  displayGAuthMessage: (text: string) => void;
  displayGAuthError: (err: any) => void;

  constructor(
    client_id?: string,
    apiKey?: string,
    discoveryDocs?: string[],
    scopes?: string
  ) {
    console.log(client_id, apiKey, discoveryDocs, scopes);
    if (!client_id || !apiKey || !discoveryDocs || !scopes) {
      throw new Error("Invalid args");
    }

    this.client_id = client_id;
    this.apiKey = apiKey;
    this.discoveryDocs = discoveryDocs;
    this.scopes = scopes;
    this.tokenClient = undefined;
    this.gapiInited = false;
    this.gisInited = false;

    this.displayGAuthButton = (text: string) => {};
    this.displayGAuthSignoutButton = () => {};
    this.hideGAuthButton = () => {};
    this.hideGAuthSignoutButton = () => {};
    this.displayGAuthMessage = (text: string) => {};
    this.displayGAuthError = (err: any) => {};
    this.ESSDataCallback = () => {};
  }

  onGapiLoaded() {
    console.log("GAPI loaded");

    gapi.load("client", () => {
      this.initializeGapiClient();
    });
  }

  async initializeGapiClient() {
    const apiKey = this.apiKey;
    const discoveryDocs = this.discoveryDocs;
    await gapi.client.init({
      apiKey: apiKey,
      discoveryDocs: discoveryDocs,
    });
    this.gapiInited = true;
    this.maybeEnableButtons();
  }

  onGisLoaded() {
    console.log("GIS loaded");
    this.tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: this.client_id,
      scope: this.scopes,
      callback: this.handleAuthClick,
      prompt: "",
    }) as ITokenClient;
    this.gisInited = true;
    this.maybeEnableButtons();
  }

  maybeEnableButtons() {
    if (this.gapiInited && this.gisInited && !this.onceAuthed) {
      this.onceAuthed = true;
      this.handleAuthClick();
      this.displayGAuthButton("Sign in to Google");
    }
  }

  handleAuthClick() {
    if (!this.tokenClient) return;
    this.tokenClient.callback = async (resp) => {
      if (resp.error !== undefined) {
        throw resp;
      }
      this.displayGAuthSignoutButton();
      // this.displayGAuthButton("Refresh");
      this.hideGAuthButton();
      await this.fetchESS();
    };
    this.tokenClient.requestAccessToken({ prompt: "" });
  }

  handleSignoutClick() {
    const token = gapi.client.getToken();
    if (token !== null) return;
    google.accounts.oauth2.revoke(token, () => {
      gapi.client.setToken(null);
      this.displayGAuthMessage("");
      this.displayGAuthButton("Sign in to Google");
      this.hideGAuthSignoutButton();
    });
  }

  async fetchESS() {
    let response;
    try {
      response = await gapi.client.sheets.spreadsheets.get({
        spreadsheetId: "1d4LxrQHMFAdd8inuEwFRKZeVWWovtmVojfBRAPaDKko",
        ranges: ["Master!J1:J1"],
        includeGridData: true,
      });
    } catch (err) {
      console.error(err);
      return;
    }
    const sheetData = response.result;
    let targetCell =
      sheetData?.sheets?.[0]?.data?.[0]?.rowData?.[0]?.values?.[0]?.hyperlink;
    if (!targetCell) throw new Error("Invalid target cell");
    const startRow = targetCell.match(/range=J(.*)/)?.[1];
    if (!startRow || isNaN(Number(startRow)))
      throw new Error("Invalid start row");
    const endRow = Number(startRow) + 20;

    try {
      response = await gapi.client.sheets.spreadsheets.get({
        spreadsheetId: "1d4LxrQHMFAdd8inuEwFRKZeVWWovtmVojfBRAPaDKko",
        ranges: [`Master!J${startRow}:T${endRow}`],
        includeGridData: true,
      });
    } catch (err) {
      console.error(err);
      return;
    }

    console.log(response.result);
    this.ESSDataCallback(
      (response.result?.sheets?.[0]?.data?.[0]?.rowData ?? []) as GSheetRow[]
    );
  }
}
