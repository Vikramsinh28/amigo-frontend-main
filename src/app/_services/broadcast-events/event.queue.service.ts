import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { filter } from 'rxjs/operators';

export enum AppEventType {
    SideNavClicked = 'SIDE_NAV_CLICKED',
    NavigationCardChanged = 'NAVIGATION_CARD_CHANGED',
    StudentPaperLoaded='STUDENT_PAPER_LOADED',
    StudentPaperUnloaded='STUDENT_PAPER_UNLOADED'
}

export class AppEvent<T> {
    constructor(
        public type: AppEventType,
        public payload: T,
    ) { }
}

@Injectable({ providedIn: 'root' })
export class EventQueueService {

    private eventBrocker = new Subject<AppEvent<any>>();

    on(eventType: AppEventType): Observable<AppEvent<any>> {
        return this.eventBrocker.pipe(filter(event => event.type === eventType));
    }

    dispatch<T>(event: AppEvent<T>): void {
        this.eventBrocker.next(event);
    }

}