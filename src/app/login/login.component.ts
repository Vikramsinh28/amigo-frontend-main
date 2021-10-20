import { Component, OnInit, OnDestroy, Renderer2 } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { first } from 'rxjs/operators';
import { Location } from '@angular/common';
import { environment } from '../../environments/environment';
import { BackendService } from '../backend';
import { fetchClientInternalNameFromURL, getMIMEType } from 'src/app/_helpers/common';

import { AuthenticationService } from '../_services'
import { MatDialog } from '@angular/material/dialog';
import { DeleteConfirmationDialogComponent } from '../delete-confirmation-dialog/delete-confirmation-dialog.component';

@Component({
    selector: 'app-login',
    templateUrl: 'login.component.html',
    styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {
    loginForm: FormGroup;
    loading = false;
    submitted = false;
    returnUrl: string;
    error: string;
    hide: boolean = true;
    success: string
    clientLogo: any;
    loaded: boolean = false;

    constructor(
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private authenticationService: AuthenticationService,
        private renderer: Renderer2,
        private location: Location,
        private backendService: BackendService,
        private sanitizer: DomSanitizer,
        public dialog: MatDialog
    ) {
        this.renderer.addClass(document.body, 'login');
        // redirect to home if already logged in
        if (this.authenticationService.currentUserValue) {
            this.router.navigate(['/']);
        }
    }
    ngOnDestroy(): void {
        this.renderer.removeClass(document.body, 'login');
    }

    ngOnInit() {
        this.loginForm = this.formBuilder.group({
            username: ['', Validators.required],
            password: ['', Validators.required]
        });

        // get return url from route parameters or default to '/'
        this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';

        // show success message on registration
        if (this.route.snapshot.queryParams['registered']) {
            this.success = 'Registration successful';
        }

        var clientInternalName = fetchClientInternalNameFromURL()
        this.backendService.getClientLogo(clientInternalName).toPromise().then((result: any) => {
            if (result.clientLogoFileName != null && result.clientLogoFileName != "" && result.clientLogo != null) {
                var fExt = result.clientLogoFileName.split('.').pop();
                var strMIME = getMIMEType(fExt.toLowerCase());
                this.clientLogo = 'data:' + strMIME + ';base64,' + result.clientLogo
                this.clientLogo = this.sanitizer.bypassSecurityTrustUrl(this.clientLogo);
                localStorage.setItem('clientLogo', JSON.stringify(this.clientLogo));
                this.loaded = true
            } else {
                console.log("Unable to load Client Logo. Please check Client Logo and Client Logo File Name are configured correctly.")
                this.loaded = true
            }
        }).catch((error: any) => {
            console.log("Unable to load Client logo ", error)
            this.loaded = true
        })
    }

    // convenience getter for easy access to form fields
    get f() { return this.loginForm.controls; }

    onSubmit() {
        var clientInternalName = fetchClientInternalNameFromURL()
        this.submitted = true;
        // reset alerts on submit
        this.error = null;
        this.success = null;
        //    // stop here if form is invalid
        if (this.loading) {
            return;
        }

        this.loading = true;
        this.authenticationService.login(clientInternalName, this.f.username.value, this.f.password.value)
            .pipe(first())
            .toPromise().then(
                data => {
                    //this.router.navigate([this.returnUrl]);
                    this.router.navigate(['home']);
                })
                .catch((error:any) => {
                    this.error = error.error.message;
                    this.loading = false;
                });
    }

    // fetchClientInternalNameFromURL() {
    //     var clientInternalName = environment.staticClient
    //     if (clientInternalName == "") {
    //         clientInternalName = location.hostname.split(".")[0]
    //     }
    //     return clientInternalName
    // }
    
    forgotPassword() {
        const dialogRef = this.dialog.open(DeleteConfirmationDialogComponent, {
            width: '300px',
            data: {title:'Forgot Password', message:'Please contact Admin to reset password.', yes:'Ok'},
            disableClose: true,
        });
        dialogRef.afterClosed().subscribe(result=>{
            if(result){
            console.log("Yet to be Implemented !");
            }
        })
    }
    passwordHideToggle()
    {
        this.hide = !this.hide;
    }
}