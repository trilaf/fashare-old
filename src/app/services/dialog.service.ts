import { Injectable } from '@angular/core';
import { ReceiverService } from './receiver.service';
import { MatDialogRef } from '@angular/material/dialog';
import { ConnectChannelDialog } from '../dialog-data/connect-channel-dialog/connect-channel-dialog.component';

@Injectable({
  providedIn: 'root'
})
export class DialogService {
  idChannel;

  constructor() {}

}
