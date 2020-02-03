import { Component, OnInit } from '@angular/core';
import { AppComponent } from '../../app.component';
import { SenderService } from '../../services/sender.service';

@Component({
  selector: 'app-sender',
  templateUrl: './sender.component.html',
  styleUrls: ['./sender.component.css']
})
export class SenderComponent implements OnInit {


  idChannel = 'Not Set';

  constructor(
    private appComponent: AppComponent,
    public senderServ: SenderService
  ) {}

  async uploadFile(event) {
    await this.senderServ.uploadFile(event);
    this.idChannel = this.senderServ.getChannelId();
  }

  checkFile() {
    console.log(this.senderServ.fileList);
  }

  ngOnInit() {
    this.senderServ.checkCookie();
    this.appComponent.pageTitle = 'Sender Page';
  }

}
