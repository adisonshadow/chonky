import React, { useEffect, useRef, useId } from 'react';
import { ChonkyRenderer } from './renderer';

export interface ChonkyWrapperProps {
  chonkyId: string;
  componentName: string;
  sourceFile: string;
  sourceLine: number;
  children: React.ReactNode;
  [key: string]: unknown;
}

/**
 * HOC injected by the Babel plugin during development builds.
 * Wraps every user component to track mount/update/unmount lifecycle.
 * Tree-shaken away in production.
 */
export function _ChonkyWrapper({
  chonkyId,
  componentName,
  sourceFile,
  sourceLine,
  children,
  ...restProps
}: ChonkyWrapperProps) {
  const instanceId = useId();
  const renderer = ChonkyRenderer.getInstance();
  const prevPropsRef = useRef<Record<string, unknown>>({});
  const renderStartRef = useRef<number>(0);

  useEffect(() => {
    renderer.registerComponent(chonkyId, componentName, sourceFile, sourceLine);
    renderer.registerInstance(chonkyId, instanceId, null, restProps);

    return () => {
      renderer.recordUnmount(chonkyId, instanceId);
    };
    // Only run on mount/unmount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const duration = renderStartRef.current
      ? performance.now() - renderStartRef.current
      : undefined;

    const prev = prevPropsRef.current;
    const changedProps = Object.keys(restProps).filter(
      (key) => restProps[key] !== prev[key],
    );

    if (changedProps.length > 0) {
      renderer.recordUpdate(chonkyId, instanceId, restProps, changedProps, duration);
    }

    prevPropsRef.current = { ...restProps };
  });

  renderStartRef.current = performance.now();

  return <>{children}</>;
}
