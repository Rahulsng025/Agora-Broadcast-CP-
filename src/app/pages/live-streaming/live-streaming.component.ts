import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthenticateService } from 'app/shared/services/authenticate.service';

@Component({
  selector: 'app-live-streaming',
  templateUrl: './live-streaming.component.html',
  styleUrls: ['./live-streaming.component.scss']
})
export class LiveStreamingComponent implements OnInit {

 
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

  constructor( private authenticateService: AuthenticateService,
    private fb: FormBuilder,
    private router: Router) { 
      this.parsedUrl = new URL(window.location.href);
      // // language translation
      // this.translateService.addLangs(this.supportLanguages);
      // this.translateService.setDefaultLang('en');
  
      // const browserlang = this.translateService.getBrowserLang();
      // translateService.use(browserlang);
    }

  ngOnInit(): void {
    this.CommentForm = this.fb.group({
      comment: new FormControl('', [Validators.required])
    })
    this.getLiveComment();

    this.getFriends();
    this.fetchImage();
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
    this.message=this.CommentForm.value.comment;
    alert(this.message);
        const formData: FormData = new FormData(); 
        if(this.selectedImage!=null){
          formData.append('image', this.selectedImage, this.selectedImage.name);
          alert(this.selectedImage.name);
        console.log(this.selectedImage);
        
        }
        if(this.message!=null){
          formData.append('message', this.message);
        } 
        formData.append('live_id', '123456789');
        this.authenticateService.addLiveComment(formData).subscribe((data: any) => {
            console.log('Comment added successfully');
            //this.authenticateService.successToaster('Comment added successfully','Success');
            this.CommentForm.reset();
            this.getLiveComment();
          }) 
  }


  getLiveComment() {
    // this.authenticateService.getLiveComment().subscribe((data: any) => {
    //   this.liveComment = data;
    //   console.log(this.liveComment)
    // })
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
  //   alert('block'+friend_id);
  //   const formdata = new FormData();
  //   formdata.append('status', '0');
  //   this.authenticateService.unblock(friend_id,formdata).subscribe((data)=>{
  //     this.friends = data;
  //     console.log(data);
  //   })
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
