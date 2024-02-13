let express=require("express");
const path = require("path");
let app=express();


// settings
app.set("views", path.join(__dirname,"views"));
app.set("view engine","ejs");

app.use(express.static("public"));

const bodyParser=require("body-parser");
app.use(bodyParser.urlencoded({extended:false}));


// let conn=require("./connect");

let {body, validationResult}=require("express-validator");



// all routes
app.get("/",(req, res)=>{
    res.render("home");
})

app.get("/register",(req, res)=>{
    res.render("register",{errors:[]});
})

app.post("/do_register",
body("name").isLength({min:2}).withMessage("Name is required."),
body("email").isEmail().withMessage("Invalid email id."),
body("password").isLength({min:2}).withMessage("Password is required.")
,(req, res)=>{

    let errors= validationResult(req);

    // console.log(errors.isEmpty());
    if(errors.isEmpty()){
        // console.log(req.body);
        let query="INSERT INTO users(name, email, password)VALUES(?,?,?)";
        conn.query(query,[req.body.name, req.body.email,req.body.password],(error,results)=>{
                if(error){
                    res.json({"message":"failed",success:false});
                }        
                res.json({"message":"success",success:true});
        })
    }
    else{
        // console.log(errors.array());
        res.render("register",{errors: errors.array()});
    }

    




})




app.get("/contact", (req, res)=>{
    res.render("contact");
})

app.post("/send_message", (req, res)=>{
    // console.log(req.body);

    let contactQuery="INSERT INTO contacts(name, email, message)VALUES(?,?,?)";
    conn.query(contactQuery,[req.body.name, req.body.email, req.body.message],(error, results)=>{
        if(error){
            res.json({"message":"failed",success:false});
        }
        res.json({"message":"success",success:true});
    })
})







app.get('/show_messages',(req, res)=>{
    let contactQuery="SELECT * FROM contacts";
    conn.query(contactQuery, (error, reults)=>{
        if (error) throw error;
        res.render("show_contacts", {contacts: reults});
    })
})


app.get("/users",(req, res)=>{
    let query="SELECT * FROM users";
    conn.query(query,(error, results)=>{
        if(error) throw error;
        // res.json(results);
        res.render("users",{users: results});
    })
})


app.get("/edit_user/:id", (req, res)=>{
    let id=req.params.id;


    // get old data

    let query="SELECT * FROM users WHERE id=?";
    conn.query(query,[id],(error, results)=>{
        if(error) throw error;
         res.render("edit_user",{record: results[0] });
    })
})


app.post("/update_user", (req, res)=>{

    let query="UPDATE users SET name=?, email=?, password=? WHERE id=?";
    conn.query(query,[req.body.name, req.body.email, req.body.password, req.body.id],(error, results)=>{
        if(error) throw error;
        res.redirect("/users");
    })

})

app.get("/delete_user/:id", (req, res)=>{
    let id=req.params.id;
    let query="DELETE FROM users WHERE id=?";
    conn.query(query,[id],(error, results)=>{
        if(error) throw error;
        // res.json(results);
        res.redirect("/users");
    })
})

// ---------------------------

// load session
let session=require("express-session");
// configure
app.use(session({
    secret:"ctalmora",
    resave:true,
    saveUninitialized:true
}));


// to create session

app.get("/create_session", (req, res)=>{
        req.session.email="capscomtech@gmail.com";
        req.session.password="12345";
        res.send("session created");
})

// to get session
app.get("/get_session", (req, res)=>{
    console.log(req.session.email);
    console.log(req.session.password);
})


// to destroy session / logout
app.get("/logout", (req, res)=>{
    req.session.destroy( error=>{
        if(error) throw error;
        res.redirect("/");
    } )
})

// ----------------------------


// for cookies

let cookieParser=require("cookie-parser");
app.use(cookieParser());

// create cookie
app.get("/create_cookie", (req, res)=>{
    res.cookie("email","capscomalmora@gmail.com", {expires: new Date(Date.now() + 86400)});
    res.cookie("password","12345", {expires: new Date(Date.now() + 86400)});
    res.send("cookie set");
})

// get cookie
app.get("/get_cookie", (req, res)=>{
    console.log(req.cookies.email);
    console.log(req.cookies.password);
})


app.get("/login", (req, res)=>{

    if(req.body.remember=="remember"){
        
    }
})

let multer= require("multer");
const { FirstMiddleware } = require("./middleware/FirstMiddleware");
const { SecondMiddleware } = require("./middleware/SecondMiddleware");
const clientPromise = require("./mongo");
const { ObjectId } = require("mongodb");


let storage= multer.diskStorage({
    destination:(req, file, cb)=>{
        cb(null, "public/upload");
    },
    filename:(req, file, cb)=>{
        cb(null, Date.now()+"-"+file.originalname);
    }
})

let filter=(req, file, cb)=>{
    if(file.mimetype === "image/png" || file.mimetype === "PNG"){
        cb(null, true);
    }
    else{
        cb(new Error("Invalid file extension only jpg, png files are allowed."));
    }
}


let upload= multer({
    storage: storage,
    fileFilter: filter,
    limits:{ fieldSize: 1024*1024 }
}).single("image");


app.get("/upload", (req, res)=>{
    res.render("upload");
})

app.post("/upload", (req, res)=>{
      upload(req, res, error=>{
            if(error){
                return res.status(414).json({message: error.message});
            }
            console.log(req.file);
            console.log(req.file.path);
      })
    res.render("upload");
})



app.get("/home", FirstMiddleware, SecondMiddleware, (req, res)=>{
    res.send("This is home page");
});






// MONGODB CRUD


app.get("/mongo_create", async (req, res)=>{
    const client= await clientPromise;
    const db=client.db("facebook");
    await db.collection("users").insertOne({name:"rakesh",email:"rakesh@gmail.com",password:"12345"});
    res.redirect("/mongo_users");
});

app.get("/mongo_delete", async (req, res)=>{
    const client= await clientPromise;
    const db=client.db("facebook");
    await db.collection("users").deleteOne({_id:new ObjectId("64180869d175d707975056d6")});
    res.redirect("/mongo_users");
});

app.get("/mongo_update", async(req, res)=>{
    const client= await clientPromise;
    const db=client.db("facebook");
    let data=await db.collection("users").updateOne({_id:new ObjectId("641801543ec17076eb289616")},{
        $set:{
            name:"amit singh"
        }
    });
    console.log(data);
    res.redirect("/mongo_users");
})



app.get("/mongo_users", async (req, res)=>{
    const client= await clientPromise;
    const db=client.db("facebook");

    let users= await db.collection("users").find({})
    .skip(1)
    .limit(1)
    .toArray();
    // console.log(users);
    // res.json(users);
    res.render("mongo_users", {users: users});
});



// server run
const PORT=3000;
app.listen(PORT, ()=>{
    console.log("server running");
})