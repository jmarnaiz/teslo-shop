import { Component, effect, inject } from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '@products/services/product.service';
import { map } from 'rxjs';
import { ProductDetailsComponent } from './product-details/product-details.component';

@Component({
  selector: 'app-product-admin-page',
  imports: [ProductDetailsComponent],
  templateUrl: './product-admin-page.component.html',
})
export class ProductAdminPageComponent {
  private readonly _activatedRoute = inject(ActivatedRoute);
  private readonly _productService = inject(ProductService);

  private readonly _router = inject(Router);

  productId = toSignal(
    this._activatedRoute.params.pipe(map((params) => params['id']))
  );

  readonly productResource = rxResource({
    request: () => ({ id: this.productId() }),
    loader: ({ request }) => {
      return this._productService.getProductById(request.id);
    },
  });

  redirectEffect = effect(() => {
    if (this.productResource.error()) {
      this._router.navigateByUrl('admin/products');
    }
  });
}
