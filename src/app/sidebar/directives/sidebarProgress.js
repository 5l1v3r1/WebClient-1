/* @ngInject */
function sidebarProgress(authentication, $filter) {
    const filter = $filter('humanSize');
    const percentage = $filter('percentage');
    const percentageValue = () => percentage(authentication.user.UsedSpace, authentication.user.MaxSpace);
    const colorModifierClass = (percentValue) => {
        if (percentValue < 60) {
            return 'circle-bar--low';
        }
        if (percentValue < 80) {
            return 'circle-bar--medium';
        }
        if (percentValue >= 80) {
            return 'circle-bar--full';
        }
    };

    return {
        templateUrl: require('../../../templates/directives/core/sidebarProgress.tpl.html'),
        replace: true,
        link(scope, el) {
            scope.percentageValue = percentageValue;
            el.addClass(colorModifierClass(percentageValue()));
            scope.storageValue = (isMax) => {
                if (isMax) {
                    return filter(authentication.user.MaxSpace);
                }

                return filter(authentication.user.UsedSpace);
            };
        }
    };
}
export default sidebarProgress;
