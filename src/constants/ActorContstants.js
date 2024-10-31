export const ExternalSource = {
    COGNITO: 'COGNITO',
};

export const Roles = {
    ADMINISTRATOR: {description: 'Administrator', moniker: 'ADMINISTRATOR'},
    PHYSICIAN: {description: 'Physician', moniker: 'PHYSICIAN'},
    OFFICE_ADMINISTRATOR: {description: 'Office Administrator', moniker: 'OFFICE_ADMINISTRATOR'},
    WHOLESALER: {description: 'Wholesaler', moniker: 'WHOLESALER'},
    PATIENT: {description: 'Patient', moniker: 'PATIENT'}
};

export const AdminRoleOptionsByRole = {
    [Roles.ADMINISTRATOR.moniker]: [
        Roles.ADMINISTRATOR,
        Roles.OFFICE_ADMINISTRATOR,
        Roles.WHOLESALER,
    ],
    [Roles.OFFICE_ADMINISTRATOR.moniker]: [Roles.OFFICE_ADMINISTRATOR],
};

export const PhysicianRoleOptionsByRole = {
    [Roles.ADMINISTRATOR.moniker]: [Roles.PHYSICIAN],
    [Roles.OFFICE_ADMINISTRATOR.moniker]: [Roles.PHYSICIAN],
    [Roles.PHYSICIAN.moniker]: [Roles.PHYSICIAN],
};
