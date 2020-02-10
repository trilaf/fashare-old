import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Data } from '../models/fashare-models';

@Injectable({
  providedIn: 'root'
})
export class ReceiverService {

  id: string;
  fileList: Data[] = [];

  constructor(
    private fstore: AngularFirestore
  ) { }

  connectChannel() {
    this.fstore
  }

}
