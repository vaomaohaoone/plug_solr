///<reference path ="../node_modules/grafana-sdk-mocks/app/headers/common.d.ts" />
System.register([], function(exports_1) {
    var SolrDatasource;
    return {
        setters:[],
        execute: function() {
            /** @ngInject */
            SolrDatasource = (function () {
                function SolrDatasource(instanceSettings, backendSrv, templateSrv, $q) {
                    this.backendSrv = backendSrv;
                    this.templateSrv = templateSrv;
                    this.$q = $q;
                    this.usedCollections = new Set();
                    this.name = instanceSettings.name;
                    this.id = instanceSettings.id;
                    this.url = instanceSettings.url;
                    this.basicAuth = instanceSettings.basicAuth;
                    this.withCredentials = instanceSettings.withCredentials;
                }
                // Query for metric targets within the specified time range.
                // Returns the promise of a result dictionary.
                SolrDatasource.prototype.query = function (options) {
                    var _this = this;
                    var results = options.targets
                        .filter(function (target) { return target.query && target.collection; })
                        .map(function (target) {
                        var collection = target.collection;
                        if (!_this.usedCollections.has(collection))
                            _this.usedCollections.add(collection);
                        var query = target.query;
                        var timeFrom = options.range.from;
                        var timeTo = options.range.to;
                        timeFrom.local();
                        timeTo.local();
                        query = _this.templateSrv.replace(query, options.scopedVars);
                        var adhocFilters = _this.templateSrv.getAdhocFilters(_this.name);
                        if (adhocFilters && adhocFilters.length > 0) {
                            var filters = adhocFilters
                                .map(function (filter) {
                                var splitted_key = filter.key.split(/([\w-_]+) : (.*)/);
                                return splitted_key[2] + ":" + filter.value;
                            }).join(" AND ");
                            query = query + " AND " + filters;
                        }
                        var post_data = {
                            fq: target.time + ':[' + timeFrom.format("YYYY-MM-DDTHH:mm:ss.SSS") + 'Z TO ' + timeTo.format("YYYY-MM-DDTHH:mm:ss.SSS") + 'Z]',
                            q: query,
                            fl: '*',
                            rows: target.maxRows || 1000,
                            sort: target.time + ' desc'
                        };
                        return _this.doGet(collection + "/select?wt=json", post_data);
                    });
                    return new Promise(function (resolve, reject) {
                        Promise.all(results).then(function (result) {
                            var docs = result.flatMap(function (target_result) {
                                return target_result.data.response.docs;
                            });
                            resolve({ data: _this.docsToTableFormat(docs) });
                        }, function (errors) {
                            reject(errors);
                        });
                    });
                };
                SolrDatasource.prototype.docsToTableFormat = function (docs) {
                    var keysIndex = {};
                    var columnCount = 0;
                    var rows = [];
                    docs.map(function (doc) {
                        var row = [];
                        Object.keys(doc).forEach(function (key) {
                            var value = doc[key];
                            if (!(typeof value === 'string' || typeof value === 'number'))
                                return;
                            var keyPos = keysIndex[key];
                            if (keyPos === undefined) {
                                keyPos = columnCount++;
                                keysIndex[key] = keyPos;
                            }
                            row[keyPos] = value;
                        });
                        return row;
                    })
                        .forEach(function (row) {
                        for (var i = 0; i < columnCount; i++) {
                            if (!row[i])
                                row[i] = null;
                        }
                        rows.push(row);
                    });
                    var columns = [];
                    Object.keys(keysIndex).forEach(function (key, index) {
                        columns.push({ text: key });
                    });
                    return [{
                            columns: columns,
                            rows: rows,
                            type: "table"
                        }];
                };
                SolrDatasource.prototype.metricFindQuery = function (query) {
                    //q=*:*&facet=true&facet.field=CR&facet.field=product_type&facet.field=provincia&wt=json&rows=0
                    if (!this.collection) {
                        return [];
                    }
                    var path = this.collection + '/select?q=*:*&facet=true&facet.field=' + query + '&wt=json&rows=0';
                    return this.doGet(path).then(this.mapToTextValue);
                };
                SolrDatasource.prototype.mapToTextValue = function (result) {
                    if (result.data.facet_counts) {
                        var ar = [];
                        for (var key in result.data.facet_counts.facet_fields) {
                            if (result.data.facet_counts.facet_fields.hasOwnProperty(key)) {
                                var array = result.data.facet_counts.facet_fields[key];
                                for (var i = 0; i < array.length; i += 2) {
                                    ar.push({
                                        text: array[i],
                                        expandable: false
                                    });
                                }
                            }
                        }
                        return ar;
                    }
                };
                // Test the connection to Solr by querying collection response.
                SolrDatasource.prototype.testDatasource = function () {
                    return this.doGet("").then(function (success) {
                        return { status: 'success', message: 'Data source is working' };
                    }, function (error) {
                        return { status: 'error', message: error };
                    });
                };
                SolrDatasource.prototype.listCollections = function () {
                    return this.doGet('/admin/collections?action=LIST&wt=json').then(function (result) {
                        return result.data.collections.map(function (collection) {
                            return {
                                text: collection,
                                value: collection
                            };
                        });
                    });
                };
                SolrDatasource.prototype.listAliases = function () {
                    return this.doGet('/admin/collections?action=LISTALIASES&wt=json').then(function (result) {
                        return Object.keys(result.data.aliases).map(function (key) {
                            return {
                                text: key,
                                value: key
                            };
                        });
                    });
                };
                SolrDatasource.prototype.listFields = function (collection) {
                    return this.doGet(collection + '/select?q=*:*&wt=csv&rows=1').then(function (result) {
                        return result.data.split('\n')[0].split(',').map(function (field) {
                            return {
                                text: field,
                                value: field
                            };
                        });
                    });
                };
                SolrDatasource.prototype.doGet = function (path, data) {
                    if (data === void 0) { data = null; }
                    return this.backendSrv.datasourceRequest({
                        url: this.url + "/" + path,
                        method: 'GET',
                        params: data
                    });
                };
                SolrDatasource.prototype.doRequest = function (path, method) {
                    return this.backendSrv.datasourceRequest({
                        url: this.url + "/" + path,
                        method: method
                    });
                };
                return SolrDatasource;
            })();
            exports_1("SolrDatasource", SolrDatasource);
        }
    }
});
//# sourceMappingURL=datasource.js.map