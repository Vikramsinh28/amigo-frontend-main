export interface ChapterTopicNode {
    chapterTopicId: number;
    topicName: string;
    defaultTopic: number;
    topics: ChapterTopicNode[];
  }
  
  /** Flat chapter topic item node with expandable and level information */
  export class ChapterTopicFlatNode {
    chapterTopicId: number;
    topicName: string;
    level: number;
    expandable: boolean;
  }
  