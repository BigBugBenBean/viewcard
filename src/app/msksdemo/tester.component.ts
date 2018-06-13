import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { MsksService } from '../shared/msks';
import { FormGroup, FormControl, AbstractControl, FormBuilder, Validators, ValidatorFn } from '@angular/forms';

export function isJson(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } => {
        try {
            JSON.parse(control.value);
            console.log(`${control.value} is a valid json`);
            return null;
        } catch (error) {
            return { 'invalidjson': `${control.value} is not a valid json` };
        }

    };
}

@Component({
    selector: 'sc2-tester',
    templateUrl: './tester.component.html'
})
export class TesterComponent implements OnInit {

    public form: FormGroup;

    @ViewChild('jsonviewer')
    public jsonviewer: ElementRef;

    constructor(private service: MsksService,
        private fb: FormBuilder) { }

    public ngOnInit() {
        this.form = this.fb.group({
            channelid: this.fb.control('', Validators.required),
            functionid: this.fb.control('', Validators.required),
            payload: this.fb.control('', TesterComponent.checkJsonString())
        });
    }

    public sendRequest() {

        console.log(this.form.controls['payload'].value.length);

        const payload = (this.form.controls['payload'].value) ? JSON.parse(this.form.controls['payload'].value) : {};

        this.service.sendRequest(
            this.form.controls['channelid'].value,
            this.form.controls['functionid'].value,
            payload
        ).subscribe((resp) => {
            $(this.jsonviewer.nativeElement).jsonViewer(resp);
        });
    }

    public static checkJsonString(): ValidatorFn {
        return (control: FormControl): { [key: string]: any } => {
            if (control.dirty) {
                try {
                    const input = control.value as string;

                    if (input) {
                        const output = JSON.parse(input);
                        return null;
                    } else {
                        return null;
                    }
                } catch (error) {
                    return { 'invalidjson': true };
                }
            }
            return null;
        }
    }

}
