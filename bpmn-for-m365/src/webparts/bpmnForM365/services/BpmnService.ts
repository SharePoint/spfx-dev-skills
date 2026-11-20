import { spfi, SPFI, SPFx } from '@pnp/sp';
import '@pnp/sp/webs';
import '@pnp/sp/lists';
import '@pnp/sp/files';
import '@pnp/sp/folders';
import type { WebPartContext } from '@microsoft/sp-webpart-base';

export interface ILibraryInfo {
  id: string;
  title: string;
}

export interface IBpmnFileInfo {
  serverRelativeUrl: string;
  name: string;
}

const DOCUMENT_LIBRARY_TEMPLATE: number = 101;
const MAX_FILES: number = 500;

export class BpmnService {
  private readonly _sp: SPFI;

  public constructor(context: WebPartContext) {
    this._sp = spfi().using(SPFx(context));
  }

  public async getLibraries(): Promise<ILibraryInfo[]> {
    const lists: { Id: string; Title: string }[] = await this._sp.web.lists
      .filter(`BaseTemplate eq ${DOCUMENT_LIBRARY_TEMPLATE} and Hidden eq false`)
      .select('Id', 'Title')
      .orderBy('Title')();
    return lists.map(l => ({ id: l.Id, title: l.Title }));
  }

  public async getBpmnFiles(libraryId: string): Promise<IBpmnFileInfo[]> {
    const viewXml: string =
      '<View Scope="RecursiveAll"><Query><Where><Eq>' +
      '<FieldRef Name="File_x0020_Type"/><Value Type="Text">bpmn</Value>' +
      '</Eq></Where><OrderBy><FieldRef Name="FileLeafRef"/></OrderBy></Query>' +
      '<ViewFields><FieldRef Name="FileRef"/><FieldRef Name="FileLeafRef"/></ViewFields>' +
      `<RowLimit>${MAX_FILES}</RowLimit></View>`;

    const result: { Row: { FileRef: string; FileLeafRef: string }[] } =
      await this._sp.web.lists.getById(libraryId).renderListDataAsStream({ ViewXml: viewXml });

    return result.Row.map(r => ({ serverRelativeUrl: r.FileRef, name: r.FileLeafRef }));
  }

  public getFileText(serverRelativeUrl: string): Promise<string> {
    return this._sp.web.getFileByServerRelativePath(serverRelativeUrl).getText();
  }

  public async saveFileText(serverRelativeUrl: string, content: string): Promise<void> {
    await this._sp.web.getFileByServerRelativePath(serverRelativeUrl).setContent(content);
  }
}
