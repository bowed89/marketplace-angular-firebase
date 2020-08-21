import { Component, OnInit } from '@angular/core';
import { Path } from '../../../config';
import { CategoriesService } from '../../../services/categories.service';
import { SubCategoriesService } from '../../../services/sub-categories.service';
import { ProductsService } from '../../../services/products.service';
import { Rating, OwlCarouselConfig } from '../../../functions';

declare var jQuery: any;
declare var $: any;

@Component({
  selector: 'app-home-showcase',
  templateUrl: './home-showcase.component.html',
  styleUrls: ['./home-showcase.component.css']
})
export class HomeShowcaseComponent implements OnInit {

  path:string =  Path.url;
  categories:any[] = [];
  preload:boolean = false;
  render:boolean = true;

  constructor(
    private _categoriesService: CategoriesService,
    private _subCategoriesService: SubCategoriesService,
    private _productsService: ProductsService
  ) { }

  ngOnInit(): void {

    this.preload = true;

    //Tomamos los datos de Categories
    let getCategories = []
    this._categoriesService.getData().subscribe(resp => {

      for(let i in resp) {

        getCategories.push(resp[i]);

      }

      // ordenamos las vistas 'views' de mayor a menor de getCategories
      getCategories.sort(function(a, b) {
        return (b.view - a.view);
      });

      // Filtramos hasta 6 categorias
       getCategories.forEach((category, index) => {

        // agrega las 6 primeras categorias.
        if(index < 6) {

          this.categories[index] = getCategories[index];
          this.preload = false;

        }
      });

      
    });

  }

  callback(indexes) {

    if(this.render) {

      this.render = false;
      let arraySubCategories = [];
      let arrayProducts = [];
      let preloadSV = 0;

      // Separar categorias
      this.categories.forEach((category, index) => {

        // Tomamos la coleccion de las subcategorias filtrando con los nombres de categorias 

        this._subCategoriesService.getFilterData("category", category.name).subscribe(resp => {

          for(let i in resp) {

            arraySubCategories.push({
              "category": resp[i].category,
              "name": resp[i].name,
              "url": resp[i].url
            });

          }

          // Recorremos 'arraySubCategories' para buscar coincidencias con los nombre de categorias  
          for(let j in arraySubCategories) {

            if(category.name == arraySubCategories[j].category) {

                $(`[category-showcase='${category.name}']`).append(`
                  <li> 
                    <a href="products/${arraySubCategories[j].url}">${arraySubCategories[j].name}</a>
                  </li>
                `);

            }

          }

        });

        // Tomamos la coleccion de los productos filtrados con las urls de categorias y el limite de 6
        this._productsService.getFilterDataWithLimit("category", category.url, 6).subscribe(resp => {

          for(let i in resp) {

            arrayProducts.push({

              "category": resp[i].category,
              "url": resp[i].url,
              "name": resp[i].name,
              "image": resp[i].image,
              "price": resp[i].price,
              "offer": resp[i].offer,
              "reviews": resp[i].reviews,
              "stock": resp[i].stock,
              "vertical_slider": resp[i].vertical_slider

            });

          }
          
          // Recorremos el 'arrayProducts' para buscar coinncidencias con las urls de categorias
          for(let k in arrayProducts) {

            if(category.url == arrayProducts[k].category) {

              // Definimos si el precio del producto tiene oferta o no
              let price;
              let type;
              let value;
              let offer;
              let disccount = "";
              let offerDate;
              let today = new Date();

              if(arrayProducts[k].offer != "") {

                  
                offerDate = new Date(

                  parseInt(JSON.parse(arrayProducts[k].offer)[2].split("-")[0]),
                  JSON.parse(arrayProducts[k].offer)[2].split("-")[1] - 1,
                  parseInt(JSON.parse(arrayProducts[k].offer)[2].split("-")[2]),
              
                );

                if(today < offerDate) { 

                  type = JSON.parse(arrayProducts[k].offer)[0];
                  value = JSON.parse(arrayProducts[k].offer)[1];

                  if(type == "Disccount") {

                    offer = (arrayProducts[k].price - (arrayProducts[k].price * value / 100)).toFixed(2);

                  }

                  if(type == "Fixed") {

                    offer = value;
                    value = Math.round(offer * 100 / arrayProducts[k].price);

                  }

                  disccount =  `<div class="ps-product__badge">-${value}%</div>`;

                  price = `<p class="ps-product__price sale">$${ offer } <del>$${ arrayProducts[k].price }</del></p>`;

                } else {

                  price = `<p class="ps-product__price">$${ arrayProducts[k].price }</p>`;

                }

              } else {

                price = `<p class="ps-product__price">$${ arrayProducts[k].price }</p>`;

              }

              // Calculamos el total de las calificaciones de las reseñas
              let totalReview = 0;

              for(let f = 0; f < JSON.parse(arrayProducts[k].reviews).length; f++) {

                totalReview = totalReview + Number(JSON.parse(arrayProducts[k].reviews)[f]["review"]);

              }

              // Imprimimos el total de las calificaciones para cada producto
              let rating = Math.round(totalReview / JSON.parse(arrayProducts[k].reviews).length);

              // Definimos si el producto tiene stock

              if(arrayProducts[k].stock == 0) {

                disccount = `<div class="ps-product__badge out-stock">Out Of Stock</div>`

              }



              // Imprimimos los productos en el DOM
              
              $(`[category-pb='${arrayProducts[k].category}']`).append(`
            
                  <div class="ps-product ps-product--simple">

                      <div class="ps-product__thumbnail">

                          <a href="product/${arrayProducts[k].url}">

                              <img src="assets/img/products/${arrayProducts[k].category}/${arrayProducts[k].image}" alt="">

                          </a>

                          ${ disccount }

                      </div>

                    <div class="ps-product__container">

                        <div class="ps-product__content" data-mh="clothing">

                            <a class="ps-product__title" href="product/${arrayProducts[k].url}">${arrayProducts[k].name}</a>

                            <div class="ps-product__rating">

                                  <select class="ps-rating productRating" data-read-only="true">

                                  </select>

                                <span>${ rating }</span>

                            </div>

                            ${ price }

                        </div>

                    </div>

                </div>

              `);

              // Clasificamos la cantidad de estrellas según la calificación
              let arrayRating = $(".productRating");

              for(let i = 0; i < arrayRating.length; i++) {

                for(let f = 1; f <= 5; f++) {

                  $(arrayRating[i]).append(`
                    <option value="2">${f}</option>
                  `);

                  if(rating == f) {
                    $(arrayRating[i]).children('option').val(1);
                  }

                }

              }

              // Ejecutar plugin de reseñas
              Rating.fnc();

              // Imprimimos los productos en el Vertical slider en el DOM
              $(`[category-sl='${arrayProducts[k].category}']`).append(`

                  <a href="product/${arrayProducts[k].url}">
                      <img src="assets/img/products/${arrayProducts[k].category}/vertical/${arrayProducts[k].vertical_slider}">
                  </a>
              
                `);
              // Ejecutar plugin de vertical slider ej: ejecuta cuando termine de cargar los 36 productos de las 6 categorias:
              preloadSV ++;

              if(preloadSV == (indexes + 1) * 6) {

                $(`[category-sl]`).addClass('ps-carousel--product-box');
                $(`[category-sl]`).addClass('owl-slider');
                $(`[category-sl]`).owlCarousel({

                  items: 1,
                  autoplay: true, 
                  autoplayTimeout: 7000,
                  loop: true,
                  nav: true,
                  margin: 0,
                  dots: true,
                  navSpeed: 500,
                  dotsSpeed: 500,
                  dragEndSpeed: 500,
                  navText: ["<i class='icon-chevron-left'></i>", "<i class='icon-chevron-right'></i>"]

                });

              }


            }

          }

        });

      });


    }



  }

}
