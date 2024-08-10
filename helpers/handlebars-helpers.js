const moment = require("moment");

module.exports = {
    generateTime: function(date, format){
        return moment(date).format(format);
    },
    select:function(selected, options){
        return options.fn(this).replace(new RegExp(' value=\"'+selected+'\"'), '$&selected="selected"');
    }
};