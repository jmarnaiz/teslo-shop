import { Component, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { ProductTableComponent } from '@products/components/product-table/product-table.component';
import { ProductService } from '@products/services/product.service';
import { PaginationComponent } from '@shared/components/pagination/pagination.component';
import { PaginationService } from '@shared/components/pagination/pagination.service';
import { environment } from 'src/environments/environment';

const PAGE_SIZE = environment.pageSize;

@Component({
  selector: 'app-products-admin-page',
  imports: [ProductTableComponent, PaginationComponent, RouterLink],
  templateUrl: './products-admin-page.component.html',
})
export class ProductsAdminPageComponent {
  private readonly _productService = inject(ProductService);
  readonly paginationService = inject(PaginationService);
  productsPerPage = signal<number>(PAGE_SIZE);

  productsResource = rxResource({
    request: () => ({
      page: this.paginationService.currentPage() - 1,
      limit: this.productsPerPage(),
    }),
    loader: ({ request }) => {
      return this._productService.getProducts({
        offset: request.page * request.limit,
        limit: request.limit,
      });
    },
  });
}
