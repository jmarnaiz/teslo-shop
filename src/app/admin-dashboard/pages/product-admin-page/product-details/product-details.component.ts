import { Component, inject, input, OnInit, signal } from '@angular/core';
import { Gender, Product, Size } from '@products/interfaces/product.interface';
import { ProductCarouselComponent } from '@products/components/product-carousel/product-carousel.component';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormUtils } from '@utils/form-utils';
import { FormErrorLabelComponent } from '../../../../shared/components/form-error-label/form-error-label.component';
import { ProductService } from '@products/services/product.service';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'product-details',
  imports: [
    ProductCarouselComponent,
    ReactiveFormsModule,
    FormErrorLabelComponent,
  ],
  templateUrl: './product-details.component.html',
})
export class ProductDetailsComponent implements OnInit {
  product = input.required<Product>();

  private readonly _productService = inject(ProductService);
  private readonly _router = inject(Router);

  readonly sizes = Object.values(Size);
  readonly SizesEnum = Size;
  readonly genders = Object.values(Gender);
  readonly GendersEnum = Gender;

  saved = signal(false);

  private readonly _fb = inject(FormBuilder);
  readonly productForm = this._fb.group({
    title: ['', Validators.required],
    description: ['', Validators.required],
    slug: [
      '',
      [Validators.required, Validators.pattern(FormUtils.slugPattern)],
    ],
    price: [0, [Validators.required, Validators.min(0)]],
    stock: [0, [Validators.required, Validators.min(0)]],
    sizes: [['']],
    images: [['']],
    tags: [''],
    gender: [
      Gender.Men,
      [Validators.required, FormUtils.enumValidator(this.genders)],
    ],
  });

  ngOnInit(): void {
    this.productForm.patchValue({
      ...this.product(),
      tags: this.product().tags?.join(', ') || '', // Convertir array a string
    });
    // this.productForm.reset(this.product());
  }

  onSizeClicked(size: Size) {
    const selectedSizes = this.productForm.value.sizes ?? [];

    if (selectedSizes.includes(size)) {
      selectedSizes.splice(selectedSizes.indexOf(size), 1);
    } else {
      selectedSizes.push(size);
    }

    this.productForm.patchValue({ sizes: selectedSizes });
  }

  async onSubmit() {
    const isValid = this.productForm.valid;
    this.productForm.markAllAsTouched();

    if (!isValid) return;

    const formValue = this.productForm.value;

    // Cuando le doy a guardar, tags se guarda como un string y no como un array de strings
    const processedValue: Partial<Product> = {
      ...(formValue as any),
      tags:
        formValue.tags
          ?.split(',')
          .map((tag) => tag.toLocaleLowerCase().trim()) ?? [],
    };

    if (this.product().id === 'new') {
      // Create product

      const product = await firstValueFrom(
        this._productService.createProduct(processedValue)
      );

      console.log('Created product');
      this._router.navigate(['/admin/products', product.id]);
      // this._productService
      //   .createProduct(processedValue)
      //   .subscribe((product) => {
      //     console.log('Created product');
      //     this._router.navigate(['/admin/products', product.id]);
      //     this.saved.set(true);
      //   });
    } else {
      // Update product
      await firstValueFrom(
        this._productService.updateProduct(this.product().id, processedValue)
      );

      this.saved.set(true);
      setTimeout(() => {
        this.saved.set(false);
      }, 3000);
      // this._productService
      //   .updateProduct(this.product().id, processedValue)
      //   .subscribe(() => {
      //     console.log('Updated product');
      //   });
    }
  }
}
