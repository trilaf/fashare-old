import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DeviceDetectorService } from 'ngx-device-detector';

@Component({
    selector: 'play-dialog',
    templateUrl: './play-dialog.component.html'
})
export class PlayDialog {
    constructor(
        @Inject(MAT_DIALOG_DATA) public fileAttr: any,
        public deviceDetector: DeviceDetectorService
    ) {}
}
