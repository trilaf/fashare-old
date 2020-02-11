import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Data } from '../models/fashare-models';
import { MatDialog } from '@angular/material/dialog';
import { ConnectChannelDialog } from '../dialog-data/connect-channel-dialog/connect-channel-dialog.component';
import { DialogService } from './dialog.service';

@Injectable({
  providedIn: 'root'
})
export class ReceiverService {

  id: string;
  fileList: Data[] = [];

  constructor(
    private fstore: AngularFirestore,
    private dialog: MatDialog,
    private dialogServ: DialogService
  ) { }

  openDialogInsertChannelID() {
    const dialogRef = this.dialog.open(ConnectChannelDialog);
    dialogRef.afterClosed().subscribe(res => {
      if(res == true) {
        this.connectChannel(this.dialogServ.idChannel);
      }
    })
  }

  connectChannel(id) {
    this.id = id;
  }

}
