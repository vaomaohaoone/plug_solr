/// <reference path="../node_modules/grafana-sdk-mocks/app/headers/common.d.ts" />
/** @ngInject */
export declare class SolrDatasource {
    private backendSrv;
    private templateSrv;
    private $q;
    id: number;
    name: string;
    url: string;
    collection: string;
    basicAuth: any;
    withCredentials: any;
    usedCollections: Set<{}>;
    constructor(instanceSettings: any, backendSrv: any, templateSrv: any, $q: any);
    query(options: any): Promise<{}>;
    docsToTableFormat(docs: any): {
        columns: any[];
        rows: any[];
        type: string;
    }[];
    metricFindQuery(query: any): any;
    mapToTextValue(result: any): any[];
    testDatasource(): any;
    listCollections(): any;
    listAliases(): any;
    listFields(collection: any): any;
    doGet(path: any, data?: any): any;
    doRequest(path: any, method: any): any;
}
