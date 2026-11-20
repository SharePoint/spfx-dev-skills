import * as React from 'react';
import {
  Button,
  FluentProvider,
  MessageBar,
  MessageBarBody,
  MessageBarTitle,
  Spinner,
  Text,
  webDarkTheme,
  webLightTheme
} from '@fluentui/react-components';
import { SaveRegular } from '@fluentui/react-icons';
import Modeler from 'bpmn-js/lib/Modeler';
import 'bpmn-js/dist/assets/diagram-js.css';
import 'bpmn-js/dist/assets/bpmn-js.css';
import './bpmn-font.css';

import * as strings from 'BpmnForM365WebPartStrings';
import styles from './BpmnModeler.module.scss';
import type { IBpmnModelerProps } from './IBpmnModelerProps';

function getErrorMessage(error: unknown): string {
  const e: { message?: string } = (error ?? {}) as { message?: string };
  return e.message || String(error);
}

export default function BpmnModeler(props: IBpmnModelerProps): React.ReactElement<IBpmnModelerProps> {
  const { service, fileUrl, isDarkTheme, backgroundColor, textColor } = props;

  const containerRef: React.RefObject<HTMLDivElement> = React.useRef<HTMLDivElement>(null);
  const modelerRef: React.MutableRefObject<Modeler | undefined> = React.useRef<Modeler | undefined>();
  const colorsRef: React.MutableRefObject<{ bg: string; fg: string }> =
    React.useRef({ bg: backgroundColor, fg: textColor });
  colorsRef.current = { bg: backgroundColor, fg: textColor };

  // workingXml is what the modeler is (re)created from; edits survive theme changes.
  const [workingXml, setWorkingXml] = React.useState<string | undefined>();
  const [themeKey, setThemeKey] = React.useState<number>(0);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [loadError, setLoadError] = React.useState<string | undefined>();
  const [saveError, setSaveError] = React.useState<string | undefined>();
  const [dirty, setDirty] = React.useState<boolean>(false);
  const [saving, setSaving] = React.useState<boolean>(false);
  const [justSaved, setJustSaved] = React.useState<boolean>(false);
  const dirtyRef: React.MutableRefObject<boolean> = React.useRef<boolean>(false);
  dirtyRef.current = dirty;

  React.useEffect(() => {
    setWorkingXml(undefined);
    setLoadError(undefined);
    setSaveError(undefined);
    setDirty(false);
    setJustSaved(false);
    if (!fileUrl) {
      setLoading(false);
      return;
    }

    let cancelled: boolean = false;
    setLoading(true);
    service.getFileText(fileUrl)
      .then(text => {
        if (!cancelled) {
          setWorkingXml(text);
          setLoading(false);
        }
      })
      .catch((e: unknown) => {
        if (!cancelled) {
          setLoadError(strings.LoadFileError.replace('{0}', getErrorMessage(e)));
          setLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, [service, fileUrl]);

  // Create the modeler for the current XML / theme generation.
  React.useEffect(() => {
    const container: HTMLDivElement | null = containerRef.current;
    if (!container || workingXml === undefined) {
      return;
    }

    let cancelled: boolean = false;
    const modeler: Modeler = new Modeler({
      container,
      keyboard: { bindTo: container },
      bpmnRenderer: {
        defaultFillColor: colorsRef.current.bg,
        defaultStrokeColor: colorsRef.current.fg
      }
    });
    modelerRef.current = modeler;

    modeler.importXML(workingXml)
      .then(() => {
        if (cancelled) {
          return;
        }
        setLoadError(undefined);
        (modeler.get('canvas') as { zoom: (v: string) => void }).zoom('fit-viewport');
        (modeler.get('eventBus') as { on: (e: string, cb: () => void) => void })
          .on('commandStack.changed', () => {
            setDirty(true);
            setJustSaved(false);
          });
      })
      .catch((e: unknown) => {
        if (!cancelled) {
          setLoadError(strings.InvalidBpmnError.replace('{0}', getErrorMessage(e)));
        }
      });

    return () => {
      cancelled = true;
      modelerRef.current = undefined;
      modeler.destroy();
    };
  }, [workingXml, themeKey]);

  // On theme change, snapshot current edits and recreate the modeler with the new colors.
  const firstColorRun: React.MutableRefObject<boolean> = React.useRef<boolean>(true);
  React.useEffect(() => {
    if (firstColorRun.current) {
      firstColorRun.current = false;
      return;
    }
    const modeler: Modeler | undefined = modelerRef.current;
    if (!modeler) {
      return;
    }
    modeler.saveXML({ format: true })
      .then(({ xml }) => {
        if (xml !== undefined && modelerRef.current === modeler) {
          setWorkingXml(xml);
          setThemeKey(k => k + 1);
        }
      })
      .catch(() => { /* keep the current modeler on failure */ });
  }, [backgroundColor, textColor]);

  const save: () => Promise<void> = React.useCallback(async () => {
    const modeler: Modeler | undefined = modelerRef.current;
    if (!modeler || !fileUrl) {
      return;
    }
    setSaving(true);
    setSaveError(undefined);
    try {
      const { xml } = await modeler.saveXML({ format: true });
      await service.saveFileText(fileUrl, xml ?? '');
      setDirty(false);
      setJustSaved(true);
    } catch (e) {
      setSaveError(strings.SaveError.replace('{0}', getErrorMessage(e)));
    } finally {
      setSaving(false);
    }
  }, [service, fileUrl]);

  // Warn before leaving with unsaved changes; Ctrl/Cmd+S saves.
  React.useEffect(() => {
    const onBeforeUnload: (e: BeforeUnloadEvent) => void = e => {
      if (dirtyRef.current) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    const onKeyDown: (e: KeyboardEvent) => void = e => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's' && modelerRef.current) {
        e.preventDefault();
        save().catch(() => { /* handled in save */ });
      }
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('beforeunload', onBeforeUnload);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [save]);

  let status: React.ReactElement | undefined;
  if (loadError) {
    status = (
      <MessageBar intent="error">
        <MessageBarBody>
          <MessageBarTitle>{strings.ErrorTitle}</MessageBarTitle>
          {loadError}
        </MessageBarBody>
      </MessageBar>
    );
  } else if (loading) {
    status = <Spinner label={strings.Loading} />;
  } else if (!fileUrl) {
    status = (
      <MessageBar intent="info">
        <MessageBarBody>{strings.NoFileSelected}</MessageBarBody>
      </MessageBar>
    );
  }

  const showEditor: boolean = workingXml !== undefined && !loadError;

  return (
    <FluentProvider theme={isDarkTheme ? webDarkTheme : webLightTheme} style={{ background: 'transparent' }}>
      <section className={styles.bpmnModeler}>
        {status && <div className={styles.status}>{status}</div>}
        {showEditor && (
          <div className={styles.toolbar} role="toolbar">
            <Button
              appearance="primary"
              icon={<SaveRegular />}
              disabled={!dirty || saving}
              onClick={() => { save().catch(() => { /* handled in save */ }); }}
            >
              {strings.SaveButton}
            </Button>
            <Text role="status" aria-live="polite">
              {saving ? strings.Saving : dirty ? strings.UnsavedChanges : justSaved ? strings.Saved : ''}
            </Text>
          </div>
        )}
        {saveError && (
          <MessageBar intent="error">
            <MessageBarBody>{saveError}</MessageBarBody>
          </MessageBar>
        )}
        <div
          ref={containerRef}
          className={styles.canvas}
          tabIndex={-1}
          style={{
            display: showEditor ? 'block' : 'none',
            background: backgroundColor,
            borderColor: textColor
          }}
        />
      </section>
    </FluentProvider>
  );
}
