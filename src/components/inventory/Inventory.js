import React, {useState} from 'react';
import {
    StyledButton,
    StyledContainer,
    StyledTableActionsContainer,
    StyledTextField,
} from '../shared/StyledElements';
import InventoryTable from './InventoryTable';
import InventoryDialog from './InventoryDialog';
import MedicationOrder from '../medicationorder/MedicationOrder';

export default function Inventory() {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [showShipmentTable, setShowShipmentTable] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [selectedMedication, setSelectedMedication] = useState({});
    const [shipmentMedicationIds, setShipmentMedicationIds] = useState([]);

    return (
        <StyledContainer>
            {!showShipmentTable && (
                <StyledTableActionsContainer>
                    <StyledTextField
                        name="searchText"
                        value={searchText}
                        onChange={(event) => setSearchText(event.target.value)}
                        label={`Search Inventory`}
                        type="search"
                    />
                    <StyledButton
                        variant={'contained'}
                        onClick={() => setShowShipmentTable(true)}
                        disabled={!shipmentMedicationIds || shipmentMedicationIds.length === 0}
                    >
                        Request Shipment
                    </StyledButton>
                </StyledTableActionsContainer>
            )}
            {!showShipmentTable && (
                <InventoryTable
                    searchValue={searchText}
                    setSelectedMedication={setSelectedMedication}
                    setDialogOpen={setDialogOpen}
                    shipmentMedicationIds={shipmentMedicationIds}
                    setShipmentMedicationIds={setShipmentMedicationIds}
                />
            )}
            {!showShipmentTable && (
                <InventoryDialog
                    dialogOpen={dialogOpen}
                    setDialogOpen={setDialogOpen}
                    medication={selectedMedication}
                    setSelectedMedication={setSelectedMedication}
                />
            )}
            {showShipmentTable && (
                <MedicationOrder
                    setShipmentMedicationIds={setShipmentMedicationIds}
                    shipmentMedicationIds={shipmentMedicationIds}
                    setShow={setShowShipmentTable}
                />
            )}
        </StyledContainer>
    );
}
