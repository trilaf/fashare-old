import { Component, OnInit } from '@angular/core';
import { AppComponent } from '../../app.component';
import { ReceiverService } from 'src/app/services/receiver.service';
import { UniversalService } from 'src/app/services/universal.service';

@Component({
  selector: 'app-receiver',
  templateUrl: './receiver.component.html',
  styleUrls: ['./receiver.component.css']
})
export class ReceiverComponent implements OnInit {

  constructor(
    private appComponent: AppComponent,
    public receiverServ: ReceiverService,
    public universalServ: UniversalService
  ) { }

  ngOnInit() {
    this.appComponent.pageTitle = 'Receiver Page';
  }

}
