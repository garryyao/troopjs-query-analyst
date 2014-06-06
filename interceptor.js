require(['troopjs-core/component/service', 'jquery'], function interceptor (Service, $) {
  $(window.document).ajaxSend(function($evt, xhr, options) {
    var query;
    if("x-troopjs-request-id" in options.headers){
      query = /^q=(.*)/.exec(options.data)[1];
    }
    // report the query.
    alert(query);
  });
});