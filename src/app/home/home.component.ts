import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { NavigationCard, Navigation } from "../entities"
import { BackendService } from '../backend';
import { NavItem } from '../entities';
import { NavigationService } from "../menu-item"
import { EventQueueService, AppEvent, AppEventType} from '../_services/broadcast-events/event.queue.service'
import { FrontendService } from '../_services/frontend.service';

declare var jsonpath: any;

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {
  menu: NavItem[]
  navigation: Navigation;

  constructor(private backendService: BackendService, private navigationService: NavigationService, private router: Router,
    private eventQueue: EventQueueService, private activatedRoute: ActivatedRoute, private frontendService: FrontendService) {
  }

  ngOnInit(): void {
    var userIdentity = this.frontendService.getJWTUserIdentity();

    if (!userIdentity)
    {
      this.router.navigate(['/login']);
      return;
    }

    var menu = JSON.parse(localStorage.getItem('menu'));
    if (!menu) {
      this.backendService.getMenu(userIdentity.userId, userIdentity.loginRoleId).toPromise().then((data: string) => {
        this.menu = JSON.parse(data);
        localStorage.setItem('menu', data);
        this.frontendService.setAvailableRoutes();
        this.__loadNavigation()
      })
      .catch((error:any) => {
                    console.log(error);
                })
    } else {
      this.menu = menu;
      this.__loadNavigation()
    }
    this.eventQueue.on(AppEventType.SideNavClicked).subscribe(event => this.handleSideNavClick(event.payload));
  }

  handleSideNavClick(selectedCard: NavigationCard) {
    if (selectedCard) {
      this.render(selectedCard)
    } else {
      this.__loadNavigation()
    }
  }

  __loadNavigation() {
    this.activatedRoute.queryParamMap.subscribe(paramMap => {
      var id = paramMap.get('id');
      if (id) {
        var selectedCard = {
          type  : paramMap.get('type'),
          id    : id,
          label : paramMap.get('label'),
          smart_icon : null,
          icon  : null,
          description : null
        }
        this.render(selectedCard)
      } else {
        this.navigation = this.navigationService.createNavigation(NavigationService.BASE_QUERY_LEVEL_1_NODES, this.menu);
      }
    })
  }

  render(selectedCard) {
    if(selectedCard.licensed != 'False')
    {
      if (selectedCard.type == NavigationService.MENU_TYPE_BRANCH_NODE) {
        var baseQuery = NavigationService.BASE_QUERY_BRANCH_NODES.replace("selectedId", selectedCard.id)
        this.navigation = this.navigationService.createNavigation(baseQuery, this.menu);
      } else {
        var baseCondition = NavigationService.BASE_QUERY_LEAF_NODE.replace("selectedId", selectedCard.id)
        var route = jsonpath.query(this.menu, baseCondition + ".route")
        this.router.navigate([route[0]]);
      }
      this.eventQueue.dispatch(new AppEvent(AppEventType.NavigationCardChanged, selectedCard));
    }
  }

  ngOnDestroy() {
    this.navigation = null;
  }

}
