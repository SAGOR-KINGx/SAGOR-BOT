const express = require("express");
const path = require("path");
const fs = require("fs");
const os = require("os");
const { spawn } = require("child_process");

const app = express();
const PORT = process.env.PORT || 5000;

let botProcess;
let logs=[];
let startTime=Date.now();
let activity=0;

/* remove ansi color */

function clean(text){
return text.replace(/\x1B[[0-9;]*[A-Za-z]/g,"");
}

app.use(express.static(path.join(__dirname,"public")));

app.get("/",(req,res)=>{
res.sendFile(path.join(__dirname,"public","index.html"));
});

/* STATUS */

app.get("/api/status",(req,res)=>{

const total=os.totalmem()/1024/1024;
const free=os.freemem()/1024/1024;

const ram=(total-free).toFixed(2);
const cpu=os.loadavg()[0].toFixed(2);

const uptime=Math.floor((Date.now()-startTime)/1000);

let commands=[];
let events=[];

try{

const cmdPath=path.join(__dirname,"scripts","cmds");
const eventPath=path.join(__dirname,"scripts","events");

if(fs.existsSync(cmdPath))
commands=fs.readdirSync(cmdPath).filter(f=>f.endsWith(".js"));

if(fs.existsSync(eventPath))
events=fs.readdirSync(eventPath).filter(f=>f.endsWith(".js"));

}catch{}

res.json({

cpu,
ram,
uptime,

ping:Math.floor(Math.random()*20)+20,
temp:(30+Math.random()*10).toFixed(1),

activity,

commandsCount:commands.length,
eventsCount:events.length,

commands,
events,

online:botProcess?true:false

});

});

/* LOG API */

app.get("/api/logs",(req,res)=>{
res.json(logs.slice(-600));
});

/* RESTART */

app.get("/api/restart",(req,res)=>{

if(botProcess) botProcess.kill();

startBot();

res.send("Restarting");

});

/* BOT */

function startBot(){

botProcess=spawn("node",["Goat.js"],{
cwd:__dirname,
shell:true
});

botProcess.stdout.on("data",(data)=>{

const msg=clean(data.toString());

logs.push(msg);
activity++;

});

botProcess.stderr.on("data",(data)=>{

const msg=clean(data.toString());

logs.push(msg);
activity++;

});

botProcess.on("close",(code)=>{

logs.push("BOT EXITED "+code);

setTimeout(startBot,3000);

});

}

app.listen(PORT,"0.0.0.0",()=>{
console.log("Dashboard running "+PORT);
});

startBot();
