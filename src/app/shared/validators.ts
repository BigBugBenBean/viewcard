import { FormControl, ValidatorFn } from '@angular/forms';

export class MsksValidator {

    public static checkJsonString(): ValidatorFn {
        return (control: FormControl): { [key: string]: any } => {
            if (control.dirty) {
                try {
                    const input = control.value as string;

                    const output = JSON.parse(input);
                    return null;
                } catch (error) {
                    return { 'invalidjson': true };
                }
            }
            return null;
        }
    }
}
