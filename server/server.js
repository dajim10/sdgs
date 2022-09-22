require('dotenv').config();
const express = require("express");
const multiparty = require("multiparty")
const cors = require('cors')
const app = express();
const mysql = require('mysql2')
const PORT = process.env.PORT;
const SERVER = process.env.SERVER;
const IMAGE_UPLOAD_DIR = "./public/images/"
const IMAGE_BASE_URL = `http://localhost:4000/images`

app.use(express.static("public"));
app.use(cors());

const connection = mysql.createConnection({
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE
})

connection.connect((err, result) => {
    if (err) throw err;
    console.log("connection to db success")
});


app.get('/', (req, res) => {
    console.log("Home...")
})

app.get('/content', (req, res) => {
    connection.query("SELECT * FROM content", (err, result, fields) => {
        if (err) throw err;
        res.send(result)
    })
})

app.post("/addcontent", (req, res) => {
    let form = new multiparty.Form({ uploadDir: IMAGE_UPLOAD_DIR });

    form.parse(req, function (err, fields, files) {
        if (err) return res.send({ err: err.message });
        console.log(`fields = ${JSON.stringify(fields, null, 2)}`)
        console.log(`files = ${JSON.stringify(files, null, 2)}`)


        const imagePath = files.image[0].path;
        console.log('image path : '+imagePath)
        const imageFileName = imagePath.slice(imagePath.lastIndexOf("\\") + 1);
        console.log('image file name : '+imageFileName)
        // const imageURL = IMAGE_BASE_URL + imageFileName;
        const FULLimageURL = "http://localhost:4000/"+imageFileName;
        // http://localhost:4000/public/images/file.jpg
        const splitted = FULLimageURL.split('/public');
        console.log(splitted)
        const imageURL = splitted[0]+splitted[1];
        console.log(imageURL)

        const { content_name, content_detail,type } = fields;
        // res.send({ "content_name": content_name, "content_detail": content_detail, "date": new Date(), "image": imageURL })
        const InsertMysql = "INSERT INTO content(content_name,content_detail,date,image,type) VALUES (?,?,?,?,?)"
        connection.query(InsertMysql, [content_name, content_detail, date = new Date(), imageURL,type], (err, result,fields) => {
            if (err) throw err;
                const lastId = result.insertId
            res.send(result)
            console.log(lastId)

            // res.send(insertId)
        })
    })
})

app.listen(PORT, () => {
    console.log(`Server running at : http://localhost:${PORT}`)
})