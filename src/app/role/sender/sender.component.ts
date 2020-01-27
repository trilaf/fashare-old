import { Component, OnInit } from '@angular/core';
import { AppComponent } from '../../app.component';

@Component({
  selector: 'app-sender',
  templateUrl: './sender.component.html',
  styleUrls: ['./sender.component.css']
})
export class SenderComponent implements OnInit {

  idChannel = 'Not Set';

  constructor(
    private appComponent: AppComponent
  ) { }

  ngOnInit() {
    this.appComponent.pageTitle = 'Sender Page';
  }

}
