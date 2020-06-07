import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Data } from '../models/fashare-models';
import { MatDialog } from '@angular/material/dialog';
import { ConnectChannelDialogComponent } from '../dialog-data/connect-channel-dialog/connect-channel-dialog.component';
import { DialogService } from './dialog.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subscription } from 'rxjs';
import { HttpClient } from 'selenium-webdriver/http';
import { FileSaverService } from 'ngx-filesaver';
import { PreviewDialogComponent } from '../dialog-data/preview-dialog/preview-dialog.component';
import { DomSanitizer } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root'
})
export class ReceiverService {

  // shortID = Channel Name

  idChannel: string;
  isConnected: boolean;
  isLoading: boolean;
  fileList: Data[] = [];
  dataSubscription: Subscription;
  channelSubscription: Subscription;

  constructor(
    private fstore: AngularFirestore,
    private dialog: MatDialog,
    private dialogServ: DialogService,
    private snackbar: MatSnackBar,
    private filesaver: FileSaverService,
    private sanitizer: DomSanitizer
  ) { }

  openDialogInsertChannelID() {
    const dialogRef = this.dialog.open(ConnectChannelDialogComponent);
    dialogRef.afterClosed().subscribe(res => {
      if (res === true) {
        this.getRealChannelID(this.dialogServ.idChannel);
      }
    });
  }

  async isChannelExists(idCH): Promise<boolean> {
    let isExists: boolean;
    await this.fstore.firestore.collection(idCH).get().then(doc => {
      if (doc.empty) {
        isExists = false;
      } else {
        isExists = true;
      }
    });
    return isExists;
  }

  getRealChannelID(shortID: string) {
    let realChannelID;
    this.isLoading = true;
    this.snackbar.open('Connecting...');
    this.fstore.firestore.collection('_shortID').doc(shortID).get().then(data => {
      if (data.get('id') === undefined) {
        this.snackbar.open('Channel Not Found', 'OK', {duration: 5000});
        this.isLoading = false;
      } else {
        this.snackbar.open('Connected', 'OK', {duration: 5000});
        this.isConnected = true;
        this.isLoading = false;
        this.idChannel = shortID;
        realChannelID = data.get('id');
        this.getFileList(realChannelID, 'connect');
        this.channelListener(shortID);
        document.cookie = 'RCVR=1; path=/; samesite=none; secure';
      }
    }).catch(err => {
      this.isLoading = false;
      this.snackbar.open(`Failed to connect channel`, 'X');
    });
  }

  getFileList(idCH: string, type?: string) {
    this.snackbar.open('Fetching list of data....');
    this.dataSubscription = this.fstore.collection<Data>(idCH).snapshotChanges().subscribe(data => {
      this.fileList = data.map(e => {
        return {
          id: e.payload.doc.id,
          ...e.payload.doc.data()
        } as Data;
      });
      if (type === 'connect') {
        this.snackbar.open('Successfully fetched', 'OK', {duration: 5000});
        type = '';
      }
    }, err => {
      console.log(`Error: ${err}`);
      this.snackbar.open('Failed to fetch data', 'OK', {duration: 5000});
    });
  }

  disconnectChannel(type?: string) {
    if (type !== 'endedByHost') {
      this.snackbar.open('Disconnecting...');
    }
    this.idChannel = '';
    this.isConnected = false;
    this.fileList = [];
    this.dataSubscription.unsubscribe();
    this.channelSubscription.unsubscribe();
    document.cookie = `RCVR=""; max-age=-1`;
    if (type === 'endedByHost') {
      this.snackbar.open('Channel ended by host', 'OK', {duration: 5000});
    } else {
      this.snackbar.open('Disconnected', 'OK', {duration: 5000});
    }
  }

  channelListener(shortID) {
    this.channelSubscription = this.fstore.collection('_shortID').doc(shortID).snapshotChanges().subscribe(snapshot => {
      if (snapshot.payload.get('id') === undefined) {
        this.disconnectChannel('endedByHost');
      }
    });
  }

  directDownload(url, fileName?: string, fileType?: string) {
    /* const fileBlob = new Blob([new Uint8Array(url)], { type: fileType });
    this.filesaver.save(fileBlob, fileName); */
    this.getFile(url).then(res => {
      this.filesaver.save(res, fileName);
    }).catch(err => {
      console.log(err);
    });
  }

  getFile(url): Promise<any> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', url);
      xhr.responseType = 'blob';
      xhr.onreadystatechange = (e) => {
        console.log(xhr.readyState);
        if (xhr.readyState === 3) {
          if (xhr.status === 200) {
            resolve(xhr.response);
          } else {
            reject(new Error(`Error (${xhr.status}):`));
          }
        }
      };
      xhr.send();
    });
  }

  getIconForButtonPreview(fileType: string) {
    if (fileType.match(/(?=audio)\w+/g) || fileType.match(/(?=video)\w+/g)) {
      return 'play_arrow';
    } else {
      return 'remove_red_eye';
    }
  }

  setHrefButtonPreview(fileType: string, fileUrl: string) { // Not Used
    if (fileType.match(/(?=audio)\w+/g) || fileType.match(/(?=video)\w+/g)) {
      return this.sanitizer.bypassSecurityTrustUrl('javascript:');
    } else {
      return fileUrl;
    }
  }

  setTargetButtonPreview(fileType: string) { // Not Used
    if (fileType.match(/(?=audio)\w+/g) || fileType.match(/(?=video)\w+/g)) {
      return '';
    } else {
      return '_blank';
    }
  }

  openPlayDialog(fileType: string, fileName, fileUrl) {
    if (fileType.match(/(?=audio|image|video)\w+/g)) {
      let type;
      if (fileType.match(/(?=audio)\w+/g)) {
        type = 'audio';
      } else if (fileType.match(/(?=video)\w+/g)) {
        type = 'video';
      } else if (fileType.match(/(?=image)\w+/g)) {
        type = 'image';
      }
      this.dialog.open(PreviewDialogComponent, {
        data: {
          name: fileName,
          url: fileUrl,
          type: type as string
        }
      });
    } else {
      return;
    }
  }

  displayPreviewButton(fileType: string): boolean {
    if (fileType.match(/(?=audio|video|text|image)\w+/g)) {
      return true;
    } else {
      return false;
    }
  }

  displayDownloadButton(fileType: string): boolean {
    if (fileType.match(/(?=image)\w+/g)) {
      return false;
    } else {
      return true;
    }
  }

}
