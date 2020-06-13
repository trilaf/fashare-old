import { Component, OnInit } from '@angular/core';
import { AppComponent } from '../app.component';
import { CookieService } from 'ngx-cookie-service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  constructor(
    private appComponent: AppComponent,
    private cookie: CookieService,
    private router: Router,
    private snackbar: MatSnackBar
  ) { }

  ngOnInit() {
    if (this.cookie.check('CHNL_ID') === true) {
      if (this.cookie.get('CHNL_DFLT') === 'text') {
        this.router.navigate(['/sender/textsharing']);
      } else {
        this.router.navigate(['/sender/filesharing']);
      }
      this.snackbar.open('You must end session first', 'X', {duration: 5000});
    }
    if (this.cookie.check('RCVR') === true) {
      this.router.navigate(['/receiver']);
      this.snackbar.open('You must disconnect first', 'X', {duration: 5000});
    }
    if ((this.cookie.check('CHNL_ID') === false && this.cookie.check('CHNL_DFLT') === true)) {
      document.cookie = `CHNL_DFLT=""; max-age=-1`;
    }
  }

}
