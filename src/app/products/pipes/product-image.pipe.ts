import { Pipe, type PipeTransform } from '@angular/core';
import { environment } from 'src/environments/environment';

const BASE_URL = environment.baseUrl;
const NO_IMAGE_URL = 'assets/images/no-image.jpg';

@Pipe({
  name: 'productImage',
})
export class ProductImagePipe implements PipeTransform {
  transform(value: null | string | string[]): string {
    // if (Array.isArray(value) && value.length > 1) {
    // }
    if (!value) {
      return NO_IMAGE_URL;
    }

    if (typeof value === 'string') {
      if (value.startsWith('blob:')) {
        // return value.replace(/^blob:/, '');
        return value;
      }

      return `${BASE_URL}/files/product/${value}`;
    }

    // Si es un array de elementos, solo voy a mostrar el primero

    const image = value.at(0);

    if (!image) {
      return NO_IMAGE_URL;
    }

    return `${BASE_URL}/files/product/${image}`;
  }
}
