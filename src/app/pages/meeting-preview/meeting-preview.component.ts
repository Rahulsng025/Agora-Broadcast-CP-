import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthenticateService } from 'app/shared/services/authenticate.service';
import { AnyRecord } from 'dns';
import { Subscription } from 'rxjs';
import { TokenService } from '../../shared/services/token.service';

@Component({
  selector: 'app-meeting-preview',
  templateUrl: './meeting-preview.component.html',
  styleUrls: ['./meeting-preview.component.css']
})
export class MeetingPreviewComponent implements OnInit, OnDestroy {
  showSettings = false;
  joinLoading = false;
  newLoading = false;
  connectionInfoForm!: FormGroup;
  subscriptions: Subscription[] = [];
  user: any;
  user_id: any;
  random: any;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private tokeService: TokenService,
    private authenticateService: AuthenticateService
  ) { }

  ngOnInit(): void {
   this.random=Math.floor((Math.random() * 9999) + 1);
    this.getProfile();
    this.connectionInfoForm = this.formBuilder.group({
      channel: '',
      link: '',
    });

    const channelChangeSubs = this.connectionInfoForm.get('channel')?.valueChanges.subscribe(value => {
      if (value === '') {
        this.connectionInfoForm?.get('link')?.enable({ emitEvent: false });
      }
      else {
        this.connectionInfoForm?.get('link')?.disable({ emitEvent: false });
      }
    });

    this.subscriptions.push(channelChangeSubs as Subscription);

    const linkChangeSubs = this.connectionInfoForm.get('link')?.valueChanges.subscribe(value => {
      if (value === '') {
        this.connectionInfoForm?.get('channel')?.enable({ emitEvent: false });
      }
      else {
        this.connectionInfoForm?.get('channel')?.disable({ emitEvent: false });
      }
    });
    this.subscriptions.push(linkChangeSubs as Subscription);
  }

  ngOnDestroy(): void {
    for (const subs of this.subscriptions) {
      subs.unsubscribe();
    }
  }

  onShowSettings(): void {
    this.showSettings = true;
  }

  onCloseSettings(): void {
    this.showSettings = false;
  }

  getProfile(){
    this.authenticateService.getProfile().toPromise().then(data=>{
      this.user=data;
      //this.user_id=this.user.id;
      //alert(this.user_id);
    })
  }

  onJoinMeeting(user_id: any): void {
    const { channel, link } = this.connectionInfoForm?.value;
    if (channel) {
      const joinLink = this.tokeService.getLink(channel+this.random);
      let meetinglink = location.origin+"/#/meeting;link="+ joinLink;
      localStorage.setItem('meeting_link',joinLink);
      const formData =new FormData;
      //alert(channel);
      formData.append('live_id', channel+this.random);
      formData.append('user_id', user_id);
      this.authenticateService.addLiveIds(formData).toPromise().then(data=>{
        console.log('added live id');
      }).catch(err=>{
        console.log(err);
      });
      setTimeout(function(){
        alert(`Link copied, You can Invite other people using the link: ${meetinglink}`);
        alert(location.origin);
     }, 1000)
     navigator.clipboard.writeText(meetinglink).then().catch(e => console.error(e));
     console.log(meetinglink);
    }
    const channel_name=channel+this.random
    this.router.navigate(['/meeting'], { queryParams: { channel:channel_name, link } });
    
  }

  onDashboardNavigate(){
    window.location.href = "ommunity.infodeltasys.nl/dist/Frontend/#/dashboard"
  }
  onProfileNavigate(){
    window.location.href = "ommunity.infodeltasys.nl/dist/Frontend/#/my-profile"
  }
}