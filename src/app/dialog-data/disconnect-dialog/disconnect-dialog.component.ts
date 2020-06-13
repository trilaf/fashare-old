import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
    selector: 'app-disconnect-dialog',
    templateUrl: './disconnect-dialog.component.html'
})
export class DisconnectDialogComponent {
    constructor(
        @Inject(MAT_DIALOG_DATA) public chnlDefault: any
    ) {}
}
