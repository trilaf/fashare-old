import { Component, OnInit } from '@angular/core';
import { SenderService } from '../app/services/sender.service';
import { CookieService } from 'ngx-cookie-service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

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
    private router: Router,
    private snackbar: MatSnackBar
  ) {}

  ngOnInit() {
    if(this.cookie.check('CHNL_ID') == true) {
      this.senderServ.id = this.cookie.get('CHNL_ID');
      this.senderServ.readFileList();
      this.snackbar.open('Continuing Session', 'OK', {duration: 5000})
      this.router.navigate(['/sender']);
    }
  }
}
