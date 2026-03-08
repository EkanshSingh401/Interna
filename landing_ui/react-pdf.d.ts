import * as React from 'react';

declare module '@react-pdf/renderer' {
  export class Document extends React.Component<any> {}
  export class Page extends React.Component<any> {}
  export class View extends React.Component<any> {}
  export class Text extends React.Component<any> {}
  export class StyleSheet {
    static create(styles: any): any;
  }
  export class Font {
    static register(options: any): void;
  }
  // Add any other components you are using like Image, Link, etc.
}