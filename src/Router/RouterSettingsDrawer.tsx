// RouterSettingsDrawer.tsx
// @ts-nocheck
import React, { useState, useEffect, useRef } from 'react';
import {
  Drawer,
  Button,
  Typography,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import EditIcon from '@mui/icons-material/Edit';
import styled from '@emotion/styled';
import { disableBodyScroll, enableBodyScroll, clearAllBodyScrollLocks } from 'body-scroll-lock';
import { Application } from '../Application';

const S = {
  Container: styled.div`
    width: 300px;
    padding: 20px;
    display: flex;
    flex-direction: column;
  `,
  Title: styled(Typography)`
    font-size: 1.5rem;
    font-weight: bold;
    margin-bottom: 10px;
  `,
  DetailItem: styled.div`
    display: flex;
    flex-direction: row;
    margin-bottom: 4px;
    & > strong {
      margin-right: 4px;
    }
  `,
};

// Props に routerName（小文字）を追加
interface RouterSettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  inputValueA: string;
  inputValueB: string;
  onInputChange: (event: React.ChangeEvent<HTMLInputElement>, inputName: string) => void;
  onSave: () => void;
  routerName: string; // 右クリックしたノードのルーター名（小文字）
}

// 不要なフィールドを除外する関数
const filterRouterInfo = (info: any): any => {
  const { id, className, attributeErrorStatement, multiplictyErrorStatement, namd, ...rest } = info;
  return rest;
};

// 編集用に、元データの元の index を保持するように変更
const groupByClassName = (data: any[]): { [key: string]: { data: any, originalIndex: number }[] } => {
  return data.reduce((acc, curr, index) => {
    const cls = curr.className;
    if (!acc[cls]) {
      acc[cls] = [];
    }
    acc[cls].push({ data: filterRouterInfo(curr), originalIndex: index });
    return acc;
  }, {} as { [key: string]: { data: any, originalIndex: number }[] });
};

const RouterSettingsDrawer: React.FC<RouterSettingsDrawerProps> = ({
  isOpen,
  onClose,
  inputValueA,
  inputValueB,
  onInputChange,
  onSave,
  routerName,
}) => {
  const [routerInfo, setRouterInfo] = useState<any[]>([]);
  // 編集可能なデータ（初期はロードした内容と同じ）
  const [editableRouterInfo, setEditableRouterInfo] = useState<any[]>([]);
  // オリジナルのデータを保持（変更前と比較するため）
  const [originalRouterInfo, setOriginalRouterInfo] = useState<any[]>([]);
  // 全体グループ（サブアコーディオンなし）の編集モード（グループ単位）
  const [editModes, setEditModes] = useState<{ [key: string]: boolean }>({});
  // サブアコーディオン単位の編集モード（キー例: "VlanSetting_3"）
  const [subEditModes, setSubEditModes] = useState<{ [key: string]: boolean }>({});

  // ドロワー内のスクロール対象となるコンテナ用 ref
  const containerRef = useRef<HTMLDivElement>(null);

  // 背景スクロール防止：ドロワーが開いている場合、対象コンテナで body のスクロールをロック
  useEffect(() => {
    const target = containerRef.current;
    if (!target) return;
    if (isOpen) {
      disableBodyScroll(target);
    } else {
      enableBodyScroll(target);
    }
    return () => {
      clearAllBodyScrollLocks();
    };
  }, [isOpen]);

  useEffect(() => {
    // Application インスタンスからルーター情報を取得し、対象ルーターのみ抽出
    const app = new Application();
    app.loadRouterInfo()
      .then((info) => {
        if (info[routerName]) {
          setRouterInfo(info[routerName]);
          // 初期状態ではオリジナル・編集用とも同じ内容
          setOriginalRouterInfo(info[routerName]);
          setEditableRouterInfo(info[routerName]);
        } else {
          setRouterInfo([]);
          setOriginalRouterInfo([]);
          setEditableRouterInfo([]);
        }
      })
      .catch(err => console.error(err));
  }, [routerName]);

  // グループ化は editableRouterInfo を元に行う
  const groupedInfo = groupByClassName(editableRouterInfo);

  // ソート処理（VlanSetting, Vlan, EthernetSetting の場合のみ）
  if (groupedInfo["VlanSetting"]) {
    groupedInfo["VlanSetting"] = groupedInfo["VlanSetting"].sort(
      (a, b) => (a.data.vlanNum || 0) - (b.data.vlanNum || 0)
    );
  }
  if (groupedInfo["Vlan"]) {
    groupedInfo["Vlan"] = groupedInfo["Vlan"].sort(
      (a, b) => (a.data.num || 0) - (b.data.num || 0)
    );
  }
  if (groupedInfo["EthernetSetting"]) {
    groupedInfo["EthernetSetting"] = groupedInfo["EthernetSetting"].sort(
      (a, b) => (a.data.port || 0) - (b.data.port || 0)
    );
  }

  // JSON 出力（編集後の内容をインプットと同様の形式で出力）
  const handleOutputJSON = () => {
    console.log("出力JSON:", JSON.stringify(editableRouterInfo, null, 2));
    alert("コンソールに JSON を出力しました。");
  };

  return (
    <Drawer anchor="right" open={isOpen} onClose={onClose}>
      <div
        ref={containerRef}
        style={{
          width: '350px',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '100vh',
          overflowY: 'auto'
        }}
      >
        <Typography variant="h5" style={{ marginBottom: '10px', fontWeight: 'bold' }}>
          {routerName.toUpperCase()} の詳細情報
        </Typography>
        <Divider style={{ marginBottom: '10px' }} />

        {Object.keys(groupedInfo).length > 0 ? (
          Object.entries(groupedInfo).map(([cls, items], idx) => {
            // サブアコーディオンが必要なクラス：VlanSetting, EthernetSetting
            if (cls === 'VlanSetting' || cls === 'EthernetSetting') {
              return (
                <Accordion key={cls} defaultExpanded={false}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    {/* グループ単位はそのまま表示（変更はサブアコーディオン単位） */}
                    <Typography style={{ fontWeight: 'bold' }}>{cls}</Typography>
                  </AccordionSummary>
                  <AccordionDetails style={{ display: 'flex', flexDirection: 'column' }}>
                    {items.map((item, itemIdx) => {
                      const subKey = `${cls}_${item.originalIndex}`;
                      let header = '';
                      if (cls === 'VlanSetting') {
                        header = `VlanNum: ${item.data.vlanNum}`;
                      } else if (cls === 'EthernetSetting') {
                        header = `Port: ${item.data.port}`;
                      }
                      return (
                        <Accordion key={`${cls}-${itemIdx}`} defaultExpanded={false} style={{ marginBottom: '8px' }}>
                          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                              <Typography style={{ fontWeight: 'bold' }}>
                                {header || `${cls} ${itemIdx + 1}`}
                              </Typography>
                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSubEditModes({ ...subEditModes, [subKey]: !subEditModes[subKey] });
                                }}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </div>
                          </AccordionSummary>
                          <AccordionDetails style={{ display: 'flex', flexDirection: 'column', paddingLeft: '16px' }}>
                            {Object.entries(item.data).map(([key, value]) => {
                              const originalValue =
                                originalRouterInfo[item.originalIndex] &&
                                originalRouterInfo[item.originalIndex][key];
                              const isEdited = String(value) !== String(originalValue);
                              return (
                                <div key={key} style={{ display: 'flex', flexDirection: 'row', marginBottom: '4px' }}>
                                  <strong style={{ marginRight: '4px' }}>{key}:</strong>
                                  {subEditModes[subKey] ? (
                                    <input
                                      type="text"
                                      value={value}
                                      onChange={(e) => {
                                        const newValue = e.target.value;
                                        setEditableRouterInfo((prev: any[]) => {
                                          const newArr = [...prev];
                                          newArr[item.originalIndex] = {
                                            ...newArr[item.originalIndex],
                                            [key]: newValue,
                                          };
                                          return newArr;
                                        });
                                      }}
                                      style={{
                                        flex: 1,
                                        border: '1px solid #ccc',
                                        padding: '2px 4px',
                                        color: isEdited ? 'blue' : 'inherit'
                                      }}
                                    />
                                  ) : (
                                    <Typography variant="body2" style={isEdited ? { color: 'blue' } : {}}>
                                      {String(value)}
                                    </Typography>
                                  )}
                                </div>
                              );
                            })}
                          </AccordionDetails>
                        </Accordion>
                      );
                    })}
                  </AccordionDetails>
                </Accordion>
              );
            } else {
              // その他のクラスは、もともとのサブアコーディオンなしの表示構造に、グループ単位の編集アイコンを追加
              return (
                <Accordion key={idx} defaultExpanded={false}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                      <Typography style={{ fontWeight: 'bold' }}>{cls}</Typography>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditModes({ ...editModes, [cls]: !editModes[cls] });
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </div>
                  </AccordionSummary>
                  <AccordionDetails style={{ display: 'flex', flexDirection: 'column' }}>
                    {items.map((item, itemIdx) => (
                      <div key={itemIdx} style={{ marginBottom: '8px' }}>
                        {Object.entries(item.data).map(([key, value]) => {
                          const originalValue =
                            originalRouterInfo[item.originalIndex] &&
                            originalRouterInfo[item.originalIndex][key];
                          const isEdited = String(value) !== String(originalValue);
                          return (
                            <div key={key} style={{ display: 'flex', flexDirection: 'row', marginBottom: '4px' }}>
                              <strong style={{ marginRight: '4px' }}>{key}:</strong>
                              {editModes[cls] ? (
                                <input
                                  type="text"
                                  value={value}
                                  onChange={(e) => {
                                    const newValue = e.target.value;
                                    setEditableRouterInfo((prev: any[]) => {
                                      const newArr = [...prev];
                                      newArr[item.originalIndex] = {
                                        ...newArr[item.originalIndex],
                                        [key]: newValue,
                                      };
                                      return newArr;
                                    });
                                  }}
                                  style={{
                                    flex: 1,
                                    border: '1px solid #ccc',
                                    padding: '2px 4px',
                                    color: isEdited ? 'blue' : 'inherit'
                                  }}
                                />
                              ) : (
                                <Typography variant="body2" style={isEdited ? { color: 'blue' } : {}}>
                                  {String(value)}
                                </Typography>
                              )}
                            </div>
                          );
                        })}
                        {itemIdx !== items.length - 1 && <Divider style={{ margin: '5px 0' }} />}
                      </div>
                    ))}
                  </AccordionDetails>
                </Accordion>
              );
            }
          })
        ) : (
          <Typography variant="body1">情報が見つかりませんでした</Typography>
        )}

        <Button variant="outlined" fullWidth onClick={onClose} style={{ marginTop: '10px' }}>
          閉じる
        </Button>
        <Button
          variant="contained"
          fullWidth
          onClick={handleOutputJSON}
          style={{ marginTop: '10px', backgroundColor: '#1976d2', color: 'white' }}
        >
          JSON出力
        </Button>
      </div>
    </Drawer>
  );
};

export default RouterSettingsDrawer;
