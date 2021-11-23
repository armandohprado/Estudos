export interface ErrorApi {
  error: string;
  args: any[];
  callAgain: (...args: any[]) => any;
  moreInfo?: ErrorApiMoreInfo;
}

export interface ErrorApiMoreInfo {
  code?: number;
  title: string;
  info: string;
}
