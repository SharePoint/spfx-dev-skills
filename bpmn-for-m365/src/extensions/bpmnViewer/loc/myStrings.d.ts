declare interface IBpmnViewerCommandSetStrings {
  OpenInViewer: string;
  EditInModeler: string;
}

declare module 'BpmnViewerCommandSetStrings' {
  const strings: IBpmnViewerCommandSetStrings;
  export = strings;
}
