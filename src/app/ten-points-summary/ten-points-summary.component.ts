import { ValidatorFn } from '@angular/forms';
import { TenPointsSummary } from '../entities';
import { Component, OnInit } from '@angular/core';
import { BackendService } from '../backend';
import { FrontendService } from '../_services/frontend.service';

@Component({
  selector: 'app-ten-points-summary',
  templateUrl: './ten-points-summary.component.html',
  styleUrls: ['./ten-points-summary.component.scss']
})
export class TenPointsSummaryComponent implements OnInit {

  public tenPointsSummary : TenPointsSummary;
  dataLoaded = false;

  constructor(private backendService: BackendService,
    private frontendService: FrontendService) { }

  ngOnInit(): void {
    this.loadExamSummaryReport();
  }

  loadExamSummaryReport()
  {
    var userIdentity = this.frontendService.getJWTUserIdentity();
    this.backendService.getTenPointSummary(userIdentity.studentId, userIdentity.clientId).toPromise().then((data: string) => {
      this.tenPointsSummary = JSON.parse(data);
      //console.log(this.tenPointsSummary);
      this.dataLoaded = true;
  }).catch((error:any) => {
                    console.log(error);
                });
  }

  formatData(value:number)
  {
    let strValue : string;
    if (value)
    {
      strValue = value.toString() + "%";
      if (value > 0)
        strValue = "+" + strValue;
      strValue = " (" + strValue + ")";
    }

    return strValue;
  }

  appendPerSign(value: number)
  {
    let strValue :string
    if (value)
    {
      strValue = " (" + value.toString() + "%)" ;
    }
    return strValue;
  }
}
