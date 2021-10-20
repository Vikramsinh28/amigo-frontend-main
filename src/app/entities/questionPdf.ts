export interface TextLine
{
    text ?: string,
    style ?: string,
    ul ?:Options[],
    columns ?:Columns[],
    image ?: string,
    width ?: number,
    height ?: number,
    pageBreak ?: string,
    margin ?: Array<any>,
    alignment ?: string,
    canvas ?: any
}
export interface Options
{
  text ?: string,
  style ?: string,
}
export interface Columns
{
  svg ?: string,
  text ?: string,
  width ?: string,
  style ?: string,
  alignment ?: string
}
export interface File
{
  fileName ?: string,
  url ?: string
}