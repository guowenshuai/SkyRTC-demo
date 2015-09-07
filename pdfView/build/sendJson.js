/**
 * Created by jky on 15-9-6.
 */

function sendJson(args) {
    console.log("send start");
    $.ajax({
        url: '/json',
        type: 'POST',
        data: args,
        //data: {"data":{"name":"张三","age":25}},
        //contentType: "application/json;charset=utf-8",
        contentType: "application/x-www-form-urlencoded;charset=utf-8",
        dataType: 'json',
        success: function(data){
            console.log("success========== " + data.success);
        },
        error: function(){
            console.log("error============");
        }
    });
    console.log("send over");
}