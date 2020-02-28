import { Component, OnInit } from '@angular/core';
import { AppComponent } from '../app.component';
import { CookieService } from 'ngx-cookie-service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  constructor(
    private appComponent: AppComponent,
    private cookie: CookieService,
    private router: Router
  ) { }

  ngOnInit() {
    this.appComponent.pageTitle = 'Home';
    if(this.cookie.check('CHNL_ID') == true) {
      this.router.navigate(['/sender']);
    }
  }

}
