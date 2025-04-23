import { ActivatedRoute } from '@angular/router';
import { Component, inject } from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { Gender } from '@products/interfaces/product.interface';
import { ProductService } from '@products/services/product.service';
import { ProductCardComponent } from '../../../products/components/product-card/product-card.component';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { PaginationService } from '@shared/components/pagination/pagination.service';
import { environment } from 'src/environments/environment';

const PAGE_SIZE = environment.pageSize;

@Component({
  selector: 'gender-page',
  imports: [ProductCardComponent, PaginationComponent],
  templateUrl: './gender-page.component.html',
})
export class GenderPageComponent {
  // Aquí si debo hacerlo de forma reactiva porque
  // navego dentro de la misma página y por tanto,
  // debo estar atento a los cambios

  genderType = Gender;

  private readonly _route = inject(ActivatedRoute);
  private readonly _productService = inject(ProductService);
  readonly paginationService = inject(PaginationService);

  gender = toSignal(this._route.params.pipe(map(({ gender }) => gender)));
  // Route params: { "gender": "women" }

  productsResource = rxResource({
    request: () => ({
      gender: this.gender(),
      page: this.paginationService.currentPage() - 1,
    }),
    loader: ({ request }) => {
      const { gender, page } = request;
      return this._productService.getProducts({
        gender,
        offset: page * PAGE_SIZE,
      });
    },
  });
}
