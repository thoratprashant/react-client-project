import React, {useMemo} from 'react';
import {useReadAllMedicationOrders} from '../../../api/medicationOrderApi';
import OfficeRequestedShipment from './OfficeRequestedShipment';
import {LinearProgress} from '@mui/material';
import {MedicationOrderStatus} from '../../../constants/CommonConstants';

export default function RequestedShipments() {
    const {
        data: medOrders,
        isLoading,
        isError,
    } = useReadAllMedicationOrders(MedicationOrderStatus.NEW);

    const medOrdersByOfficeMap = useMemo(() => {
        const map = {};
        if (isLoading || isError) return map;
        medOrders.forEach((mo) => {
            if (map[mo.officeId]) {
                map[mo.officeId].push(mo);
            } else {
                map[mo.officeId] = [mo];
            }
        });

        return map;
    }, [medOrders, isError, isLoading]);

    if (isLoading) return <LinearProgress />;
    else if (!isError && medOrders && medOrders.length === 0) {
        return <div>There are no open Shipping Requests right now</div>;
    }

    return Object.keys(medOrdersByOfficeMap).map((k, i) => {
        const officeName = medOrdersByOfficeMap[k][0].officeName;

        return (
            <OfficeRequestedShipment
                officeName={officeName}
                medOrders={medOrdersByOfficeMap[k]}
                key={`office_request_${i}`}
            />
        );
    });
}
