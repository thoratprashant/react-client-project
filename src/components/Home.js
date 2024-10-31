import React from 'react';
import {useUserContext} from '../UserContext';
import Invoices from './invoices/Invoices';
import {Roles} from '../constants/ActorContstants';
import styled from '@emotion/styled';

const StyledContainer = styled.div`
    width: 100%;
    padding-left: 10px;
`;

export default function Home() {
    const {actor} = useUserContext();

    return (
        <StyledContainer>
            <span>{`Welcome, ${actor?.firstName} ${actor?.lastName}.`}</span>
            {(actor.role === Roles.PHYSICIAN.moniker ||
                actor.role === Roles.ADMINISTRATOR.moniker) && <Invoices />}
        </StyledContainer>
    );
}
