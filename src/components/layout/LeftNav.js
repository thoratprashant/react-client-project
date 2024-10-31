import React, {useCallback, useMemo, useState} from 'react';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import styled from '@emotion/styled';
import {useTheme} from '@emotion/react';
import {Badge, Link} from '@mui/material';
import {useLocation, useNavigate} from 'react-router';
import {
    ADMIN_NAV_ITEMS,
    E_RX_NAV_ITEMS,
    HOME_NAV_ITEM,
    RPM_NAV_ITEMS,
} from '../../constants/RouteConstants';
import {useUserContext} from '../../UserContext';
import {ExpandLess, ExpandMore} from '@mui/icons-material';
import AssignmentIcon from '@mui/icons-material/Assignment';
import MonitorIcon from '@mui/icons-material/Monitor';
import {Divider} from '@aws-amplify/ui-react';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import {useReadRenewalRequests} from '../../api/prescriptionApi';
import {Roles} from '../../constants/ActorContstants';
import {useReadAllMedications} from '../../api/medicationApi';
import LowInventoryAlertDialog from '../LowInventoryAlertDialog';

const StyledDrawer = styled(Drawer)(({theme}) => ({
    width: theme.layout.drawerWidth,
    zIndex: 200,
    marginRight: '12px',
}));
const StyledLink = styled(Link)(({theme}) => ({
    display: 'flex',
    alignItems: 'center',
    color: 'white',
}));
const StyledListItemIcon = styled(ListItemIcon)(({theme}) => ({
    color: 'white',
}));
const StyledListItemText = styled(ListItemText)(({theme}) => ({
    color: 'white',
    marginLeft: '-16px',
}));
const StyledNavListItemText = styled(ListItemText)(({theme}) => ({
    color: 'white',
}));
const StyledExpandLess = styled(ExpandLess)(({theme}) => ({
    color: 'white',
}));
const StyledExpandMore = styled(ExpandMore)(({theme}) => ({
    color: 'white',
}));
const StyledBadge = styled(Badge)(({theme}) => ({
    '& .MuiBadge-badge': {
        backgroundColor: '#f10173',
        color: 'white',
    },
}));
const StyledListItemButton = styled(ListItemButton)(({theme}) => ({
    '&.Mui-selected': {
        // filter: 'brightness(125%)',
        backgroundColor: '#025e81',
    },
}));

export default function LeftNav() {
    const theme = useTheme();
    const navigate = useNavigate();
    const {actor} = useUserContext();
    const location = useLocation();
    const [adminOpen, setAdminOpen] = useState(false);
    const [rpmOpen, setRpmOpen] = useState(false);
    const [eRxOpen, setERxOpen] = useState(false);
    const [lowInventoryReviewed, setLowInventoryReviewed] = useState(false);

    const {data: renewalRequests, isLoading} = useReadRenewalRequests(
        false,
        actor.role !== Roles.PATIENT.moniker
    );

    const {data: medications, isLoading: isMedicationsLoading} = useReadAllMedications(
        false,
        actor.role !== Roles.PATIENT.moniker && actor.role !== Roles.WHOLESALER.moniker
    );
    const lowInventoryMedications = useMemo(() => {
        if (isMedicationsLoading) return [];
        const lowInventoryMeds = medications.filter((m) => m.inventoryOnHand <= m.inventoryMinimum);
        if (!lowInventoryMeds || lowInventoryMeds.length === 0) return [];
        return lowInventoryMeds.map(
            (m) =>
                `${m.displayName} is low on inventory for ${m.office.name} with only ${m.inventoryOnHand} on hand.`
        );
    }, [isMedicationsLoading, medications]);

    const countsData = useMemo(() => {
        const counts = {physicianRenewalRequestCount: 0};
        if (renewalRequests?.length > 0 && !isLoading)
            counts.physicianRenewalRequestCount = renewalRequests.length;

        return counts;
    }, [renewalRequests, isLoading]);

    const handleGroupClick = useCallback(
        (groupName) => {
            if (groupName === 'ADMIN') setAdminOpen(!adminOpen);
            else if (groupName === 'RPM') setRpmOpen(!rpmOpen);
            else if (groupName === 'ERx') setERxOpen(!eRxOpen);
        },
        [adminOpen, rpmOpen, eRxOpen]
    );

    const currPath = useMemo(() => {
        return location.pathname;
    }, [location]);

    const renderNavItem = useCallback(
        ({index, url, description, icon, showCount}) => {
            return (
                <StyledListItemButton
                    key={`leftNav_${index}`}
                    onClick={() => navigate(url)}
                    selected={currPath === url}
                >
                    <StyledLink
                        aria-label={description}
                        underline="hover"
                        key={`${description}_${index}`}
                    >
                        {showCount && Boolean(countsData[showCount]) && countsData[showCount] > 0 && (
                            <StyledListItemIcon>
                                <StyledBadge badgeContent={countsData[showCount]}>
                                    {icon}
                                </StyledBadge>
                            </StyledListItemIcon>
                        )}
                        {(!showCount ||
                            !Boolean(countsData[showCount]) ||
                            countsData[showCount] === 0) && (
                            <StyledListItemIcon>{icon}</StyledListItemIcon>
                        )}
                        <StyledNavListItemText primary={description} />
                    </StyledLink>
                </StyledListItemButton>
            );
        },
        [currPath, navigate, countsData]
    );

    const hasAdminItems = useMemo(() => {
        return (
            ADMIN_NAV_ITEMS.filter(({requiresOneOfRole, excludeFromLeftNav}) => {
                if (excludeFromLeftNav) return false;
                return !requiresOneOfRole || requiresOneOfRole.includes(actor?.role);
            }).length > 0
        );
    }, [actor?.role]);

    const hasERxItems = useMemo(() => {
        return (
            E_RX_NAV_ITEMS.filter(({requiresOneOfRole, excludeFromLeftNav}) => {
                if (excludeFromLeftNav) return false;
                return !requiresOneOfRole || requiresOneOfRole.includes(actor?.role);
            }).length > 0
        );
    }, [actor?.role]);

    const renderERxItems = useCallback(() => {
        return (
            <>
                <Divider />
                <ListItemButton onClick={() => handleGroupClick('ERx')}>
                    <StyledListItemIcon>
                        <LocalHospitalIcon />
                    </StyledListItemIcon>
                    <StyledListItemText primary="E-Prescribe" />
                    {eRxOpen ? <StyledExpandLess /> : <StyledExpandMore />}
                </ListItemButton>
                <Divider />
                {eRxOpen &&
                    E_RX_NAV_ITEMS.filter(({requiresOneOfRole, excludeFromLeftNav}) => {
                        if (excludeFromLeftNav) return false;
                        return !requiresOneOfRole || requiresOneOfRole.includes(actor?.role);
                    }).map(({description, icon, url, showCount}, index) =>
                        renderNavItem({index, url, description, icon, showCount})
                    )}
            </>
        );
    }, [actor?.role, eRxOpen, handleGroupClick, renderNavItem]);

    const renderAdminItems = useCallback(() => {
        return (
            <>
                <Divider />
                <ListItemButton onClick={() => handleGroupClick('ADMIN')}>
                    <StyledListItemIcon>
                        <AssignmentIcon />
                    </StyledListItemIcon>
                    <StyledListItemText primary="Admin" />
                    {adminOpen ? <StyledExpandLess /> : <StyledExpandMore />}
                </ListItemButton>
                <Divider />
                {adminOpen &&
                    ADMIN_NAV_ITEMS.filter(({requiresOneOfRole, excludeFromLeftNav}) => {
                        if (excludeFromLeftNav) return false;
                        return !requiresOneOfRole || requiresOneOfRole.includes(actor?.role);
                    }).map(({description, icon, url}, index) =>
                        renderNavItem({index, url, description, icon})
                    )}
            </>
        );
    }, [actor?.role, adminOpen, handleGroupClick, renderNavItem]);

    const hasRpmItems = useMemo(() => {
        return (
            RPM_NAV_ITEMS.filter(({requiresOneOfRole}) => {
                return !requiresOneOfRole || requiresOneOfRole.includes(actor?.role);
            }).length > 0
        );
    }, [actor?.role]);

    const renderRpmItems = useCallback(() => {
        return (
            <>
                {adminOpen && <Divider />}
                <ListItemButton onClick={() => handleGroupClick('RPM')}>
                    <StyledListItemIcon>
                        <MonitorIcon />
                    </StyledListItemIcon>
                    <StyledListItemText primary="Patient Monitoring" />
                    {rpmOpen ? <StyledExpandLess /> : <StyledExpandMore />}
                </ListItemButton>
                <Divider />
                {rpmOpen &&
                    RPM_NAV_ITEMS.filter(({requiresOneOfRole}) => {
                        return !requiresOneOfRole || requiresOneOfRole.includes(actor?.role);
                    }).map(({description, icon, url}, index) =>
                        renderNavItem({index, url, description, icon})
                    )}
            </>
        );
    }, [actor?.role, adminOpen, handleGroupClick, renderNavItem, rpmOpen]);

    return (
        <>
            <StyledDrawer
                variant="permanent"
                sx={{
                    '& .MuiDrawer-paper': {
                        width: theme.layout.drawerWidth,
                        paddingTop: '68px',
                        backgroundColor: '#012e3f',
                    },
                }}
            >
                <List>
                    {[HOME_NAV_ITEM].map(({description, icon, url}, index) =>
                        renderNavItem({index, url, description, icon})
                    )}
                    {hasERxItems && renderERxItems()}
                    {hasRpmItems && renderRpmItems()}
                    {hasAdminItems && renderAdminItems()}
                </List>
            </StyledDrawer>
            <LowInventoryAlertDialog
                handleClose={() => {
                    setLowInventoryReviewed(true);
                }}
                open={
                    lowInventoryMedications?.length > 0 &&
                    !lowInventoryReviewed &&
                    (actor.role === Roles.PHYSICIAN.moniker ||
                        actor.role === Roles.OFFICE_ADMINISTRATOR.moniker)
                }
                lowInventoryMessages={lowInventoryMedications}
                setReviewed={setLowInventoryReviewed}
            />
        </>
    );
}
