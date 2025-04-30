import { Component, inject, signal } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '@auth/services/auth.service';

const MIN_LENGTH: number = 6;

@Component({
  selector: 'app-register-page',
  imports: [ReactiveFormsModule],
  templateUrl: './register-page.component.html',
})
export class RegisterPageComponent {
  private readonly _fb = inject(FormBuilder);
  private readonly _authService = inject(AuthService);
  private readonly _router = inject(Router);

  hasError = signal<boolean>(false);
  errors = signal<string[]>([]);

  registerForm = this._fb.group(
    {
      username: [
        '',
        [Validators.required, Validators.pattern(/^([a-zA-Z]+) ([a-zA-Z]+)$/)],
      ],
      email: ['', [Validators.required, Validators.email]],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(MIN_LENGTH),
          Validators.pattern(/\d/), // has a number
          Validators.pattern(/[A-Z]/), // has upper case letter
          Validators.pattern(/[a-z]/), //  has a lower-case letter
          Validators.pattern(/[ !@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/), // has a special character
        ],
      ],
      password2: ['', Validators.required],
    },
    {
      validators: [
        RegisterPageComponent.areEqualFields('password', 'password2'),
      ],
    }
  );

  static areEqualFields(field1: string, field2: string) {
    return (group: FormGroup) => {
      const field1Value = group.controls[field1].value;
      const field2Value = group.controls[field2].value;
      return field1Value === field2Value ? null : { notEquals: true };
    };
  }

  onSubmit() {
    if (this.registerForm.invalid) {
      this._showError();
      return;
    }

    const { email, password, username } = this.registerForm.value;
    this._authService
      .register({ email, fullName: username, password })
      .subscribe((isAuthenticated) => {
        if (isAuthenticated) {
          this._router.navigateByUrl('/');
          return;
        }

        this._showError();
      });
  }

  private _showError() {
    this.hasError.set(true);
    setTimeout(() => {
      this.hasError.set(false);
    }, 2000);
  }
}
