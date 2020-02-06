import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreDocument, AngularFirestoreCollection } from '@angular/fire/firestore';
import { AngularFireStorage } from '@angular/fire/storage';
import { Observable, merge } from 'rxjs';
import { finalize, map, last } from 'rxjs/operators';
import { CookieService } from 'ngx-cookie-service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { DisconnectDialog } from '../dialog-data/disconnect-dialog/disconnect-dialog.component';
import { Router } from '@angular/router';
import { HttpClient, HttpRequest } from '@angular/common/http';
import * as firebase from 'firebase';

export interface Data {
    name: string,
    size: number,
    url: any
}

export interface fileList {
  fileList: any;
}

@Injectable({
  providedIn: 'root'
})
export class SenderService {

  private filesCollection: AngularFirestoreCollection<Data>;
  id: string;
  detailData: Data;
  fileList:Data[];
  isCookieExist: boolean;

  constructor(
   private fstore: AngularFirestore,
   private storage: AngularFireStorage,
   private cookie: CookieService,
   private snackbar: MatSnackBar,
   private dialog: MatDialog,
   private router: Router,
   private http: HttpClient
  ) {}

  getChannelId() {
    return this.id;
  }

  testCloudFunctions() {
    let url = 'https://us-central1-fashare-trilaf.cloudfunctions.net/helloWorld';
    this.http.post(url, '').toPromise().then(res => {
      console.log(res);
    }).catch(err => {
      console.log(err);
    });
  }

  checkCookie() {
    if(this.cookie.check('CHNL_ID') == true) {this.isCookieExist = true}
    else {this.isCookieExist = false}
  }

  setCookiesExpiredInHour(): Date {
    let date = new Date();
    let hour = date.getHours();
    date.setHours(hour + 1);
    return date;
  }

  createCollection() {
    this.id = this.fstore.createId();
  }

  checkFileList() {
    console.log(this.fileList);
  }

  async uploadFile(event) {
    this.snackbar.open('Uploading...');
    if(this.id === undefined || null) {
      await this.createCollection();
      this.cookie.set('CHNL_ID', this.id, await this.setCookiesExpiredInHour(), '/');
      this.isCookieExist = true;
    }

    const file = event.target.files[0];
    const filePath: string = this.id + '/' + event.target.files[0].name;
    const fileRef = this.storage.ref(filePath);
    await this.storage.upload(filePath, file).then(() => {console.log('Upload Success')}, () => {console.log('Upload Failed')});

    let detailData = {
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
    await this.fstore.collection<Data>(this.id).add(detailData).then(
      (success) => {
        console.log('Pushed'); 
        this.snackbar.open('Upload Success', 'OK', {duration: 5000});
        if((this.fileList.length == 0) || (this.fileList === undefined || null)) {
          this.deleteCollectionAtPath(this.id, 'auto');
        }
      }
    ).catch(
      (failed) => {console.log('Push Failed'); this.snackbar.open('Upload Failed', 'OK', {duration: 5000})}
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

  async disconnectChannel() {
    this.snackbar.open('Disconnecting...', '');
    await this.deleteCollectionAtPath(this.id, 'direct')
    this.id = undefined;
    this.fileList = undefined;
    this.isCookieExist = false;
    this.cookie.delete('CHNL_ID');
  }

  openDisconnectDialog() {
    const dialogRef = this.dialog.open(DisconnectDialog);
    dialogRef.afterClosed().subscribe(result => {
      if(result == true) {
        this.disconnectChannel(); 
        //this.router.navigate(['']);
      }
    })
  }

  deleteCollectionAtPath(path, type) {
    var deleteFn = firebase.functions().httpsCallable('recursiveDelete')
    deleteFn({path: path, type: type})
      .then(() => {
        if(type == 'direct') {
          this.snackbar.open('Disconnected', 'OK', {duration: 5000});
        }
      })
      .catch(() => {
        if(type == 'direct') {
          this.snackbar.open('Failed to Disconnect', 'OK', {duration: 5000});
        }
      })
  }

}
