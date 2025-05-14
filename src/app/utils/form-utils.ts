import {
  AbstractControl,
  FormArray,
  FormGroup,
  ValidationErrors,
} from '@angular/forms';

// Función para simular la petición a un servidor
async function sleep() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, 2500);
  });
}

export class FormUtils {
  // Regular expressions
  static namePattern = /^([a-zA-Z]+) ([a-zA-Z]+)$/;
  static emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  static notOnlySpacesPattern = /^[a-zA-Z0-9]+$/;

  // Use for passwords
  static numberPattern = /\d/; // check whether the entered password has a number
  static capitalCasePattern = /[A-Z]/; // check whether the entered password has upper case letter
  static smallCasePattern = /[a-z]/; //  check whether the entered password has a lower-case letter
  static specialCharacterPattern = /[ !@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/; // check whether the entered password has a special character

  static securePasswordPattern: '/^(?=.*[a-z])(?=.*[A-Z])(?=.*d)(?=.*[@$!%*?&])[A-Za-zd@$!%*?&]{8,}$/';
  static slugPattern = '^[a-z0-9_]+(?:-[a-z0-9_]+)*$';

  static isValidField(form: FormGroup, fieldName: string): boolean | null {
    return form.controls[fieldName].errors && form.controls[fieldName].touched;
  }

  static isValidFieldInArray(formArray: FormArray, index: number) {
    return (
      formArray.controls[index].errors && formArray.controls[index].touched
    );
  }

  static getFieldError(form: FormGroup, fieldName: string): string | null {
    if (!form.controls[fieldName]) return null;

    const errors = form.controls[fieldName].errors ?? {};

    return FormUtils.getTextErrors(errors);
  }

  static getFieldErrorInArray(form: FormArray, index: number): string | null {
    if (!form.controls.length) return null;

    const errors = form.controls[index].errors ?? {};

    return FormUtils.getTextErrors(errors);
  }

  static enumValidator(
    allowedValues: string[]
  ): (control: AbstractControl) => ValidationErrors | null {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!allowedValues.includes(value)) {
        return { enumInvalid: { value, allowedValues } };
      }
      return null;
    };
  }

  static getTextErrors(errors: ValidationErrors) {
    for (const key of Object.keys(errors)) {
      switch (key) {
        case 'required':
          return 'Este campo es requerido';
        case 'email':
          return 'El email introducido no es válido';
        case 'emailTaken':
          return 'El email ya ha sido registrado anteriormente';
        case 'minlength':
          return `Mínimo de ${errors['minlength'].requiredLength} caracteres`;
        case 'min':
          return `Mínimo de ${errors['min'].min} caracteres`;
        case 'userNameNotValid':
          return 'Nombre de usuario no permitido';
        case 'pattern': {
          const requiredPattern = errors['pattern'].requiredPattern;
          if (requiredPattern == FormUtils.emailPattern) {
            return 'Formato de correo electrónico incorrecto';
          }
          if (requiredPattern == FormUtils.namePattern) {
            return 'El formato debe ser nombre y apellido';
          }
          if (requiredPattern == FormUtils.notOnlySpacesPattern) {
            return 'No se permiten espacios';
          }
          if (requiredPattern == FormUtils.numberPattern) {
            return 'Debe contener al menos un número';
          }
          if (requiredPattern == FormUtils.capitalCasePattern) {
            return 'Debe contener al menos un carácter en mayúsculas';
          }
          if (requiredPattern == FormUtils.smallCasePattern) {
            return 'Debe contener al menos un carácter en minúsculas';
          }
          if (requiredPattern == FormUtils.specialCharacterPattern) {
            return 'Debe contener al menos un carácter especial';
          }
          if (requiredPattern == FormUtils.slugPattern) {
            return 'Debe ser un formato de slug válido ';
          }
          return 'Formato incorrecto';
        }
        default:
          return `Error de validación no controlado ${key}`;
      }
    }

    return null;
  }

  static areEqualFields(field1: string, field2: string) {
    return (group: FormGroup) => {
      const field1Value = group.controls[field1].value;
      const field2Value = group.controls[field2].value;
      return field1Value === field2Value ? null : { notEquals: true };
    };
  }
}
