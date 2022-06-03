import { ChangeDetectionStrategy, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, interval, Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { IMediaTrack, IRemoteUser, NgxAgoraSdkNgService } from 'ngx-agora-sdk-ng';

import { MediaService } from '../../shared/services/media.service';
import { TokenService } from '../../shared/services/token.service';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthenticateService } from 'app/shared/services/authenticate.service';
import { AnyARecord } from 'dns';


export interface IMeetingUser {
  type: 'local' | 'remote';
  user?: IRemoteUser;
  mediaTrack?: IMediaTrack;
}

@Component({
  selector: 'app-meeting-page',
  templateUrl: './meeting-page.component.html',
  styleUrls: ['./meeting-page.component.css'],
})
export class MeetingPageComponent implements OnInit, OnDestroy {
  @ViewChild('localVideo', { static: true }) localVideo?: ElementRef;
  link = '';
  channel = '';
  subscriptions: Subscription[] = [];
  userList: IMeetingUser[] = [];
  audioInId = '';
  videoInId = '';
  audioOutId = '';
  token : any;
  mediaTrack?: IMediaTrack;
  pinnedUser?: IMeetingUser | null;
  supportLanguages = ['en', 'pashto', 'farsi', 'urdu','uz'];
  storedTheme: string = localStorage.getItem('theme-color') || '{}';


  friends: any;
  newImage: any;
  requestCount = 0;
  parsedUrl: any;

  liveComment: any;
  comment:string='';
  CommentForm!: FormGroup;
  emoji: string='';
  showEmojiPicker = false;
  imgSrc: any;
  selectedImage: any;
  message: string='';
  meeting_link: any;
  array: any;
  url: any;
  constructor(
    private activatedRoute: ActivatedRoute,
    private agoraService: NgxAgoraSdkNgService,
    private mediaService: MediaService,
    private tokenService: TokenService,
    private router: Router,
    private authenticateService: AuthenticateService,
    private fb: FormBuilder,
  ) { 
    this.parsedUrl = new URL(window.location.href);
      // // language translation
      // this.translateService.addLangs(this.supportLanguages);
      // this.translateService.setDefaultLang('en');
  
      // const browserlang = this.translateService.getBrowserLang();
      // translateService.use(browserlang);

  }

  ngOnInit(): void {
    // alert(this.activatedRoute.snapshot.queryParamMap.get('token'));
    if(this.activatedRoute.snapshot.queryParamMap.get('token')){
      this.token=this.activatedRoute.snapshot.queryParamMap.get('token');
    localStorage.setItem('id_token',this.token);
    }
    
    this.getFriends();
    this.fetchImage();
   
    this.meeting_link=localStorage.getItem('meeting_link');
    this.CommentForm = this.fb.group({
      comment: new FormControl('', [Validators.required])
    })
    setTimeout(()=>{                          
      this.getFriends();
    this.fetchImage();
 }, 3000);
   
    forkJoin([
      this.activatedRoute.queryParams.pipe(take(1)),
      this.mediaService.selectedAudioInputId.pipe(take(1)),
      this.mediaService.selectedAudioOutputId.pipe(take(1)),
      this.mediaService.selectedVideoInputId.pipe(take(1)),
    ])
      .pipe(
        take(1),
      ).subscribe(([params, aInId, aOutId, vInId]) => {
        this.link = params.link;
        this.channel = params.channel;
        if (this.link) {
          
          const result = this.tokenService.getChannel(this.link);
          if (result.error) {
            alert(result.error);
            this.router.navigate(['/..']);
            return;
          }
          this.channel = result.channel as string;
        }
        this.tokenService.getToken(this.channel);
        this.audioInId = aInId;
        this.videoInId = vInId;
        this.audioOutId = aOutId;
      });
      
    const tokenSub = this.tokenService.token.pipe(take(1)).subscribe(token => {
      this.token = token;
      this.joinVideo();
    });
    this.subscriptions.push(tokenSub);

    const remoteUserLeaveSubs = this.agoraService.onRemoteUserLeft().subscribe(leftuser => {
      this.userList = this.userList.filter(user => user.user?.uid !== leftuser.user.uid);
      if (this.pinnedUser && this.pinnedUser.user?.uid && this.pinnedUser.user.uid === leftuser.user.uid) {
        this.pinnedUser = null;
      }
    });
    this.subscriptions.push(remoteUserLeaveSubs);

    const remoteUserChangeSubs = this.agoraService.onRemoteUsersStatusChange().subscribe(status => {
      switch (status.connectionState) {
        case 'CONNECTED':
          if (!this.userList.find(user => user.user?.uid === status.user.uid)) {
            this.userList.push({ type: 'remote', user: status.user });
          }
          break;
        case 'DISCONNECTED':
        case 'DISCONNECTING':
        case 'RECONNECTING':
          const currentUserIndex = this.userList.findIndex(user => user.user?.uid === status.user.uid);
          if (currentUserIndex >= 0) {
            this.userList[currentUserIndex] = { type: 'remote', user: status.user };
            if (this.pinnedUser && this.pinnedUser.user?.uid && this.pinnedUser.user.uid === status.user.uid) {
              this.pinnedUser = { type: 'remote', user: status.user };
            }
          }
          break;
      }
    });
    this.subscriptions.push(remoteUserChangeSubs);

    const localUserJoinedSubs = this.agoraService.onLocalUserJoined().subscribe(track => {
      this.userList.push({ type: 'local', mediaTrack: track.track });
    });
    this.subscriptions.push(localUserJoinedSubs);
    //alert(this.channel);
    this.getLiveComment();
    interval(100 * 60).subscribe(x => {
      this.getLiveComment();
    });
    this.updateLive('active');
  }

  ngOnDestroy(): void {
    for (const sub of this.subscriptions) {
      sub.unsubscribe();
    }
  }

  async joinVideo(): Promise<void> {
    this.mediaTrack = await this.agoraService.join(this.channel, this.token)
      .WithCameraAndMicrophone(this.audioInId, this.videoInId)
      .Apply();
  }

  onLocalMic(value: boolean): void {
    !value ? this.mediaTrack?.microphoneUnMute() : this.mediaTrack?.microphoneMute();
  }

  onLocalCamera(value: boolean): void {
    !value ? this.mediaTrack?.cameraOn() : this.mediaTrack?.cameraOff();
  }

  onLocalPinned(value: boolean): void {
    const localuser = this.userList.find(user => user.type === 'local');
    if (localuser) {
      this.onPin(localuser);
    }
  }

  onLocalLeave(): void {
    this.agoraService.leave();
    this.mediaTrack?.stop();
    this.updateLive('inactive');
    this.router.navigate(['/..']);
  }

  updateLive(status: any){
    const formData = new FormData;
    formData.append('status',status);
    formData.append('live_id',this.channel);
    this.authenticateService.updateLiveId(formData).toPromise().then(data=>{
      console.log(data);
    }).catch(err=>{
      console.log(err);
    })
  }

  onPin(user: IMeetingUser): void {
    if (user.type === 'local') {
      if (this.pinnedUser && this.pinnedUser?.type === 'local') {
        this.pinnedUser = null;
        return;
      }
      this.pinnedUser = user;
      return;
    }
    if (this.pinnedUser?.type === 'local') {
      this.pinnedUser = user;
      return;
    }
    if (this.pinnedUser?.user?.uid === user.user?.uid) {
      this.pinnedUser = null;
    } else {
      this.pinnedUser = user;
    }
  }

  getUnpinnedUsers(): IMeetingUser[] {
    if (this.pinnedUser?.type === 'local') {
      return this.userList.filter(user => user.type !== 'local');
    }
    return this.userList.filter(user => user.user?.uid !== this.pinnedUser?.user?.uid);
  }

  getFriends(){
    this.authenticateService.getFriends().subscribe((data: any)=>{
      this.friends = data;
      console.log(this.friends);
    })
  }

  fetchImage(){
    
    this.authenticateService.getProfile().subscribe((data: any)=> {
      this.newImage = data
      console.log(data);
    })
  }


  toggleEmojiPicker(){
    this.showEmojiPicker=!this.showEmojiPicker;
  }

  addEmoji(event: { emoji: { native: string; }; }) {
    const text= `${event.emoji.native}`;
    this.comment+=event.emoji.native;
    //alert(this.comment);
    this.emoji+= text;
    }

    showPreview(event: any) {
      if(event.target.files && event.target.files[0]){
        const reader = new FileReader();
        reader.onload = (e:any) => this.imgSrc = e.target.result;
        reader.readAsDataURL(event.target.files[0]);
        this.selectedImage = event.target.files[0];
      }
      else {
        this.imgSrc = './assets/click_here.svg';
        this.selectedImage = null;
      }
    }
    
  addLiveComment(){
  // this.channel=this.activatedRoute.snapshot.params.channel;
    this.message=this.CommentForm.value.comment;
    //alert(this.message);
        const formData: FormData = new FormData(); 
        formData.append('live_id', this.channel);
        if(this.selectedImage!=null){
          formData.append('image', this.selectedImage, this.selectedImage.name);
          // alert(this.selectedImage.name);
        console.log(this.selectedImage);
        
        }
        if(this.message!=null){
          formData.append('message', this.message);
        } 
       
        this.authenticateService.addLiveComment(formData).subscribe((data: any) => {
            console.log('Comment added successfully');
            //this.authenticateService.successToaster('Comment added successfully','Success');
            this.CommentForm.reset();
            this.comment='';
            this.message='';
            this.showEmojiPicker=false;
            this.getLiveComment();
          }) 
  }


  getLiveComment() {
   // this.channel=this.activatedRoute.snapshot.channel;
    //alert(this.channel);
    this.authenticateService.getLiveComment(this.channel).subscribe((data: any) => {
      this.liveComment = data;
      console.log(this.liveComment);
    })
  }


  // Nav bar area

  allUser(){
    this.router.navigate(['all-users']);
  }

  blockUnblock(id: any,friend_id: string | Blob,status: string | Blob){
    const formdata = new FormData();
    formdata.append('user_id_2', friend_id);
    formdata.append('status', status);
    this.authenticateService.blockUnblock(id,formdata).subscribe((data: any)=>{
      this.friends = data;
      //this.authenticateService.successToaster('User Blocked Successfully...','SUCCESS');
    })
  }

  // unblock(friend_id){
  // alert('block'+friend_id);
  // const formdata = new FormData();
  // formdata.append('status', '0');
  // this.authenticateService.unblock(friend_id,formdata).subscribe((data)=>{
  // this.friends = data;
  // console.log(data);
  // })
  // }

  chat(profile: any,user_name: any,friend_id: any){
    // alert('Chat With '+friend_id);
    this.router.navigate([`chatroom/${friend_id}`, {friend_id,profile,user_name}]);
  }



  showDiv = {
    previous : false,
    
  }

  onProfileView() {
    this.router.navigate(['my-profile']);
  }

  onWebCam(){
    this.router.navigate(['preview-video']);
  }

  onPrivacyView(){
    this.router.navigate(['privacy']);
    
  }
  setTheme() {
    if (this.storedTheme === 'theme-dark') {
      localStorage.setItem('theme-color', 'theme-light');
      this.storedTheme = localStorage.getItem('theme-color') || '{}';

    }
    else {
      localStorage.setItem('theme-color', 'theme-dark');
      this.storedTheme = localStorage.getItem('theme-color') || '{}';
    }
  }
}