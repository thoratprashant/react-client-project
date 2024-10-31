import React from 'react';
import {Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle} from '@mui/material';
import Button from '@mui/material/Button';
import {useNavigate} from 'react-router';

export default function LowInventoryAlertDialog({
    open,
    lowInventoryMessages = [],
    handleClose,
    setReviewed,
}) {
    const navigate = useNavigate();
    return (
        <Dialog
            open={open}
            onClose={handleClose}
            aria-labelledby="alert-lowinventory-title"
            aria-describedby="alert-lowinventory-description"
        >
            <DialogTitle id="alert-lowinventory-title">Low Inventory Alert</DialogTitle>
            <DialogContent>
                <DialogContentText id="alert-lowinventory-description">
                    The following Medications are low on inventory:
                </DialogContentText>
                <ul>
                    {lowInventoryMessages.map((m, i) => (
                        <li key={`low-inventory-${i}`}>{m}</li>
                    ))}
                </ul>
            </DialogContent>
            <DialogActions sx={{display: 'flex', justifyContent: 'space-between'}}>
                <Button onClick={handleClose} variant={'contained'}>
                    Ignore
                </Button>
                <Button
                    onClick={() => {
                        setReviewed(true);
                        navigate('/inventory/levels');
                    }}
                    autoFocus
                    variant={'contained'}
                >
                    Order More
                </Button>
            </DialogActions>
        </Dialog>
    );
}
