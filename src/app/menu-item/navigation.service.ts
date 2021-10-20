import { Injectable } from '@angular/core';
import jsonpath from 'jsonpath';
import { Navigation, NavigationCard } from "../entities"

//declare var jsonpath: any;

@Injectable({
    providedIn: 'root'
  })
  export class NavigationService {

    static MENU_TYPE_BRANCH_NODE = "BRANCH"
    static MENU_TYPE_LEAF_NODE = "LEAF"
    static MENU_TYPE_SECTION_NODE = "SECTION"
    static BASE_QUERY_LEVEL_1_NODES = "$..[?(@.level==1)]"
    static BASE_QUERY_BRANCH_NODES = "$..[?(@.id==selectedId)].children[:]"
    static BASE_QUERY_LEAF_NODE = "$..[?(@.id==selectedId)]"

    createNavigation(baseQuery, menu) {
        var navigation: Navigation;
        var hasSection = false;

        var cards: NavigationCard[] = []
        var c = this.executeQuery(baseQuery, menu)

        if (c.types != null && c.types.length > 0) {
          for (let i = 0; i < c.types.length; i++) {
            var menuType = c.types[i]
            if (menuType == NavigationService.MENU_TYPE_SECTION_NODE) {
              hasSection = true
              var navCard: NavigationCard = { type: c.types[i], id: c.ids[i], label: c.labels[i], smart_icon: c.smart_icons[i], icon: c.icons[i], description: c.descs[i], subcards: [], licensed: c.licenses[i] }
              var sectionId = c.ids[i]
              var query = NavigationService.BASE_QUERY_BRANCH_NODES.replace("selectedId", sectionId)
              var r = this.executeQuery(query, menu)
              if (r.types != null && r.types.length > 0) {
                for (let j = 0; j < r.types.length; j++) {
                  var card: NavigationCard = { type: r.types[j], id: r.ids[j], label: r.labels[j], smart_icon: r.smart_icons[j], icon: r.icons[j], description: r.descs[j], licensed: r.licenses[j] }
                  navCard.subcards = navCard.subcards.concat(card)
                }
              }
              cards = cards.concat(navCard)
            } else {
              var navCard: NavigationCard = { type: c.types[i], id: c.ids[i], label: c.labels[i], smart_icon: c.smart_icons[i], icon: c.icons[i], description: c.descs[i], licensed: c.licenses[i] }
              cards = cards.concat(navCard)
            }
          }
        }
        if (hasSection) {
          var navigation: Navigation = { type: 'SECTION', cards: cards }
        } else {
          var navigation: Navigation = { type: 'NODE&BRANCH', cards: cards }
        }
        return navigation
      }

      private executeQuery(query, menu) {
          try {
            var types = jsonpath.query(menu, query + ".type")
            var ids = jsonpath.query(menu, query + ".id")
            var labels = jsonpath.query(menu, query + ".label")
            var smart_icons = jsonpath.query(menu, query + ".smart_icon")
            var icons = jsonpath.query(menu, query + ".icon")
            var descs = jsonpath.query(menu, query + ".description")
            var licenses = jsonpath.query(menu, query + ".licensed")
            return { types: types, ids: ids, labels: labels, smart_icons: smart_icons, icons: icons, descs : descs, licenses: licenses }
          } catch (error) {
              console.log("Error occured while parsing menu --->", error);
              console.log(menu)
              console.log(query)
          }

      }
  }
