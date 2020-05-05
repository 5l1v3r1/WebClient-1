import CONFIG from '../../config';

/* @ngInject */
function asideSidebar() {
    return {
        replace: true,
        restrict: 'E',
        templateUrl: require('../../../templates/layout/asideSidebar.tpl.html'),
        scope: {},
        link(scope) {
            scope.hasDrive = CONFIG.featureFlags.includes('drive');
        }
    };
}

export default asideSidebar;
