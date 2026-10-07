export type RuntimeConfig = {
  bundleId: number;
  nativeVersion: string;
  otaEnabled: boolean;
  apiUrl: string;
  otaAppKey: string;
};

export type DownloadUpdateOptions = {
  zipUrl: string;
  bundleId: number;
  zipSize?: number;
  zipSha256?: string;
};

export type DownloadProgressEvent = {
  downloaded: number;
  total: number;
  percent: number;
};
