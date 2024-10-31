import React, {useState} from 'react';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import PersonIcon from '@mui/icons-material/Person';
import {Auth} from 'aws-amplify';
import styled from '@emotion/styled';
import {useNavigate} from 'react-router';
import {useQueryClient} from '@tanstack/react-query';

const StyledPersonIcon = styled(PersonIcon)`
    height: 40px;
    width: 40px;
    color: ${({theme}) => theme.palette.text.primary};
`;

export default function HeaderUserMenu() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);
    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleSignOut = () => {
        queryClient.removeQueries();
        queryClient.clear();
        queryClient.invalidateQueries().then(() => {
            queryClient.resetQueries().then(() => {
                Auth.signOut().then(() => {
                    navigate('/');
                    handleClose();
                })
            })
        });
    };

    return (
        <div>
            <Button
                aria-controls={open ? 'user-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={open ? 'true' : undefined}
                onClick={handleClick}
            >
                <StyledPersonIcon aria-label={'person-icon-button'} />
            </Button>
            <Menu
                id="basic-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                MenuListProps={{
                    'aria-labelledby': 'person-icon-button',
                }}
            >
                <MenuItem onClick={handleSignOut}>Sign Out</MenuItem>
            </Menu>
        </div>
    );
}
