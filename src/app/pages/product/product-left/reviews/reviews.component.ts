import { Component, OnInit, Input } from '@angular/core';
import { Path } from '../../../../config';
import { DinamicRating, DinamicReviews, Rating } from '../../../../functions';

declare var jQuery: any;
declare var $: any;

@Component({
  selector: 'app-reviews',
  templateUrl: './reviews.component.html',
  styleUrls: ['./reviews.component.css']
})
export class ReviewsComponent implements OnInit {

  // Contiene datos que paso desde el producto del componente padre (product left)
  @Input() childItem: any;  

  path:string = Path.url;
  rating:any[] = [];
  totalReviews:string;
  itemReviews:any[] = [];
  render:boolean = true;


  constructor() { }

  ngOnInit(): void {

    // Rating
    this.rating.push(DinamicRating.fnc(this.childItem));
    
    // Reviews
    let reviews = [];

    reviews.push(DinamicReviews.fnc(this.rating[0]));

    // Menor a 5 porque son 5 estrellas
    for(let i = 0; i < 5; i++) {

      $(".reviewsOption").append(`
      <option value="${reviews[0][i]}">${ i + 1 }</option>
      `);

    }

    Rating.fnc();

    // total Reviews
    this.totalReviews = JSON.parse(this.childItem["reviews"]).length;

    // Bloques de Estrellas
    // Necesitamos un array vacio para almacenar los reviews
    let arrayReview = [];
    //recorremos el campo reviews del producto en 'childItem'
    JSON.parse(this.childItem["reviews"]).forEach(resp => {

      arrayReview.push(resp.review);

    });
    //Ordenamos de menor a mayor
    arrayReview.sort();

    let objectStar = {
      "1": 0,
      "2": 0,
      "3": 0,
      "4": 0,
      "5": 0
    };

    // Identificamos que valores se repiten y cuales no se repiten en 'arrayReview'
    arrayReview.forEach((value, index, array) => {

      // Tomamos del array completo el primer indice de cada valor
      let first_index = array.indexOf(value);
      // Tomanos del array completo el ultimo indice de cada valor
      let last_index = array.lastIndexOf(value);

      // Comparamos si tanto el primer indice como el ultimo indice del mismo valor son diferentes. 
      // Si es diferente significa que se repite varias veces, si son iguales significa que nunca se repite
      if(first_index !== last_index) {
        //Incrementamos valores que se repiten en 'objectStar'
        objectStar[value] = objectStar[value] + 1;

      } else {
       //Incrementamos valores que no se repiten en 'objectStar'
        objectStar[value] = objectStar[value] + 1;

      }

    });
    // Hacemos un recorrido por cada uno de los renglones de 'objectStar'
    for(let i = 5; i > 0; i--) {

      // Sacamos el porcentaje con la regla de 3
      let starPercentage = Math.round((objectStar[i] * 100) / arrayReview.length);

      $(".ps-block--average-rating").append(`
        <div class="ps-block__star">

          <span>${ i } Star</span>

          <div class="ps-progress" data-value="${ starPercentage }">

              <span></span>

          </div>

          <span>${ starPercentage }%</span>

        </div>

      `);

    }
    // Enviamos a la vista las reseñas del producto
    this.itemReviews.push(JSON.parse(this.childItem["reviews"]));


  }

  callback() {

    if(this.render) {

      this.render = false;

      let reviews =  $("[reviews]");

      for(let i = 0; i < reviews.length; i ++) {

        // Menor a 5 porque son 5 estrellas
        for(let r = 0; r < 5; r ++) {

          $(reviews[i]).append(`

            <option value="2">
                
                ${ r + 1 }
            
            </option>

          `);

          if( $(reviews[i]).attr("reviews") == (r + 1)) {

            $(reviews[i]).children("option").val(1) 

          }
    
        }
        
      }

      Rating.fnc();

    }


  }

}
