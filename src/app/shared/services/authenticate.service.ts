import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, NgZone } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthenticateService {
  uri = 'https://infodeltasys.nl/cportal/public/api';
  token = localStorage.getItem('id_token');
  options = {
    headers: new HttpHeaders({
      'Authorization': `Bearer ${this.token}`,
    }),
  };
  userData: any;
  constructor(public afs: AngularFirestore, // Inject Firestore service
    public afAuth: AngularFireAuth, // Inject Firebase auth service
    public router: Router,
    public ngZone: NgZone, // NgZone service to remove outside scope warning
    public http: HttpClient,
  ) { }

  getuser() {
    this.afAuth.onAuthStateChanged(function (user) {
      //alert(user)
      if (user) {
        console.log(user);
        // this.userData = user;
        localStorage.setItem('user', JSON.stringify(user));
        JSON.parse(localStorage.getItem('user') || '{}');
      }

      else {
        // alert('else');
        localStorage.setItem('user', null!);
        JSON.parse(localStorage.getItem('user') || '{}');
      }
    });
  }

  getLiveComment(meeting_link: any) {

    return this.http.get(`${this.uri}/auth/livestreamcomment/${meeting_link}`, this.options)
  }

  addLiveComment(FormData: any) {
    return this.http.post(`${this.uri}/auth/livestreamcomment`, FormData, this.options)
  }

  // block friend
  blockUnblock(id: any, formData: FormData): Observable<any> {
    return this.http.post(`${this.uri}/auth/block/${id}`, formData, this.options)
  }

  // Get Profile Detail
  getProfile() {

    return this.http.get(`${this.uri}/auth/profile`, this.options)
  }

  // Get All Friends
  getFriends() {
    return this.http.get(`${this.uri}/auth/friend`, this.options)
  }

  updateLiveId(FormData: any) {
    return this.http.post(`${this.uri}/updatelive`, FormData,this.options)
  }


  addLiveIds(FormData: any) {
    return this.http.post(`${this.uri}/live-data`, FormData)
  }

  getLiveStory(){
    return this.http.get(`https://infodeltasys.nl/cportal/public/api/auth/live-story`, this.options)
  }

}
