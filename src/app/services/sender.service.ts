import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreDocument, AngularFirestoreCollection } from '@angular/fire/firestore';
import { AngularFireStorage } from '@angular/fire/storage';
import { Observable, merge } from 'rxjs';
import { finalize, map } from 'rxjs/operators';
import { CookieService } from 'ngx-cookie-service';
import { MatSnackBar } from '@angular/material/snack-bar';

export interface Data {
    name: string,
    size: number,
    url: any
}

@Injectable({
  providedIn: 'root'
})
export class SenderService {

  private filesCollection: AngularFirestoreCollection<Data>;
  id: string;
  detailData: Data;
  fileList: Data[];

  constructor(
   private fstore: AngularFirestore,
   private storage: AngularFireStorage,
   private cookie: CookieService,
   private snackbar: MatSnackBar
  ) {}

  getChannelId() {
    return this.id;
  }

  setCookiesExpiredInHour(): Date {
    let date = new Date();
    let hour = date.getHours();
    date.setHours(hour + 8);
    return date;
  }

  createCollection() {
    this.id = this.fstore.createId();
  }

  async uploadFile(event) {
    this.snackbar.open('Uploading...');
    if(this.id === undefined || null) {
      await this.createCollection();
      this.cookie.set('CHNL_ID', this.id, await this.setCookiesExpiredInHour(), '/');
    }

    const file = event.target.files[0];
    const filePath: string = this.id + '/' + event.target.files[0].name;
    const fileRef = this.storage.ref(filePath);
    await this.storage.upload(filePath, file).then(() => {console.log('Upload Success')}, () => {console.log('Upload Failed')});

    let detailData: Data = {
        name: event.target.files[0].name,
        size: event.target.files[0].size,
        url: ''
    }
    this.uploadFileDetail(detailData);
  }

  async uploadFileDetail(detailData) {
    console.log('Pushing Detail Data...');
    /*this.fstore.collection('fashare').doc(this.id).set(detailData, {merge: false}).then(
      () => {console.log('Pushed')}, () => {console.log('Push Failed')}
    )*/
    await this.fstore.collection(this.id).add(detailData).then(
      (success) => {console.log('Pushed'); this.snackbar.open('Upload Success', '', {duration: 5000})},
      (failed) => {console.log('Push Failed'); this.snackbar.open('Upload Failed', '', {duration: 5000})}
    );
    this.readFileList();
  }

  readFileList() {
    this.fstore.collection<Data>(this.id).snapshotChanges().subscribe(data => {
      this.fileList = data.map(e => {
        return {
          id: e.payload.doc.id,
          ...e.payload.doc.data()
        } as Data;
      });
    });   
  }

}
