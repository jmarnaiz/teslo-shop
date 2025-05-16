import {
  AfterViewInit,
  Component,
  ElementRef,
  input,
  OnChanges,
  SimpleChanges,
  viewChild,
} from '@angular/core';
// import Swiper JS
import Swiper from 'swiper';
import { Navigation, Pagination } from 'swiper/modules';
// import Swiper and modules styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { ProductImagePipe } from '@products/pipes/product-image.pipe';

@Component({
  selector: 'product-carousel',
  imports: [ProductImagePipe],
  templateUrl: './product-carousel.component.html',
  styles: `
  .swiper {
    width: 100%;
    height: 500px;
  }
  `,
})
export class ProductCarouselComponent implements AfterViewInit, OnChanges {
  images = input.required<string[]>();
  swiperDiv = viewChild.required<ElementRef>('swiperDiv');
  swiper: Swiper | undefined = undefined;

  ngAfterViewInit(): void {
    this._swiperInit();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['images'].firstChange) {
      return;
    }

    if (!this.swiper) {
      return;
    }

    // Lo ideal sería esto:
    // this.swiper.addSlide()
    this.swiper.destroy(true, true);

    // To fix dots problem

    const paginationElm: HTMLDivElement =
      this.swiperDiv().nativeElement.querySelector('.swiper-pagination');

    console.log(paginationElm);

    paginationElm.innerHTML = '';

    // Esto me duele una barbaridad

    setTimeout(() => {
      this._swiperInit();
    }, 100);
  }

  private _swiperInit() {
    const element = this.swiperDiv().nativeElement;

    // Redundant because is required
    if (!element) {
      throw new Error('No element found');
    }
    this.swiper = new Swiper(element, {
      // Optional parameters
      direction: 'horizontal',
      loop: true,

      // configure Swiper to use modules
      modules: [Navigation, Pagination],

      // If we need pagination
      pagination: {
        el: '.swiper-pagination',
      },

      // Navigation arrows
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
      },

      // And if we need scrollbar
      scrollbar: {
        el: '.swiper-scrollbar',
      },
    });
  }
}
