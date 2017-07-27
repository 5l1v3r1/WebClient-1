angular.module('proton.dashboard')
    .factory('downgrade', ($rootScope, confirmModal, eventManager, gettextCatalog, networkActivityTracker, notify, Payment) => {
        const I18N = {
            downgradeTitle: gettextCatalog.getString('Confirm downgrade', null, 'Title'),
            downgradeMessage: gettextCatalog.getString('This will downgrade your account to a free account. ProtonMail is free software that is supported by donations and paid accounts. Please consider making a donation so we can continue to offer the service for free.<br /><br />Note: Additional addresses, custom domains, and members must be removed/disabled before performing this action.', null, 'Info'),
            successMessage: gettextCatalog.getString('You have successfully unsubscribed', null)
        };

        function unsubscribe() {
            return Payment.delete()
                .then(({ data = {} } = {}) => {
                    if (data.Code === 1000) {
                        return eventManager.call();
                    }
                    throw new Error(data.Error);
                });
        }

        return () => {
            confirmModal.activate({
                params: {
                    title: I18N.downgradeTitle,
                    message: I18N.downgradeMessage,
                    confirm() {
                        const promise = unsubscribe()
                            .then(() => {
                                confirmModal.deactivate();
                                notify({ message: I18N.successMessage, classes: 'notification-success' });
                            });

                        networkActivityTracker.track(promise);
                    },
                    cancel() {
                        confirmModal.deactivate();
                    }
                }
            });
        };
    });
