import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { MsksService } from '../shared/msks';
import { MenuService } from '../shared/menu';

@Component({
    selector: 'sc2-msks-photo',
    templateUrl: './photo.component.html'
})
export class PhotoDemoComponent implements OnInit {

    public camerastatus: string;
    public online = false;

    @ViewChild('imgholder')
    public imgholder: ElementRef;

    constructor(private service: MsksService,
        private menu: MenuService) {
            console.log(menu);
    }

    public ngOnInit() {
        this.service.sendRequest('RR_CAMERA', 'start').subscribe((resp) => {
            if (resp.errorcode === '0') {
                this.camerastatus = 'Online';
                this.online = true;
            } else {
                this.camerastatus = 'Unable to connect to terminal server';
            }
        }, (error) => {
            this.camerastatus = 'Unable to connect to terminal server';
        });
    }

    public sendRequest() {
        if (this.online) {
            this.service.sendRequest('RR_CAMERA', 'takephoto').subscribe((resp) => {
                if (resp.errorcode === '0') {
                    console.log(resp);
                    this.imgholder.nativeElement.src = `data:image/jpeg;base64,${resp.img}`;
                } else {
                    this.camerastatus = 'Unable to connect to terminal server';
                }
            }, (error) => {
                this.camerastatus = 'Unable to connect to terminal server';
            });
        }
    }
}
