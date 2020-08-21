import { Component, OnInit } from '@angular/core';
import { Path } from '../../../config';
import { ActivatedRoute } from '@angular/router';
import { ProductsService } from '../../../services/products.service';



@Component({
  selector: 'app-call-to-action',
  templateUrl: './call-to-action.component.html',
  styleUrls: ['./call-to-action.component.css']
})
export class CallToActionComponent implements OnInit {

  path:string = Path.url;
  call_to_action:any[] = [];
  price:any[] = [];


  constructor(
    private activatedRoute: ActivatedRoute,
    private _productsService: ProductsService
  ) { }

  ngOnInit(): void {

    let param = this.activatedRoute.snapshot.params["param"];

    this._productsService.getFilterData("url", param).subscribe(resp => {

      for(let i in resp) {

        this.call_to_action.push(resp[i]);

      }

      // Recorremos 'call_to_action' para sacar prices con sus ofertas
      this.call_to_action.forEach(response => {
        
        let type;
        let value;
        let offer;

        
        if (response.offer != "") {
          
          // Si es disccount o fixed
          type = JSON.parse(response.offer)[0];
          value = JSON.parse(response.offer)[1];

          if (type == "Disccount") {

              offer = (response.price - (response.price * value / 100)).toFixed(2);

          }

          if (type == "Fixed") {

              offer = value;

          }

          this.price.push(`<span class="ps-product__price">
                            
                              <span>$${ offer }</span>

                              <del>$${ response.price }</del>
                    
                          </span>`);

        } else {
          
          this.price.push(`<span class="ps-product__price">
                            
                              <span>$${ response.price }</span>
                    
                            </span>`);

        }



      });

    });


  }

}
