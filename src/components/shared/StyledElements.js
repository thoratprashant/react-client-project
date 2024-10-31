import styled from '@emotion/styled';
import {Button, DialogActions, DialogTitle, TextField} from '@mui/material';

export const StyledContainer = styled.div`
    width: 100%;
    padding-right: 10px;
`;
export const StyledTableActionsContainer = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 5px;
    margin-left: 5px;
    margin-right: 5px;
`;
export const StyledTextField = styled(TextField)`
    margin-top: 10px;
    margin-bottom: 10px;
`;
export const StyledCreateButton = styled(Button)`
    height: 46px;
    font-weight: 600;
    background-color: ${({theme}) => theme.palette.primary.light};
`;
export const StyledFullWidthPageContainer = styled.div`
    width: 100%;
    margin: 10px;
`;
export const StyledDialogContainer = styled.div`
    margin: 10px;
`;
export const StyledDialogTitle = styled(DialogTitle)`
    background-color: ${({theme}) => theme.palette.primary.light};
`;
export const StyledDialogActions = styled(DialogActions)`
    display: flex;
    justify-content: space-between;
`;
export const StyledButton = styled(Button)`
    font-weight: 600;
    background-color: ${({theme}) => theme.palette.primary.light};
`;
export const StyledBreadcrumbs = styled.div`
    position: sticky;
    top: 0;

    &:hover {
        cursor: pointer;
    }
`;
export const StyledCentered = styled.div`
    display: flex;
    justify-content: center;
`;