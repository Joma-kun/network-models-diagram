// @ts-nocheck
import React, { useState } from 'react';
import styled from '@emotion/styled';
import { Drawer, Button, List, ListItem, ListItemText, Collapse, Typography } from '@mui/material';
import { ExpandLess, ExpandMore } from '@mui/icons-material';

interface RouterSettingsDrawerProps {
    isOpen: boolean;
    onClose: () => void;
}

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
    SectionTitle: styled(Typography)`
        font-size: 1.2rem;
        font-weight: bold;
        margin-top: 15px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: space-between;
    `,
    DetailText: styled(Typography)`
        font-size: 1rem;
        margin-left: 10px;
    `,
    ErrorSection: styled.div`
        background-color: #ffebee;
        padding: 10px;
        border-radius: 5px;
    `,
    ErrorText: styled(Typography)`
        font-size: 1rem;
        margin-left: 10px;
        color: #d32f2f;
        font-weight: bold;
    `
};

const RouterSettingsDrawer: React.FC<RouterSettingsDrawerProps> = ({ isOpen, onClose }) => {
    const [expanded, setExpanded] = useState({
        config: false,
        hostname: false,
        vlan: false
    });

    const toggleExpand = (section: keyof typeof expanded) => {
        setExpanded((prev) => ({ ...prev, [section]: !prev[section] }));
    };

    return (
        <Drawer anchor="right" open={isOpen} onClose={onClose}>
            <S.Container>
                <S.Title>機器情報</S.Title>

                {/* Config Section */}
                <List>
                    <ListItem button onClick={() => toggleExpand('config')}>
                        <S.SectionTitle>
                            Config
                            {expanded.config ? <ExpandLess /> : <ExpandMore />}
                        </S.SectionTitle>
                    </ListItem>
                    <Collapse in={expanded.config} timeout="auto" unmountOnExit>
                        <List component="div" disablePadding>
                            <ListItem>
                                <S.DetailText>DeviceModel: cisco1812</S.DetailText>
                            </ListItem>
                        </List>
                    </Collapse>
                </List>

                {/* Hostname Section */}
                <List>
                    <ListItem button onClick={() => toggleExpand('hostname')}>
                        <S.SectionTitle>
                            Hostname
                            {expanded.hostname ? <ExpandLess /> : <ExpandMore />}
                        </S.SectionTitle>
                    </ListItem>
                    <Collapse in={expanded.hostname} timeout="auto" unmountOnExit>
                        <List component="div" disablePadding>
                            <ListItem>
                                <S.DetailText>Name: Router2</S.DetailText>
                            </ListItem>
                        </List>
                    </Collapse>
                </List>

                {/* Vlan Setting Section (エラー) */}
                <List>
                    <ListItem button onClick={() => toggleExpand('vlan')}>
                        <S.SectionTitle style={{ color: '#d32f2f' }}>
                            VlanSetting
                            {expanded.vlan ? <ExpandLess /> : <ExpandMore />}
                        </S.SectionTitle>
                    </ListItem>
                    <Collapse in={expanded.vlan} timeout="auto" unmountOnExit>
                        <S.ErrorSection>
                            <List component="div" disablePadding>
                                <ListItem>
                                    <S.DetailText>VlanNum: 10</S.DetailText>
                                </ListItem>
                                <ListItem>
                                    <S.ErrorText>IpAddress: 192.168.10.2</S.ErrorText>
                                </ListItem>
                                <ListItem>
                                    <S.DetailText>SubnetMask: 255.255.255.0</S.DetailText>
                                </ListItem>
                            </List>
                        </S.ErrorSection>
                    </Collapse>
                </List>

                {/* Close Button */}
                <Button variant="contained" color="primary" fullWidth onClick={onClose} style={{ marginTop: '20px' }}>
                    閉じる
                </Button>
            </S.Container>
        </Drawer>
    );
};

export default RouterSettingsDrawer;
