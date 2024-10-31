import React, {useState} from 'react';
import {Box, Tab, Tabs} from '@mui/material';
import RequestedShipments from './requested/RequestedShipments';
import ShipmentsByStatusTable from './ShipmentsByStatusTable';
import {ShipmentStatus} from '../../constants/CommonConstants';

export default function Shipments() {
    const [activeTab, setActiveTab] = useState(0);
    return (
        <div>
            <Box sx={{borderBottom: 1, borderColor: 'divider', marginBottom: '5px'}}>
                <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
                    <Tab label="Requests" />
                    <Tab label="Shipped" />
                    <Tab label="Delivered" />
                </Tabs>
            </Box>
            {0 === activeTab && <RequestedShipments />}
            {1 === activeTab && <ShipmentsByStatusTable shipmentStatus={ShipmentStatus.SHIPPED} />}
            {2 === activeTab && <ShipmentsByStatusTable shipmentStatus={ShipmentStatus.DELIVERED} />}
        </div>
    );
}
