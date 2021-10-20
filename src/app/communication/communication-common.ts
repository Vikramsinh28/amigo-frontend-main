import { Injectable } from "@angular/core";
import { BackendService } from "../backend";
import { CommonService, downloadFile } from "../_helpers/common";

@Injectable({
    providedIn: 'root'
})
export class CommunicationCommonFunctions {
    constructor(
        private backendService: BackendService,
        private snackBar: CommonService
    ) { }

    async shareWithStudents(commId) {
        let data = { communicationId: commId };
        let returnResult = 0;
        await this.backendService.shareWithStudents(data).toPromise().then(result => {
            returnResult = 1;
        })
            .catch(e => {
                returnResult = 0;
                console.error(e.error);
            });
        return returnResult;
    }

    async deleteCommunication(commId) {
        //let data = {communicationId: commId};
        let returnResult = 0;
        await this.backendService.deleteCommunicationDetails(commId).toPromise().then(result => {
            returnResult = 1;
        })
            .catch(e => {
                returnResult = 0;
                console.error(e.error);
            });
        return returnResult;
    }

    async downloadFile(commId, fileName) {
        await this.backendService.downloadCommunicationAttachment(commId)
            .toPromise()
            .then(result => {
                downloadFile(result, fileName, true);
            })
            .catch(e => {
                this.showErrorMsg("Something went wrong!")
                console.error(e.error);
            });
    }

    showErrorMsg(errMsg) {
        this.snackBar.showErrorMsg(errMsg);
    }

    showSucessMsg(msg) {
        this.snackBar.showSuccessMsg(msg);
    }

    ValidateDates(fromDate, toDate, dateMiddleFix): Boolean {
        if (toDate && (fromDate == undefined || fromDate == null)) {
            this.showErrorMsg("Please specify 'From " + dateMiddleFix + " Date'.")
            return false;
        }

        if (fromDate && (toDate == undefined || toDate == null)) {
            this.showErrorMsg("Please specify 'To " + dateMiddleFix + " Date'.")
            return false;
        }
        return true;
    }
}
