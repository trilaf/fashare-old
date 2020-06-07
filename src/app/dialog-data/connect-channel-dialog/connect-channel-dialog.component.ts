import { Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { DialogService } from 'src/app/services/dialog.service';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
    selector: 'app-connect-channel-dialog',
    templateUrl: './connect-channel-dialog.component.html'
})
export class ConnectChannelDialogComponent {
    insertChannelName = new FormControl('', [Validators.required]);
    dialogRef: MatDialogRef<ConnectChannelDialogComponent>;

    constructor(
        public dialogServ: DialogService
    ) {}

    submitChannelName() {
        if (this.insertChannelName.valid) {
            this.dialogServ.idChannel = this.insertChannelName.value;
        }
    }
}
