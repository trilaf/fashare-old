import { Component, OnInit } from '@angular/core';
import { SenderService } from 'src/app/services/sender.service';

@Component({
  selector: 'app-text-sender',
  templateUrl: './text-sender.component.html',
  styleUrls: ['./text-sender.component.css']
})
export class TextSenderComponent implements OnInit {

  constructor(public senderServ: SenderService) { }

  ngOnInit() {
    this.senderServ.checkCookie();
    document.cookie = `CHNL_DFLT=text; max-age=${ 3600 * 1000 }; path=/; samesite=None; secure`;
  }

}
