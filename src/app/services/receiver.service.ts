import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Data } from '../models/fashare-models';
import { MatDialog } from '@angular/material/dialog';
import { ConnectChannelDialog } from '../dialog-data/connect-channel-dialog/connect-channel-dialog.component';
import { DialogService } from './dialog.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReceiverService {

  idChannel: string;
  isConnected: boolean;
  fileList: Data[] = [];
  dataSubscription: Subscription;
  channelSubscription: Subscription;

  constructor(
    private fstore: AngularFirestore,
    private dialog: MatDialog,
    private dialogServ: DialogService,
    private snackbar: MatSnackBar
  ) { }

  openDialogInsertChannelID() {
    const dialogRef = this.dialog.open(ConnectChannelDialog);
    dialogRef.afterClosed().subscribe(res => {
      if(res == true) {
        this.getRealChannelID(this.dialogServ.idChannel);
      }
    })
  }

  async isChannelExists(idCH): Promise<boolean> {
    let isExists: boolean;
    await this.fstore.firestore.collection(idCH).get().then(doc => {
      if(doc.empty) {
        isExists = false;
      } else {
        isExists = true;
      }
    });
    return isExists;
  }

  getRealChannelID(shortID: string) {
    let realChannelID;
    this.snackbar.open('Connecting...');
    this.fstore.firestore.collection('_shortID').doc(shortID).get().then(data => {
      if(data.get('id') == undefined) {
        this.snackbar.open('Channel Not Found', 'OK', {duration: 5000});
      } else {
        this.snackbar.open('Connected', 'OK', {duration: 5000});
        realChannelID = data.get('id');
        this.getFileList(realChannelID, shortID, 'connect');
        this.channelListener(shortID);
      }
    });
  }

  getFileList(idCH: string, shortID: string, type?: string) {
    this.snackbar.open('Fetching list of data....');
    this.dataSubscription = this.fstore.collection<Data>(idCH).snapshotChanges().subscribe(data => {
      this.fileList = data.map(e => {
        return {
          id: e.payload.doc.id,
          ...e.payload.doc.data()
        } as Data;
      });
      if(type == 'connect') {
        this.idChannel = shortID;
        this.isConnected = true;
        this.snackbar.open('Successfully fetched', 'OK', {duration: 5000});
        type = '';
      }
    }, err => {
      console.log(`Error: ${err}`);
      this.snackbar.open('Failed to fetch data', 'OK', {duration: 5000});
    });
  }

  disconnectChannel(type?: string) {
    if(type !== 'endedByHost') {
      this.snackbar.open('Disconnecting...');
    }
    this.idChannel = '';
    this.isConnected = false;
    this.fileList = [];
    this.dataSubscription.unsubscribe();
    this.channelSubscription.unsubscribe();
    if(type == 'endedByHost') {
      this.snackbar.open('Channel ended by host', 'OK', {duration: 5000});
    } else {
      this.snackbar.open('Disconnected', 'OK', {duration: 5000});
    }
  }

  channelListener(shortID) {
    this.channelSubscription = this.fstore.collection('_shortID').doc(shortID).snapshotChanges().subscribe(snapshot => {
      if(snapshot.payload.get('id') == undefined) {
        this.disconnectChannel('endedByHost');
      }
    })
  }

  directDownload(url) {
    var xhr = new XMLHttpRequest();
    xhr.responseType = 'blob';
    xhr.onload = function(event) {
      var blob = xhr.response;
    };
    xhr.open('GET', url);
    xhr.setRequestHeader('Access-Control-Allow-Origin', 'a44d163f-0be4-47bd-82fd-dddeff354e10')
    xhr.send();
  }

}
