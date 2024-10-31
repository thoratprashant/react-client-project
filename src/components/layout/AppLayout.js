import React, {useCallback, useState} from 'react';
import styled from '@emotion/styled';
import Header from './Header';
import {Outlet} from 'react-router';
import LeftNav from './LeftNav';
import {useIdleTimer} from 'react-idle-timer';
import InactivityDialog from '../InactivityDialog';
import {Auth} from 'aws-amplify';
import {useQueryClient} from '@tanstack/react-query';

const StyledAppLayout = styled.div`
    height: 100%;
    display: flex;
    flex-direction: column;
`;

const StyledHeader = styled('header')(({theme}) => ({
    position: 'sticky',
    top: '0',
    minWidth: '100%',
    zIndex: theme.zIndex.drawer + 2,
}));

const StyledMainContent = styled.div`
    display: flex;
    flex: 1 1 auto;
    flex-direction: row;
    overflow: hidden;
    overflow-x: auto;
`;

const StyledLeftNav = styled(LeftNav)`
    margin-right: 10px;
`;

export default function AppLayout() {
    const queryClient = useQueryClient();
    const [inactivityDialogOpen, setInactivityDialogOpen] = useState(false);
    const onPrompt = useCallback(() => {
        setInactivityDialogOpen(true);
    }, []);
    const onIdle = useCallback(() => {
        setInactivityDialogOpen(false);
        queryClient.removeQueries()
        Auth.signOut();
    }, [queryClient]);

    // When the user becomes idle, the onPrompt is called
    // After prompt timeout is reached, the onIdle function is called
    // ex: Set the timeout to 13 minutes, so the onPrompt will pop a dialog. Set the promptTimeout to an additional 2 minutes so you're logged out at a total of 15 minutes.
    const {reset} = useIdleTimer({
        onPrompt,
        onIdle,
        timeout: 1000 * 60 * 13,
        promptTimeout: 1000 * 60 * 2,
    });

    return (
        <StyledAppLayout>
            <StyledHeader>
                <Header />
            </StyledHeader>
            <StyledMainContent>
                <StyledLeftNav />
                <Outlet />
            </StyledMainContent>
            <InactivityDialog
                handleClose={() => {
                    setInactivityDialogOpen(false);
                    reset();
                }}
                open={inactivityDialogOpen}
            />
        </StyledAppLayout>
    );
}
