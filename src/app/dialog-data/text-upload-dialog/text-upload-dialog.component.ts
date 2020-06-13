import { Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { DialogService } from 'src/app/services/dialog.service';

@Component({
    selector: 'app-text-upload-dialog',
    templateUrl: './text-upload-dialog.component.html'
})
export class TextUploadDialogComponent {
    textUpload = new FormControl('', [Validators.required]);

    constructor(public dialogServ: DialogService) {}

    uploadText() {
        if (this.textUpload.valid === true) {
            this.dialogServ.textForUpload = this.textUpload.value;
        }
    }
}
