import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import styled from '@emotion/styled';
import moment from 'moment';
import {
    useCreateMessage,
    useMarkMessagesAsReviewed,
    useReadChatsForPatient,
} from '../../api/rpmApi';
import {IconButton, InputAdornment, LinearProgress} from '@mui/material';
import {useUserContext} from '../../UserContext';
import {Roles} from '../../constants/ActorContstants';
import {useReadPatient} from '../../api/patientApi';
import {StyledTextField} from '../shared/StyledElements';
import SendIcon from '@mui/icons-material/Send';
import {useQueryClient} from '@tanstack/react-query';
import {useSnackbar} from 'notistack';
import 'moment-timezone';

const StyledContainer = styled.div`
    background-color: #fff;
    border: 1px solid #e5e5ea;
    border-radius: 0.25rem;
    display: flex;
    flex-direction: column;
    padding: 20px 20px;
    font-family: 'SanFrancisco';
    justify-content: space-between;
    height: 80vh;
    overflow-y: scroll;
`;
const StyledMessage = styled.p`
    border-radius: 1.15rem;
    line-height: 1.25;
    max-width: 75%;
    padding: 0.5rem 0.875rem;
    position: relative;
    word-wrap: break-word;
    margin: 5px 0;
    width: fit-content;

    &.fromMe {
        align-self: flex-end;
        background-color: #248bf5;
        color: #fff;
    }

    &.fromThem {
        align-self: flex-start;
        background-color: #e5e5ea;
        color: #000;
    }

    &.unread {
        font-weight: bolder;
    }
`;
const StyledMessageDateTime = styled.p`
    font-size: 0.75 rem;
    color: rgba(0, 0, 0, 0.54);
    margin: 0;

    &.fromMe {
        align-self: flex-end;
    }

    &.fromThem {
        align-self: flex-start;
    }
`;
const StyledMessagesContainer = styled.div`
    display: flex;
    flex-direction: column;
`;
const StyledActionsContainer = styled.div``;
const StyledMessageAndDate = styled.div`
    display: flex;
    flex-direction: column;
`;

export default function Chat({patientId}) {
    const {actor} = useUserContext();
    const queryClient = useQueryClient();
    const {enqueueSnackbar} = useSnackbar();
    const messageItems = useRef();
    const [chatText, setChatText] = useState('');
    const {data: messages, isLoading: isMessagesLoading} = useReadChatsForPatient(patientId);
    const {data: patient, isLoading: isPatientLoading} = useReadPatient(patientId);

    const submissionOptions = {
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({queryKey: ['rpm']}).then(() => {
                enqueueSnackbar(`Your message has been successfully sent.`, {
                    variant: 'success',
                });
                setChatText('');
            });
        },
        onError: ({data}, variables) => {
            enqueueSnackbar(
                `There was an error sending your message${data?.message && ': ' + data.message}`,
                {
                    variant: 'error',
                }
            );
        },
    };
    const {mutate: submitMessage} = useCreateMessage(submissionOptions);

    const calcWhoMessageIsFrom = useCallback(
        (sentByType) => {
            if (actor.role === Roles.PATIENT.moniker) {
                if (sentByType === 'PATIENT') return 'fromMe';
                return 'fromThem';
            } else {
                if (sentByType === 'OFFICE') return 'fromMe';
                return 'fromThem';
            }
        },
        [actor]
    );

    const markAsReviewedSubmissionOptions = {
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({queryKey: ['messages']}).then(() => {});
        },
        onError: ({data}, variables) => {
            enqueueSnackbar(
                `There was an error marking the chat messages as reviewed${
                    data?.message && ': ' + data.message
                }`,
                {
                    variant: 'error',
                }
            );
        },
    };
    const {mutate: markAsReviewed} = useMarkMessagesAsReviewed(markAsReviewedSubmissionOptions);

    const nonReviewedIds = useMemo(() => {
        if (!messages) return [];
        return messages
            ?.filter((m) => {
                const whoseMessage = calcWhoMessageIsFrom(m.sentByType);
                return m.reviewedDateTime === null && whoseMessage === 'fromThem';
            })
            .map((r) => r.id);
    }, [messages, calcWhoMessageIsFrom]);

    useEffect(() => {
        setTimeout(() => {
            if (nonReviewedIds?.length) {
                markAsReviewed({body: {patientId, rpmMessageIds: nonReviewedIds}});
            }
        }, 5000);
    }, [patientId, nonReviewedIds, markAsReviewed]);

    useEffect(() => {
        setTimeout(() => {
            if (patientId && messages && messageItems?.current) {
                const lastItem = messageItems?.current?.lastElementChild;
                lastItem.scrollIntoView({behavior: 'smooth', block: 'nearest'});
            }
        }, 100);
    }, [messages, patientId]);

    const handleSendMessage = useCallback(() => {
        submitMessage({
            body: {patientId, message: chatText},
        });
    }, [chatText, patientId, submitMessage]);

    const calcClassName = useCallback(
        (sentByType, reviewed) => {
            const whoMessageIsFrom = calcWhoMessageIsFrom(sentByType);
            let className = whoMessageIsFrom;
            if (!reviewed && whoMessageIsFrom === 'fromThem') {
                className = className + ' unread';
            }
            return className;
        },
        [calcWhoMessageIsFrom]
    );

    if (isMessagesLoading || isPatientLoading) return <LinearProgress />;
    return (
        <StyledContainer ref={messageItems}>
            <StyledMessagesContainer>
                {messages?.length === 0 && (
                    <StyledMessageDateTime>{`Start Chatting with ${
                        actor.role === Roles.PATIENT.moniker
                            ? 'Provider'
                            : patient.lastName + ', ' + patient.firstName
                    }`}</StyledMessageDateTime>
                )}
                {messages?.length > 0 &&
                    messages.map((m, i) => (
                        <StyledMessageAndDate key={`rpm_message_${i}`}>
                            <StyledMessage className={calcClassName(m.sentByType, m.reviewed)}>
                                {m.message}
                            </StyledMessage>
                            <StyledMessageDateTime
                                className={calcClassName(m.sentByType, m.reviewed)}
                            >
                                {moment
                                    .utc(m.createdDateTime)
                                    .tz(actor.timezone)
                                    .format('MM/DD/YYYY HH:mm')}
                            </StyledMessageDateTime>
                        </StyledMessageAndDate>
                    ))}
            </StyledMessagesContainer>
            <StyledActionsContainer>
                <StyledTextField
                    name="chatText"
                    value={chatText}
                    onChange={(event) => setChatText(event.target.value)}
                    label={`Send Message`}
                    fullWidth
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton
                                    aria-label="send message"
                                    onClick={handleSendMessage}
                                    edge="end"
                                    disabled={chatText.trim() === ''}
                                >
                                    <SendIcon />
                                </IconButton>
                            </InputAdornment>
                        ),
                    }}
                />
            </StyledActionsContainer>
        </StyledContainer>
    );
}
