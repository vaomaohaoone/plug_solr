///<reference path ="../node_modules/grafana-sdk-mocks/app/headers/common.d.ts" />
System.register([], function(exports_1) {
    var SolrConfigCtrl;
    return {
        setters:[],
        execute: function() {
            SolrConfigCtrl = (function () {
                function SolrConfigCtrl($scope) {
                }
                SolrConfigCtrl.templateUrl = 'partials/config.html';
                return SolrConfigCtrl;
            })();
            exports_1("SolrConfigCtrl", SolrConfigCtrl);
        }
    }
});
//# sourceMappingURL=config_ctrl.js.map