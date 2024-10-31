import React from 'react';
import styled from '@emotion/styled';

const StyledIndented = styled.div`
    margin-left: 10px;
`;

export default function DispenseTerms() {
    return (
        <>
            <div>The undersigned certifies that</div>
            <StyledIndented>
                (a) the person for whom the prescription was written is eligible for benefits;
            </StyledIndented>
            <StyledIndented>(b) they have received the Prescription listed;</StyledIndented>
            <StyledIndented>
                (c) they authorized release of all information contained on this log, the
                prescription to which it corresponds and subsequent claim to parties concerned;
            </StyledIndented>
            <StyledIndented>
                (d) they are the patient for whom this prescription is being obtained or are
                authorized to execute this on behalf of such person; and
            </StyledIndented>
            <StyledIndented>
                (e) they received or declined medication information on the prescription(s)
                dispensed.
            </StyledIndented>
            <StyledIndented>
                (f) they recognize that by accepting this medication by paying out of pocket for the
                full cost that they will not receive any benefits that may be paid under their
                insurance (this includes Medicare part D, Tricare, State Medicaid(s), MCO’s,
                Medicare Advantage Plans or commercial payers).
            </StyledIndented>
            <StyledIndented>
                I understand that I have the option of filling my medications at the pharmacy of my
                choice; and I have determined that another pharmacy is not conveniently available.
            </StyledIndented>
        </>
    );
}
