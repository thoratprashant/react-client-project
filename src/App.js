import React from 'react';
import {Authenticator, useAuthenticator} from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import './App.css';
import {UserContext} from './UserContext';
import styled from '@emotion/styled';
import AppLayout from './components/layout/AppLayout';
import {createBrowserRouter, RouterProvider} from 'react-router-dom';
import {ExternalSource} from './constants/ActorContstants';
import {useReadActorByExternalIdAndSource} from './api/actorApi';
import {LinearProgress} from '@mui/material';
import {ALL_NAV_ITEMS} from './constants/RouteConstants';

const StyledLogin = styled.div`
    display: flex;
    height: 100vh;
    align-items: center;
    justify-content: center;
`;
const StyledApp = styled.div`
    height: 100%;
`;

function App() {
    const {authStatus, user: authUser} = useAuthenticator();

    const {
        data: actor,
        isLoading,
        isError,
    } = useReadActorByExternalIdAndSource(authUser?.attributes?.sub, ExternalSource.COGNITO, true);

    const router = createBrowserRouter([
        {
            path: '/',
            element: <AppLayout />,
            // errorElement: TODO
            children: ALL_NAV_ITEMS.filter(
                ({requiresOneOfRole}) =>
                    !requiresOneOfRole || requiresOneOfRole.includes(actor?.role)
            ).map(({url, element}) => ({path: url, element})),
        },
    ]);

    if (authStatus === 'authenticated' && Boolean(authUser)) {
        const {username, attributes, pool} = authUser;
        if (isLoading) return <LinearProgress />;
        else if (isError) return <div>An error has occurred</div>;
        return (
            <StyledApp>
                <UserContext.Provider value={{username, attributes, pool, actor}}>
                    <RouterProvider router={router} />
                </UserContext.Provider>
            </StyledApp>
        );
    }

    return (
        <StyledLogin>
            <Authenticator hideSignUp={true}>
                <div className="App" />
            </Authenticator>
        </StyledLogin>
    );
}

export default App;
