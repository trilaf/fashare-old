import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { SenderComponent } from './role/sender/sender.component';


const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'sender', component: SenderComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
