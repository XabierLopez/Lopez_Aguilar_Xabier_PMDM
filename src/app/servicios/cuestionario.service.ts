import { HttpClient } from '@angular/common/http';
import { AlertController } from '@ionic/angular';
import { IPregunta } from './../interfaces/interfaces';
import { Observable, of } from 'rxjs';
import { GestionStorageService } from './gestion-storage.service';
import { Injectable, input } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CuestionarioService {
  // Array para almacenar todas las preguntas del json. Recordad inicializar el array para evitar problemas
  galderak: IPregunta[] = [];
  //Añadir los componentes y servicios que se necesitan
  constructor(private http: HttpClient, private gestionStorage: GestionStorageService, private alertController: AlertController) {
    //Cargar los datos
  }

  // Método que devolverá un array de IPregunta, es decir, todas las preguntas del cuestionario en un array
  getGalderak():Observable<IPregunta[]> { //honek galderak erakutsiko dituenez edozein lekutan, observablea asincronia kudeatzeko ondo. this.galderak berriz, soilik zerbitzu barneko propietatea da, ez da erakutsiko kanpoan, beraz ez da observable behar.
    return of(this.galderak);
  }

  // Recupera las preguntas de Storage. Si no hay ninguna almacenada, las lee del fichero
  // Controlar la asincronía.
  async galderakKargatu(){
    var galderakStorage=await this.gestionStorage.getObject('galderak');
    if(galderakStorage && galderakStorage.length>0){
      this.galderak=galderakStorage;
    }else{
      this.jsonetikIrakurriGalderak().subscribe(irakurritakoGalderak => {
      this.galderak = irakurritakoGalderak.map(galdera => ({
        ...galdera, // jsonean bai dauden propietateak kopiatu
        //besteak hutsik baina inizializatu behar dira, aukerazkoak ez direlako
        respuestasIncorrectas: [],
        intentos: 0,
        acierto: false
      }));

      this.galderakStoragenGorde();
      console.log('galderak jsonetik', this.galderak);
    });
    }
  }

  // Lee los datos de un fichero y los almacena en un array
  jsonetikIrakurriGalderak():Observable<IPregunta[]>{
    return this.http.get<IPregunta[]>('../../assets/datos/datos.json');
  }

  // Abre una alerta con el enunciado de la pregunta y comprueba la respuesta
  // 1- En función de si es correcta o no, actualiza el estado de acierto.
  // 2- Si no se acierta:
  // 2.1- Restará el valor de los intentos
  // 2.2- Guardará el valor añadido en el array respuestasIncorrectas

  async erantzunAlerta(galdera: IPregunta){
    const alert = await this.alertController.create({
      header: 'Zer markako logotipoa da hau?',
      inputs: [
        {
          name: 'erantzuna',
          type: 'text',
          label: 'Ortografiarekin kontuz'
        }
      ],
      buttons: [
        {
          text:'Bidali',
          handler: (data) => {
            const erantzuna = data.erantzuna?.trim(); // ? operadorearen bidez erantzuna hutsik badago null bueltatu eta trim ez egin, bestela errorea

            if (!erantzuna) {
              return false; // false bueltatzean alerta ez da itxiko
            }

            if (erantzuna.toLowerCase() === galdera.respuesta.toLowerCase()) {
              galdera.acierto = true;
            } else {
              galdera.intentos++;
              galdera.respuestasIncorrectas.push(erantzuna);
            }

          
            return true; // handlerrek jakiteko alerta itxi behar dela
          }
        }
      ]
    });

    await alert.present();
  }

  // Almacenar el array de preguntas en Storage
  galderakStoragenGorde(){
    this.gestionStorage.setObject('galderak', this.galderak);
  }
}
