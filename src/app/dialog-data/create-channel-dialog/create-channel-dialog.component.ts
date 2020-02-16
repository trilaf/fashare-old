import { Component } from '@angular/core'
import { FormControl, Validators } from '@angular/forms';
import { DialogService } from 'src/app/services/dialog.service';

@Component({
    selector: 'create-channel-dialog',
    templateUrl: './create-channel-dialog.component.html'
})
export class CreateChannelDialog {
    insertChannelName = new FormControl('', [Validators.required]);

    constructor(private dialogServ: DialogService) {}

    createChannelName() {
        this.dialogServ.newChannelName = this.insertChannelName.value;
    }
}