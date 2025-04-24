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

interface RouterSettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  routerName: string;
}

const filterRouterInfo = (info: any): any => {
  const { id, className, attributeErrorStatement, multiplictyErrorStatement, namd, ...rest } = info;
  return rest;
};

const groupByClassName = (data: any[]): { [key: string]: { data: any; originalIndex: number }[] } =>
  data.reduce((acc, curr, index) => {
    const cls = curr.className;
    if (!acc[cls]) acc[cls] = [];
    acc[cls].push({ data: filterRouterInfo(curr), originalIndex: index });
    return acc;
  }, {} as Record<string, { data: any; originalIndex: number }[]>);

const RouterSettingsDrawer: React.FC<RouterSettingsDrawerProps> = ({
  isOpen,
  onClose,
  onSave,
  routerName,
}) => {
  const [editableInfo, setEditableInfo] = useState<any[]>([]);
  const [originalInfo, setOriginalInfo] = useState<any[]>([]);
  const [errorInstances, setErrorInstances] = useState<Record<string, string[]>>({});
  const [groupEditModes, setGroupEditModes] = useState<Record<string, boolean>>({});
  const [subEditModes, setSubEditModes] = useState<Record<string, boolean>>({});
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const target = containerRef.current;
    if (!target) return;
    if (isOpen) disableBodyScroll(target);
    else enableBodyScroll(target);
    return () => clearAllBodyScrollLocks();
  }, [isOpen]);

  useEffect(() => {
    const app = new Application();
    app.loadErrorInfo()
      .then(() => app.loadRouterInfo())
      .then(info => {
        setErrorInstances(app.errorInstances);
        const list = info[routerName] || [];
        setOriginalInfo(list);
        setEditableInfo(list);
      })
      .catch(err => console.error(err));
  }, [routerName]);

  const grouped = groupByClassName(editableInfo);

  // グループごとのエラー有無を判定
  const groupErrorMap: Record<string, boolean> = {};
  Object.entries(grouped).forEach(([cls, items]) => {
    groupErrorMap[cls] = items.some(({ data, originalIndex }) => {
      const id = originalInfo[originalIndex]?.id?.trim().toLowerCase() || '';
      return Object.keys(data).some(key => errorInstances[id]?.includes(key));
    });
  });

  // ソート
  if (grouped['VlanSetting']) grouped['VlanSetting'].sort((a, b) => (a.data.vlanNum || 0) - (b.data.vlanNum || 0));
  if (grouped['Vlan']) grouped['Vlan'].sort((a, b) => (a.data.num || 0) - (b.data.num || 0));
  if (grouped['EthernetSetting']) grouped['EthernetSetting'].sort((a, b) => (a.data.port || 0) - (b.data.port || 0));

  const handleOutputJSON = () => {
    console.log(JSON.stringify(editableInfo, null, 2));
    alert('コンソールにJSONを出力しました');
  };

  const handleSave = () => {
    const app = new Application();
    app.routerInfo[routerName] = editableInfo;
    onSave();
    onClose();
  };

  return (
    <Drawer anchor="right" open={isOpen} onClose={onClose}>
      <S.Container ref={containerRef}>
        <S.Title>{routerName.toUpperCase()} の詳細情報</S.Title>
        <Divider style={{ marginBottom: 10 }} />

        {Object.entries(grouped).map(([cls, items]) => {
          const hasSub = cls === 'VlanSetting' || cls === 'EthernetSetting';
          const isGroupError = groupErrorMap[cls];
          return (
            <Accordion key={cls} defaultExpanded={false}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography style={{
                  fontWeight: 'bold',
                  ...(isGroupError ? { backgroundColor: 'rgba(255,0,0,0.2)' } : {})
                }}>
                  {cls}
                </Typography>
                {!hasSub && (
                  <IconButton size="small" onClick={e => { e.stopPropagation(); setGroupEditModes({ ...groupEditModes, [cls]: !groupEditModes[cls] }); }}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                )}
              </AccordionSummary>
              <AccordionDetails style={{ display: 'flex', flexDirection: 'column' }}>
                {items.map(({ data, originalIndex }, idx) => {
                  if (hasSub) {
                    const subKey = `${cls}_${originalIndex}`;
                    let header = '';
                    if (cls === 'VlanSetting') header = `VlanNum: ${data.vlanNum}`;
                    if (cls === 'EthernetSetting') header = `Port: ${data.port}`;
                    return (
                      <Accordion key={subKey} defaultExpanded={false} style={{ marginBottom: 8 }}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                          <Typography style={{ fontWeight: 'bold' }}>
                            {header || `${cls} ${idx + 1}`}
                          </Typography>
                          <IconButton size="small" onClick={e => { e.stopPropagation(); setSubEditModes({ ...subEditModes, [subKey]: !subEditModes[subKey] }); }}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </AccordionSummary>
                        <AccordionDetails style={{ display: 'flex', flexDirection: 'column', paddingLeft: 16 }}>
                          {Object.entries(data).map(([key, value]) => {
                            const id = originalInfo[originalIndex]?.id?.trim().toLowerCase() || '';
                            const isError = errorInstances[id]?.includes(key);
                            return (
                              <S.DetailItem key={key} style={isError ? { backgroundColor: 'rgba(255,0,0,0.2)' } : {}}>
                                <strong style={isError ? { color: 'red' } : {}}>{key}:</strong>
                                {subEditModes[subKey]
                                  ? <input
                                      type="text"
                                      value={value as any}
                                      onChange={e => {
                                        const arr = [...editableInfo];
                                        arr[originalIndex] = { ...arr[originalIndex], [key]: e.target.value };
                                        setEditableInfo(arr);
                                      }}
                                      style={{ flex: 1, border: '1px solid #ccc', padding: '2px 4px', ...(isError ? { color: 'red' } : {}) }}
                                    />
                                  : <Typography variant="body2" style={isError ? { color: 'red' } : {}}>{String(value)}</Typography>
                                }
                              </S.DetailItem>
                            );
                          })}
                        </AccordionDetails>
                      </Accordion>
                    );
                  }
                  return (
                    <S.DetailItem key={idx} style={{ marginBottom: 8, ...(isGroupError ? { backgroundColor: 'rgba(255,0,0,0.1)' } : {}) }}>
                      {Object.entries(data).map(([key, value]) => {
                        const id = originalInfo[originalIndex]?.id?.trim().toLowerCase() || '';
                        const isError = errorInstances[id]?.includes(key);
                        return (
                          <span key={key} style={{ display: 'flex', width: '100%' }}>
                            <strong style={isError ? { color: 'red' } : {}}>{key}:</strong>
                            {groupEditModes[cls]
                              ? <input
                                  type="text"
                                  value={value as any}
                                  onChange={e => {
                                    const arr = [...editableInfo];
                                    arr[originalIndex] = { ...arr[originalIndex], [key]: e.target.value };
                                    setEditableInfo(arr);
                                  }}
                                  style={{ flex: 1, border: '1px solid #ccc', padding: '2px 4px', ...(isError ? { color: 'red' } : {}) }}
                                />
                              : <Typography variant="body2" style={isError ? { color: 'red' } : {}}>{String(value)}</Typography>
                            }
                          </span>
                        );
                      })}
                    </S.DetailItem>
                  );
                })}
              </AccordionDetails>
            </Accordion>
          );
        })}

        <Button variant="outlined" fullWidth onClick={onClose} style={{ marginTop: 10 }}>
          閉じる
        </Button>
        <Button variant="contained" fullWidth onClick={handleOutputJSON} style={{ marginTop: 10, backgroundColor: '#1976d2', color: 'white' }}>
          JSON出力
        </Button>
        <Button variant="contained" fullWidth onClick={handleSave} style={{ marginTop: 10 }}>
          保存して閉じる
        </Button>
      </S.Container>
    </Drawer>
  );
};

export default RouterSettingsDrawer;
