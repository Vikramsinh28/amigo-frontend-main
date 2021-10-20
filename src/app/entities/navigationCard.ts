export interface NavigationCard {
    type  : string,
    id    : number,
    label : string,
    smart_icon : string,
    icon  : string,
    description : string,
    subcards? : NavigationCard[],
    licensed? : string 
}

export interface Navigation {
    type : string,
    cards : NavigationCard[]
}

