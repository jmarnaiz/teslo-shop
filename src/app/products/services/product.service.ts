import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import type { ProductsResponse } from '@products/interfaces/product.interface';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private _http = inject(HttpClient);

  getProducts(): Observable<ProductsResponse> {
    return this._http
      .get<ProductsResponse>('http://localhost:3000/api/products')
      .pipe(tap((resp) => console.log('Response: ', resp)));
  }
}
