import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { BackendService } from '../backend';
import { DeleteConfirmationDialogComponent } from '../delete-confirmation-dialog/delete-confirmation-dialog.component';
import { ClientGrade } from '../entities/clientGrade';
import { ClientSubject, SubjectGroupSubject } from '../entities/clientSubject';
import { ClientYear } from '../entities/clientYear';
import { FrontendService } from '../_services/frontend.service';
import { EventQueueService, AppEvent, AppEventType} from '../_services/broadcast-events/event.queue.service'
import { CommonService } from '../_helpers/common';

export interface SubjectCategory {
  category: number;
  categoryName: string;
}
@Component({
  selector: 'app-subject-subject-group',
  templateUrl: './subject-subject-group.component.html',
  styleUrls: ['./subject-subject-group.component.scss']
})
export class SubjectSubjectGroupComponent implements OnInit {
  subjectDisplayColumn: string[] = ['subject', 'category', 'edit-save', 'delete'];
  mandatorySubjectGroupDisplayColumn: string[] = ['groupName', 'edit-save-groupName', 'mandatorySubjects', 'edit-save', 'delete'];
  optionalSubjectGroupDisplayColumn: string[] = ['groupName', 'edit-save-groupName', 'optionalSubjects', 'edit-save', 'delete'];
  selectedYear: any = -1;
  currentYear: any = -1;
  selectedGrade: any;
  userIdentity: any;
  defaultSubjectId: number = 0;
  defaultSubjectGroupId: number = 0;
  clientYear: ClientYear[];
  grades: ClientGrade[];
  subjectCategory: SubjectCategory[];
  mandatorySubjectGroup: SubjectGroupSubject[];
  optionalSubjectGroup: SubjectGroupSubject[];
  subjects: ClientSubject[];
  subjectDataSource = new MatTableDataSource<ClientSubject>();
  mandatorySubjectGroupDataSource = new MatTableDataSource<SubjectGroupSubject>();
  optionalSubjectGroupDataSource = new MatTableDataSource<SubjectGroupSubject>();
  rowNo: any;
  table: any;
  year: any;
  grade: any;
  routeFlag: any = "false";


  constructor(public dialog: MatDialog,
    private backendService: BackendService,
    private frontendService: FrontendService,
    private snackBar: CommonService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private eventQueue: EventQueueService) { }

  ngOnInit(): void {
    this.activatedRoute.queryParamMap.subscribe(paramMap => {
      if (paramMap.get('year') && paramMap.get('grade') && paramMap.get('flag')) {
        this.year = Number(paramMap.get('year'));
        this.selectedGrade = Number(paramMap.get('grade'));
        this.routeFlag = paramMap.get('flag');
      }
    })
    this.userIdentity = this.frontendService.getJWTUserIdentity();
    // One single API to get all necessary data at time of initalization. Data like clientYear, clientSubject, clientCatrgory.
    this.backendService.getSubjectGroupData(this.userIdentity.clientId).toPromise().then((result: any) => {
      this.subjectCategory = result.category;
      this.subjects = result.subject;
      this.clientYear = result.year;
      this.subjects.forEach((f) => {
        f.openForEdit = false;
      });
      this.subjectDataSource.data = this.subjects;
      this.clientYear.forEach((f) => {
        if (this.routeFlag === "true") {
          if (f.clientYearId === this.year) {
            this.selectedYear = f;
          }
        }
        if (f.isCurrentYear == 1) {
          this.currentYear = f;
          if (this.routeFlag === "false") {
            this.selectedYear = f;
            this.loadGrade(this.selectedYear);
          }
        }
      });
      if (this.routeFlag === "true") {
        // debugger;
        // this.selectedYear = this.clientYear.filter(x => x.clientYearId === this.year);
        this.loadGrade(this.selectedYear);
      }
    }).catch((error: any) => {
      this.showErrMsg(error.error)
    })
  }

  // On year selected get grades of selected grade.
  onYearSelected(selectedYear) {
    this.mandatorySubjectGroup = [];
    this.optionalSubjectGroup = [];
    this.mandatorySubjectGroupDataSource.data = null;
    this.optionalSubjectGroupDataSource.data = null;
    this.selectedGrade = null;
    this.selectedYear = selectedYear;
    this.grades = [] = [];
    this.loadGrade(selectedYear)
  }

  loadGrade(selectedYear) {
    this.backendService
      .getClientGrades(this.userIdentity.clientId, selectedYear.clientYearId)
      .toPromise().then(
        (result: any) => {
          this.grades = result;
          this.grades.forEach(f => {
            if (f.gradeId == this.grade) {
              this.selectedGrade = f;
              this.onGradeSelected(f);
            }
          })
        },
        (error: any) => {
          this.showErrMsg(error.error)
        }
      );
  }

  // Get subject-group data for selected grade and year.
  onGradeSelected(selectedGrade) {
    this.backendService.getClientSubjectGroup(this.userIdentity.clientId, this.selectedYear.clientYearId, selectedGrade.gradeId, "subject-group").toPromise().then((result: any) => {
      this.mandatorySubjectGroup = result.filter(r => r.isMandatory === 'Y');
      this.optionalSubjectGroup = result.filter(r => r.isMandatory === 'N');
      this.mandatorySubjectGroup.forEach((f) => {
        f.openForEdit = false;
        f.isGroupNameEditable = false;
        f.subjectGroupSubjectDetails.forEach((f) => { f.isSubjectGroupSubjectAdded = false; f.isSubjectGroupSubjectDeleted = false })
      })
      this.optionalSubjectGroup.forEach((f) => {
        f.openForEdit = false;
        f.isGroupNameEditable = false;
        f.subjectGroupSubjectDetails.forEach((f) => { f.isSubjectGroupSubjectAdded = false; f.isSubjectGroupSubjectDeleted = false })
      })
      this.mandatorySubjectGroupDataSource.data = this.mandatorySubjectGroup;
      this.optionalSubjectGroupDataSource.data = this.optionalSubjectGroup;
    }).catch((error: any) => {
      this.showErrMsg(error.error)
    })
  }

  //<--------------------------------------------------------- CRUD operation for subject starts from here -------------------------------------------------->
  addNewSubject() {
    this.defaultSubjectId = this.defaultSubjectId - 1;
    let subject: ClientSubject = {
      subjectId: this.defaultSubjectId,
      clientId: this.userIdentity.clientId,
      subjectName: "",
      category: -1,
      openForEdit: true
    }
    var subjectData = this.subjectDataSource.data;
    subjectData.push(subject);
    this.subjectDataSource.data = subjectData;
  }

  editSubject(rowNo, data) {
    this.subjectDataSource.data[rowNo].undoValue = this.subjectDataSource.data[rowNo].subjectName;
    this.subjectDataSource.data[rowNo].openForEdit = true;
  }

  saveSubject(rowNo, data) {
    if (data.subjectName.toString().trim().length > 0 && data.subjectName.toString().trim() !== null) {
      if (data.category > 0) {
        let subject: ClientSubject = {
          subjectName: data.subjectName.toString().trim(),
          category: data.category,
        }
        // Save newly created subject
        if (data.subjectId < 0) {
          this.backendService.postClientSubject(this.userIdentity.clientId, this.userIdentity.userId, subject).toPromise().then((result: any) => {
            this.subjectDataSource.data[rowNo].subjectId = result;
            this.subjectDataSource.data[rowNo].openForEdit = false;
            this.subjectDataSource.data[rowNo].subjectName = data.subjectName;
            this.snackBar.showSuccessMsg("Subject :" + data.subjectName + " inserted sucessfully");
          }).catch((error: any) => {
            this.showErrMsg(error.error)
          })
        } else {
          // Update existing subject
          subject.subjectId = data.subjectId
          this.backendService.putClientSubject(this.userIdentity.clientId, this.userIdentity.userId, subject).toPromise().then((result: any) => {
            this.subjectDataSource.data[rowNo].openForEdit = false;
            this.subjectDataSource.data[rowNo].subjectName = data.subjectName;
            if (this.mandatorySubjectGroup.length > 0) {
              this.mandatorySubjectGroup.forEach((f) => {
                f.subjectGroupSubjectDetails.find(x => x.subjectId === data.subjectId).subjectName = data.subjectName;
              })
            }
            if (this.optionalSubjectGroup.length > 0) {
              this.optionalSubjectGroup.forEach((f) => {
                f.subjectGroupSubjectDetails.find(x => x.subjectId === data.subjectId).subjectName = data.subjectName;
              })
            }
            this.snackBar.showSuccessMsg(result);
          }).catch((error: any) => {
            this.showErrMsg(error.error)
          })
        }

      } else {
        this.snackBar.showErrorMsg('Subject category is required');
      }
    } else {
      this.snackBar.showErrorMsg('Subject name is required');
    }
  }

  // Delete newly created subject.This will only delete subject which are created in front-end but not saved to database.
  deleteNewlyCreatedSubject(subjectId) {
    this.subjectDataSource.data = this.subjectDataSource.data.filter(
      (value) => {
        return value.subjectId != subjectId;
      }
    );
  }
  //<---------------------------------------------CRUD operation for subject ENDS--------------------------------------->

  //CRUD OPERATION FOR SUBJECT GROUP STARTS FROM HERE....
  // Save mandatory table data
  saveMandatoryGroup(data, rowNo, column) {
    if (this.validateData(data.groupCode)) {
      // Subject group should have atleast one subject.
      if (this.validateSubjectGroupData(data)) {
        let compGroupData: any = {
          gradeId: this.selectedGrade.gradeId,
          groupCode: data.groupCode.toString().trim(),
          isMandatory: data.isMandatory,
        }
        // Newly created subject group
        if (data.subjectGroupId < 0) {
          compGroupData.subjectIds = data.subjectGroupSubjectDetails.map(id => id.subjectId);
          this.backendService.postClientSubjectGroup(this.userIdentity.clientId, this.userIdentity.userId, compGroupData).toPromise().then((result: any) => {
            // Binding subjectGroup Id 
            this.mandatorySubjectGroupDataSource.data[rowNo].subjectGroupId = result.subjectGroupId;
            // Binding subjectGroup subjects 
            this.mandatorySubjectGroupDataSource.data[rowNo].subjectGroupSubjectDetails.forEach((f) => {
              f.subjectGroupSubjectId = result.subjectGroupSubjectIds[f.subjectId];
            })
            this.mandatorySubjectGroupDataSource.data[rowNo].openForEdit = false;
            this.mandatorySubjectGroupDataSource.data[rowNo].isGroupNameEditable = false;
            this.showSucessMsgOnGroupInserted(data.groupCode);

          }).catch((error: any) => {
            this.showErrMsg(error.error);
          });
        } else {
          // Existing subject group.
          // Check which column is updated either group name or group subjects.
          compGroupData.subjectGroupId = data.subjectGroupId;
          switch (column) {
            case 'groupName':
              this.backendService.putClientSubjectGroupName(this.userIdentity.clientId, this.userIdentity.userId, compGroupData).toPromise().then((result: any) => {
                this.mandatorySubjectGroupDataSource.data[rowNo].isGroupNameEditable = false;
                this.snackBar.showSuccessMsg(result);
              }).catch((error: any) => {
                this.showErrMsg(error.error);
              })
              break;
            case 'group':
              var { addedSubjects, deletedSubjects } = this.getNewlyAdded_DeletedSubjectGroupSubject(this.mandatorySubjectGroupDataSource.data[rowNo].subjectGroupSubjectDetails)
              compGroupData.addedSubjectGroupSubjectIds = addedSubjects.length > 0 ? addedSubjects : null;
              compGroupData.deletedSubjectGroupSubjectIds = deletedSubjects.length > 0 ? deletedSubjects : null;
              this.backendService.putClientSubjectGroupSubject(this.userIdentity.userId, compGroupData).toPromise().then((result: any) => {
                if (result !== null) {
                  // Binding subjectGroup subjects 
                  this.mandatorySubjectGroupDataSource.data[rowNo].subjectGroupSubjectDetails.forEach((f) => {
                    if (f.subjectGroupSubjectId === 0) {
                      f.subjectGroupSubjectId = result.subjectGroupSubjectIds[f.subjectId];
                      f.isSubjectGroupSubjectAdded = false;
                      f.isSubjectGroupSubjectDeleted = false;
                    }
                  })
                }
                this.showUpdateMsgOnGroupSubjectUpdate(data.groupCode);
                this.mandatorySubjectGroupDataSource.data[rowNo].openForEdit = false;
              }).catch((error: any) => {
                this.showErrMsg(error.error);
              })
              break;
          }
        }
      } else {
        this.showMinimumSubjectError(data.groupCode)
      }
    } else {
      this.snackBar.showErrorMsg('Group Name is required.');
    }
  }

  // Delete subjects in mandatory table..
  deleteCompSubjects(rowNo, subjectId) {
    this.mandatorySubjectGroupDataSource.data[rowNo].subjectGroupSubjectDetails.forEach((f) => {
      if (f.subjectId === subjectId) {
        f.isSubjectGroupSubjectDeleted = true;
      }
    })
  }

  //<-------------------------------------------- CRUD operation for optional table starts here------------------------------------------->
  // Save optional table data
  saveOptionalGroup(data, rowNo, column) {
    if (this.validateData(data.groupCode)) {
      // Subject group should have atleast one subject.
      if (this.validateSubjectGroupData(data)) {
        let optGroupData: any = {
          gradeId: this.selectedGrade.gradeId,
          groupCode: data.groupCode.toString().trim(),
          isMandatory: data.isMandatory,
        }
        // Newly created subject group
        if (data.subjectGroupId < 0) {
          optGroupData.subjectIds = data.subjectGroupSubjectDetails.map(id => id.subjectId);
          this.backendService.postClientSubjectGroup(this.userIdentity.clientId, this.userIdentity.userId, optGroupData).toPromise().then((result: any) => {
            // Binding subjectGroup Id 
            this.optionalSubjectGroupDataSource.data[rowNo].subjectGroupId = result.subjectGroupId;
            // Binding subjectGroup subjects 
            this.optionalSubjectGroupDataSource.data[rowNo].subjectGroupSubjectDetails.forEach((f) => {
              f.subjectGroupSubjectId = result.subjectGroupSubjectIds[f.subjectId];
            })
            this.optionalSubjectGroupDataSource.data[rowNo].openForEdit = false;
            this.optionalSubjectGroupDataSource.data[rowNo].isGroupNameEditable = false;
            this.showSucessMsgOnGroupInserted(data.groupCode);

          }).catch((error: any) => {
            this.showErrMsg(error.error);
          })
        } else {
          // Existing subject group.
          // Check which column is updated either group name or group subjects.
          optGroupData.subjectGroupId = data.subjectGroupId;
          switch (column) {
            case 'groupName':
              this.backendService.putClientSubjectGroupName(this.userIdentity.clientId, this.userIdentity.userId, optGroupData).toPromise().then((result: any) => {
                this.mandatorySubjectGroupDataSource.data[rowNo].isGroupNameEditable = false;
                this.snackBar.showSuccessMsg(result);
              }).catch((error: any) => {
                this.showErrMsg(error.error);
              })
              break;
            case 'group':
              var { addedSubjects, deletedSubjects } = this.getNewlyAdded_DeletedSubjectGroupSubject(this.optionalSubjectGroupDataSource.data[rowNo].subjectGroupSubjectDetails)
              optGroupData.addedSubjectGroupSubjectIds = addedSubjects.length > 0 ? addedSubjects : null;
              optGroupData.deletedSubjectGroupSubjectIds = deletedSubjects.length > 0 ? deletedSubjects : null;
              this.backendService.putClientSubjectGroupSubject(this.userIdentity.userId, optGroupData).toPromise().then((result: any) => {
                if (result !== null) {
                  // Binding subjectGroup subjects 
                  this.optionalSubjectGroupDataSource.data[rowNo].subjectGroupSubjectDetails.forEach((f) => {
                    if (f.subjectGroupSubjectId === 0) {
                      f.subjectGroupSubjectId = result.subjectGroupSubjectIds[f.subjectId];
                      f.isSubjectGroupSubjectAdded = false;
                      f.isSubjectGroupSubjectDeleted = false;
                    }
                  })
                }
                this.showUpdateMsgOnGroupSubjectUpdate(data.groupCode);
                this.optionalSubjectGroupDataSource.data[rowNo].openForEdit = false;
              }).catch((error: any) => {
                this.showErrMsg(error.error);
              })
              break;
          }
        }
      } else {
        this.showMinimumSubjectError(data.groupCode)
      }
    } else {
      this.snackBar.showErrorMsg('Group Name is required.');
    }
  }

  // Delete subjects in optional table.
  deleteOptSubjects(rowNo, subjectId) {
    this.optionalSubjectGroupDataSource.data[rowNo].subjectGroupSubjectDetails.forEach((f) => {
      if (f.subjectId === subjectId) {
        f.isSubjectGroupSubjectDeleted = true;
      }
    })
  }


  // ------------------------------------Common functions for mandatory/optional table -----------------------------------------

  //  Add new Group for selected Year and Grade.
  addNewSubjectGroup(table) {
    if (this.selectedGrade != null && this.selectedYear != null) {
      this.defaultSubjectGroupId = this.defaultSubjectGroupId - 1;
      let tempNewSubject: SubjectGroupSubject = {
        groupCode: '',
        subjectGroupSubjectDetails: [],
        subjectGroupId: this.defaultSubjectGroupId,
        subjectName: '',
        openForEdit: true,
        isGroupNameEditable: true,
        countSubjectGroupInUse: 0
      }
      switch (table) {
        case 'mandatoryTable':
          tempNewSubject.isMandatory = 'Y';
          var tempCompData = this.mandatorySubjectGroupDataSource.data;
          tempCompData.push(tempNewSubject);
          this.mandatorySubjectGroupDataSource.data = tempCompData;
          break;
        case 'optionalTable':
          tempNewSubject.isMandatory = 'N';
          var tempOpData = this.optionalSubjectGroupDataSource.data;
          tempOpData.push(tempNewSubject);
          this.optionalSubjectGroupDataSource.data = tempOpData;
          break;
      }
    } else {
      this.snackBar.showErrorMsg('Grade not selected');
    }
  }

  //  Edit Group Name/Group Subject for selected Group.
  onEditBtnClick(subjectGroupId, rowNo, group, column?) {
    switch (group) {
      case 'mandatoryTable':
        if (subjectGroupId < 0) {
          this.mandatorySubjectGroupDataSource.data[rowNo].openForEdit = true;
          this.mandatorySubjectGroupDataSource.data[rowNo].isGroupNameEditable = true;
        } else {
          switch (column) {
            case 'groupName':
              this.mandatorySubjectGroupDataSource.data[rowNo].isGroupNameEditable = true;
              break;
            case 'group':
              this.mandatorySubjectGroupDataSource.data[rowNo].openForEdit = true;
              break;
          }
        }
        break;
      case 'optionalTable':
        if (subjectGroupId < 0) {
          this.optionalSubjectGroupDataSource.data[rowNo].openForEdit = true;
          this.optionalSubjectGroupDataSource.data[rowNo].isGroupNameEditable = true;
        } else {
          switch (column) {
            case 'groupName':
              this.optionalSubjectGroupDataSource.data[rowNo].isGroupNameEditable = true;
              break;
            case 'group':
              this.optionalSubjectGroupDataSource.data[rowNo].openForEdit = true;
              break;
          }
        }
        break;
    }
  }

  // On subject dragged and droped in mandatory/optional table.
  drop(event: CdkDragDrop<any>) {
    if (this.rowNo != null && this.table != null && event.container.data != null) {
      switch (this.table) {
        case 'mandatoryTable':
          var tempCompData = this.mandatorySubjectGroup[this.rowNo].subjectGroupSubjectDetails.filter(x => x.subjectId === event.container.data.subjectId)[0]
          if (tempCompData != null) {
            if (tempCompData.isSubjectGroupSubjectDeleted) {
              tempCompData.isSubjectGroupSubjectDeleted = false;
              break;
            } else {
              this.showDuplicateSubjectSnackBarPreview();
              break;
            }
          } else {
            this.mandatorySubjectGroupDataSource.data[this.rowNo].subjectGroupSubjectDetails.push({ subjectName: event.container.data.subjectName, subjectId: event.container.data.subjectId, subjectGroupSubjectId: 0, isSubjectGroupSubjectAdded: true, isSubjectGroupSubjectDeleted: false })
            break;
          }
        case 'optionalTable':
          var tempOptData = this.optionalSubjectGroup[this.rowNo].subjectGroupSubjectDetails.filter(x => x.subjectId === event.container.data.subjectId)[0]
          if (tempOptData != null) {
            if (tempOptData.isSubjectGroupSubjectDeleted) {
              tempOptData.isSubjectGroupSubjectDeleted = false;
              break;
            } else {
              this.showDuplicateSubjectSnackBarPreview();
              break;
            }
          } else {
            this.optionalSubjectGroupDataSource.data[this.rowNo].subjectGroupSubjectDetails.push({ subjectName: event.container.data.subjectName, subjectId: event.container.data.subjectId, subjectGroupSubjectId: 0, isSubjectGroupSubjectAdded: true, isSubjectGroupSubjectDeleted: false })
            break;
          }
      }
    }
  }

  // This function helps to find row number and table name to drop selected subject.
  onRowHover(row, tableName) {
    this.rowNo = row;
    this.table = tableName;
  }

  // Common function to show error message if same subject droped, already there in subject-group in mandatory/optional table.
  showDuplicateSubjectSnackBarPreview() {
    this.snackBar.showErrorMsg("Subject already exists");
  }

  // Delete group.
  deleteGroup(element, table) {
    if (element.subjectGroupId > 0) {
      let dialogMsg =
        'Are you sure you want to delete Group: ' +
        element.groupCode +
        ' of ' +
        this.selectedYear.year +
        ' ?';
      const dialogRef = this.dialog.open(DeleteConfirmationDialogComponent, {
        width: '500px',
        disableClose: true,
        data: {
          title: 'Confirm Group Delete',
          message: dialogMsg,
          yes: 'Delete',
          no: 'Cancel',
        },
      });
      dialogRef.afterClosed().subscribe((result) => {
        if (result) {
          this.backendService.deleteClientSubjectGroup(this.selectedGrade.gradeId, element.subjectGroupId).toPromise().then(
            (result) => {
              this.deleteGroupInFront_End(element.subjectGroupId, table);
              this.snackBar.showSuccessMsg(result);
            })
            .catch((error:any) => {
              this.showErrMsg(error.error);
            }
          );
        }
      });
    } else {
      // Delete new added row which is not in database.
      this.deleteGroupInFront_End(element.subjectGroupId, table);
    }
  }

  // Common function that deletes group for mandatory/optional table.
  deleteGroupInFront_End(subjectGroupId, table) {
    switch (table) {
      case 'mandatoryTable':
        this.mandatorySubjectGroupDataSource.data = this.mandatorySubjectGroupDataSource.data.filter((value) => {
          return value.subjectGroupId != subjectGroupId;
        });
        break;
      case 'optionalTable':
        this.optionalSubjectGroupDataSource.data = this.optionalSubjectGroupDataSource.data.filter((value) => {
          return value.subjectGroupId != subjectGroupId;
        });
        break;
    }
  }

  // This function returns count of total subjects deleted. Subjects are count on the basis of field->"isSubjectGroupSubjectDeleted"
  checkIsSubjectDeletable(data) {
    var length = data.length;
    var countFlagIsDeleted = data.filter(x => x.isSubjectGroupSubjectDeleted);
    if (countFlagIsDeleted.length === length) {
      return false;
    } else if (countFlagIsDeleted.length < length) {
      return true;
    }
  }

  // This function returns subjectIds for given data in array.
  getSubjectGroupSubjectIds(data) {
    return data.subjectGroupSubjectDetails.map(id => id.subjectId);
  }

  // This function returns added/deleted subjects in particular group.
  getNewlyAdded_DeletedSubjectGroupSubject(data) {
    var addedSubjects: any = [];
    var deletedSubjects: any = [];
    data.forEach(element => {
      if (element.isSubjectGroupSubjectAdded && element.subjectGroupSubjectId === 0) {
        addedSubjects.push(element.subjectId);
      }
      if (element.isSubjectGroupSubjectDeleted && element.subjectGroupSubjectId > 0) {
        deletedSubjects.push(element.subjectGroupSubjectId);
      }
    });
    return { addedSubjects, deletedSubjects };
  }

  // Common function to show error msg if user tries to delete all subject for selected group.
  showMinimumSubjectError(groupName) {
    this.snackBar.showErrorMsg('Atleast one subject should be there for Group :' + groupName);
  }

  showSucessMsgOnGroupInserted(groupCode) {
    this.snackBar.showSuccessMsg("Group :" + groupCode + " created sucessfully.");
  }

  showUpdateMsgOnGroupSubjectUpdate(groupCode) {
    this.snackBar.showSuccessMsg("Subjects for Group :" + groupCode + " updated sucessfully");
  }

  showErrMsg(errMsg) {
    this.snackBar.showErrorMsg(errMsg);
  }

  validateData(data) {
    if (data.toString().trim().length > 0 && data.toString().trim() !== null) {
      return true;
    } else {
      return false;
    }
  }

  validateSubjectGroupData(data) {
    if (data.subjectGroupSubjectDetails != null && data.subjectGroupSubjectDetails.length > 0 && this.checkIsSubjectDeletable(data.subjectGroupSubjectDetails)) {
      return true;
    } else {
      return false;
    }
  }

  navigateGradeDivision() {
    this.router.navigate(['/grade-division'], { queryParams: { 'year': this.selectedYear.clientYearId } });
    this.eventQueue.dispatch(new AppEvent(AppEventType.NavigationCardChanged, {label: 'Grade & Division'}));
  }

  navigatePromotion() {
    if (!this.selectedGrade) {
      this.selectedGrade = -1;
    }
    this.router.navigate(['/student-promotion'], { queryParams: { 'grade': this.selectedGrade.gradeId } });
    this.eventQueue.dispatch(new AppEvent(AppEventType.NavigationCardChanged, {label: 'Student Promotion'}));
  }

  undoInputText(rowNo) {
    this.subjects[rowNo].subjectName = this.subjects[rowNo].undoValue;
    this.subjectDataSource.data[rowNo].openForEdit = false;
  }

}
