import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { User } from '@auth/interfaces/user.interface';
import {
  Gender,
  Product,
  ProductsResponse,
} from '@products/interfaces/product.interface';
import { forkJoin, map, Observable, of, switchMap, tap } from 'rxjs';
import { environment } from 'src/environments/environment';

const BASE_URL = environment.baseUrl;
const PAGE_SIZE = environment.pageSize;

interface ProductOptions {
  limit?: number;
  offset?: number;
  gender?: Gender;
}

const _emptyProduct: Product = {
  id: 'new',
  title: '',
  price: 0,
  description: '',
  slug: '',
  stock: 0,
  sizes: [],
  gender: Gender.Men,
  tags: [],
  images: [],
  user: {} as User,
};

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
    if (id === 'new') {
      return of(_emptyProduct);
    }

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

  createProduct(
    product: Partial<Product>,
    imageFileList?: FileList
  ): Observable<Product> {
    return this.uploadImages(imageFileList).pipe(
      map((imageNames) => ({
        ...product,
        images: [...imageNames],
      })),
      switchMap((newProduct) =>
        this._http.post<Product>(`${BASE_URL}/products`, newProduct)
      ),
      tap((product) => this._updateProductCache(product))
    );
  }
  // Se puede optimizar para mandar un segundo parámetro y que
  // no actualice _productsCache

  updateProduct(
    id: string,
    product: Partial<Product>,
    imageFileList?: FileList
  ): Observable<Product> {
    const currentImages = product.images ?? [];
    return this.uploadImages(imageFileList).pipe(
      map((imageNames) => ({
        ...product,
        images: [...currentImages, ...imageNames],
      })),
      switchMap((updatedProduct) =>
        this._http.patch<Product>(`${BASE_URL}/products/${id}`, updatedProduct)
      ),
      tap((product) => this._updateProductCache(product))
    );

    /**
     * switchMap toma el valor de un observable anterior y lo encandena
     * con un valor nuevo, emitiendo un único valor.
     * Básicamente lo que va a hacer es transformar un Observable en
     * otros Observables y unificar la salida de todos los Observables
     * bajo un solo stream.
     */
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

  uploadImages(images?: FileList): Observable<string[]> {
    if (!images) {
      return of([]);
    }

    const uploadObservables: Observable<string>[] = Array.from(
      images,
      (imageFile) => this.uploadImage(imageFile)
    );

    return forkJoin(uploadObservables);
  }

  uploadImage(imageFile: File): Observable<string> {
    const formData = new FormData();
    formData.append('file', imageFile);

    return this._http
      .post<{ fileName: string }>(`${BASE_URL}/files/product/`, formData)
      .pipe(map((resp) => resp.fileName));
  }
}
