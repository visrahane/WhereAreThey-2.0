var cors = require('cors');
var express=require("express"),
app=express(),
port = process.env.PORT || 8090,
bodyParser = require('body-parser');


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());


var routes = require('./routes/travelRoutes'); //importing route
routes(app); //register the route

app.listen(port);
console.log('travel RESTful API server started on: ' + port);
app.get("/",function(req,res){
    res.send("hello Vis");
});