import { Component, OnInit, Input } from '@angular/core';
import { StoreService } from '../../../../services/store.service';
import { Path } from '../../../../config';

@Component({
  selector: 'app-vendor-store',
  templateUrl: './vendor-store.component.html',
  styleUrls: ['./vendor-store.component.css']
})
export class VendorStoreComponent implements OnInit {

  // Contiene datos que paso desde el producto del componente padre (product left)
  @Input() childItem: any;  
  
  store:any[] = [];
  path:string = Path.url;

  constructor(
    private storeService: StoreService
  ) { }

  ngOnInit(): void {

    this.storeService.getFilterData("store", this.childItem).subscribe(resp => {
      
      for(let i in resp) {

        this.store.push(resp[i]);

      }


      
    });
    

  }

}
