import { Component, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { ProductService } from '@products/services/product.service';

@Component({
  selector: 'app-product-page',
  imports: [],
  templateUrl: './product-page.component.html',
})
export class ProductPageComponent {
  productSlug = inject(ActivatedRoute).snapshot.params['idSlug'];
  private readonly _productService = inject(ProductService);

  productResource = rxResource({
    request: () => ({ idSlug: this.productSlug }),
    loader: ({ request }) => {
      return this._productService.getProductByIdSlug(request.idSlug);
    },
  });
}
