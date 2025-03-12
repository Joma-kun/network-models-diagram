// @ts-nocheck
import * as React from 'react';
import { useState, useRef, useEffect } from 'react';
import styled from '@emotion/styled';
import { css, Global } from '@emotion/react';
import { CanvasWidget } from '@projectstorm/react-canvas-core';

export interface DiagramCanvasWidgetProps {
  color?: string;
  background?: string;
  leftEngine: any;
  rightEngine?: any; // 分割時のみ使用
  isSplit: boolean;
}

namespace S {
  export const Wrapper = styled.div`
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
  `;

  export const CanvasArea = styled.div`
    display: flex;
    flex-grow: 1;
    width: 100%;
    height: 100%;
    position: relative;
  `;

  export const Container = styled.div<{ color: string; background: string; isSplit: boolean }>`
    background-color: ${(p) => p.background};
    background-size: 50px 50px;
    display: flex;
    flex-grow: 1;
    height: 100%;
    > * {
      height: 100%;
      min-height: 100%;
      width: 100%;
    }
    background-image: linear-gradient(
        0deg,
        transparent 24%,
        ${(p) => p.color} 25%,
        ${(p) => p.color} 26%,
        transparent 27%,
        transparent 74%,
        ${(p) => p.color} 75%,
        ${(p) => p.color} 76%,
        transparent 77%,
        transparent
      ),
      linear-gradient(
        90deg,
        transparent 24%,
        ${(p) => p.color} 25%,
        ${(p) => p.color} 26%,
        transparent 27%,
        transparent 74%,
        ${(p) => p.color} 75%,
        ${(p) => p.color} 76%,
        transparent 77%,
        transparent
      );
  `;

  export const Expand = css`
    html,
    body,
    #root {
      height: 100%;
    }
  `;
}

const Divider = styled.div`
  width: 5px;
  background: #ccc;
  cursor: col-resize;
  user-select: none;
`;

const DiagramCanvasWidget: React.FC<DiagramCanvasWidgetProps> = ({
  color,
  background,
  leftEngine,
  rightEngine,
  isSplit,
}) => {
  const [leftWidth, setLeftWidth] = useState(50); // 初期は50%
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const newLeftWidth = ((e.clientX - rect.left) / rect.width) * 100;
      if (newLeftWidth < 10) setLeftWidth(10);
      else if (newLeftWidth > 90) setLeftWidth(90);
      else setLeftWidth(newLeftWidth);
    };

    const handleMouseUp = () => {
      if (isDragging) setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  return (
    <S.Wrapper ref={containerRef}>
      <Global styles={S.Expand} />
      <S.CanvasArea>
        <S.Container
          style={{ flexBasis: isSplit ? `${leftWidth}%` : '100%' }}
          background={background || 'rgb(60, 60, 60)'}
          color={color || 'rgba(255,255,255, 0.05)'}
          isSplit={isSplit}
        >
          <CanvasWidget engine={leftEngine} />
        </S.Container>
        {isSplit && rightEngine && (
          <>
            <Divider onMouseDown={() => setIsDragging(true)} />
            <S.Container
              style={{ flexBasis: `${100 - leftWidth}%` }}
              background={'rgb(80, 80, 80)'}
              color={'rgba(255,255,255, 0.05)'}
              isSplit={isSplit}
            >
              <CanvasWidget engine={rightEngine} />
            </S.Container>
          </>
        )}
      </S.CanvasArea>
    </S.Wrapper>
  );
};

export default DiagramCanvasWidget;
