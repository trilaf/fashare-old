import { Component, OnInit } from '@angular/core';
import { AppComponent } from '../../app.component';
import { ReceiverService } from 'src/app/services/receiver.service';

@Component({
  selector: 'app-receiver',
  templateUrl: './receiver.component.html',
  styleUrls: ['./receiver.component.css']
})
export class ReceiverComponent implements OnInit {

  constructor(
    private appComponent: AppComponent,
    public receiverServ: ReceiverService
  ) { }

  ngOnInit() {
    this.appComponent.pageTitle = 'Receiver Page';
  }

}
