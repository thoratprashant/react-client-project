import GroupIcon from '@mui/icons-material/Group';
import BusinessIcon from '@mui/icons-material/Business';
import InventoryIcon from '@mui/icons-material/Inventory';
import EqualizerIcon from '@mui/icons-material/Equalizer';
import HomeIcon from '@mui/icons-material/Home';
import React from 'react';
import Home from '../components/Home';
import Users from '../components/users/Users';
import Office from '../components/office/Office';
import Medication from '../components/medication/Medication';
import InventoryLevels from '../components/inventory/Inventory';
import MedicationIcon from '@mui/icons-material/Medication';
import ContactEmergencyIcon from '@mui/icons-material/ContactEmergency';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import PostAddIcon from '@mui/icons-material/PostAdd';
import {Roles} from './ActorContstants';
import Patients from '../components/patient/Patients';
// import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
// import BloodPressure from '../components/rpm/bloodPressure/BloodPressure';
import ScaleIcon from '@mui/icons-material/Scale';
import Patient from '../components/patient/Patient';
import Shipments from '../components/shipment/Shipments';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import VaccinesIcon from '@mui/icons-material/Vaccines';
import EPrescribe from '../components/eprescribe/EPrescribe';
import Dispense from '../components/dispense/Dispense';
import PrescriptionCreate from '../components/eprescribe/PrescriptionCreate';
import PatientSearch from '../components/eprescribe/PatientSearch';
import Prescription from '../components/eprescribe/Prescription';
import DispensePrescription from '../components/dispense/DispensePrescription';
import DispenseAllSet from '../components/dispense/DispenseAllSet';
import MonitorWeightIcon from '@mui/icons-material/MonitorWeight';
import Monitoring from '../components/rpm/Monitoring';
import PatientRenewalRequest from '../components/prescriptionrenewal/patient/PatientRenewalRequest';
import PhysicianRenewalRequest from '../components/prescriptionrenewal/physician/PhysicianRenewalRequest';
import RpmDeviceInventory from '../components/rpmdevice/RpmDeviceInventory';

export const HOME_NAV_ITEM = {description: 'Home', icon: <HomeIcon />, url: '/', element: <Home />};

export const E_RX_NAV_ITEMS = [
    {
        description: 'E-Prescribe',
        icon: <NoteAddIcon />,
        url: '/erx',
        element: <EPrescribe />,
        requiresOneOfRole: [Roles.ADMINISTRATOR.moniker, Roles.PHYSICIAN.moniker],
    },
    {
        description: 'Patient Search',
        url: '/erx/patient/search',
        element: <PatientSearch />,
        excludeFromLeftNav: true,
        requiresOneOfRole: [Roles.ADMINISTRATOR.moniker, Roles.PHYSICIAN.moniker],
    },
    {
        description: 'Prescription Create Page',
        url: '/erx/new',
        element: <PrescriptionCreate />,
        excludeFromLeftNav: true,
        requiresOneOfRole: [Roles.ADMINISTRATOR.moniker, Roles.PHYSICIAN.moniker],
    },
    {
        description: 'Prescription Create Page',
        url: '/erx/:prescriptionId',
        element: <Prescription />,
        excludeFromLeftNav: true,
        requiresOneOfRole: [Roles.ADMINISTRATOR.moniker, Roles.PHYSICIAN.moniker],
    },
    {
        description: 'Dispense',
        icon: <VaccinesIcon />,
        url: '/dispense',
        element: <Dispense />,
        requiresOneOfRole: [
            Roles.ADMINISTRATOR.moniker,
            Roles.PHYSICIAN.moniker,
            Roles.OFFICE_ADMINISTRATOR.moniker,
        ],
    },
    {
        description: 'Prescription Renewal',
        icon: <PostAddIcon />,
        url: '/erx/renewalRequest',
        element: <PatientRenewalRequest />,
        requiresOneOfRole: [Roles.PATIENT.moniker],
    },
    {
        description: 'Rx Renewal Requests',
        icon: <PostAddIcon />,
        showCount: 'physicianRenewalRequestCount',
        url: '/erx/renewalRequests',
        element: <PhysicianRenewalRequest />,
        requiresOneOfRole: [
            Roles.PHYSICIAN.moniker,
            Roles.OFFICE_ADMINISTRATOR.moniker,
            Roles.ADMINISTRATOR.moniker,
        ],
    },
    {
        description: 'Dispense Prescription Page',
        url: '/dispense/:prescriptionId',
        element: <DispensePrescription />,
        excludeFromLeftNav: true,
        requiresOneOfRole: [
            Roles.ADMINISTRATOR.moniker,
            Roles.PHYSICIAN.moniker,
            Roles.OFFICE_ADMINISTRATOR.moniker,
        ],
    },
    {
        description: 'Dispense Landing Page',
        url: '/dispense/allSet',
        element: <DispenseAllSet />,
        excludeFromLeftNav: true,
        requiresOneOfRole: [
            Roles.ADMINISTRATOR.moniker,
            Roles.PHYSICIAN.moniker,
            Roles.OFFICE_ADMINISTRATOR.moniker,
        ],
    },
];

export const ADMIN_NAV_ITEMS = [
    {
        description: 'Admin Users',
        icon: <GroupIcon />,
        url: '/users',
        element: <Users isPhysician={false} />,
        requiresOneOfRole: [Roles.ADMINISTRATOR.moniker, Roles.OFFICE_ADMINISTRATOR.moniker],
    },
    {
        description: 'Physicians',
        icon: <MedicationIcon />,
        url: '/physicians',
        element: <Users isPhysician={true} />,
        requiresOneOfRole: [
            Roles.ADMINISTRATOR.moniker,
            Roles.OFFICE_ADMINISTRATOR.moniker,
            Roles.PHYSICIAN.moniker,
        ],
    },
    {
        description: 'Physician Offices',
        icon: <BusinessIcon />,
        url: '/offices',
        element: <Office />,
        requiresOneOfRole: [Roles.ADMINISTRATOR.moniker, Roles.OFFICE_ADMINISTRATOR.moniker],
    },
    {
        description: 'Medications',
        icon: <InventoryIcon />,
        url: '/medications',
        element: <Medication />,
        requiresOneOfRole: [
            Roles.ADMINISTRATOR.moniker,
            Roles.OFFICE_ADMINISTRATOR.moniker,
            Roles.PHYSICIAN.moniker,
        ],
    },
    {
        description: 'Inventory Levels',
        icon: <EqualizerIcon />,
        url: '/inventory/levels',
        element: <InventoryLevels />,
        requiresOneOfRole: [
            Roles.ADMINISTRATOR.moniker,
            Roles.OFFICE_ADMINISTRATOR.moniker,
            Roles.PHYSICIAN.moniker,
        ],
    },
    {
        description: 'Shipments',
        icon: <LocalShippingIcon />,
        url: '/shipments',
        element: <Shipments />,
        requiresOneOfRole: [
            Roles.ADMINISTRATOR.moniker,
            Roles.OFFICE_ADMINISTRATOR.moniker,
            Roles.PHYSICIAN.moniker,
            Roles.WHOLESALER.moniker,
        ],
    },
    {
        description: 'RPM Device Inventory',
        icon: <ScaleIcon />,
        url: '/rpmDevices',
        element: <RpmDeviceInventory />,
        requiresOneOfRole: [
            Roles.ADMINISTRATOR.moniker,
            Roles.OFFICE_ADMINISTRATOR.moniker,
            Roles.PHYSICIAN.moniker,
        ],
    },
    {
        description: 'Patients',
        icon: <ContactEmergencyIcon />,
        url: '/patients',
        element: <Patients />,
        requiresOneOfRole: [
            Roles.ADMINISTRATOR.moniker,
            Roles.OFFICE_ADMINISTRATOR.moniker,
            Roles.PHYSICIAN.moniker,
        ],
    },
    {
        description: 'Patient Page',
        url: '/patients/:patientId',
        element: <Patient />,
        excludeFromLeftNav: true,
        requiresOneOfRole: [
            Roles.ADMINISTRATOR.moniker,
            Roles.OFFICE_ADMINISTRATOR.moniker,
            Roles.PHYSICIAN.moniker,
        ],
    },
];

export const RPM_NAV_ITEMS = [
    {
        description: 'Monitor Patients',
        icon: <MonitorWeightIcon />,
        url: '/patients/monitor',
        element: <Monitoring isPatientViewing={false} />,
        requiresOneOfRole: [
            Roles.ADMINISTRATOR.moniker,
            Roles.PHYSICIAN.moniker,
            Roles.OFFICE_ADMINISTRATOR.moniker,
        ],
    },
    {
        description: 'Monitoring',
        icon: <MonitorWeightIcon />,
        url: '/monitor',
        element: <Monitoring isPatientViewing />,
        requiresOneOfRole: [Roles.PATIENT.moniker],
    },
];

export const ALL_NAV_ITEMS = [
    HOME_NAV_ITEM,
    ...E_RX_NAV_ITEMS,
    ...ADMIN_NAV_ITEMS,
    ...RPM_NAV_ITEMS,
];
