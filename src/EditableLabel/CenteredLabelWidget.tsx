// CenteredLabelWidget.tsx
import * as React from 'react';
import { DefaultLinkModel } from '@projectstorm/react-diagrams';

interface CenteredLabelWidgetProps {
    label: string;
    link: DefaultLinkModel;
}

export const CenteredLabelWidget: React.FC<CenteredLabelWidgetProps> = ({ label, link }) => {
    const linkPoints = link.getPoints();
    if (linkPoints.length < 2) return null;

    // 中央のポイント計算
    const midPointIndex = Math.floor(linkPoints.length / 2);
    const start = linkPoints[midPointIndex - 1].getPosition();
    const end = linkPoints[midPointIndex].getPosition();

    const centerX = (start.x + end.x) / 2;
    const centerY = (start.y + end.y) / 2;

    return (
        <foreignObject x={centerX - 10} y={centerY - 10} width={60} height={20}>
            <div style={{ fontSize: 12, color: 'black', background: 'white', padding: '2px' }}>
                {label}
            </div>
        </foreignObject>
    );
};
