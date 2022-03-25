import { BrowserModule } from '@angular/platform-browser';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { NgxAgoraSdkNgModule } from 'ngx-agora-sdk-ng';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { AppComponent } from './app.component';
import { MeetingComponent } from './pages/meeting/meeting.component';
import { MeetingPreviewComponent } from './pages/meeting-preview/meeting-preview.component';
import {
  RoundTranparentIconButtonComponent
} from './shared/components/round-tranparent-icon-button/round-tranparent-icon-button.component';
import { InputOutputSettingsComponent } from './shared/components/input-output-settings/input-output-settings.component';
import { SoundMeterComponent } from './shared/components/sound-meter/sound-meter.component';
import { CameraPreviewComponent } from './shared/components/camera-preview/camera-preview.component';
import { WelcomeComponent } from './pages/welcome/welcome.component';
import { AppRoutingModule } from './app-routing.module';
import { MeetingPageComponent } from './pages/meeting-page/meeting-page.component';
import { AgoraVideoPlayerDirective } from './shared/directives/agora-video-player.directive';
import { MeetingControlsComponent } from './shared/components/meeting-controls/meeting-controls.component';
import { MeetingParticipantComponent } from './shared/components/meeting-participant/meeting-participant.component';
import { MeetingParticipantControlsComponent } from './shared/components/meeting-participant-controls/meeting-participant-controls.component';
import { from } from 'rxjs';
import { SoundVisualizerComponent } from './shared/components/sound-visualizer/sound-visualizer.component';
import { CommonModule } from '@angular/common';
//Firebase
import { AngularFireModule } from '@angular/fire';

import { AngularFireStorageModule } from '@angular/fire/storage'
import { AngularFireAuthModule } from '@angular/fire/auth'
import { environment } from '../environments/environment';
import { LiveStreamingComponent } from './pages/live-streaming/live-streaming.component'

// Ng-x Translate
// import { TranslateModule, TranslateLoader, TranslateService } from "@ngx-translate/core"
// import { TranslateHttpLoader } from '@ngx-translate/http-loader';

//emoji
import { PickerModule } from '@ctrl/ngx-emoji-mart'

// export function HttpLoaderFactory(http: HttpClient){
//   return new TranslateHttpLoader(http, 'assets/i18n');
// }

@NgModule({
  declarations: [
    AppComponent,
    MeetingComponent,
    MeetingPreviewComponent,
    RoundTranparentIconButtonComponent,
    InputOutputSettingsComponent,
    SoundMeterComponent,
    CameraPreviewComponent,
    WelcomeComponent,
    MeetingPageComponent,
    AgoraVideoPlayerDirective,
    MeetingControlsComponent,
    MeetingParticipantComponent,
    MeetingParticipantControlsComponent,
    SoundVisualizerComponent,
    LiveStreamingComponent
  ],
  imports: [
   
    BrowserModule,
    ReactiveFormsModule,
    HttpClientModule,
    PickerModule,
    // TranslateModule.forRoot(
    //   {
    //     loader: {
    //       provide: TranslateLoader,
    //       useFactory: (http: HttpClient) =>{ return new TranslateHttpLoader(http, './assets/i18n/', '.json'); },
    //       deps: [HttpClient]
    //     }
    //   }
    // ),
    NgxAgoraSdkNgModule.forRoot({
      AppID: 'replace-agora-appId',
      Video: { codec: 'h264', mode: 'rtc', role: 'host' }
    }),
    FontAwesomeModule,
    CommonModule,
     AppRoutingModule,
    
     AngularFireModule.initializeApp(environment.firebaseConfig),
    AngularFireAuthModule,
    AngularFireStorageModule,
   
  ],
  providers: [],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule { }
