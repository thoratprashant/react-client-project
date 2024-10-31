import React from 'react';
import {Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle} from '@mui/material';
import Button from '@mui/material/Button';

export default function InactivityDialog({open, handleClose}) {
    return (
        <Dialog
            open={open}
            onClose={handleClose}
            aria-labelledby="alert-inactivity-title"
            aria-describedby="alert-inactivity-description"
        >
            <DialogTitle id="alert-inactivity-title">Inactivity Alert</DialogTitle>
            <DialogContent>
                <DialogContentText id="alert-inactivity-description">
                    You will be logged out soon due to inactivity. Click "Cancel" to remain logged
                    in.
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} autoFocus variant={'contained'}>
                    Cancel
                </Button>
            </DialogActions>
        </Dialog>
    );
}
