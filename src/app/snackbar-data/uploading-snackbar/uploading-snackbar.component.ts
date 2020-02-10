import { Component, OnInit } from "@angular/core";
import { SnackbarService } from 'src/app/services/snackbar.service';

@Component({
    selector: 'uploading-snackbar',
    templateUrl: './uploading-snackbar.component.html',
})
export class UploadingSnackbar implements OnInit {
    testValue = 0;

    constructor(
        public snackbarServ: SnackbarService
    ) {}

    ngOnInit() {
        //const progress = setInterval(() => {
        //    if(this.testValue == 100) {
        //        clearInterval(progress);
        //        this.snackbarRef.dismiss();
        //    } else {
        //        this.testValue += 10;
        //    }
        //    console.log(`Value: ${this.testValue}`)
        //}, 500);
    }
}