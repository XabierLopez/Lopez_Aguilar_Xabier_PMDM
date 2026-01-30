import { Component } from '@angular/core';
import { CuestionarioService } from './../servicios/cuestionario.service';
import { IPregunta } from './../interfaces/interfaces';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage {
  galderak:IPregunta[]= [];
  //Importar servicio
  constructor(private cuestionarioService: CuestionarioService) { // inject ere balioko zuen
   
  }

  //Crear método para gestionar el onclick de RESPONDER
  //Recibirá un IPregunta y llamará al servicio para realizar las operaciones necesarias.
  erantzunAlerta(erantzuna: IPregunta) {
    this.cuestionarioService.erantzunAlerta(erantzuna);
  }

  //Crear método para gestionar el onclick de Guardar
  //No recibe parámetros y llamará al servicio para realizar las operaciones necesarias.
  galdetegiaGorde() {
    this.cuestionarioService.galderakStoragenGorde();
  }
  async ngOnInit() {
    await this.cuestionarioService.galderakKargatu();
    this.cuestionarioService.getGalderak().subscribe(galderak => {
      this.galderak = galderak;
    });
    console.log(this.galderak);
  }

}
