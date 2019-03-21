/// <reference path="../node_modules/grafana-sdk-mocks/app/headers/common.d.ts" />
import { QueryCtrl } from 'app/plugins/sdk';
export declare class SolrQueryCtrl extends QueryCtrl {
    private templateSrv;
    static templateUrl: string;
    collection_types: string[];
    fields: any[];
    collections: any[];
    defaults: {};
    /** @ngInject **/
    constructor($scope: any, $injector: any, templateSrv: any);
    onCollectionTypeChange(): void;
    onCollectionSelect(): void;
    getOptions(query: any): any;
    listCollection(): void;
    listFields(): any;
    onChangeInternal(): void;
}
