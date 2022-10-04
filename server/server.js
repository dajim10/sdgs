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
const fs = require('fs')
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false}))

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


app.use(express.static("./public"));
app.use(cors());
// app.use([
//     express.static("public"),
//     express.json(),
//     cors(),
//     upload.array("files")
// ])

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

app.get('/getcontentbytype/:type',(req,res)=>{
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

app.get('/contentsdg/:sdg_number',(req,res)=>{
    const sdg_number = req.params.sdg_number;
    sqlQuery = `SELECT content_id ,  content_name ,image ,content_detail, type ,sdg_number
    FROM content
    LEFT JOIN  content_sdg ON content.id=content_sdg.content_id
    WHERE content_sdg.sdg_number = ?
    `
    connection.query(sqlQuery,[sdg_number],(err,result)=>{
        if (err) throw err;
        res.send(result)
    })



    // connection.query(`SELECT
    //     content_id,content_name,image,content_detail,type,
    //     JSON_ARRAYAGG(
    //         JSON_OBJECT(
    //             'color',sdg_goal.color,
    //             'sdg_number',sdg_number
    //         ))
    //          AS sdg_number
    //     FROM content_sdg
    //     LEFT JOIN content ON content.id=content_sdg.content_id
    //     LEFT JOIN sdg_goal ON content_sdg.sdg_number=sdg_goal.id
    //     WHERE content_sdg.sdg_number = ?
    //     GROUP BY content_id ORDER BY sdg_number`,[sdg_number], function(err,result){
    //     if (err) throw err;
    //     res.send(result)
    // })
})

app.post("/upload_files",multipartyMiddleware,(req,res)=>{
    // console.log(req.files)
    // if(req.files) {
    //     res.json(req.files.path)
    // }

    // console.log(req.files.files.path);
    var TempFile = req.files.files;
    var TempPathfile = TempFile.path;

    // console.log(filename)
   console.log(TempFile)
    const fileSplit = TempPathfile.split("public/")
    const filename = fileSplit[1]

    console.log(TempPathfile)
    console.log(filename)
    const targetPathUrl = path.join(__dirname,`${TempPathfile}`);
    
    // fs.rename(TempPathfile,targetPathUrl, err=>{
        res.status(200).json({
            uploaded:true,
            url:`${TempPathfile}`,
            filename:filename,
            //filename: req.files.files.name,
        })
        // if(err) return console.log(err);
    // })
   
})

app.post("/update/:id",(req,res)=>{
    
    const id = req.params.id
    let form = req.body
    console.log(form)

    if (form !== 'undefined') {
        res.send(form)
    }
    // // const contentDetail = req.body.content_detail

    // // console.log(contentDetail)

    // const contentDetail = '<img src="http://localhost:4000/1I51uBGhrQOArW95GXnQTOr2.jpeg />'
    // connection.query('UPDATE `content` SET `content_detail`=? where `id`=?', [req.body.content_detail,,id], function (error, results, fields) {
    //     if (error) throw error;
    //     res.send(JSON.stringify(results));
    //   });
    
    // connection.query(`UPDATE content SET content_detail = ? WHERE id = ?`,[contentDetail,id],
    // function (error, results, fields) {
    //     if (error) throw error;
    //     res.end(JSON.stringify(results));
    //   })

    // res.send(`Send request by id ${id}`)
})

app.get("/sdgs",(req,res)=> {
    connection.query(`SELECT * FROM sdg_goal`,function(err,result){
        if (err) throw err;
        res.send(result);
    })
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

app.post("/upload/:id",upload.array("image"),(req,res)=>{
    const id = req.params.id;
    console.log(req.file)
    // if (!id) {
    //     res.status(400).send({message:"error 404 "})
    // }else {

    //     res.json({ success:true,url:res.req.file.path,fileName:res.req.file.filename})
    // }
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

app.get('/getcontentbyid/:id',(req,res)=> {
    const id = req.params.id;
    connection.query(`SELECT
        content_id,content_name,image,content_detail,
        JSON_ARRAYAGG(
            JSON_OBJECT(
                'color',sdg_goal.color,
                'sdg_number',sdg_number
            ))
             AS sdg_number
        FROM content_sdg
        LEFT JOIN content ON content.id=content_sdg.content_id
        LEFT JOIN sdg_goal ON content_sdg.sdg_number=sdg_goal.id
        WHERE content_id = ?
        GROUP BY content_id `,[id], function(err,result){
        if (err) throw err;
        res.send(result);
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



app.get('/content', (req, res) => {
    connection.query("SELECT * FROM content ORDER BY ID DESC ", (err, result, fields) => {
        if (err) throw err;
        res.send(result)
    })
})








app.post("/addcontent",(req,res)=>{
    // let form = new multiparty.Form({ uploadDir : IMAGE_UPLOAD_DIR});
    // console.log(form)
    console.log(req.body)
    res.status(200).send();
})



app.listen(PORT, () => {
    console.log(`Server running at : http://localhost:${PORT}`)
})