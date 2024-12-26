// @ts-nocheck
import React from 'react';
import styled from '@emotion/styled';
import { Drawer, Button, Checkbox, FormControlLabel, Collapse, List, ListItem, ListItemText, ListItemIcon } from '@mui/material';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import { Application } from '../Application';
import { CanvasWidget } from '@projectstorm/react-canvas-core';
import { DiagramCanvasWidget } from '../DiagramCanvasWidget';
import { RouterNodeModel } from '../Router/RouterNodeModel';
import { MemoNodeModel } from '../Memo/MemoNodeModel';

const S = {
    Body: styled.div`
        flex-grow: 1;
        display: flex;
        flex-direction: column;
        min-height: 100%;
    `,
    Header: styled.div`
        display: flex;
        background: rgb(30, 30, 30);
        flex-grow: 0;
        flex-shrink: 0;
        color: white;
        font-family: Helvetica, Arial, sans-serif;
        padding: 10px;
        align-items: center;
        justify-content: space-between;
    `,
    Content: styled.div`
        display: flex;
        flex-grow: 1;
    `,
    Layer: styled.div`
        position: relative;
        flex-grow: 1;
    `
};

export class BodyWidget extends React.Component<{ app: Application }> {
    state = {
        drawerOpen: false,
        selectedRoutes: {},
        expandedStarts: {}
    };

    // 始点ごとに分類された経路パターンをプロパティとして定義
    routesByStart = {
        cf1: Array.from({ length: 8 }, (_, i) => `cf1-cf${i + 2}`), // cf1-cf2 ~ cf1-cf9
        cf2: Array.from({ length: 7 }, (_, i) => `cf2-cf${i + 3}`), // cf2-cf3 ~ cf2-cf10
        cf3: Array.from({ length: 6 }, (_, i) => `cf3-cf${i + 4}`), // cf3-cf4 ~ cf3-cf10
        cf4: Array.from({ length: 5 }, (_, i) => `cf4-cf${i + 5}`), // cf4-cf5 ~ cf4-cf10
        cf5: Array.from({ length: 4 }, (_, i) => `cf5-cf${i + 6}`), // cf5-cf6 ~ cf5-cf10
        cf6: Array.from({ length: 3 }, (_, i) => `cf6-cf${i + 7}`), // cf6-cf7 ~ cf6-cf10
        cf7: Array.from({ length: 2 }, (_, i) => `cf7-cf${i + 8}`), // cf7-cf8 ~ cf7-cf10
        cf8: Array.from({ length: 1 }, (_, i) => `cf8-cf${i + 9}`), // cf8-cf9 ~ cf8-cf10
    };

    handleToggleRoute = (route) => {
        this.setState((prevState) => ({
            selectedRoutes: {
                ...prevState.selectedRoutes,
                [route]: !prevState.selectedRoutes[route]
            }
        }));
    };

    handleToggleDrawer = (open: boolean) => {
        this.setState({ drawerOpen: open });
    };

    handleToggleStart = (start) => {
        this.setState((prevState) => ({
            expandedStarts: {
                ...prevState.expandedStarts,
                [start]: !prevState.expandedStarts[start]
            }
        }));
    };

    handleSelectAll = () => {
        const allRoutes = {};
        Object.values(this.routesByStart).flat().forEach((route) => {
            allRoutes[route] = true;
        });
        this.setState({ selectedRoutes: allRoutes });
    };

    handleDeselectAll = () => {
        this.setState({ selectedRoutes: {} });
    };

    handleAddNode = () => {
        const { app } = this.props;
        const engine = app.getDiagramEngine();

        const nodesCount = Object.keys(engine.getModel().getNodes()).length;
        const node = new MemoNodeModel(`Memo ${nodesCount - 8}`);

        node.setPosition(100 + nodesCount * 50, 100 + nodesCount * 50);
        engine.getModel().addNode(node);
        this.forceUpdate();
    };

    render() {
        const { app } = this.props;
        const { drawerOpen, selectedRoutes, expandedStarts } = this.state;

        return (
            <S.Body>
                <S.Header>
                    <div className="title" style={{ width: '150px' }}></div>
                    <Button variant="contained" onClick={() => this.handleToggleDrawer(true)}>表示する経路を変更</Button>
                    <Button variant="contained" color="secondary" onClick={this.handleAddNode}>Memoを追加</Button>
                </S.Header>
                <S.Content>
                    <S.Layer>
                        <DiagramCanvasWidget app={app}>
                            <CanvasWidget engine={app.getDiagramEngine()} />
                        </DiagramCanvasWidget>
                    </S.Layer>
                </S.Content>
                <Drawer
                    anchor="right"
                    open={drawerOpen}
                    onClose={() => this.handleToggleDrawer(false)}
                >
                    <div style={{ width: '300px', padding: '20px' }}>

                        <Button
                            variant="contained"
                            color="primary"
                            fullWidth
                            style={{ marginTop: '20px' }}
                            onClick={() => {
                                this.handleToggleDrawer(false);
                                app.updateDisplayedRoutes(this.state.selectedRoutes);
                            }}
                        >
                            選択した経路を表示
                        </Button>
                        <h2 style={{ marginBottom: '10px' }}>経路を選択</h2>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                            <Button variant="outlined" onClick={this.handleSelectAll}>
                                全選択
                            </Button>
                            <Button variant="outlined" onClick={this.handleDeselectAll}>
                                全解除
                            </Button>
                        </div>
                        {Object.entries(this.routesByStart).map(([start, routes]) => (
                            <List key={start}>
                                <ListItem button onClick={() => this.handleToggleStart(start)}>
                                    <ListItemIcon>
                                        {expandedStarts[start] ? <ExpandLess /> : <ExpandMore />}
                                    </ListItemIcon>
                                    <ListItemText primary={start.toUpperCase()} />
                                </ListItem>
                                <Collapse in={expandedStarts[start]} timeout="auto" unmountOnExit>
                                    <List component="div" disablePadding>
                                        {routes.map((route) => (
                                            <ListItem key={route} dense style={{ paddingLeft: '20px' }}>
                                                <FormControlLabel
                                                    control={
                                                        <Checkbox
                                                            checked={!!selectedRoutes[route]}
                                                            onChange={() => this.handleToggleRoute(route)}
                                                        />
                                                    }
                                                    label={route}
                                                />
                                            </ListItem>
                                        ))}
                                    </List>
                                </Collapse>
                            </List>
                        ))}
                    </div>
                </Drawer>
            </S.Body>
        );
    }
}
