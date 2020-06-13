import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { SenderComponent } from './role/sender/sender.component';
import { ReceiverComponent } from './role/receiver/receiver.component';
import { TextSenderComponent } from './role/text-sender/text-sender/text-sender.component';


const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'sender', children: [
    {
      path: 'filesharing',
      component: SenderComponent
    },
    {
      path: 'textsharing',
      component: TextSenderComponent
    }
  ]},
  { path: 'receiver', component: ReceiverComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
