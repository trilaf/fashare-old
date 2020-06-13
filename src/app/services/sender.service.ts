import { Injectable, ViewChild, ElementRef } from '@angular/core';
import { AngularFirestore, AngularFirestoreDocument, AngularFirestoreCollection } from '@angular/fire/firestore';
import { AngularFireStorage } from '@angular/fire/storage';
import { AngularFireFunctions } from '@angular/fire/functions';
import { Subscription } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { DisconnectDialogComponent } from '../dialog-data/disconnect-dialog/disconnect-dialog.component';
import { Router } from '@angular/router';
import { HttpClient, HttpRequest } from '@angular/common/http';
import { UploadingSnackbarComponent } from '../snackbar-data/uploading-snackbar/uploading-snackbar.component';
import { SnackbarService } from './snackbar.service';
import { Data, shortChannelID } from '../models/fashare-models';
import { CreateChannelDialogComponent } from '../dialog-data/create-channel-dialog/create-channel-dialog.component';
import { DialogService } from './dialog.service';
import { TextUploadDialogComponent } from '../dialog-data/text-upload-dialog/text-upload-dialog.component';

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
  isLoading: boolean = false;
  firestoreTask: Subscription;
  uploadTask: firebase.storage.UploadTask;

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
        if (!snapshot.empty) {
          snapshot.forEach(doc => {
            if (doc.get('name') === filename) {
              reject('file exists');
            } else {
              resolve();
            }
          });
        } else {
          resolve();
        }
      }, err => {
        reject(err);
      });
    });
  }

  checkShortID(shortID: string) {
    this.snackbar.open('Checking channel name...');
    this.fstore.firestore.collection('_shortID').doc(shortID).get().then(data => {
      if (data.get('id') === undefined) {
        this.snackbar.open('Creating channel...');
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
    const randomRealID = {
      id: this.fstore.createId(),
      createdAt: new Date().toJSON()
    };
    this.fstore.collection('_shortID').doc<shortChannelID>(shortID).set(randomRealID).then(() => {
      this.id = randomRealID.id;
      this.simpleChannelID = shortID;
      document.cookie = `CHNL_ID=${ this.id }; max-age=${ 3600 * 1000 }; path=/; samesite=None; secure`;
      document.cookie = `CHNL_NAME=${ encodeURIComponent(shortID) }; max-age=${ 3600 * 1000 }; path=/; samesite=None; secure`;
      this.isCookieExist = true;
      this.snackbar.open('Channel successfully created', 'X', {duration: 5000});
    }, err => {
      this.snackbar.open(`Failed creating channel`, 'X', {duration: 5000});
      console.log(`Failed create channel: ${err}`);
    });
  }

  checkCookie() {
    if (this.cookie.check('CHNL_ID') === true) {
      this.isCookieExist = true;
    } else {
      this.isCookieExist = false;
    }
  }

  setCookiesExpiredInHour(): Date {
    const date = new Date();
    const hour = date.getHours();
    date.setHours(hour + 1);
    return date;
  }

  createCollection() {
    this.id = this.fstore.createId();
  }

  cancelUpload() {
    this.uploadTask.cancel();
    this.isUploading = false;
    this.snackbar.open('Upload canceled', 'X', {duration: 5000});
  }

  async uploadFile(event) {
    if (event.target.files.length === 0) {
      return;
    }
    let downloadURL;
    let isFileExist: boolean = false;
    this.isUploading = true;
    for (const files of this.fileList) {
      if (files.name === event.target.files[0].name) {
        isFileExist = true;
        this.isUploading = false;
        this.snackbar.open('File already exists', 'X', {duration: 5000});
        break;
      }
    }
    /* await this.checkFileExist(event.target.files[0].name).catch(err => {
      this.isUploading = false;
      isFileExist = true;
      console.log(err);
      if(err == 'file exists') {
        this.snackbar.open('File already exists', 'X', {duration: 5000});
      } else {
        this.snackbar.open('Upload Failed', 'X', {duration: 5000});
      }
      return;
    }); */
    if (isFileExist) {
      return true;
    }

    const file = event.target.files[0];
    const fileRef = this.storage.storage.ref(this.id).child(event.target.files[0].name);
    this.uploadTask = fileRef.put(file);
    this.snackbar.openFromComponent(UploadingSnackbarComponent);
    this.uploadTask.on('state_changed',
    progress => {
      this.snackbarServ.percentResult = ((progress.bytesTransferred / progress.totalBytes) * 100).toFixed(1);
    },
    err => {
      console.log(`Upload Failed (errorput): ${err.message}`);
      this.isUploading = false;
      this.uploadTask.cancel();
    },
    async () => {
      await fileRef.getDownloadURL().then(urlDL => {
        downloadURL = urlDL;
        const detailData = {
          name: event.target.files[0].name,
          size: event.target.files[0].size,
          url: downloadURL,
          type: event.target.files[0].type
        };
        this.uploadFileDetail(detailData);
      }, err => {
        console.log(`Upload Failed (filedetail): ${err}`);
        this.isUploading = false;
        this.snackbar.open(`Upload Failed`, 'X', {duration: 5000});
      });
    });
  }

  async uploadFileDetail(detailData) {
    await this.fstore.collection<Data>(this.id).add(detailData).then(
      () => {
        this.snackbar.open('Upload Success', 'X', {duration: 5000});
        this.isUploading = false;
      }, err => {
        console.log('Push Failed : ' + err);
        this.snackbar.open('Upload Failed', 'X', {duration: 5000});
        this.isUploading = false;
      }
    ).catch(
      err => {
        console.log(`Failed: ${err}`);
        this.isUploading = false;
      }
    );
    this.readFileList();
  }

  readFileList(type?: string) {
    this.firestoreTask = this.fstore.collection<Data>(this.id).snapshotChanges().subscribe(data => {
      this.fileList = data.filter(contentType => {
        const checkDefault = (this.cookie.get('CHNL_DFLT') === 'text') ?
          contentType.payload.doc.data().contentType === 'text' : contentType.payload.doc.data().contentType !== 'text';
        return checkDefault;
      }).map(e => {
        return {
          id: e.payload.doc.id,
          ...e.payload.doc.data()
        } as Data;
      });
      if (type === 'check') {
        this.snackbar.open('Session Loaded', 'X', {duration: 5000});
        type = '';
        this.isLoading = false;
      }
    }, err => {
      this.snackbar.open(`Failed sync file list`, 'X');
    });
  }

  disconnectChannel(type?: string) {
    this.snackbar.open('Disconnecting...');
    this.isLoading = true;
    if (this.fileList.length === 0) {
      this.deleteCollectionAtPath('_shortID/' + this.simpleChannelID, 'direct', 'nofile').then(() => {
        this.isLoading = false;
        this.snackbar.open('Disconnected', 'X', {duration: 5000});
      }).catch(err => {
        console.log(err);
        this.isLoading = false;
        this.snackbar.open('Failed disconnecting', 'X');
      });
    } else if (type === 'text') {
      console.log('Disconnect type text');
      this.deleteCollectionAtPath(this.id, 'direct').then(() => {
        this.deleteCollectionAtPath('_shortID/' + this.simpleChannelID, 'direct', 'done').then(() => {
          this.isLoading = false;
          this.snackbar.open('Disconnected', 'X', {duration: 5000});
        }).catch(err => {
          console.log(err);
          this.isLoading = false;
          this.snackbar.open('Failed disconnecting', 'X');
        });
      });
    } else {
      this.deleteFileStorage()
      .then(() => {
        this.deleteCollectionAtPath(this.id, 'direct').then(() => {
          this.deleteCollectionAtPath('_shortID/' + this.simpleChannelID, 'direct', 'done').then(() => {
            this.isLoading = false;
            this.snackbar.open('Disconnected', 'X', {duration: 5000});
          }).catch(err => {
            console.log(err);
            this.isLoading = false;
            this.snackbar.open('Failed disconnecting', 'X');
          });
        }).catch(err => {
          console.log(err);
          this.isLoading = false;
          this.snackbar.open(`Failed disconnecting`, 'X');
        });
      })
      .catch(err => {
        console.log(err);
        this.isLoading = false;
        this.snackbar.open(`Failed disconnecting`, 'X');
      });
    }
  }

  cleanUpData(type?: string) {
    if (type === 'done') {
      this.id = undefined;
      if (this.firestoreTask !== undefined) {
        this.firestoreTask.unsubscribe();
      }
      this.fileList = [];
      document.cookie = `CHNL_ID=""; max-age=-1`;
      document.cookie = `CHNL_NAME=""; max-age=-1`;
      /* this.cookie.delete('CHNL_ID', '/', window.location.hostname);
      this.cookie.delete('CHNL_NAME', '/', window.location.hostname); */
      this.isCookieExist = false;
    } else if (type === 'nofile') {
      this.id = undefined;
      document.cookie = `CHNL_ID=""; max-age=-1`;
      document.cookie = `CHNL_NAME=""; max-age=-1`;
      /* this.cookie.delete('CHNL_ID', '/', window.location.hostname);
      this.cookie.delete('CHNL_NAME', '/', window.location.hostname); */
      this.isCookieExist = false;
    }
  }

  openDisconnectDialog() {
    if (this.fileList.length === 0) {
      this.disconnectChannel();
    } else {
      const dialogRef = this.dialog.open(DisconnectDialogComponent, {
        data: {
          chnlType: this.cookie.get('CHNL_DFLT')
        }
      });
      dialogRef.afterClosed().subscribe(result => {
        if (result === true) {
          this.disconnectChannel((this.cookie.get('CHNL_DFLT') === 'text') ? 'text' : '');
        }
      });
    }
  }

  openCreateChannelDialog() {
    const dialogRef = this.dialog.open(CreateChannelDialogComponent);
    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.checkShortID(this.dialogServ.newChannelName);
      }
    });
  }

  openTextUploadDialog() {
    const dialogRef = this.dialog.open(TextUploadDialogComponent);
    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.uploadText(this.dialogServ.textForUpload);
      }
    });
  }

  deleteSingleFile(fileId: string, fileName: string, index) {
    this.snackbar.open(`Deleting : ${fileName}`);
    this.deleteFileStorage('single', fileName).then(() => {
      this.deleteCollectionAtPath(this.id + '/' + fileId, 'direct', 'single').then(res => {
        this.fileList.splice(index, 1);
        this.snackbar.open(res, 'X', {duration: 5000});
        console.log(this.fileList);
      }).catch(err => {
        console.log(err);
        this.snackbar.open('Failed deleting file', 'X', {duration: 5000});
      });
    }).catch(() => {
      this.deleteCollectionAtPath(this.id + '/' + fileId, 'direct', 'single').then(res => {
        this.fileList.splice(index, 1);
        this.snackbar.open(res, 'X', {duration: 5000});
        console.log(this.fileList);
      }).catch(err => {
        console.log(err);
        this.snackbar.open('Failed deleting file', 'X', {duration: 5000});
      });
    });
  }

  deleteCollectionAtPath(paths, types, cleanUpType?: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const deleteFn = this.functions.functions.httpsCallable('recursiveDelete');
      deleteFn({path: paths, type: types})
        .then(() => {
          if (cleanUpType === 'single') {
            resolve('File deleted');
          } else if (cleanUpType === 'text') {
            resolve('Text deleted');
          } else {
            resolve(this.cleanUpData(cleanUpType));
          }
        })
        .catch(err => {
          reject(err);
        });
    });
  }

  deleteFileStorage(requestType?: string, fileName?: string): Promise<any> {
    return new Promise((resolve, reject) => {
      if (requestType === 'single') {
        this.storage.storage.ref(this.id).child(fileName).delete().then(() => {
          resolve();
        }).catch(err => reject(err));
      } else {
        for (const files of this.fileList) {
          this.storage.storage.ref(this.id).child(files.name).delete().then(() => {
            console.log(`Deleted: ${files.name}`);
            this.fileList.splice(0, 1);
          }).catch(err => reject(err));
        }
        resolve();
      }
    });
  }

  uploadText(text) {
    this.snackbar.open('Uploading text...');
    const data = {
      contentType: 'text',
      theText: text
    };
    this.fstore.collection(this.id).add(data).then(() => {
      this.readFileList();
      this.snackbar.open('Text uploaded', 'OK', {duration: 5000});
    }).catch(err => {
      this.snackbar.open('Failed uploading text', 'OK');
    });
  }

  deleteText(textID: string, index) {
    this.snackbar.open('Deleting...');
    this.deleteCollectionAtPath(this.id + '/' + textID, 'direct', 'text').then(res => {
      this.fileList.splice(index, 1);
      this.snackbar.open(res, 'X', {duration: 5000});
    }).catch(err => {
      console.log(err);
      this.snackbar.open('Failed deleting text', 'X');
    });
  }

}
