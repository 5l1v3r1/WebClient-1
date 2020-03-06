import { load, save } from 'proton-shared/lib/helpers/secureSessionStorage';
import createStore from 'proton-shared/lib/helpers/store';
import { MAILBOX_PASSWORD_KEY, UID_KEY } from 'proton-shared/lib/constants';

import { EO_DECRYPTED_TOKEN_KEY, EO_PASSWORD_KEY } from '../../constants';

const SECURE_SESSION_STORAGE_KEYS = [MAILBOX_PASSWORD_KEY, UID_KEY, EO_DECRYPTED_TOKEN_KEY, EO_PASSWORD_KEY];

/* @ngInject */
function secureSessionStorage() {
    const store = createStore(load(SECURE_SESSION_STORAGE_KEYS));

    if ('onpagehide' in window) {
        const handlePageShow = () => {
            // This does not need to do anything. The main purpose is just to reset window.name and sessionStorage to fix the Safari bug described below
            load(SECURE_SESSION_STORAGE_KEYS);
        };

        const handlePageHide = () => {
            // Cannot use !event.persisted because Safari 13.1 does not send that when you are navigating on the same domain
            save(SECURE_SESSION_STORAGE_KEYS, store.getState());
        };

        window.addEventListener('pageshow', handlePageShow, true);
        window.addEventListener('pagehide', handlePageHide, true);
    } else {
        const handleUnload = () => {
            save(SECURE_SESSION_STORAGE_KEYS, store.getState());
        };

        window.addEventListener('unload', handleUnload, true);
    }

    return store;
}

export default secureSessionStorage;
