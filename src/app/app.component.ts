import { Component, ViewEncapsulation,ChangeDetectorRef, ViewChild, ElementRef, Renderer2 } from '@angular/core';
import { AuthenticationService } from './_services';
import { Router } from '@angular/router';
import { BackendService } from './backend';
import { NavItem, NavigationCard } from './entities';
import { EventQueueService, AppEventType} from './_services/broadcast-events/event.queue.service'
import {MediaMatcher} from '@angular/cdk/layout';
import { FrontendService } from './_services/frontend.service';
import { DateTimeService } from './_services/date-time/dateTimeService';
import { MatDialog } from '@angular/material/dialog';
import { ChangePasswordComponent } from './login/change-password/change-password.component';
import { MatSidenav } from '@angular/material/sidenav';
import { CommonService, getMIMEType } from './_helpers/common';
import { ConnectionService } from 'ng-connection-service';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AppComponent {
  title: string = ""
  userIdentity: any;
  currentUser: any;
  navItems: NavItem[] = []
  smartNavigation = true
  mobileQuery: MediaQueryList;
  @ViewChild("menuDiv") menuDiv: ElementRef;
  gradeDivDetails = "";
  status: boolean = false;
  @ViewChild('sidenav') sidenav: MatSidenav;
  network= "You are Online";
  isConnected = true;
  clientLogo: any;
  pictureSrc="../assets/images/profile-picture.png";

  ngOnInit() {
    try{
      this.title = ""
      this.eventQueue.on(AppEventType.NavigationCardChanged).subscribe(event => {
        var card : NavigationCard = event.payload
        this.title = card ? card.label : ""
      });
    }
    catch(e){}
    }

    ngAfterViewInit(): void
    {
      try{
      this.eventQueue.on(AppEventType.StudentPaperLoaded).subscribe(event => {

        this.renderer.addClass(document.body, 'nomenubar');
      });

      this.eventQueue.on(AppEventType.StudentPaperUnloaded).subscribe(event => {
        this.renderer.removeClass(document.body, 'nomenubar');
      });}
      catch(e){}
    }

    ngOnDestroy(): void {
      this.mobileQuery.removeListener(this._mobileQueryListener);
    }
    private _mobileQueryListener: () => void;

  constructor( private router: Router,
      private authenticationService: AuthenticationService,
      private backendService: BackendService,
      private eventQueue: EventQueueService,
      changeDetectorRef: ChangeDetectorRef, media: MediaMatcher,
      private renderer: Renderer2,
      public dialog: MatDialog,
      private frontendService: FrontendService,
      private connectionService: ConnectionService,
      private snackbar: CommonService,
      private sanitizer: DomSanitizer,
      private dateService: DateTimeService) {

    this.mobileQuery = media.matchMedia('(max-width: 992px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);

      this.authenticationService.currentUser.subscribe(x => {
        this.currentUser = x
        if (this.currentUser) {
          this.userIdentity = frontendService.getJWTUserIdentity4CurrUser(this.currentUser);
          if (this.userIdentity.loginRoleName == 'Student') {
            this.gradeDivDetails =  "-" + this.userIdentity.studentGrade + "/" + this.userIdentity.studentDivision
          }
          let picture = frontendService.getUserPicture();

          if (picture)
          {
            let strMIME = getMIMEType('png');
            let objectURL = 'data:' + strMIME + ';base64,' + picture;
            picture = this.sanitizer.bypassSecurityTrustUrl(objectURL);
            this.pictureSrc = picture;
          }

          if (!this.smartNavigation) {
            this.getMenu();
          }
          this.dateService.format = this.userIdentity.dateFormat;
          this.clientLogo = this.frontendService.getClientLogo();
          this.clientLogo = this.sanitizer.bypassSecurityTrustUrl(this.clientLogo);
        }

      });

      this.connectionService.monitor().subscribe(isConnected=>{
        this.isConnected = isConnected;
        if(this.isConnected){
            this.network = "You are Online !";
          this.snackbar.showSuccessMsg(this.network, "", 2000); //Snackbar common service that we created
        }
        else
        {
          this.network = "You are Offline !";
          this.snackbar.showErrorMsg(this.network, "", null); //Snackbar common service that we created
        }
      });
  }

  getMenu(){
    this.backendService.getMenu(this.userIdentity.userId, this.userIdentity.loginRoleId).toPromise().then((data: string) => {
      this.navItems = JSON.parse(data);
    })
    .catch((error:any) => {
                    console.log(error);
                })
  }

  logout() {
    this.backendService.logout().toPromise().then((data:string) => {})
      .catch((error:any) => {
                    console.log(error);
                });
    this.authenticationService.logout();
    this.pictureSrc="../assets/images/profile-picture.png";
    this.navItems = [];
    if(this.status==true)
    {
      this.sidenav.toggle();
      this.clickEvent();
    }

    this.router.navigate(['/login']);
    this.clearTitle();
    this.gradeDivDetails = ""
  }

  changePassword(){
    const dialogRef = this.dialog.open(ChangePasswordComponent, {
      width: '400px',
      disableClose: true,
      data: ''
    });
  }

  clickEvent(){
      this.status = !this.status;
  }

  clearTitle(){
    this.title = ""
  }

}
