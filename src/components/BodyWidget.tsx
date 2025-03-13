// @ts-nocheck
import React from 'react';
import styled from '@emotion/styled';
import {
	Drawer,
	Button,
	Checkbox,
	FormControlLabel,
	Collapse,
	List,
	ListItem,
	ListItemText,
	ListItemIcon
} from '@mui/material';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import { Application } from '../Application';
import DiagramCanvasWidget from '../DiagramCanvasWidget';
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
		isSplit: false, // 画面分割状態（初期は1画面表示）
		leftSelectedRoutes: {},
		rightSelectedRoutes: {},
		activeCanvas: 'left',
		expandedStarts: {}
	};

	// 始点ごとに分類された経路パターン（例）
	routesByStart = {
		cf1: Array.from({ length: 8 }, (_, i) => `cf1-cf${i + 2}`),
		cf2: Array.from({ length: 7 }, (_, i) => `cf2-cf${i + 3}`),
		cf3: Array.from({ length: 6 }, (_, i) => `cf3-cf${i + 4}`),
		cf4: Array.from({ length: 5 }, (_, i) => `cf4-cf${i + 5}`),
		cf5: Array.from({ length: 4 }, (_, i) => `cf5-cf${i + 6}`),
		cf6: Array.from({ length: 3 }, (_, i) => `cf6-cf${i + 7}`),
		cf7: Array.from({ length: 2 }, (_, i) => `cf7-cf${i + 8}`),
		cf8: Array.from({ length: 1 }, (_, i) => `cf8-cf${i + 9}`)
	};

	handleToggleRoute = (route: string) => {
		const { activeCanvas } = this.state;
		if (activeCanvas === 'left') {
			this.setState(prevState => ({
				leftSelectedRoutes: {
					...prevState.leftSelectedRoutes,
					[route]: !prevState.leftSelectedRoutes[route]
				}
			}));
		} else {
			this.setState(prevState => ({
				rightSelectedRoutes: {
					...prevState.rightSelectedRoutes,
					[route]: !prevState.rightSelectedRoutes[route]
				}
			}));
		}
	};

	handleToggleDrawer = (open: boolean) => {
		this.setState({ drawerOpen: open });
	};

	handleToggleStart = (start: string) => {
		this.setState(prevState => ({
			expandedStarts: {
				...prevState.expandedStarts,
				[start]: !prevState.expandedStarts[start]
			}
		}));
	};

	handleSelectAll = () => {
		const allRoutes: Record<string, boolean> = {};
		Object.values(this.routesByStart).flat().forEach(route => {
			allRoutes[route] = true;
		});
		const { activeCanvas } = this.state;
		if (activeCanvas === 'left') {
			this.setState({ leftSelectedRoutes: allRoutes });
		} else {
			this.setState({ rightSelectedRoutes: allRoutes });
		}
	};

	handleDeselectAll = () => {
		const { activeCanvas } = this.state;
		if (activeCanvas === 'left') {
			this.setState({ leftSelectedRoutes: {} });
		} else {
			this.setState({ rightSelectedRoutes: {} });
		}
	};

	// 画面分割の切替ハンドラ
	handleToggleSplit = () => {
		this.setState(prevState => ({
			isSplit: !prevState.isSplit
		}));
	};

	// 統合された経路設定・更新ハンドラ（Drawer 内の更新ボタン用）
	handleUpdateRoutes = () => {
		const { app } = this.props;
		const { activeCanvas, leftSelectedRoutes, rightSelectedRoutes } = this.state;
		if (activeCanvas === 'left') {
			app.updateDisplayedRoutesForEngine(app.getDiagramEngine(), leftSelectedRoutes);
		} else {
			app.updateDisplayedRoutesForEngine(this.rightEngine, rightSelectedRoutes);
		}
		this.setState({ drawerOpen: false });
	};

	// Memo追加ハンドラ：現在選択中の画面に Memo ノードを追加し、グローバルな memoCount を更新（左右は別々に追加）
	handleAddMemo = () => {
		const { app } = this.props;
		const { activeCanvas } = this.state;
		let engine;
		if (activeCanvas === 'left') {
			engine = app.getDiagramEngine();
		} else {
			engine = this.rightEngine;
		}
		// グローバルなメモカウントを更新（左右で共通の連番）
		app.memoCount = app.memoCount + 1;
		const memoNumber = app.memoCount;
		// Memoノードは、対象画面にのみ追加する
		const memoNode = new MemoNodeModel(`Memo ${memoNumber}`);
		memoNode.setPosition(100 + memoNumber * 50, 100 + memoNumber * 50);
		engine.getModel().addNode(memoNode);
		engine.repaintCanvas();
		this.forceUpdate();
	};

	componentDidMount() {
		const { app } = this.props;
		const checkYamlLoaded = () => {
			if (app.yamlLoaded) {
				this.rightEngine = app.createDiagramEngine();
			} else {
				setTimeout(checkYamlLoaded, 200);
			}
		};
		checkYamlLoaded();
	}

	render() {
		const { app } = this.props;
		const { drawerOpen, expandedStarts, activeCanvas, isSplit } = this.state;
		return (
			<S.Body>
				<S.Header>
					<div className="title" style={{ width: '150px' }}></div>
					{/* 画面分割切替ボタン */}
					<Button variant="contained" onClick={this.handleToggleSplit}>
						{isSplit ? '1画面表示' : '2画面表示'}
					</Button>
					{/* 対象画面選択（表示のみ） */}
					<div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
						<Button
							variant={activeCanvas === 'left' ? 'contained' : 'outlined'}
							onClick={() => this.setState({ activeCanvas: 'left' })}
						>
							左側
						</Button>
						<Button
							variant={activeCanvas === 'right' ? 'contained' : 'outlined'}
							onClick={() => this.setState({ activeCanvas: 'right' })}
							disabled={!isSplit}
						>
							右側
						</Button>
					</div>
					{/* 統合された経路設定・更新ボタン */}
					<Button variant="contained" onClick={() => this.handleToggleDrawer(true)}>
						経路設定・更新
					</Button>
					<Button variant="contained" color="secondary" onClick={this.handleAddMemo}>
						Memoを追加
					</Button>
				</S.Header>
				<S.Content>
					<S.Layer>
						<DiagramCanvasWidget
							leftEngine={app.getDiagramEngine()}
							rightEngine={this.rightEngine}
							isSplit={isSplit}
						/>
					</S.Layer>
				</S.Content>
				<Drawer anchor="right" open={drawerOpen} onClose={() => this.handleToggleDrawer(false)}>
					<div style={{ width: '300px', padding: '20px' }}>
						<Button variant="contained" color="primary" fullWidth style={{ marginTop: '20px' }} onClick={this.handleUpdateRoutes}>
							更新
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
									<ListItemIcon>{expandedStarts[start] ? <ExpandLess /> : <ExpandMore />}</ListItemIcon>
									<ListItemText primary={start.toUpperCase()} />
								</ListItem>
								<Collapse in={expandedStarts[start]} timeout="auto" unmountOnExit>
									<List component="div" disablePadding>
										{routes.map(route => (
											<ListItem key={route} dense style={{ paddingLeft: '20px' }}>
												<FormControlLabel
													control={
														<Checkbox
															checked={
																activeCanvas === 'left'
																	? !!this.state.leftSelectedRoutes[route]
																	: !!this.state.rightSelectedRoutes[route]
															}
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
