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
    this.appComponent.pageTitle = 'Home';
    if (this.cookie.check('CHNL_ID') === true) {
      this.router.navigate(['/sender']);
      this.snackbar.open('You must end session first', 'X', {duration: 5000});
    }
    if (this.cookie.check('RCVR') === true) {
      this.router.navigate(['/receiver']);
      this.snackbar.open('You must disconnect first', 'X', {duration: 5000});
    }
  }

}
