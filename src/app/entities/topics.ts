export interface Topics {
    id?: number;
    name: string;
    children_text?: string;
    children?: Topics[];
  }