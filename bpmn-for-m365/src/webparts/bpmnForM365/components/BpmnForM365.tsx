import * as React from 'react';
import {
  FluentProvider,
  MessageBar,
  MessageBarBody,
  MessageBarTitle,
  Spinner,
  webDarkTheme,
  webLightTheme
} from '@fluentui/react-components';
import NavigatedViewer from 'bpmn-js/lib/NavigatedViewer';
import 'bpmn-js/dist/assets/diagram-js.css';
import 'bpmn-js/dist/assets/bpmn-js.css';

import * as strings from 'BpmnForM365WebPartStrings';
import styles from './BpmnForM365.module.scss';
import type { IBpmnForM365Props } from './IBpmnForM365Props';

function getErrorMessage(error: unknown): string {
  const e: { message?: string } = (error ?? {}) as { message?: string };
  return e.message || String(error);
}

export default function BpmnForM365(props: IBpmnForM365Props): React.ReactElement<IBpmnForM365Props> {
  const { service, fileUrl, fullPage, isDarkTheme, backgroundColor, textColor } = props;

  const containerRef: React.RefObject<HTMLDivElement> = React.useRef<HTMLDivElement>(null);
  const [xml, setXml] = React.useState<string | undefined>();
  const [loading, setLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | undefined>();

  // Load the file content whenever the selected file changes.
  React.useEffect(() => {
    setXml(undefined);
    setError(undefined);
    if (!fileUrl) {
      setLoading(false);
      return;
    }

    let cancelled: boolean = false;
    setLoading(true);
    service.getFileText(fileUrl)
      .then(text => {
        if (!cancelled) {
          setXml(text);
          setLoading(false);
        }
      })
      .catch((e: unknown) => {
        if (!cancelled) {
          setError(strings.LoadFileError.replace('{0}', getErrorMessage(e)));
          setLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, [service, fileUrl]);

  // (Re)create the viewer when the XML or theme colors change.
  React.useEffect(() => {
    const container: HTMLDivElement | null = containerRef.current;
    if (!container || xml === undefined) {
      return;
    }

    let cancelled: boolean = false;
    const viewer: NavigatedViewer = new NavigatedViewer({
      container,
      bpmnRenderer: {
        defaultFillColor: backgroundColor,
        defaultStrokeColor: textColor
      }
    });

    const fit: () => void = () => {
      try {
        (viewer.get('canvas') as { zoom: (v: string) => void }).zoom('fit-viewport');
      } catch {
        // viewport not ready or nothing imported yet
      }
    };

    viewer.importXML(xml)
      .then(() => {
        if (!cancelled) {
          setError(undefined);
          fit();
        }
      })
      .catch((e: unknown) => {
        if (!cancelled) {
          setError(strings.InvalidBpmnError.replace('{0}', getErrorMessage(e)));
        }
      });

    const observer: ResizeObserver = new ResizeObserver(fit);
    observer.observe(container);

    return () => {
      cancelled = true;
      observer.disconnect();
      viewer.destroy();
    };
  }, [xml, backgroundColor, textColor]);

  let status: React.ReactElement | undefined;
  if (error) {
    status = (
      <MessageBar intent="error">
        <MessageBarBody>
          <MessageBarTitle>{strings.ErrorTitle}</MessageBarTitle>
          {error}
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

  const showCanvas: boolean = xml !== undefined && !error;

  return (
    <FluentProvider theme={isDarkTheme ? webDarkTheme : webLightTheme} style={{ background: 'transparent' }}>
      <section className={styles.bpmnForM365}>
        {status && <div className={styles.status}>{status}</div>}
        <div
          ref={containerRef}
          className={styles.canvas}
          role="img"
          aria-label={fileUrl}
          style={{
            display: showCanvas ? 'block' : 'none',
            height: fullPage ? 'calc(100vh - 160px)' : undefined,
            background: backgroundColor,
            borderColor: textColor
          }}
        />
      </section>
    </FluentProvider>
  );
}
