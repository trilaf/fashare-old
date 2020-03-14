import { Component, OnInit } from '@angular/core';
import { SenderService } from '../app/services/sender.service';
import { CookieService } from 'ngx-cookie-service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ReceiverService } from './services/receiver.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit {
  title = 'fashare';
  pageTitle = '';

  constructor(
    private senderServ: SenderService,
    private cookie: CookieService,
    private receiverServ: ReceiverService,
    private router: Router,
    private snackbar: MatSnackBar
  ) {}

  ngOnInit() {
    if(this.cookie.check('CHNL_ID') == true) {
      this.senderServ.isLoading = true;
      this.senderServ.id = this.cookie.get('CHNL_ID');
      this.senderServ.simpleChannelID = this.cookie.get('CHNL_NAME');
      this.snackbar.open('Checking Session...', '', {duration: 5000});
      this.senderServ.readFileList('check');
      this.router.navigate(['/sender']);
    }
    if(!this.receiverServ.isConnected) {
      if(this.cookie.check('RCVR')) {
        document.cookie = `RCVR=""; max-age=-1`;
      }
    }
  }
}
