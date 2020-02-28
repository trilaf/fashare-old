import { Injectable, ViewChild, ElementRef } from '@angular/core';
import { AngularFirestore, AngularFirestoreDocument, AngularFirestoreCollection } from '@angular/fire/firestore';
import { AngularFireStorage } from '@angular/fire/storage';
import { AngularFireFunctions } from '@angular/fire/functions';
import { Subscription } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { DisconnectDialog } from '../dialog-data/disconnect-dialog/disconnect-dialog.component';
import { Router } from '@angular/router';
import { HttpClient, HttpRequest } from '@angular/common/http';
import { UploadingSnackbar } from '../snackbar-data/uploading-snackbar/uploading-snackbar.component';
import { SnackbarService } from './snackbar.service';
import { Data, shortChannelID } from '../models/fashare-models';
import { CreateChannelDialog } from '../dialog-data/create-channel-dialog/create-channel-dialog.component';
import { DialogService } from './dialog.service';

@Injectable({
  providedIn: 'root'
})
export class SenderService {

  private filesCollection: AngularFirestoreCollection<Data>;
  id: string;
  simpleChannelID: string;
  detailData: Data;
  fileList: Data[] = [];
  isCookieExist: boolean;
  percentResult = '0';
  isUploading: boolean = false;
  firestoreTask: Subscription

  constructor(
   private fstore: AngularFirestore,
   private storage: AngularFireStorage,
   private cookie: CookieService,
   private snackbar: MatSnackBar,
   private dialog: MatDialog,
   private router: Router,
   private http: HttpClient,
   private functions: AngularFireFunctions,
   private snackbarServ: SnackbarService,
   private dialogServ: DialogService
  ) {}

  getChannelId() {
    return this.id;
  }

  checkFileExist(filename): Promise<any> {
    return new Promise((resolve, reject) => {
      this.fstore.firestore.collection(this.id).where('name', '==', filename).get().then(snapshot => {
        if(!snapshot.empty) {
          snapshot.forEach(doc => {
            if(doc.get('name') == filename) reject();
            else resolve();
          });
        } else resolve();
      }, err => {
        console.log(err);
        reject();
      })
    });
  }

  checkShortID(shortID: string) {
    this.snackbar.open('Checking channel name...', '', {duration: 5000});
    this.fstore.firestore.collection('_shortID').doc(shortID).get().then(data => {
      if(data.get('id') == undefined) {
        this.snackbar.open('Creating channel...', '', {duration: 5000});
        this.writeShortID(shortID);
      } else {
        this.snackbar.open('Channel name is already taken', 'X', {duration: 5000});
      }
    }, err => {
      this.snackbar.open(`Failed checking channel name`, 'X', {duration: 5000});
      console.log(`Failed check channel: ${err}`);
    });
  }

  writeShortID(shortID: string) {
    let randomRealID = {
      'id': this.fstore.createId()
    };
    this.fstore.collection('_shortID').doc<shortChannelID>(shortID).set(randomRealID).then(() => {
      this.id = randomRealID.id;
      this.simpleChannelID = shortID;
      this.cookie.set('CHNL_ID', this.id, 3650, '/');
      this.cookie.set('CHNL_NAME', shortID, 3650, '/');
      this.isCookieExist = true;
      this.snackbar.open('Channel successfully created', 'X', {duration: 5000});
    }, err => {
      this.snackbar.open(`Failed creating channel`, 'X', {duration: 5000});
      console.log(`Failed create channel: ${err}`);
    })
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
    let isFileExist: boolean = false;
    this.isUploading = true;
    await this.checkFileExist(event.target.files[0].name).catch(err => {
      this.isUploading = false;
      isFileExist = true;
      this.snackbar.open('File already exists', 'X', {duration: 5000});
      return;
    });
    if(isFileExist) {
      return true;
    }

    this.snackbar.openFromComponent(UploadingSnackbar);

    const file = event.target.files[0];
    const fileRef = this.storage.storage.ref(this.id).child(event.target.files[0].name);
    await fileRef.put(file)
    .on('state_changed', 
    progress => {
      this.snackbarServ.percentResult = ((progress.bytesTransferred / progress.totalBytes) * 100).toFixed(1);
    }, 
    err => {console.log(`Upload Failed: ${err}`); this.isUploading = false; this.snackbar.open(`Upload Failed`, 'X', {duration: 5000})},
    async () => {
      await fileRef.getDownloadURL().then(urlDL => {
        downloadURL = urlDL;
        let detailData = {
          name: event.target.files[0].name,
          size: event.target.files[0].size,
          url: downloadURL
        }
      this.uploadFileDetail(detailData);
      }, err => {console.log(`Upload Failed: ${err}`); this.isUploading = false; this.snackbar.open(`Upload Failed`, 'X', {duration: 5000});})
    })
  }

  async uploadFileDetail(detailData) {
    await this.fstore.collection<Data>(this.id).add(detailData).then(
      () => {
        this.snackbar.open('Upload Success', 'X', {duration: 5000});
        this.isUploading = false;
      }, err => {console.log('Push Failed : ' + err); this.snackbar.open('Upload Failed', 'X', {duration: 5000}); this.isUploading = false;}
    ).catch(
      err => {console.log(`Failed: ${err}`); this.isUploading = false;}
    );
    this.readFileList();
  }

  readFileList(type?: string) {
    this.firestoreTask = this.fstore.collection<Data>(this.id).snapshotChanges().subscribe(data => {
      this.fileList = data.map(e => {
        return {
          id: e.payload.doc.id,
          ...e.payload.doc.data()
        } as Data;
      });
      if(type === 'check') {
        this.snackbar.open('Session Loaded', 'X', {duration: 5000});
        type = '';
        this.isUploading = false;
      }
    }, err => {
      this.snackbar.open(`Error: ${err}`, 'X');
    });
  }

  disconnectChannel() {
    this.snackbar.open('Disconnecting...', '', {duration: 5000});
    if(this.fileList.length === 0) {
      this.deleteCollectionAtPath('_shortID/' + this.simpleChannelID, 'direct', 'done');
    } else {
      this.deleteFileStorage()
      .then(() => {
        this.deleteCollectionAtPath(this.id, 'direct').then(() => {
          this.deleteCollectionAtPath('_shortID/' + this.simpleChannelID, 'direct', 'done');
        }).catch(err => {
          console.log(err);
          this.snackbar.open(`Failed: ${err}`, 'X');
        });
      })
      .catch(err => {
        console.log(err);
        this.snackbar.open(`Failed: ${err}`, 'X');
      });
    }
  }

  cleanUpData(type?: string) {
    if(type == 'done') {
      console.log('Cleaning Up Data...');
      this.id = undefined;
      if(this.firestoreTask != undefined) {
        this.firestoreTask.unsubscribe();
      }
      this.fileList = [];
      this.isCookieExist = false;
      this.cookie.delete('CHNL_ID');
      this.cookie.delete('CHNL_NAME');
      console.log('Cleaning Done');
    }
  }

  openDisconnectDialog() {
    const dialogRef = this.dialog.open(DisconnectDialog);
    dialogRef.afterClosed().subscribe(result => {
      if(result == true) {
        this.disconnectChannel(); 
      }
    })
  }

  openCreateChannelDialog() {
    const dialogRef = this.dialog.open(CreateChannelDialog);
    dialogRef.afterClosed().subscribe(result => {
      if(result == true) {
        this.checkShortID(this.dialogServ.newChannelName);
      }
    })
  }

  deleteCollectionAtPath(path, type, cleanUpType?): Promise<any> {
    return new Promise((resolve, reject) => {
      var deleteFn = this.functions.functions.httpsCallable('recursiveDelete');
      deleteFn({path: path, type: type})
        .then(() => {
          if(cleanUpType == 'done') {
            this.snackbar.open('Disconnected', 'X', {duration: 5000});
          }
          resolve(this.cleanUpData(cleanUpType));
        })
        .catch(err => {
          if(cleanUpType == 'done') {
            this.snackbar.open('Failed to Disconnect', 'X', {duration: 5000});
          }
          reject(err);
        })
    });
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
