import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthenticateService } from 'app/shared/services/authenticate.service';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.css']
})
export class WelcomeComponent implements OnInit {
token: any
  constructor(private authenticate: AuthenticateService,
    private activatedRoute: ActivatedRoute) { }

  ngOnInit(): void {
this.token= this.activatedRoute.snapshot.params.token;
localStorage.setItem('id_token',this.token);
    this.getuser();
    this.getLiveComment();
  }

  getuser(){
    this.authenticate.getuser();
  }

  getLiveComment(){
    
    // this.authenticate.getLiveComment().toPromise().then((data)=>{
    //   console.log(data);
      
    // })
  }

 

}
