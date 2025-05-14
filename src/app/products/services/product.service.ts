import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import type {
  Gender,
  Product,
  ProductsResponse,
} from '@products/interfaces/product.interface';
import { Observable, of, tap } from 'rxjs';
import { environment } from 'src/environments/environment';

const BASE_URL = environment.baseUrl;
const PAGE_SIZE = environment.pageSize;

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

  private _productsCache = new Map<string, ProductsResponse>();
  private _productCache = new Map<string, Product>();

  getProducts(options: ProductOptions): Observable<ProductsResponse> {
    const { limit: pageSize = PAGE_SIZE, offset = 0, gender = '' } = options;

    const key = `${pageSize}-${offset}-${gender}`; // Identificador único

    if (this._productsCache.has(key)) {
      return of(this._productsCache.get(key)!);
    }

    const params = {
      params: new HttpParams()
        .set('limit', pageSize) // Tamaño de la página
        .set('offset', offset) // Número de items que se salta
        .set('gender', gender),
    };
    return this._http
      .get<ProductsResponse>(BASE_URL.concat('/products'), params)
      .pipe(tap((resp) => this._productsCache.set(key, resp))); // Save it in chache
  }
  // .get<ProductsResponse>(BASE_URL.concat('/products'), { params: { limit, offset, gender }})

  getProductByIdSlug(slug: string): Observable<Product> {
    if (!slug) {
      return of();
    }
    if (this._productCache.has(slug)) {
      return of(this._productCache.get(slug)!);
    }
    return this._http
      .get<Product>(`${BASE_URL}/products/${slug}`)
      .pipe(tap((resp) => this._productCache.set(slug, resp)));
  }

  getProductById(id: string): Observable<Product> {
    if (!id) {
      return of();
    }
    if (this._productCache.has(id)) {
      return of(this._productCache.get(id)!);
    }
    return this._http
      .get<Product>(`${BASE_URL}/products/${id}`)
      .pipe(tap((resp) => this._productCache.set(id, resp)));
  }

  updateProduct(id: string, product: Partial<Product>): Observable<Product> {
    return this._http
      .patch<Product>(`${BASE_URL}/products/${id}`, product)
      .pipe(tap((product) => this._updateProductCache(product)));
  }

  private _updateProductCache(product: Product) {
    const productId = product.id;

    // Actualizar el producto en el caché individual
    this._productCache.set(productId, product);

    // Actualizar el producto en el caché de productos
    this._productsCache.forEach((productResponse) => {
      productResponse.products = productResponse.products.map(
        (currentProduct) => {
          return currentProduct.id === productId ? product : currentProduct;
        }
      );
    });
  }
}
