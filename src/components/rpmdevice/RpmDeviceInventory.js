import React, {useState} from 'react';
import {StyledButton, StyledContainer, StyledTableActionsContainer} from '../shared/StyledElements';
import RpmDeviceRequestShipmentDialog from './RpmDeviceRequestShipmentDialog';
import OfficeDeviceTable from './OfficeDeviceTable';
import {Box, Tab, Tabs} from '@mui/material';
import DeviceShipmentTable from './DeviceShipmentTable';
import {Roles} from '../../constants/ActorContstants';
import {useUserContext} from '../../UserContext';
import {
    useUpdateOfficeDeviceShipment,
} from '../../api/officeDeviceApi';
import {useQueryClient} from '@tanstack/react-query';
import {useSnackbar} from 'notistack';
import ShippedDialog from './ShippedDialog';

export default function RpmDeviceInventory() {
    const {actor} = useUserContext();
    const [activeTab, setActiveTab] = useState(0);
    const [requestShipmentDialogOpen, setRequestShipmentDialogOpen] = useState(false);
    const [shipShipmentDialogOpen, setShipShipmentDialogOpen] = useState(false);
    const [selectedOfficeDevice, setSelectedOfficeDevice] = useState(undefined);
    const [selectedShipment, setSelectedShipment] = useState(undefined);

    const queryClient = useQueryClient();
    const {enqueueSnackbar} = useSnackbar();

    const submissionOptions = {
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({queryKey: ['shipments']}).then(() => {
                enqueueSnackbar(`Device shipment has been successfully requested.`, {
                    variant: 'success',
                });
                setRequestShipmentDialogOpen(false);
                setShipShipmentDialogOpen(false);
                setSelectedOfficeDevice(undefined);
                setSelectedShipment(undefined);
            });
        },
        onError: ({data}, variables) => {
            enqueueSnackbar(
                `There was an error updating device shipment${
                    data?.message && ': ' + data.message
                }`,
                {
                    variant: 'error',
                }
            );
        },
    };

    const {mutate: updateShipment} = useUpdateOfficeDeviceShipment(submissionOptions);

    return (
        <StyledContainer>
            <StyledTableActionsContainer>
                <Box sx={{borderBottom: 1, borderColor: 'divider', marginBottom: '5px'}}>
                    <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
                        <Tab label="Devices" />
                        <Tab label="Pending Shipments" />
                        <Tab label="Shipped" />
                        <Tab label="Delivered" />
                        <Tab label="Cancelled" />
                    </Tabs>
                </Box>
                {activeTab === 0 && (
                    <StyledButton
                        variant={'contained'}
                        onClick={() => setRequestShipmentDialogOpen(true)}
                        disabled={!selectedOfficeDevice || !selectedOfficeDevice.id}
                    >
                        Request Shipment
                    </StyledButton>
                )}
                {activeTab === 1 && (
                    <div>
                        <StyledButton
                            variant={'contained'}
                            onClick={() =>
                                updateShipment({
                                    body: {...selectedShipment, shipmentStatus: 'CANCELLED'},
                                })
                            }
                            disabled={!selectedShipment || !selectedShipment.id}
                        >
                            Cancel Shipment
                        </StyledButton>
                        {actor.role === Roles.ADMINISTRATOR.moniker && (
                            <StyledButton
                                variant={'contained'}
                                onClick={() => setShipShipmentDialogOpen(true)}
                                disabled={!selectedShipment || !selectedShipment.id}
                                sx={{marginLeft: '12px'}}
                            >
                                Ship
                            </StyledButton>
                        )}
                    </div>
                )}
                {activeTab === 2 && (
                    <StyledButton
                        variant={'contained'}
                        onClick={() =>
                            updateShipment({
                                body: {...selectedShipment, shipmentStatus: 'DELIVERED'},
                            })
                        }
                        disabled={!selectedShipment || !selectedShipment.id}
                    >
                        Mark as Delivered
                    </StyledButton>
                )}
            </StyledTableActionsContainer>
            {activeTab === 0 && (
                <OfficeDeviceTable
                    selectedDevice={selectedOfficeDevice}
                    setSelectedDevice={setSelectedOfficeDevice}
                />
            )}
            {activeTab === 1 && (
                <DeviceShipmentTable
                    selectedShipment={selectedShipment}
                    setSelectedShipment={setSelectedShipment}
                    shipmentStatus={'PENDING'}
                />
            )}
            {activeTab === 2 && (
                <DeviceShipmentTable
                    selectedShipment={selectedShipment}
                    setSelectedShipment={setSelectedShipment}
                    shipmentStatus={'SHIPPED'}
                />
            )}
            {activeTab === 3 && (
                <DeviceShipmentTable
                    selectedShipment={selectedShipment}
                    setSelectedShipment={setSelectedShipment}
                    shipmentStatus={'DELIVERED'}
                />
            )}
            {activeTab === 4 && (
                <DeviceShipmentTable
                    selectedShipment={selectedShipment}
                    setSelectedShipment={setSelectedShipment}
                    shipmentStatus={'CANCELLED'}
                />
            )}
            {requestShipmentDialogOpen && (
                <RpmDeviceRequestShipmentDialog
                    dialogOpen={requestShipmentDialogOpen}
                    setDialogOpen={setRequestShipmentDialogOpen}
                    deviceName={selectedOfficeDevice.deviceName}
                    officeDeviceId={selectedOfficeDevice.id}
                />
            )}
            {shipShipmentDialogOpen && (
                <ShippedDialog
                    dialogOpen={shipShipmentDialogOpen}
                    setDialogOpen={setShipShipmentDialogOpen}
                    selectedShipment={selectedShipment}
                    setSelectedShipment={setSelectedShipment}
                />
            )}
        </StyledContainer>
    );
}
