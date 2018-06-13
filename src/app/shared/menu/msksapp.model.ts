export enum AppType {
    WEB,
    APPLICATION,
    UNKNOWN
}

export class MsksApp {

    public appkey: string;
    public type: AppType;
    public path: string;
    public cwd?: string;

}
