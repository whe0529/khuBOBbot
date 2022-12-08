var mysql = require('mysql');

const connection = mysql.createConnection({
    host: "ossw10jo-database.c0e4aijkeltd.us-east-1.rds.amazonaws.com",
    port: 3306,
    user: "ossw10jo",
    password: "ossw10jo",
    database: "ossw10jo",
});

connection.connect();

connection.query("select * from restaurant", function(err, res, fileds){
    if(err){
        console.error(err);
        return ;
    }   

    console.log(res[0]);
})
connection.end();
