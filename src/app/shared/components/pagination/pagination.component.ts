import { Component, computed, input, linkedSignal } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-pagination',
  imports: [RouterLink],
  templateUrl: './pagination.component.html',
})
export class PaginationComponent {
  totalPages = input<number>(0);
  currentPage = input<number>(1);
  activePage = linkedSignal(this.currentPage);
  // activePage = linkedSignal(() => this.currentPage());

  pagesList = computed(() => {
    return Array.from({ length: this.totalPages() }, (_, i) => i + 1);
  });
}
