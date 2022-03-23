# angular-agora-video-call
This is a sample app for agora implementation with angular

# Find Ionic version https://github.com/dilipwk/ionic-agora-video-call


## Prerequisites
Before using the Library, you need to:

1. Get a valid Agora account. ([Sign up](https://sso.agora.io/en/signup?_ga=2.63500074.482805615.1577072824-849535803.1560925029) for free.)
2. Create a project in [Agora Console](https://console.agora.io/) and choose **APP ID** for authentication.



## Demo 
https://vcallagora.web.app/

## Setup 
<strong><pre>git clone https://github.com/dilipwk/angular-agora-video-call</pre></strong>
<strong><pre> cd angular-agora-video-call </pre></strong>
<strong><pre> npm i </pre></strong>
<strong><pre>npm i ngx-agora-sdk-ng --save </pre></strong>
<strong><pre>ng serve</pre></strong>
 
* Replace your own appId in `agora-appId`. in app.module.ts
```ts
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { NgxAgoraSdkNgModule } from 'ngx-agora-sdk-ng';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    NgxAgoraSdkNgModule.forRoot({
      AppID: 'replace-agora-appId',
      Video: { codec: 'h264', mode: 'rtc', role: 'host' }
    })
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
```

------------
Made with ❤️

Email dilipwk@hasotech.com for any development related support.

Allude https://github.com/ChapterII/ngx-agora-sdk-ng

Thanks