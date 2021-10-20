import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { BackendService } from '../../backend';
import { NavigationService } from "../../menu-item"
import { Navigation, NavItem } from "../../entities"
import { Router } from '@angular/router';
import { AuthenticationService } from '../../_services';
import { EventQueueService, AppEvent, AppEventType} from '../../_services/broadcast-events/event.queue.service'
import { FrontendService } from 'src/app/_services/frontend.service';
import { ChangePasswordComponent } from 'src/app/login/change-password/change-password.component';
import { MatDialog } from '@angular/material/dialog';
import { getMIMEType } from 'src/app/_helpers/common';
import { DomSanitizer } from '@angular/platform-browser';

declare var jsonpath: any;

@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss']
})
export class SidenavComponent implements OnInit {
  menu: NavItem[]
  navigation: Navigation;
  @Output() close = new EventEmitter();
  @Output() clearTitle = new EventEmitter();
  @Input() userIdentity: any;
  query: any;
  pictureSrc:any = "assets/images/profile-picture.png";

  constructor(private backendService: BackendService,
    private navigationService: NavigationService,
    private router: Router,
    public dialog: MatDialog,
    private authenticationService: AuthenticationService,
    private eventQueue: EventQueueService,
    private sanitizer: DomSanitizer,
    private frontendService: FrontendService)
    {
    this.authenticationService.currentUser.subscribe(x => {
      let picture = frontendService.getUserPicture();
      if (picture) {
        let strMIME = getMIMEType('png');
        let objectURL = 'data:' + strMIME + ';base64,' + picture;
        picture = this.sanitizer.bypassSecurityTrustUrl(objectURL);
        this.pictureSrc = picture;
      }
    })
    }


  ngOnInit(): void {
    var userIdentity = this.frontendService.getJWTUserIdentity();
    this.query = window.matchMedia("(max-width: 992px)")
    var menu = JSON.parse(localStorage.getItem('menu'));
    if (!menu) {
      this.backendService.getMenu(userIdentity.userId, userIdentity.loginRoleId).toPromise().then((data: string) => {
        this.menu = JSON.parse(data);
        this.navigation = this.navigationService.createNavigation(NavigationService.BASE_QUERY_LEVEL_1_NODES, this.menu);
        localStorage.setItem('menu', data);
        this.frontendService.setAvailableRoutes();
      })
      .catch((error:any) => {
                    console.log(error);
                })
    } else {
      this.menu = menu;
      this.navigation = this.navigationService.createNavigation(NavigationService.BASE_QUERY_LEVEL_1_NODES, this.menu);
    }
  }

  route(selectedCard) {
    if(selectedCard.licensed != 'False' && selectedCard.type == 'LEAF')
    {
      if (selectedCard.type == NavigationService.MENU_TYPE_BRANCH_NODE) {
        if (this.router.url.trim() == "/" || this.router.url.indexOf("/home") > -1) {
          this.eventQueue.dispatch(new AppEvent(AppEventType.SideNavClicked, selectedCard));
          if(this.query.matches)
          {
            this.close.emit(null);
          }
        } else {
          this.router.navigate(["home"], {queryParams: {'id': selectedCard.id, "type": selectedCard.type, "label" : selectedCard.label}});
        }

      } else {
        var baseCondition = NavigationService.BASE_QUERY_LEAF_NODE.replace("selectedId", selectedCard.id)
        var route = jsonpath.query(this.menu, baseCondition + ".route")
        this.router.navigate([route[0]]);
        this.eventQueue.dispatch(new AppEvent(AppEventType.NavigationCardChanged, selectedCard));
        if(this.query.matches)
        {
          this.close.emit(null);
        }
      }
    }
  }

  routeToHome() {
    if (this.router.url.trim() == "/" || this.router.url.indexOf("/home") > -1) {
      this.router.navigate(["home"]);
      this.eventQueue.dispatch(new AppEvent(AppEventType.SideNavClicked, null));
    } else {
      this.router.navigate(["home"]);
    }
    this.eventQueue.dispatch(new AppEvent(AppEventType.NavigationCardChanged, null));
    if(this.query.matches)
    {
      this.close.emit(null);
    }
  }

  logout() {
      this.backendService.logout().toPromise().then((data:string) => {},
        (error:any) => {
                    console.log(error);
                });
      this.authenticationService.logout();
      this.menu = [];
      this.navigation = null;
      this.pictureSrc = "assets/images/profile-picture.png"
      this.close.emit(null);
      this.clearTitle.emit(null);
      this.router.navigate(['/login']);
  }

  changePassword(){
    this.close.emit(null);
    const dialogRef = this.dialog.open(ChangePasswordComponent, {
      width: '400px',
      disableClose: true,
      data: ''
    });
  }

}
