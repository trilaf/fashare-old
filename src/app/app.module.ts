import { BrowserModule } from '@angular/platform-browser';
import { NgModule, ElementRef } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AngularFireModule } from '@angular/fire';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFireStorageModule } from '@angular/fire/storage';
import { AngularFireFunctionsModule } from '@angular/fire/functions';
import { environment } from '../environments/environment';
import { FileSaverModule } from 'ngx-filesaver';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBarModule, MAT_SNACK_BAR_DEFAULT_OPTIONS } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { HttpClientModule } from '@angular/common/http';
import { MatInputModule } from '@angular/material/input';
import { DeviceDetectorModule } from 'ngx-device-detector';

import { HomeComponent } from './home/home.component';
import { SenderComponent } from './role/sender/sender.component';
import { ReceiverComponent } from './role/receiver/receiver.component';

import { ConnectChannelDialogComponent } from './dialog-data/connect-channel-dialog/connect-channel-dialog.component';
import { DisconnectDialogComponent } from './dialog-data/disconnect-dialog/disconnect-dialog.component';
import { CreateChannelDialogComponent } from './dialog-data/create-channel-dialog/create-channel-dialog.component';
import { UploadingSnackbarComponent } from './snackbar-data/uploading-snackbar/uploading-snackbar.component';

import { CookieService } from 'ngx-cookie-service';
import { SenderService } from './services/sender.service';
import { DialogService } from './services/dialog.service';
import { PreviewDialogComponent } from './dialog-data/preview-dialog/preview-dialog.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    SenderComponent,
    ReceiverComponent,
    DisconnectDialogComponent,
    ConnectChannelDialogComponent,
    CreateChannelDialogComponent,
    PreviewDialogComponent,
    UploadingSnackbarComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    FileSaverModule,
    MatToolbarModule,
    MatButtonModule,
    MatCardModule,
    MatDividerModule,
    MatListModule,
    MatIconModule,
    MatMenuModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireStorageModule,
    AngularFirestoreModule,
    MatSnackBarModule,
    MatDialogModule,
    MatProgressBarModule,
    MatInputModule,
    MatTooltipModule,
    HttpClientModule,
    AngularFireFunctionsModule,
    DeviceDetectorModule.forRoot()
  ],
  providers: [
    CookieService,
    SenderService,
    DialogService,
    {provide: MAT_SNACK_BAR_DEFAULT_OPTIONS, useValue: {
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: ['margin-snackbar']
    }}
  ],
  bootstrap: [AppComponent],
  entryComponents: [
    DisconnectDialogComponent,
    ConnectChannelDialogComponent,
    CreateChannelDialogComponent,
    PreviewDialogComponent,
    UploadingSnackbarComponent
  ]
})
export class AppModule { }
