import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DeviceDetectorService } from 'ngx-device-detector';

@Component({
    selector: 'app-play-dialog',
    templateUrl: './play-dialog.component.html'
})
export class PlayDialogComponent {
    constructor(
        @Inject(MAT_DIALOG_DATA) public fileAttr: any,
        public deviceDetector: DeviceDetectorService
    ) {}
}
