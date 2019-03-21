///<reference path ="../node_modules/grafana-sdk-mocks/app/headers/common.d.ts" />

import _ from 'lodash';
import * as $ from 'jquery';
import moment from 'moment';
import * as dateMath from 'app/core/utils/datemath';

/** @ngInject */
export class SolrDatasource {
  id: number;
  name: string;
  url: string;
  collection: string;

  basicAuth: any;
  withCredentials: any;

  usedCollections = new Set();


  constructor(instanceSettings, private backendSrv, private templateSrv, private $q)
  {
    this.name = instanceSettings.name;
    this.id = instanceSettings.id;
    this.url = instanceSettings.url;

    this.basicAuth = instanceSettings.basicAuth;
    this.withCredentials = instanceSettings.withCredentials;
  }


  // Query for metric targets within the specified time range.
  // Returns the promise of a result dictionary.
  query(options)
  {
    let results = options.targets
    .filter(target => target.query && target.collection)
    .map( target => {
      let collection = target.collection;
      if(!this.usedCollections.has(collection))
          this.usedCollections.add(collection);

      let query = target.query;
      let timeFrom = options.range.from;
      let timeTo = options.range.to;

      timeFrom.local();
      timeTo.local();

      query = this.templateSrv.replace(query, options.scopedVars);

      let adhocFilters = this.templateSrv.getAdhocFilters(this.name);
      if(adhocFilters && adhocFilters.length > 0)
      {
          let filters = adhocFilters
          .map( filter => {
            let splitted_key = filter.key.split(/([\w-_]+) : (.*)/);
            return splitted_key[2] + ":" + filter.value
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
      return this.doGet(collection + "/select?wt=json", post_data)

    })

    return new Promise((resolve, reject) => {
        Promise.all(results).then(
          (result: any) => {
            let docs = result.flatMap(target_result => {
              return target_result.data.response.docs
            })
            resolve({data: this.docsToTableFormat(docs)})
          },
          errors => {reject(errors)
          })
    })
  }


    docsToTableFormat(docs){
        let keysIndex = {}
          let columnCount = 0
            let rows = []
              docs.map(doc => {
                let row = []
                Object.keys(doc).forEach(key => {
                  let value = doc[key]
                  if(!(typeof   value === 'string' || typeof value === 'number'))
                      return

                  let keyPos = keysIndex[key]
                  if(keyPos === undefined){
                    keyPos = columnCount++
                    keysIndex[key] = keyPos
                  }

                  row[keyPos] = value
                })
                return row
              })
              .forEach(row => {
                for(let i=0; i< columnCount; i++)
                {
                  if(!row[i])
                  row[i] = null
                }
                rows.push(row)
              })
              let columns = []
              Object.keys(keysIndex).forEach((key, index) => {
                columns.push({text: key})
              })
              return [{
                columns: columns,
                rows: rows,
                type: "table"
              }]
            }




      metricFindQuery(query) {
        //q=*:*&facet=true&facet.field=CR&facet.field=product_type&facet.field=provincia&wt=json&rows=0
        if (!this.collection) {
                return [];
          }
          var path = this.collection + '/select?q=*:*&facet=true&facet.field='+query+'&wt=json&rows=0'
          return this.doGet(path).then(this.mapToTextValue)
        }

      mapToTextValue(result) {
        if (result.data.facet_counts) {
          var ar = [];
          for (var key in result.data.facet_counts.facet_fields) {
            if (result.data.facet_counts.facet_fields.hasOwnProperty(key)) {
              var array = result.data.facet_counts.facet_fields[key];
              for (var i = 0; i < array.length; i += 2) { // take every second element
                ar.push({
                  text: array[i],
                  expandable: false
                });
              }
            }
          }
          return ar;
          }
        }


        // Test the connection to Solr by querying collection response.
  testDatasource() {
      return this.doGet("").then(
        success => {
          return {status: 'success', message: 'Data source is working'}
        },
        error => {
          return {status: 'error', message: error}
        }
      );
  }


  listCollections() {
    return this.doGet('/admin/collections?action=LIST&wt=json').then(result => {
        return result.data.collections.map(function(collection) {
            return {
                text: collection,
                value: collection
            };
        });
      })
  }

  listAliases(){
    return this.doGet('/admin/collections?action=LISTALIASES&wt=json').then(result => {
        return Object.keys(result.data.aliases).map(key => {
            return {
                text: key,
                value: key
            };
        });
      })
  }


  listFields(collection) {
      return this.doGet(collection + '/select?q=*:*&wt=csv&rows=1').then(result => {
          return result.data.split('\n')[0].split(',').map(field => {
              return {
                  text: field,
                  value: field
              };
          });
        });
    }


  doGet(path, data=null){
    return this.backendSrv.datasourceRequest({
        url: this.url + "/" + path,
        method: 'GET',
	       params: data
    });
  }

   doRequest(path, method){
      return this.backendSrv.datasourceRequest({
	       url: this.url + "/" + path,
	        method: method
	       });
   }

}

