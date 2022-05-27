const express = require("express");
const multer = require("multer");
const sizeOf = require("image-size");
const fs = require("fs");
const { createCanvas } = require("canvas");

const UPLOADS_FOLDER = "./uploads/";

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, UPLOADS_FOLDER);
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    },
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1000000,
    },
    fileFilter: (req, file, cb) => {
        if (
            file.mimetype === "image/png" ||
            file.mimetype === "image/jpg" ||
            file.mimetype === "image/jpeg" ||
            file.mimetype === "image/gif"
        ) {
            cb(null, true);
        } else {
            cb(new Error("File type not supported"), true);
        }
    },
});

const app = express();

app.set("view engine", "ejs");
app.set("views", "views");
app.use(express.static("public"));

app.get("/", (req, res) => {
    res.render("home");
});

app.post("/", upload.array("files", 20), (req, res) => {
    if (req.files.length) {
        const imageData = req.files.map((file) => {
            const { height, width } = sizeOf(file.path);

            const canvas = createCanvas(width, height);
            const context = canvas.getContext("2d");

            context.fillStyle = "#BFBFBF";
            context.fillRect(0, 0, width, height);

            // Set the style of the test and render it to the canvas
            context.font = `bold ${width / 8}pt 'sans-serif'`;
            context.textAlign = "center";
            context.fillStyle = "#3a3a3a";
            // 600 is the x value (the center of the image)
            // 170 is the y (the top of the line of text)
            const text = height + "X" + width;
            const { emHeightAscent } = context.measureText(text);
            context.fillText(text, width / 2, height / 2 + emHeightAscent / 3);

            const buffer = canvas.toBuffer("image/png");
            fs.writeFileSync(`./temp/${file.originalname}`, buffer);

            return {
                fileName: file.originalname,
                height: height,
                width: width,
            };
        });

        res.render("result", {
            images: imageData,
        });
    } else {
        res.send("Please upload files");
    }
});

app.listen(3000, () => {
    console.log("Server running");
});
