import { AbstractControl, ValidationErrors, ValidatorFn, FormGroup, FormArray } from '@angular/forms';

function timeToMinutes(time: string): number {
  if (!time) return 0;
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

export function validOpeningHoursValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const group = control as FormGroup;
    const open = group.get('open')?.value;
    const close = group.get('close')?.value;
    const closed = group.get('closed')?.value;

    if (closed) return null;

    if (!open || !close) {
      return { required: 'Öffnungs- und Schließzeit sind erforderlich' };
    }

    const openMinutes = timeToMinutes(open);
    const closeMinutes = timeToMinutes(close);

    if (closeMinutes <= openMinutes) {
      const diff = (24 * 60 - openMinutes) + closeMinutes;
      if (diff > 6 * 60) {
        return {
          invalidHours: 'Schließzeit muss nach Öffnungszeit liegen'
        };
      }
    }

    return null;
  };
}

export function openingHoursArrayValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const array = control as FormArray;
    return null;
  };
}
