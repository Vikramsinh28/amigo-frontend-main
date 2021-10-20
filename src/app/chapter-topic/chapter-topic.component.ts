import { Component, OnInit, ViewChild } from '@angular/core';
import { FlatTreeControl } from '@angular/cdk/tree';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { BehaviorSubject } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { BackendService } from 'src/app/backend';
import { ChapterTopicFlatNode, ChapterTopicNode } from '../entities/chapterTopicNew';
import { HttpErrorResponse } from '@angular/common/http';
import { FrontendService } from '../_services/frontend.service';
import { DeleteConfirmationDialogComponent } from '../delete-confirmation-dialog/delete-confirmation-dialog.component';
import { CommonService } from '../_helpers/common';
import { CommonGradeSubjectComponent, CommonGradeSubjectConfiguration } from '../_components/common-grade-subject/common-grade-subject.component';


@Component({
  selector: 'app-chapter-topic',
  templateUrl: './chapter-topic.component.html',
  styleUrls: ['./chapter-topic.component.scss'],
})
export class ChapterTopicComponent implements OnInit {

  flatNodeMap = new Map<ChapterTopicFlatNode, ChapterTopicNode>();

  /** Map from nested node to flattened node. This helps us to keep the same object for selection */
  nestedNodeMap = new Map<ChapterTopicNode, ChapterTopicFlatNode>();

  clientGrades: any = [];
  clientSubjects: any = [];
  data: any = [];
  dataChange = new BehaviorSubject<ChapterTopicNode[]>([]);

  editNodeItemData: ChapterTopicFlatNode = new ChapterTopicFlatNode();
  isNodeEditable: boolean = false;

  /**Current user data */
  userIdentity;

  treeControl: FlatTreeControl<ChapterTopicFlatNode>;

  treeFlattener: MatTreeFlattener<ChapterTopicNode, ChapterTopicFlatNode>;

  dataSource: MatTreeFlatDataSource<ChapterTopicNode, ChapterTopicFlatNode>;

  @ViewChild(CommonGradeSubjectComponent) filter: CommonGradeSubjectComponent;
  config: CommonGradeSubjectConfiguration = new CommonGradeSubjectConfiguration();


  constructor(public dialog: MatDialog, private backendService: BackendService, private frontendService: FrontendService,
    private snackbar:CommonService) {
    this.userIdentity = this.frontendService.getJWTUserIdentity();
    this.treeFlattener = new MatTreeFlattener(this.transformer, this.getLevel,
      this.isExpandable, this.getChildren);
    this.treeControl = new FlatTreeControl<ChapterTopicFlatNode>(this.getLevel, this.isExpandable);
    this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
    this.dataChange.subscribe(data => {
      this.dataSource.data = data;
    });
  }

  ngOnInit() {
   // this.getClientGrades();
    this.config.isGradeRequired = true;
    this.config.isSubjectVisible = true;
    this.config.isSubjectRequired = true;
    this.config.isChapterVisible = false;
    this.config.isTopicVisible = false;
    this.config.isQTypeVisible = false;
    }



  /** Load chapter and topic of selected grade and selected subject */
  loadData(grade: string, subjectId: any) {
    this.isNodeEditable = false;
    this.backendService.getClientChapterTopics(grade, subjectId).toPromise().then(res => {
      this.data = res;
      this.dataChange.next(this.data);
    }).catch((error:any) => {
                    console.log(error);
                });

  }

  /** Refresh data */
  refreshData() {
    if (!this.filter.validateForm()) return;
    this.isNodeEditable = false;
    let filterData = this.filter.value;
    this.loadData(filterData.grade, filterData.subject);
  }

  getLevel = (node: ChapterTopicFlatNode) => node.level;

  isExpandable = (node: ChapterTopicFlatNode) => node.expandable;

  getChildren = (node: ChapterTopicNode): ChapterTopicNode[] => node.topics;

  hasChild = (_: number, _nodeData: ChapterTopicFlatNode) => _nodeData.expandable;

  hasNoContent = (_: number, _nodeData: ChapterTopicFlatNode) => _nodeData.topicName === '';

  /**
   * Transformer to convert nested node to flat node. Record the nodes in maps for later use.
   */
  transformer = (node: ChapterTopicNode, level: number) => {
    const existingNode = this.nestedNodeMap.get(node);
    const flatNode = existingNode && existingNode.topicName === node.topicName
      ? existingNode
      : new ChapterTopicFlatNode();
    flatNode.chapterTopicId = node.chapterTopicId;
    flatNode.topicName = node.topicName;
    flatNode.level = level;
    flatNode.expandable = !!node.topics?.length;
    this.flatNodeMap.set(flatNode, node);
    this.nestedNodeMap.set(node, flatNode);
    return flatNode;
  }


  /* Get the parent node of a node */
  getParentNode(node: ChapterTopicFlatNode): ChapterTopicFlatNode | null {
    const currentLevel = this.getLevel(node);

    if (currentLevel < 1) {
      return null;
    }

    const startIndex = this.treeControl.dataNodes.indexOf(node) - 1;

    for (let i = startIndex; i >= 0; i--) {
      const currentNode = this.treeControl.dataNodes[i];

      if (this.getLevel(currentNode) < currentLevel) {
        return currentNode;
      }
    }
    return null;
  }

  /** Get position of parent(Chapter) node */
  findPosition(id: number, data: ChapterTopicNode[]) {
    for (let i = 0; i < data.length; i += 1) {
      if (id === data[i].chapterTopicId) {
        return i;
      }
    }
  }

  /** Add chapter node */
  addChapterNode() {
    //Check if grade and subject both are selected
    let filterValue = this.filter.value
    if (filterValue.grade && filterValue.subject) {
      // Created empty array object
      let data: ChapterTopicNode[] = []

      // Created child node.
      let childNode: ChapterTopicNode[] = []
      childNode.push({
        chapterTopicId: -1,
        topicName: '',
        topics: [],
        defaultTopic: -1
      })

      // Created parent node and assign child node to parent node.This will create parent-child relationship.
      let parentNode: ChapterTopicNode = {
        chapterTopicId: this.dataSource.data.length + 1,// Every time new node created assign dumy value as to remove conflit on save and random insertion.
        topicName: '',
        topics: childNode,
        defaultTopic: -1
      }

      // Pushed parentNode to data array.
      data.push(parentNode)

      // Copy data from datasource into new variable.
      let newData = this.dataSource.data

      // Push parentNode to this new variable.
      newData.push(parentNode)

      // Whole new variable is push to datachange, which will update datasource with new node.
      this.dataChange.next(newData)
    } else {
      this.snackbar.showErrorMsg("Please select grade and subject");
    }
  }

  /** Add topic node. */
  addTopicNode(node: ChapterTopicFlatNode) {
    const parentNode = this.flatNodeMap.get(node);

    //Initally node will not contain any data.This helps to triger hasNoContent function.
    this.insertNewTopicNode(parentNode!, '');
    this.treeControl.expand(node);
  }

  /** Edit chapter/topic node. This will enable inline-edit of node.*/
  editNode(node: ChapterTopicFlatNode) {
    if (!this.isNodeEditable) {
      this.editNodeItemData = node;
      this.isNodeEditable = true;
    }
  }

  /** Save the node to database  */
  saveChapterTopicNode(node: ChapterTopicFlatNode, itemValue: string) {
    let filterValue = this.filter.value
    if (itemValue.length > 0) {
      let parentNode = this.getParentNode(node);
      if (parentNode != null) {
        this.backendService.postChapterOrTopic(itemValue, filterValue.subject, filterValue.grade, parentNode.chapterTopicId, this.userIdentity.clientId, 1)
          .toPromise().then((response: any) => {
            this.isNodeEditable = false;
            this.snackbar.showSuccessMsg("New topic \'" + itemValue + "\' created");
            const nestedNode = this.flatNodeMap.get(node);
            nestedNode.chapterTopicId = response;
            this.updateNewTopicNode(nestedNode!, itemValue);
          }).catch((error: any) => {
            this.snackbar.showErrorMsg(error.error);
          })
      }
      else {
        this.backendService.postChapterOrTopic(itemValue, filterValue.subject, filterValue.grade, null, this.userIdentity.clientId, 0).toPromise().then((response: any) => {
          this.snackbar.showSuccessMsg("New chapter \'" + itemValue + "\' created");
          this.isNodeEditable = false;
          this.refreshData();
        }).catch((error: any) => {
          this.snackbar.showErrorMsg(error.error);
        });
      }
    }
  }


  /** Add newly added topic node to front-end after sucessfull saved to database.*/
  insertNewTopicNode(parent: ChapterTopicNode, name: string) {
    const child = <ChapterTopicNode>{ topicName: name };
    parent.topics.push(child);
    this.dataChange.next(this.data);
    this.isNodeEditable = false;
  }

  /** Update the newly added topic node to front-end after sucessfull saved to database. */
  updateNewTopicNode(node: ChapterTopicNode, name: string) {
    node.topicName = name;
    this.dataChange.next(this.data);
    this.isNodeEditable = false;
  }

  /** Save the edited chapter/topic node to database */
  saveEditedNode(node: ChapterTopicFlatNode, itemValue: string) {
    if (itemValue.length > 0) {
      this.updateEditNode(node!, itemValue);
    }
  }

  /** Update existing node to database. */
  updateEditNode(node: ChapterTopicFlatNode, ItemName: String) {
    let parentNode = this.getParentNode(node);
    // Removes more then 2 white-space and trim whole data.
    let topic = ItemName.trim();
    let filterValue = this.filter.value;
    if (topic !== null && topic.length > 0 && topic.length <= 200) {
      if (parentNode === null) {
        this.backendService.putChapterTopic(topic, node.chapterTopicId, filterValue.subject, filterValue.grade, null, this.userIdentity.clientId, 0).toPromise().then(response => {
          for (let i = 0; i < this.dataSource.data.length; i++) {
            if (node.chapterTopicId === this.dataSource.data[i].chapterTopicId) {
              this.dataSource.data[i].topicName = topic;
              this.dataChange.next(this.data);
              this.isNodeEditable = false;
              this.snackbar.showSuccessMsg("Chapter \'" + topic + "\' updated");
            }
          }
        }).catch((error: any) => {
          this.snackbar.showErrorMsg(error.toString());
        });
      }
      else {
        this.backendService.putChapterTopic(topic, node.chapterTopicId, filterValue.subject, filterValue.grade, parentNode.chapterTopicId, this.userIdentity.clientId, 1).toPromise().then(response => {
          this.snackbar.showSuccessMsg("Topic \'" + topic + "\' updated");
          this.dataSource.data.forEach(data => {
            data.topics.forEach(res => {
              if (res.chapterTopicId == node.chapterTopicId) {
                res.topicName = topic;
                this.dataChange.next(this.data);
                this.isNodeEditable = false;
              }
            })
          })
        }).catch((error: any) => {
          this.snackbar.showErrorMsg(error.toString());
        });
      }
    }
  }

  /** Delete node */
  deleteChapterTopicNode(node: ChapterTopicFlatNode) {
    let parentNode = this.getParentNode(node);
    const dialogRef = this.dialog.open(DeleteConfirmationDialogComponent, {
      width: '300px',
      disableClose: true,
      data: { title: 'Confirm', message: 'Are you sure you want to delete ' + node.topicName + ' ?', yes: 'Delete', no: 'Cancel' }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        let filterValue = this.filter.value;
        if (parentNode != null) {
          let parentPosition = this.findPosition(parentNode.chapterTopicId, this.dataSource.data);
          let flatNode = this.dataSource.data[parentPosition].topics;
          for (let i = flatNode.length - 1; i >= 0; i--) {
            if (flatNode[i].chapterTopicId === node.chapterTopicId) {
              this.backendService.deleteChapterTopic(this.userIdentity.userId, this.userIdentity.clientId, filterValue.grade, filterValue.subject, node.chapterTopicId, parentNode.chapterTopicId, 1).toPromise().then((response: any) => {
                let data = this.dataSource.data;
                data[parentPosition].topics.splice(i, 1);
                this.dataChange.next(data);
                this.snackbar.showSuccessMsg(response.toString());
              }).catch((error: any) => {
                this.snackbar.showErrorMsg(error.toString());
              });
            }
          }
        } else {
          for (let i = 0; i < this.dataSource.data.length; i++) {
            if (node.chapterTopicId === this.dataSource.data[i].chapterTopicId) {
              this.backendService.deleteChapterTopic(this.userIdentity.userId, this.userIdentity.clientId, filterValue.grade, filterValue.subject, node.chapterTopicId, null, 0).toPromise().then((response: any) => {
                let data = this.dataSource.data;
                data.splice(i, 1);
                this.dataChange.next(data);
                this.snackbar.showSuccessMsg(response.toString());
              }).catch((error: any) => {
                this.snackbar.showErrorMsg(error.toString());
              });
            }
          }
        }
      }
    });
  }

  // Close node on escape key press.
  closeNode() {
    this.isNodeEditable = false;
  }

  clearData(){
    this.filter.reset();
    this.dataSource.data = [];
  }

}
