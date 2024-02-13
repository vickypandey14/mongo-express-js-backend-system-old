const {MongoClient} = require("mongodb");
const uri="";

const options={
    useUnifiedTopology: true,
    useNewUrlParser:true
};

let client;
let clientPromise;

client=new MongoClient(uri, options);
clientPromise=client.connect();
module.exports=clientPromise;