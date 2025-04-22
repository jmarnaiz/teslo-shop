import { ActivatedRoute } from '@angular/router';
import { Component, inject } from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { Gender } from '@products/interfaces/product.interface';
import { ProductService } from '@products/services/product.service';
import { ProductCardComponent } from '../../../products/components/product-card/product-card.component';

@Component({
  selector: 'gender-page',
  imports: [ProductCardComponent],
  templateUrl: './gender-page.component.html',
})
export class GenderPageComponent {
  // Aquí si debo hacerlo de forma reactiva porque
  // navego dentro de la misma página y por tanto,
  // debo estar atento a los cambios

  genderType = Gender;

  private readonly _route = inject(ActivatedRoute);
  private readonly _productService = inject(ProductService);

  gender = toSignal(this._route.params.pipe(map(({ gender }) => gender)));
  // Route params: { "gender": "women" }

  productsResource = rxResource({
    request: () => ({ gender: this.gender() }),
    loader: ({ request }) => {
      const { gender } = request;
      return this._productService.getProducts({ gender });
    },
  });
}
