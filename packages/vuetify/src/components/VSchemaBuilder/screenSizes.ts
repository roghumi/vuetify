
export interface ScreenSizeProperties {
  width?: string
  height?: string
  maxWidth?: string
  maxHeight?: string
  minWidth?: string
  minHeight?: string
  staticClass?: string
}

export enum ScreenSize {
  Small = 'small',
  XSmall = 'xSmall',
  Large = 'large',
  Medium = 'medium',
  XLarge = 'xLarge',
  Auto = 'auto',
}

export const DefaultScreenSizeDictionary: { [key: string]: ScreenSizeProperties } = {
  [ScreenSize.XSmall]: {
    minWidth: '320px',
    maxWidth: '340px',
    maxHeight: '568px',
    minHeight: '480px',
    staticClass: 'ma-auto',
  },
  [ScreenSize.Small]: {
    maxWidth: '414px',
    maxHeight: '896px',
    minWidth: '360px',
    minHeight: '780px',
    staticClass: 'ma-auto',
  },
  [ScreenSize.Medium]: {
    minWidth: '600px',
    maxWidth: '768px',
    minHeight: '960px',
    maxHeight: '1024px',
    staticClass: 'ma-auto',
  },
  [ScreenSize.Large]: {
    minWidth: '1366px',
    minHeight: '768px',
    staticClass: 'ma-auto',
  },
  [ScreenSize.XLarge]: {
    minWidth: '1920px',
    minHeight: '1080px',
    staticClass: 'ma-auto',
  },
  [ScreenSize.Auto]: {
    width: 'auto',
    height: 'auto',
    staticClass: '',
  },
}
