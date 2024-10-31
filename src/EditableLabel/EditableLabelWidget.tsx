import * as React from 'react';
import { EditableLabelModel } from './EditableLabelModel';
import styled from '@emotion/styled';

export interface EditableLabelWidgetProps {
    model: EditableLabelModel;
    x: number;
    y: number;
}

namespace S {
    export const Label = styled.div`
        user-select: none;
        pointer-events: auto;
        background: white;
        border: 1px solid #ccc;
        padding: 4px;
        border-radius: 4px;
        position: absolute;
        transform: translate(-50%, -50%);
    `;
}

export const EditableLabelWidget: React.FunctionComponent<EditableLabelWidgetProps> = (props) => {
    const [value, setValue] = React.useState(props.model.value);

    return (
        <S.Label style={{ left: props.x, top: props.y }}>
            <input
                type="text"
                value={value}
                onChange={(e) => {
                    const newValue = e.target.value;
                    setValue(newValue);
                    props.model.value = newValue;
                }}
            />
        </S.Label>
    );
};
