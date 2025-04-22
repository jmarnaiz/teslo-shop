import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import type {
  Gender,
  Product,
  ProductsResponse,
} from '@products/interfaces/product.interface';
import { Observable, of } from 'rxjs';
import { environment } from 'src/environments/environment';

const BASE_URL = environment.baseUrl;

interface ProductOptions {
  limit?: number;
  offset?: number;
  gender?: Gender;
}

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private _http = inject(HttpClient);

  getProducts(options: ProductOptions): Observable<ProductsResponse> {
    const { limit: pageSize = 9, offset = 0, gender = '' } = options;
    const params = {
      params: new HttpParams()
        .set('limit', pageSize) // Tamaño de la página
        .set('offset', offset) // Número de items que se salta
        .set('gender', gender),
    };
    return this._http.get<ProductsResponse>(
      BASE_URL.concat('/products'),
      params
    );
    // .pipe(tap((resp) => console.log('Response: ', resp)));
  }

  getProductByIdSlug(slug: string): Observable<Product> {
    if (!slug) {
      return of();
    }
    return this._http.get<Product>(`${BASE_URL}/products/${slug}`);
  }
}

// .get<ProductsResponse>(BASE_URL.concat('/products'), { params: { limit, offset, gender }})
