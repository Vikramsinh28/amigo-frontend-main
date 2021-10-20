export interface NavItem {
  display: string;
  disabled?: boolean;
  icon: string;
  image: string;
  route?: string;
  children?: NavItem[];
}