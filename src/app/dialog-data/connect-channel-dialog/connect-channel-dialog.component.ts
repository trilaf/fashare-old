import { Component } from "@angular/core";
import { FormControl, Validators } from '@angular/forms';
import { DialogService } from 'src/app/services/dialog.service';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
    selector: 'connect-channel-dialog',
    templateUrl: './connect-channel-dialog.component.html'
})
export class ConnectChannelDialog {
    insertChannelID = new FormControl('', [Validators.required]);
    dialogRef: MatDialogRef<ConnectChannelDialog>

    constructor(
        public dialogServ: DialogService
    ) {}

    submitChannelID() {
        this.dialogServ.idChannel = this.insertChannelID.value;
    }
}