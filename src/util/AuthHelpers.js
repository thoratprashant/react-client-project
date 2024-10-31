import {Auth} from 'aws-amplify';

export const getJwt = async () => {
    return Auth.currentSession()
        .then((sess) => {
            const jwt = sess.getIdToken().getJwtToken();
            return jwt;
        })
        .catch(() => null);
};
