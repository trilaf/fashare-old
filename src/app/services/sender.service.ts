import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreDocument, AngularFirestoreCollection } from '@angular/fire/firestore';
import { AngularFireStorage } from '@angular/fire/storage';
import { AngularFireFunctions } from '@angular/fire/functions';
import { Observable, merge } from 'rxjs';
import { finalize, map, last } from 'rxjs/operators';
import { CookieService } from 'ngx-cookie-service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { DisconnectDialog } from '../dialog-data/disconnect-dialog/disconnect-dialog.component';
import { Router } from '@angular/router';
import { HttpClient, HttpRequest } from '@angular/common/http';
import { UploadingSnackbar } from '../snackbar-data/uploading-snackbar/uploading-snackbar.component';
import { SnackbarService } from './snackbar.service';

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
  fileList: Data[] = [];
  isCookieExist: boolean;
  percentResult = '0';
  isUploading: boolean = false;

  constructor(
   private fstore: AngularFirestore,
   private storage: AngularFireStorage,
   private cookie: CookieService,
   private snackbar: MatSnackBar,
   private dialog: MatDialog,
   private router: Router,
   private http: HttpClient,
   private functions: AngularFireFunctions,
   private snackbarServ: SnackbarService
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

  async uploadFile(event) {
    let downloadURL;
    this.isUploading = true;

    this.snackbar.openFromComponent(UploadingSnackbar);
    if(this.id === undefined || null) {
      await this.createCollection();
      this.cookie.set('CHNL_ID', this.id, 3650, '/');
      this.isCookieExist = true;
    }

    const file = event.target.files[0];
    const fileRef = this.storage.storage.ref(this.id).child(event.target.files[0].name);
    await fileRef.put(file)
    .on('state_changed', 
    progress => {
      this.snackbarServ.percentResult = ((progress.bytesTransferred / progress.totalBytes) * 100).toFixed(1);
    }, 
    err => {console.log(`Upload Failed: ${err}`); this.isUploading = false;},
    async () => {
      await fileRef.getDownloadURL().then(urlDL => {
        downloadURL = urlDL;
        let detailData = {
          name: event.target.files[0].name,
          size: event.target.files[0].size,
          url: downloadURL
        }
      this.uploadFileDetail(detailData);
      }, err => {console.log(`Upload Failed: ${err}`); this.isUploading = false;})
    })
  }

  async uploadFileDetail(detailData) {
    await this.fstore.collection<Data>(this.id).add(detailData).then(
      () => {
        this.snackbar.open('Upload Success', 'OK', {duration: 5000});
        this.isUploading = false;
      }, err => {console.log('Push Failed : ' + err); this.snackbar.open('Upload Failed', 'OK', {duration: 5000}); this.isUploading = false;}
    ).catch(
      err => {console.log(`Failed: ${err}`); this.isUploading = false;}
    );
    this.readFileList();
  }

  readFileList(type?: string) {
    this.fstore.collection<Data>(this.id).snapshotChanges().subscribe(data => {
      this.fileList = data.map(e => {
        return {
          id: e.payload.doc.id,
          ...e.payload.doc.data()
        } as Data;
      });
      if(type === 'check') {
        this.snackbar.open('Session Loaded', 'OK', {duration: 5000});
        type = '';
        this.isUploading = false;
      }
    });
  }

  disconnectChannel() {
    this.snackbar.open('Disconnecting...', '');
    this.deleteFileStorage()
    .then(() => {this.deleteCollectionAtPath(this.id, 'direct')})
    .catch(err => {
      console.log(err);
      this.snackbar.open(`Failed: ${err}`, 'CLOSE');
    });
  }

  cleanUpData() {
    console.log('Cleaning Up Data...');
    this.id = undefined;
    this.fileList = [];
    this.isCookieExist = false;
    this.cookie.delete('CHNL_ID');
    console.log('Cleaning Done');
  }

  openDisconnectDialog() {
    const dialogRef = this.dialog.open(DisconnectDialog);
    dialogRef.afterClosed().subscribe(result => {
      if(result == true) {
        this.disconnectChannel(); 
      }
    })
  }

  deleteCollectionAtPath(path, type) {
    var deleteFn = this.functions.functions.httpsCallable('recursiveDelete');
    deleteFn({path: path, type: type})
      .then(() => {
        if(type == 'direct') {
          this.snackbar.open('Disconnected', 'OK', {duration: 5000});
        }
        this.cleanUpData();
      })
      .catch(() => {
        if(type == 'direct') {
          this.snackbar.open('Failed to Disconnect', 'OK', {duration: 5000});
        }
      })
  }

  deleteFileStorage(): Promise<any> {
    return new Promise((resolve, reject) => {
      for(let i = 0; i < this.fileList.length; i++) {
        this.storage.storage.ref(this.id).child(this.fileList[i].name).delete().then(() => {
          console.log(`Deleted: ${this.fileList[i].name}`);
          this.fileList.splice(0, 1);
        }).catch(err => reject(err));
      }
      resolve();
    });
  }

}
