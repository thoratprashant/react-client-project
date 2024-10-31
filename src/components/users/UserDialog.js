import React, {useCallback, useMemo} from 'react';
import {
    Autocomplete,
    Checkbox,
    Dialog,
    DialogContent,
    FormControlLabel,
    FormGroup,
    LinearProgress,
    TextField,
} from '@mui/material';
import * as yup from 'yup';
import {useUserContext} from '../../UserContext';
import {useFormik} from 'formik';
import {
    AdminRoleOptionsByRole,
    PhysicianRoleOptionsByRole,
    Roles,
} from '../../constants/ActorContstants';
import MenuItem from '@mui/material/MenuItem';
import {useReadAllOffices} from '../../api/officeApi';
import {useQueryClient} from '@tanstack/react-query';
import {useSnackbar} from 'notistack';
import {useCreateUser, useEditUser} from '../../api/actorApi';
import {LocalizationProvider} from '@mui/x-date-pickers/LocalizationProvider';
import {DesktopDatePicker} from '@mui/x-date-pickers/DesktopDatePicker';
import {AdapterMoment} from '@mui/x-date-pickers/AdapterMoment';
import {
    StyledButton,
    StyledDialogActions,
    StyledDialogContainer,
    StyledDialogTitle,
} from '../shared/StyledElements';
import {useFindActivePhysicianFee} from '../../api/physicianApi';

export default function UserDialog({
    dialogOpen,
    setDialogOpen,
    user,
    isPhysician,
    setSelectedUser,
    initialValues,
}) {
    const {actor} = useUserContext();
    const {data: offices, isLoading: isOfficesLoading} = useReadAllOffices();
    const queryClient = useQueryClient();
    const {enqueueSnackbar} = useSnackbar();
    const isEdit = Boolean(user?.id);
    const {
        data: physicianFee,
        isLoading: isPhysicianFeeLoading,
        isError: isPhysicianFeeError,
    } = useFindActivePhysicianFee(Boolean(isPhysician && user?.id), user?.id);

    const userWithFee = useMemo(() => {
        if (!isPhysician) return user;
        const withFee = {...user};
        if (physicianFee && !isPhysicianFeeError && !isPhysicianFeeLoading) {
            withFee.physicianFee = physicianFee.fee;
            withFee.physicianFeeId = physicianFee.id;
        }
        return withFee;
    }, [isPhysician, isPhysicianFeeError, isPhysicianFeeLoading, user, physicianFee]);

    const submissionOptions = {
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({queryKey: ['actors']}).then(() => {
                enqueueSnackbar(`User has been successfully ${isEdit ? 'updated' : 'created'}.`, {
                    variant: 'success',
                });
                setDialogOpen(false);
            });
        },
        onError: ({data}, variables) => {
            enqueueSnackbar(
                `There was an error ${isEdit ? 'editing' : 'creating'} the user${
                    data?.message && ': ' + data.message
                }`,
                {
                    variant: 'error',
                }
            );
        },
    };

    const {mutate: submitUser} = useCreateUser(submissionOptions);
    const {mutate: editUser} = useEditUser(
        submissionOptions,
        isPhysician ? user?.actorId : user?.id
    );

    const validationSchema = yup.object({
        firstName: yup.string().required('Required'),
        lastName: yup.string().required('Required'),
        email: yup.string().email('Enter a valid email').required('Required'),
        officeIds: yup.array().of(yup.number()),
        npi: yup.lazy((value) => (isPhysician ? yup.string().required('Required') : yup.string())),
        dob: yup.lazy((value) => (isPhysician ? yup.date().required('Required') : yup.date())),
        physicianFee: yup.lazy((value) =>
            isPhysician
                ? yup
                      .number()
                      .min(0, 'A minimum physicianFee of $0 is required')
                      .required('Required')
                : yup.number()
        ),
        physicianFeeId: yup.number(),
    });

    const formik = useFormik({
        enableReinitialize: true,
        initialValues: user && user.id ? userWithFee : initialValues,
        validationSchema,
        onSubmit: (values) => {
            if (isEdit) {
                editUser({body: values});
            } else {
                submitUser({body: values});
            }
        },
    });

    const {values, resetForm, errors, touched, handleSubmit, handleChange, setFieldValue} = formik;

    const cancelForm = useCallback(() => {
        resetForm(initialValues);
        setDialogOpen(false);
        setSelectedUser(initialValues);
    }, [initialValues, setDialogOpen, resetForm, setSelectedUser]);

    const rolesList = useMemo(() => {
        return isPhysician
            ? PhysicianRoleOptionsByRole[actor.role]
            : AdminRoleOptionsByRole[actor.role];
    }, [actor.role, isPhysician]);

    const renderRoleMenuItems = useCallback(() => {
        return rolesList.map(({description, moniker}, i) => (
            <MenuItem key={`role-option-${i}`} value={moniker}>
                {description}
            </MenuItem>
        ));
    }, [rolesList]);

    const createOrEditUser = useMemo(() => {
        return `${isEdit ? 'Edit' : 'Create New'} ${isPhysician ? 'Physician' : 'User'}`;
    }, [isEdit, isPhysician]);

    const handleOfficeChange = useCallback(
        (e, selectedOptions, reason) => {
            if (reason === 'selectOption' || reason === 'removeOption') {
                setFieldValue(
                    'officeIds',
                    selectedOptions.map((option) =>
                        typeof option === 'number' ? option : option.id
                    )
                );
            } else if (reason === 'clear') {
                setFieldValue('officeIds', []);
            }
        },
        [setFieldValue]
    );

    const handleSingleOfficeChange = useCallback(
        (e) => {
            setFieldValue('officeIds', [e.target.value]);
        },
        [setFieldValue]
    );

    return (
        <Dialog open={dialogOpen} onClose={cancelForm} maxWidth="md" fullWidth>
            <StyledDialogContainer>
                <StyledDialogTitle>{createOrEditUser}</StyledDialogTitle>
                <DialogContent>
                    <form onSubmit={handleSubmit}>
                        <TextField
                            autoFocus
                            name="firstName"
                            id="firstName"
                            label="First Name"
                            fullWidth
                            required
                            margin={'normal'}
                            value={values.firstName}
                            onChange={handleChange}
                            error={touched.firstName && Boolean(errors.firstName)}
                            helperText={touched.firstName && errors.firstName}
                        />
                        <TextField
                            name="lastName"
                            id="lastName"
                            label="Last Name"
                            fullWidth
                            required
                            margin={'normal'}
                            value={values.lastName}
                            onChange={handleChange}
                            error={touched.lastName && Boolean(errors.lastName)}
                            helperText={touched.lastName && errors.lastName}
                        />
                        <TextField
                            type={'email'}
                            name="email"
                            id="email"
                            label="Email"
                            disabled={isEdit}
                            fullWidth
                            required
                            margin={'normal'}
                            value={values.email}
                            onChange={handleChange}
                            error={touched.email && Boolean(errors.email)}
                            helperText={touched.email && errors.email}
                        />
                        {isOfficesLoading && <LinearProgress />}
                        {!isOfficesLoading && !isPhysician && (
                            <TextField
                                fullWidth
                                label={'Primary Office'}
                                id="primary-office-select"
                                name={'officeIds'}
                                value={values.officeIds}
                                onChange={handleSingleOfficeChange}
                                error={errors.officeIds}
                                margin={'normal'}
                                helperText={touched.officeIds && errors.officeIds}
                                select
                                disabled={!offices || actor.role !== Roles.ADMINISTRATOR.moniker}
                                required={values.role === Roles.OFFICE_ADMINISTRATOR.moniker}
                            >
                                {offices?.map(({id, name}, i) => (
                                    <MenuItem key={`office-option-${i}`} value={id}>
                                        {name}
                                    </MenuItem>
                                ))}
                            </TextField>
                        )}
                        {!isOfficesLoading && offices && isPhysician && (
                            <Autocomplete
                                required
                                multiple
                                filterSelectedOptions
                                fullWidth
                                id="office-select"
                                name={'officeIds'}
                                value={values.officeIds}
                                onChange={handleOfficeChange}
                                isOptionEqualToValue={(option, value) => {
                                    return option.id === value;
                                }}
                                disabled={!offices || actor.role !== Roles.ADMINISTRATOR.moniker}
                                options={offices}
                                getOptionLabel={(option) => {
                                    if (typeof option === 'number') {
                                        return offices.find((item) => item.id === option)?.name;
                                    } else {
                                        return option.name;
                                    }
                                }}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label={'Offices'}
                                        placeholder={'Offices'}
                                        error={errors.officeIds}
                                        margin={'normal'}
                                        helperText={touched.officeIds && errors.officeIds}
                                    />
                                )}
                            />
                        )}
                        <TextField
                            fullWidth
                            id="role-select"
                            name={'role'}
                            label={'User Role'}
                            value={values.role}
                            onChange={handleChange}
                            disabled={!rolesList || rolesList.length < 1 || isEdit}
                            error={errors.role}
                            margin={'normal'}
                            helperText={touched.role && errors.role}
                            select
                            required
                        >
                            {renderRoleMenuItems()}
                        </TextField>
                        <FormGroup>
                            <FormControlLabel
                                label={'User Disabled'}
                                control={
                                    <Checkbox
                                        id="disabled-checkbox"
                                        name={'disabled'}
                                        checked={values.disabled}
                                        onChange={handleChange}
                                        defaultValue={false}
                                        disabled={!isEdit}
                                    />
                                }
                            />
                        </FormGroup>
                        {isPhysician && (
                            <TextField
                                name="npi"
                                id="npi"
                                label="National Provider Identifier"
                                fullWidth
                                required
                                margin={'normal'}
                                value={values.npi}
                                onChange={handleChange}
                                error={touched.npi && Boolean(errors.npi)}
                                helperText={touched.npi && errors.npi}
                            />
                        )}
                        {isPhysician && (
                            <LocalizationProvider dateAdapter={AdapterMoment}>
                                <DesktopDatePicker
                                    label="Date of Birth"
                                    inputFormat="MM/DD/YYYY"
                                    value={values.dob}
                                    onChange={(newVal) => {
                                        if (newVal === null) setFieldValue('dob', newVal);
                                        else {
                                            setFieldValue('dob', newVal.format('MM/DD/yyyy'));
                                        }
                                    }}
                                    error={touched.dob && Boolean(errors.dob)}
                                    helperText={touched.dob && errors.dob}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            margin={'normal'}
                                            required
                                            fullWidth
                                        />
                                    )}
                                />
                            </LocalizationProvider>
                        )}
                        {isPhysician && (
                            <TextField
                                name="physicianFee"
                                id="physicianFee"
                                label="Patients Fee"
                                fullWidth
                                required
                                margin={'normal'}
                                value={values.physicianFee}
                                onChange={handleChange}
                                error={touched.physicianFee && Boolean(errors.physicianFee)}
                                helperText={touched.physicianFee && errors.physicianFee}
                                disabled={actor.role !== Roles.ADMINISTRATOR.moniker}
                            />
                        )}
                        <StyledDialogActions>
                            <StyledButton variant={'contained'} onClick={cancelForm}>
                                Cancel
                            </StyledButton>
                            <StyledButton variant={'contained'} type="submit">
                                {createOrEditUser}
                            </StyledButton>
                        </StyledDialogActions>
                    </form>
                </DialogContent>
            </StyledDialogContainer>
        </Dialog>
    );
}
