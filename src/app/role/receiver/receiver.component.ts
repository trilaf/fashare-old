import { Component, OnInit } from '@angular/core';
import { AppComponent } from '../../app.component';

@Component({
  selector: 'app-receiver',
  templateUrl: './receiver.component.html',
  styleUrls: ['./receiver.component.css']
})
export class ReceiverComponent implements OnInit {

  constructor(
    private appComponent: AppComponent
  ) { }

  ngOnInit() {
    this.appComponent.pageTitle = 'Receiver Page';
  }

}
