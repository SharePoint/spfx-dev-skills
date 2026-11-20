import {
  BaseListViewCommandSet,
  type Command,
  type IListViewCommandSetExecuteEventParameters,
  type ListViewStateChangedEventArgs
} from '@microsoft/sp-listview-extensibility';

import * as strings from 'BpmnViewerCommandSetStrings';

export interface IBpmnViewerCommandSetProperties {
  // Web-relative URL of the page hosting the BpmnForM365 web part.
  pageUrl?: string;
}

const DEFAULT_VIEWER_PAGE: string = 'SitePages/BpmnViewer.aspx';
const VIEW_COMMAND_ID: string = 'OPEN_BPMN_VIEWER';
const EDIT_COMMAND_ID: string = 'EDIT_BPMN_MODELER';

export default class BpmnViewerCommandSet extends BaseListViewCommandSet<IBpmnViewerCommandSetProperties> {

  public onInit(): Promise<void> {
    const viewCommand: Command = this.tryGetCommand(VIEW_COMMAND_ID);
    if (viewCommand) {
      viewCommand.title = strings.OpenInViewer;
      viewCommand.visible = false;
    }
    const editCommand: Command = this.tryGetCommand(EDIT_COMMAND_ID);
    if (editCommand) {
      editCommand.title = strings.EditInModeler;
      editCommand.visible = false;
    }
    this.context.listView.listViewStateChangedEvent.add(this, this._onListViewStateChanged);
    return Promise.resolve();
  }

  public onExecute(event: IListViewCommandSetExecuteEventParameters): void {
    let mode: string;
    if (event.itemId === VIEW_COMMAND_ID) {
      mode = 'view';
    } else if (event.itemId === EDIT_COMMAND_ID) {
      mode = 'edit';
    } else {
      return;
    }

    const row = this.context.listView.selectedRows?.[0];
    const fileRef: string | undefined = row?.getValueByName('FileRef');
    if (!fileRef) {
      return;
    }

    const page: string = (this.properties.pageUrl || DEFAULT_VIEWER_PAGE).replace(/^\/+/, '');
    const webUrl: string = this.context.pageContext.web.absoluteUrl.replace(/\/+$/, '');
    const url: string = `${webUrl}/${page}?file=${encodeURIComponent(fileRef)}&mode=${mode}`;
    window.open(url, '_blank', 'noopener');
  }

  private _onListViewStateChanged = (args: ListViewStateChangedEventArgs): void => {
    const rows = this.context.listView.selectedRows;
    const visible: boolean = !!rows && rows.length === 1 &&
      /\.bpmn$/i.test(String(rows[0].getValueByName('FileLeafRef') || ''));

    for (const id of [VIEW_COMMAND_ID, EDIT_COMMAND_ID]) {
      const command: Command = this.tryGetCommand(id);
      if (command) {
        command.visible = visible;
      }
    }

    this.raiseOnChange();
  };
}
