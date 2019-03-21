///<reference path ="../node_modules/grafana-sdk-mocks/app/headers/common.d.ts" />


import _ from 'lodash';
import {
  QueryCtrl
} from 'app/plugins/sdk';
import './css/query_editor.css!';

export class SolrQueryCtrl extends QueryCtrl {
  static templateUrl = 'partials/query.editor.html';
  
    collection_types = ["collection","alias"]
    fields = []
    collections = []
    defaults = {};

  /** @ngInject **/
  constructor($scope, $injector, private templateSrv) {
    super($scope, $injector);
    _.defaultsDeep(this.target, this.defaults);
    if(this.panelCtrl.panel.type ==='table')
    {
      this.target.query = this.target.query || '*:*';
      this.target.collection = this.target.collection || '';
      this.target.time = this.target.time || '';
      this.target.format = this.target.format || '';
      this.target.collection_type = this.target.collection_type || this.collection_types[1];
    }
    else
    {
        this.target.query = this.target.query || '*:*';
        this.target.collection = this.target.collection || '';
        this.target.time = this.target.time || '';
        this.target.format = this.target.format || '';
        this.target.collection_type = this.target.collection_type || this.collection_types[1];
    }
	this.onCollectionTypeChange()
  }

  onCollectionTypeChange()
  {
    if(this.target.collection_type === this.collection_types[0])
        this.collections = this.datasource.listCollections();
    else
        this.collections = this.datasource.listAliases();
    this.onChangeInternal()
  }

  onCollectionSelect()
  {
    this.datasource.listFields(this.target.collection).then(  result => {
      this.fields = result
    })
    this.onChangeInternal()
  }



  getOptions(query) {
    return this.datasource.listCollections(query || '');
  }

  listCollection() {
  }

  listFields() {
    return this.datasource.listFields(this.target.collection);
  }

  onChangeInternal() {
    this.panelCtrl.refresh(); // Asks the panel to refresh data.
  }
}


