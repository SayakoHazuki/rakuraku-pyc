export interface GSheetRow {
  values: Value[];
}

export interface Value {
  userEnteredValue: UserEnteredValue;
  effectiveValue?: EffectiveValue;
  formattedValue?: string;
  userEnteredFormat: UserEnteredFormat;
  effectiveFormat: EffectiveFormat;
}

export interface EffectiveFormat {
  backgroundColor: Color;
  borders: Borders;
  padding: Padding;
  horizontalAlignment: HorizontalAlignment;
  verticalAlignment: VerticalAlignment;
  wrapStrategy: WrapStrategy;
  textFormat: EffectiveFormatTextFormat;
  hyperlinkDisplayType: HyperlinkDisplayType;
  backgroundColorStyle: GroundColorStyle;
}

export interface Color {
  red: number;
  green: number;
  blue: number;
}

export interface GroundColorStyle {
  rgbColor: Color;
}

export interface Borders {
  top: Bottom;
  bottom: Bottom;
  left: Bottom;
  right: Bottom;
}

export interface Bottom {
  style: Style;
  width: number;
  color: ColorClass;
  colorStyle: ColorStyle;
}

export interface ColorClass {}

export interface ColorStyle {
  rgbColor: ColorClass;
}

export enum Style {
  Solid = "SOLID",
}

export enum HorizontalAlignment {
  Left = "LEFT",
}

export enum HyperlinkDisplayType {
  PlainText = "PLAIN_TEXT",
}

export interface Padding {
  right: number;
  left: number;
}

export interface EffectiveFormatTextFormat {
  foregroundColor: Color;
  fontFamily: FontFamily;
  fontSize: number;
  bold: boolean;
  italic: boolean;
  strikethrough: boolean;
  underline: boolean;
  foregroundColorStyle: GroundColorStyle;
}

export enum FontFamily {
  Arial = "Arial",
  TimesNewRoman = "Times New Roman",
}

export enum VerticalAlignment {
  Middle = "MIDDLE",
}

export enum WrapStrategy {
  OverflowCell = "OVERFLOW_CELL",
  Wrap = "WRAP",
}

export interface EffectiveValue {
  stringValue: string;
}

export interface UserEnteredFormat {
  borders: Borders;
  verticalAlignment: VerticalAlignment;
  textFormat: UserEnteredFormatTextFormat;
  wrapStrategy?: WrapStrategy;
}

export interface UserEnteredFormatTextFormat {
  fontFamily?: FontFamily;
  fontSize: number;
}

export interface UserEnteredValue {
  formulaValue?: string;
  stringValue?: string;
}
