let mysql=require("mysql");
let config={
    host:"localhost",
    user:"root",
    password:"",
    database:"exp"
};

let conn=mysql.createConnection(config);

conn.connect( error=>{
    if(error) throw error;
    var query=`CREATE TABLE IF NOT EXISTS users(
        id INT(10) AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        password VARCHAR(255) NOT NULL,
        user_type VARCHAR(255) DEFAULT 'user',
        profile VARCHAR(255) DEFAULT NULL
    )`;


    conn.query(query, (error, result)=>{
        if(error) throw error;
        console.log("user table created successfully");
    })

    let contactQuery=`CREATE TABLE IF NOT EXISTS contacts(
        id INT(10) AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(200) NOT NULL,
        email VARCHAR(200) NOT NULL,
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`;

    conn.query(contactQuery, (error, result)=>{
        if (error) throw error;
        console.log("Contact Table Created Successfully!");
    });

} )

module.exports=conn;

