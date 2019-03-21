///<reference path ="../node_modules/grafana-sdk-mocks/app/headers/common.d.ts" />
System.register(['lodash', 'app/plugins/sdk', './css/query_editor.css!'], function(exports_1) {
    var __extends = (this && this.__extends) || function (d, b) {
        for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
    var lodash_1, sdk_1;
    var SolrQueryCtrl;
    return {
        setters:[
            function (lodash_1_1) {
                lodash_1 = lodash_1_1;
            },
            function (sdk_1_1) {
                sdk_1 = sdk_1_1;
            },
            function (_1) {}],
        execute: function() {
            SolrQueryCtrl = (function (_super) {
                __extends(SolrQueryCtrl, _super);
                /** @ngInject **/
                function SolrQueryCtrl($scope, $injector, templateSrv) {
                    _super.call(this, $scope, $injector);
                    this.templateSrv = templateSrv;
                    this.collection_types = ["collection", "alias"];
                    this.fields = [];
                    this.collections = [];
                    this.defaults = {};
                    lodash_1.default.defaultsDeep(this.target, this.defaults);
                    if (this.panelCtrl.panel.type === 'table') {
                        this.target.query = this.target.query || '*:*';
                        this.target.collection = this.target.collection || '';
                        this.target.time = this.target.time || '';
                        this.target.format = this.target.format || '';
                        this.target.collection_type = this.target.collection_type || this.collection_types[1];
                    }
                    else {
                        this.target.query = this.target.query || '*:*';
                        this.target.collection = this.target.collection || '';
                        this.target.time = this.target.time || '';
                        this.target.format = this.target.format || '';
                        this.target.collection_type = this.target.collection_type || this.collection_types[1];
                    }
                    this.onCollectionTypeChange();
                }
                SolrQueryCtrl.prototype.onCollectionTypeChange = function () {
                    if (this.target.collection_type === this.collection_types[0])
                        this.collections = this.datasource.listCollections();
                    else
                        this.collections = this.datasource.listAliases();
                    this.onChangeInternal();
                };
                SolrQueryCtrl.prototype.onCollectionSelect = function () {
                    var _this = this;
                    this.datasource.listFields(this.target.collection).then(function (result) {
                        _this.fields = result;
                    });
                    this.onChangeInternal();
                };
                SolrQueryCtrl.prototype.getOptions = function (query) {
                    return this.datasource.listCollections(query || '');
                };
                SolrQueryCtrl.prototype.listCollection = function () {
                };
                SolrQueryCtrl.prototype.listFields = function () {
                    return this.datasource.listFields(this.target.collection);
                };
                SolrQueryCtrl.prototype.onChangeInternal = function () {
                    this.panelCtrl.refresh(); // Asks the panel to refresh data.
                };
                SolrQueryCtrl.templateUrl = 'partials/query.editor.html';
                return SolrQueryCtrl;
            })(sdk_1.QueryCtrl);
            exports_1("SolrQueryCtrl", SolrQueryCtrl);
        }
    }
});
//# sourceMappingURL=query_ctrl.js.map