import {AbstractControl, ValidationErrors, ValidatorFn} from '@angular/forms';

/** If a field is filled, the other field must be filled too */
export function dependantFieldValidator(fieldName: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        if (!control.parent) {
            return null;
        }

        const field = control.parent.get(fieldName);

        if (field?.value && !control.value) {
            return {'dependantFieldRequired': {fieldName}};
        }

        return null;
    };
}
