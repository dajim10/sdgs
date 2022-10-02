require('dotenv').config();
const express = require("express");
const multiparty = require("connect-multiparty")
const multipartyMiddleware = multiparty({ uploadDir : './public/images'})
const bodyParser = require('body-parser')
const cors = require('cors')
const app = express();
const mysql = require('mysql2')
const multer = require('multer')
const path = require('path')
const PORT = process.env.PORT;
const SERVER = process.env.SERVER;
const IMAGE_UPLOAD_DIR = "./public/images/"
const IMAGE_BASE_URL = process.env.IMAGEURL;

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false}))




app.use(express.static("./public"));
app.use(cors());

const connection = mysql.createConnection({
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
    port:3306,
})

connection.connect((err, result) => {
    if (err) throw err;
    console.log("connection to db success")
});

app.get('/getcontent/:type',(req,res)=>{
    const type = req.params.type;
    connection.query(`SELECT
        content_id,content_name,image,content_detail,type,
        JSON_ARRAYAGG(
            JSON_OBJECT(
                'color',sdg_goal.color,
                'sdg_number',sdg_number
            ))
             AS sdg_number
        FROM content_sdg
        LEFT JOIN content ON content.id=content_sdg.content_id
        LEFT JOIN sdg_goal ON content_sdg.sdg_number=sdg_goal.id
        WHERE type = ?
        GROUP BY content_id ORDER BY sdg_number`,[type], function(err,result){
        if (err) throw err;
        res.send(result)
    })
})

app.post("/upload_files",(req,res)=>{
    if (req.files.length > 0) {
        res.json(req.files[0]);
    }
})

app.get("/sdgs",(req,res)=> {
    connection.query(`SELECT * FROM sdg_goal`,function(err,result){
        if (err) throw err;
        res.send(result);
    })
})
// ! Use of Multer
var storage = multer.diskStorage({
    destination: (req,file,callBack) =>{
        callBack(null,'./public')
    },
    filename: (req,file,callBack) => {
        callBack(null,Date.now() + path.extname(file.originalname))
    }
})

var upload = multer({
    storage : storage
})


app.get('/', (req, res) => {
    console.log("Home...")
})
// upload file to sever

app.post("/ckupload",upload.single("image"),(req,res)=>{
    if (!req.file) {
        res.status(400).send();
    }
})

app.get("/content/:id",(req,res)=>{
    const id = req.params.id;
    connection.query("SELECT * FROM content WHERE id = ?",[id],(err,result)=>{
        if (err) throw err;
        res.send(result)
    })
})

app.post("/update/:id",upload.array("image"),(req,res)=>{
    const id = req.params.id;
    if (!id) {
        res.status(400).send({message:"error 404 "})
    }else {

        console.log(req.params.id);
    }
})

app.post("/upload",upload.single("image"),(req,res)=>{
    if (!req.file) {
        res.status(400).send();
    }else {
        console.log(req.file)
        console.log(req.body)
        var imgsrc = `${process.env.SERVER}/`+req.file.filename
        var content_name = req.body.content_name;
        var content_detail = req.body.content_detail;
        var type = req.body.contentType;
        const sdgFrontEnd = req.body.sdgID
        const sdgID=sdgFrontEnd.split(',').map(x=>+x);

        // b="1,2,3,4".split(',').map(x=>+x)
        console.log(sdgID)
        console.log(content_name,content_detail)
        var insertData = "INSERT INTO content (content_name,content_detail,image,type) VALUES(?,?,?,?)"
        connection.query(insertData,[content_name,content_detail,imgsrc,type],(err,result)=>{
            if (err){
                throw err  
            } else {
                console.log("file Upload "+result);
                console.log(result.insertId);
                const ContentID = result.insertId;
                // sdgID.forEach(function(number){
                sdgID.sort(function (a,b) {return a - b}).forEach(function (number){
                    connection.query(
                        "INSERT INTO content_sdg(content_id,sdg_number) VALUES (?,?) ",
                        [ContentID,number],
                        (err,result) => {
                            if(err) throw err;
                        }
                    )
                })

            }

        })
        res.status(200).send();
    }
})




app.get('/getall',(req,res)=> {
    // Test JSON Array to extract 2 fields sdg_number and color of sdg_number

    // connection.query(`SELECT
    //     content_id,content_name,image,content_detail,
    //     JSON_ARRAYAGG(sdg_number) as sdg_number,JSON_ARRAYAGG(sdg_goal.color) as color
    //     FROM content_sdg
    //     LEFT JOIN content ON content.id=content_sdg.content_id
    //     LEFT JOIN sdg_goal ON content_sdg.sdg_number=sdg_goal.id
    //     GROUP BY content_id `, function(err,result){
    //     if (err) throw err;
    //     res.send(result)
    // })

    connection.query(`SELECT
        content_id,content_name,image,
        JSON_ARRAYAGG(
            JSON_OBJECT(
                'color',sdg_goal.color,
                'sdg_number',sdg_number
            ))
             AS sdg_number
        FROM content_sdg
        LEFT JOIN content ON content.id=content_sdg.content_id
        LEFT JOIN sdg_goal ON content_sdg.sdg_number=sdg_goal.id
        GROUP BY content_id `, function(err,result){
        if (err) throw err;
        res.send(result)
    })
})
// app.post("/upload",upload.single("image"),(req,res)=>{
//     if (!req.file) {
//         console.log("No file upload");
//     }else {
//         console.log(req.file.filename)
//         // const content_name = req.content_name;
//         // const content_detail = req.content_detail;
//         var imgsrc = "http://localhost:4000/images/"+req.file.filename
//         var insertData = "INSERT INTO content (image) VALUES(?)"
//         connection.query(insertData,[imgsrc],(err,result)=>{
//             if(err) throw err
//             console.log("file Uploaded")
//         })
//     }
// })


// app.post('/insertdata',(req,res) =>{
//     console.log(req);
//     const content_name = req.body.content_name;
//     const image = req.files;
//     const content_detail = req.body.content_detail;
    

//     connection.query("INSERT INTO content (content_name,image,content_detail) VALUES (?,?,?)",[content_name,image,content_detail],(err,result)=>{
//         if (err) throw err;
//         res.send(result)

//     })
// })
app.get('/content', (req, res) => {
    connection.query("SELECT * FROM content ORDER BY ID DESC ", (err, result, fields) => {
        if (err) throw err;
        res.send(result)
    })
})






// upload image with multer
// const multer = require('multer');
// var storege = multer.diskStorage({
//     destination: function (req,file,cb) {
//         cb(null,"./public/images");
//     },
//     filename : (req,file,cb) => {
//         cb(null,Date.now()+"--"+file.originalname);
//     },
// })
// const upload = multer({ storage: storege});

app.post('/uploadck',multipartyMiddleware,(req,res)=>{
    // let form = new multiparty.Form({uploadDir : IMAGE_UPLOAD_DIR});
    // form.parse(req,function(err,fields,files){
    //     if (err ) return res.send({ err : err.messageq});
    //     console.log(`fields= ${JSON.stringify(fields,null,2)}`)
    // })
    console.log(req.files)
})

app.post("/addcontent",(req,res)=>{
    // let form = new multiparty.Form({ uploadDir : IMAGE_UPLOAD_DIR});
    // console.log(form)
    console.log(req.body)
    res.status(200).send();
})

//
// app.post("/addcontent",(req, res) => {
//     let form = new multiparty.Form({ uploadDir: IMAGE_UPLOAD_DIR });

//     form.parse(req, function (err, fields, files) {
//         if (err) return res.send({ err: err.message });
//         console.log(`fields = ${JSON.stringify(fields, null, 2)}`)
//         console.log(`files = ${JSON.stringify(files, null, 2)}`)


//         const imagePath = files.images[0].path;
//         console.log('image path : '+imagePath)
//         const imageFileName = imagePath.slice(imagePath.lastIndexOf("\\") + 1);
//         console.log('image file name : '+imageFileName)
//         // const imageURL = IMAGE_BASE_URL + imageFileName;
//         const FULLimageURL = `${SERVER}/${imageFileName}`
//         // const FULLimageURL = "http://localhost:4000/"+imageFileName;
//         // http://localhost:4000/public/images/file.jpg
//         const splitted = FULLimageURL.split('/public');
//         console.log(splitted)
//         const imageURL = splitted[0]+splitted[1];
//         console.log(imageURL)

//         const { content_name, content_detail,type } = fields;
//         // console.log(content_detail)
//         // res.send({ "content_name": content_name, "content_detail": content_detail, "date": new Date(), "image": imageURL })
//         const InsertMysql = "INSERT INTO content(content_name,content_detail,date,image,type) VALUES (?,?,?,?,?)"
//         connection.query(InsertMysql, [content_name, content_detail, date = new Date(), imageURL,type], (err, result,fields) => {
//             if (err) throw err;
//                 const lastId = result.insertId
//             res.send(result)
//             console.log(lastId)

//             // res.send(insertId)
//         })
//     })
// })

app.listen(PORT, () => {
    console.log(`Server running at : http://localhost:${PORT}`)
})