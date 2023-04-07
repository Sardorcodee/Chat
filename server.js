const express = require("express");
const app = express();
const { write_file, read_file } = require("./fs/fs_api");
const dotenv = require("dotenv");
const path = require("path");
const http = require("http");
const uuid = require("uuid");
const fs = require("fs");
const server = http.createServer(app);

const { Server } = require("socket.io");
const io = new Server(server);
dotenv.config();
const PORT = process.env.PORT || 6000;

let messeng = require("./model/messeng.json");
let users = require("./model/users.json");
const { log } = require("console");
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/Pages/index.html");
});
app.get("/register", (req, res) => {
  res.sendFile(__dirname + "/Pages/register.html");
});
io.on("connection", (socket) => {
  socket.on("register", (user) => {
    let id = uuid.v4();
    users.push({
      user_name: user.username,
      user_password: user.password,
      user_id: id,
      user_gender: user.gender,
      user_img:
        user.gender == "Male"
          ? `https://s3-us-west-2.amazonaws.com/s.cdpn.io/195612/chat_avatar_01.jpg`
          : `https://s3-us-west-2.amazonaws.com/s.cdpn.io/195612/chat_avatar_04.jpg`,
    });
    io.emit("register", { msg: "Created User!", token: id });
    write_file("users.json", users);
  });
  socket.on("get", (token) => {
    let user = users.find((user) => user.user_id == token);
    if (user) {
      socket.emit("messeng", { users: users, messengs: messeng });
    } else {
      socket.emit("messeng", "Siz Chatga kirmagansiz iltimos ruyxatdann uting!");
    }
  });
  socket.on("send", (msg) => {
    console.log(msg);
    messeng.push({
      messeng_id: socket.id,
      messeng_title: msg.msg,
      messeng_time: new Date(),
      user_id: msg.id,
    });
    let user = users.find((user) => user.user_id == msg.id);
    if (user) {
      socket.emit("messeng", { users: users, messengs: messeng });
    } else {
      return socket.emit(
        "messeng",
        "Siz Chatga kirmagansiz iltimos ruyxatdann uting!"
      );
    }
    write_file("messeng.json", messeng);
  });
  console.log("a user connected");
  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});
server.listen(PORT, () => {
  console.log(PORT + "ga Ulandi");
});
