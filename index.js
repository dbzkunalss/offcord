const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const Discord = require("discord.js");
const Client = require("./client/Client");
const { prefix, token } = require("./config.json");
const WebSocket = require("ws");

const app = express();
const client = new Client();
client.commands = new Discord.Collection();

const server = app.listen(3000, () => {
  console.log("listening on *:3000");
});

const wss = new WebSocket.Server({ server });

wss.on("connection", (ws) => {
  console.log("New connection initiated");
  ws.on("message", (message) => {
    const msg = JSON.parse(message);
    switch (msg) {
      case "connected":
        console.log("A new call has connected ");
        break;
      case "start":
        console.log("started media streaming" + msg.streamSid);
        break;
      case "connected":
        console.log("A new call has connected ");
        break;
      default:
        break;
    }
  });
});

app.use(bodyParser.urlencoded({ extended: false }));

// Set Express routes.
app.get("/", (req, res) => {
  res.send("SERVER WORKING");
});

app.post("/events", (req, res) => {
  let to = req.body.to;
  let fromNumber = req.body.from;
  let callStatus = req.body.CallStatus;
  let callSid = req.body.callSid;

  console.log(to, fromNumber, callStatus, callSid);
  res.send("Event received");
});

const commandFiles = fs
  .readdirSync("./commands")
  .filter((file) => file.endsWith(".js"));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.name, command);
}

console.log(client.commands);

client.once("ready", () => {
  console.log("Ready!");
});

client.once("reconnecting", () => {
  console.log("Reconnecting!");
});

client.once("disconnect", () => {
  console.log("Disconnect!");
});

client.on("message", async (message) => {
  const args = message.content.slice(prefix.length).split(/ +/);
  const commandName = args.shift().toLowerCase();
  const command = client.commands.get(commandName);

  if (message.author.bot) return;
  if (!message.content.startsWith(prefix)) return;

  try {
    if (commandName == "userinfo") {
      command.execute(message, client);
    } else {
      command.execute(message);
    }
  } catch (error) {
    console.error(error);
    message.reply("There was an error trying to execute that command!");
  }
});

client.login(token);
