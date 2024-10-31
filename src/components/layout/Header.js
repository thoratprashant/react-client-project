import React from 'react';
import styled from '@emotion/styled';
import {useNavigate} from 'react-router';
import {AppBar, Link, Toolbar} from '@mui/material';
import HeaderUserMenu from './HeaderUserMenu';

const StyledAppBar = styled(AppBar)`
    border-bottom: 1px solid grey;
    background-color: white;
    z-index: ${({theme}) => theme.zIndex.drawer + 1};
    margin-bottom: ${({theme}) => theme.layout.headerBottomMargin};
    height: ${({theme}) => theme.layout.headerHeight};
`;
const StyledHeaderContent = styled(Toolbar)`
    display: flex;
    margin: 5px;
    justify-content: space-between;
`;
const StyledLogo = styled.img`
    height: 64px;
    color: ${({theme}) => theme.palette.primary.main};
`;
const StyledBranding = styled.div`
    display: flex;
    color: ${({theme}) => theme.palette.text.primary};

    &:hover {
        cursor: pointer;
    }
`;

export default function Header() {
    const navigate = useNavigate();

    return (
        <StyledAppBar position={'static'}>
            <StyledHeaderContent>
                <Link aria-label={'home'} onClick={() => navigate('/')}>
                    <StyledBranding>
                        <StyledLogo src="/logo_cropped.png" alt="Systolics LLC logo" />
                    </StyledBranding>
                </Link>
                <HeaderUserMenu />
            </StyledHeaderContent>
        </StyledAppBar>
    );
}
