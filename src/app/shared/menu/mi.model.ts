import { MsksApp } from '.';

export class MenuItem {
    public chiname: string;
    public engname: string;

    public menukey: string;

    public app?: MsksApp;
    public child?: MenuItem[];
    public service?: string;

    public iconpathen: string;
    public iconpathchi: string;
}
