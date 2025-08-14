import express from "express"
import pg from "pg"
import bodyParser from "body-parser";
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();
const app=express()
app.use(express.static("public"));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
var output="Output here"

app.get("/",(req,res)=>{
    const defaultConfig={
        language: "python"
    }
    res.render("index.ejs",{"lang":defaultConfig.language, "code": defaultConfig.code,"output": output});
})
app.post("/run", async (req, res) => {
    const { code, programID } =req.body;
    console.log("Received code:", code);
    const result=await axios.post("https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=false&wait=true", {
            source_code: code,
            language_id: programID,
            stdin: "",
        }, {
        headers: {
            "Content-Type": "application/json",
            "X-RapidAPI-Key": process.env.X_RapidAPI_Key, 
            "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com"
            }
        })
    // console.log("Response from Judge0:", result.data);
    output = result.data.stdout || result.data.stderr || "No output";
    res.json({ output: output });
});
app.listen(3000,()=>{
    console.log("Running on port 3000");
}) 
