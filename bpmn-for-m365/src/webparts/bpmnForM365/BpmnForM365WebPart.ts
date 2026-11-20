import * as React from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { Version } from '@microsoft/sp-core-library';
import {
  type IPropertyPaneConfiguration,
  type IPropertyPaneDropdownOption,
  PropertyPaneDropdown
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import type { IReadonlyTheme } from '@microsoft/sp-component-base';

import * as strings from 'BpmnForM365WebPartStrings';
import BpmnForM365 from './components/BpmnForM365';
import type { IBpmnForM365Props } from './components/IBpmnForM365Props';
import type { IBpmnModelerProps } from './components/IBpmnModelerProps';
import { BpmnService } from './services/BpmnService';

// The modeler is loaded on demand so view-only pages don't download it.
const BpmnModeler = React.lazy(() => import(/* webpackChunkName: 'bpmn-modeler' */ './components/BpmnModeler'));

export interface IBpmnForM365WebPartProps {
  libraryId: string;
  fileUrl: string;
  mode: 'view' | 'edit';
}

export default class BpmnForM365WebPart extends BaseClientSideWebPart<IBpmnForM365WebPartProps> {

  private _isDarkTheme: boolean = false;
  private _backgroundColor: string = '#ffffff';
  private _textColor: string = '#323130';
  private _root: Root | undefined;
  private _service!: BpmnService;

  private _libraryOptions: IPropertyPaneDropdownOption[] = [];
  private _fileOptions: IPropertyPaneDropdownOption[] = [];
  private _loadingLibraries: boolean = false;
  private _loadingFiles: boolean = false;
  private _paneError: string = '';

  private _getFileFromQuery(): string {
    const file: string = new URLSearchParams(window.location.search).get('file') || '';
    return file.startsWith('/') && /\.bpmn$/i.test(file) ? file : '';
  }

  // ?mode=edit|view in the URL overrides the property-pane mode.
  private _getMode(): 'view' | 'edit' {
    const mode: string = (new URLSearchParams(window.location.search).get('mode') || this.properties.mode || '').toLowerCase();
    return mode === 'edit' ? 'edit' : 'view';
  }

  public render(): void {
    const queryFile: string = this._getFileFromQuery();
    const fileUrl: string = queryFile || this.properties.fileUrl;
    let element: React.ReactElement;

    if (this._getMode() === 'edit') {
      const props: IBpmnModelerProps = {
        service: this._service,
        fileUrl,
        isDarkTheme: this._isDarkTheme,
        backgroundColor: this._backgroundColor,
        textColor: this._textColor
      };
      element = React.createElement(
        React.Suspense,
        { fallback: React.createElement('div', undefined, strings.Loading) },
        React.createElement(BpmnModeler, props)
      );
    } else {
      const props: IBpmnForM365Props = {
        service: this._service,
        fileUrl,
        fullPage: !!queryFile,
        isDarkTheme: this._isDarkTheme,
        backgroundColor: this._backgroundColor,
        textColor: this._textColor
      };
      element = React.createElement(BpmnForM365, props);
    }

    if (!this._root) {
      this._root = createRoot(this.domElement);
    }

    this._root.render(element);
  }

  protected onInit(): Promise<void> {
    this._service = new BpmnService(this.context);
    return Promise.resolve();
  }

  protected onThemeChanged(currentTheme: IReadonlyTheme | undefined): void {
    if (!currentTheme) {
      return;
    }

    this._isDarkTheme = !!currentTheme.isInverted;
    const { semanticColors } = currentTheme;
    if (semanticColors) {
      this._backgroundColor = semanticColors.bodyBackground || this._backgroundColor;
      this._textColor = semanticColors.bodyText || this._textColor;
    }

    if (this._root) {
      this.render();
    }
  }

  protected onDispose(): void {
    this._root?.unmount();
    this._root = undefined;
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected onPropertyPaneConfigurationStart(): void {
    this._loadLibraries().catch(() => { /* handled in _loadLibraries */ });
    if (this.properties.libraryId) {
      this._loadFiles(this.properties.libraryId).catch(() => { /* handled in _loadFiles */ });
    }
  }

  protected onPropertyPaneFieldChanged(propertyPath: string, oldValue: unknown, newValue: unknown): void {
    if (propertyPath === 'libraryId' && oldValue !== newValue) {
      this.properties.fileUrl = '';
      this._fileOptions = [];
      if (newValue) {
        this._loadFiles(newValue as string).catch(() => { /* handled in _loadFiles */ });
      } else {
        this.context.propertyPane.refresh();
      }
    }
  }

  private async _loadLibraries(): Promise<void> {
    this._loadingLibraries = true;
    this._paneError = '';
    this.context.propertyPane.refresh();
    try {
      const libraries = await this._service.getLibraries();
      this._libraryOptions = libraries.map(l => ({ key: l.id, text: l.title }));
    } catch (e) {
      this._paneError = (e as Error).message;
    } finally {
      this._loadingLibraries = false;
      this.context.propertyPane.refresh();
    }
  }

  private async _loadFiles(libraryId: string): Promise<void> {
    this._loadingFiles = true;
    this._paneError = '';
    this.context.propertyPane.refresh();
    try {
      const files = await this._service.getBpmnFiles(libraryId);
      // Ignore results if the user switched library meanwhile.
      if (libraryId === this.properties.libraryId) {
        this._fileOptions = files.map(f => ({
          key: f.serverRelativeUrl,
          text: f.serverRelativeUrl
        }));
      }
    } catch (e) {
      this._paneError = (e as Error).message;
    } finally {
      this._loadingFiles = false;
      this.context.propertyPane.refresh();
    }
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: this._paneError
              ? strings.PropertyPaneLoadError.replace('{0}', this._paneError)
              : strings.PropertyPaneDescription
          },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyPaneDropdown('mode', {
                  label: strings.ModeFieldLabel,
                  options: [
                    { key: 'view', text: strings.ModeView },
                    { key: 'edit', text: strings.ModeEdit }
                  ],
                  selectedKey: this.properties.mode || 'view'
                }),
                PropertyPaneDropdown('libraryId', {
                  label: strings.LibraryFieldLabel,
                  options: this._libraryOptions,
                  selectedKey: this.properties.libraryId,
                  disabled: this._loadingLibraries
                }),
                PropertyPaneDropdown('fileUrl', {
                  label: this._loadingFiles ? strings.LoadingFiles : strings.FileFieldLabel,
                  options: this._fileOptions,
                  selectedKey: this.properties.fileUrl,
                  disabled: !this.properties.libraryId || this._loadingFiles
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
