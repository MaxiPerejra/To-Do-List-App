const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const Todo = require("./models/Todo");
const fs = require("fs");

console.log("backend/.env exists:", fs);

require("dotenv").config({path: path.join(__dirname, ".env")});
console.log("MONGO_URI z env:", process.env.MONGO_URI);
console.log("process.cwd():", process.cwd());


const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}) 
.then( () => {console.log("MongoDB połączono")})
.catch((err) => console.log("Błąd połączenia z MongoDB", err));

app.get("/api/todos", async (req, res) => {
    const todos = await Todo.find().sort({createdAt: -1});
    res.json(todos);
});

app.post("/api/todos", async (req, res) => {
    const { text } = req.body;
    if (!text || text.trim() === "") {
        return res.status(400).json( {error: "Treść zadania jest wymagana"} ); 
    }
    const todo = await Todo.create({text});
    res.status(201).json(todo);
})

app.put("/api/todos/:id", async (req, res) =>{
    const todo = await Todo.findById(req.params.id);
    if (!todo) return res.status(404).json( {error: "Zadanie nie istnieje"} );

    todo.done = !todo.done;
    await todo.save();
    res.json(todo);
});

app.delete("/api/todos/:id", async (req, res) => {
    const result = await Todo.findByIdAndDelete(req.params.id);
    if (!result) return res.status(404).json( {error: "Nie znaleziono zadania"});
    res.status(204).end();
});

app.use(express.static(path.join(__dirname, "../public")));
app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../public/index.html"));
});

app.listen(PORT, () => {
    console.log(`Serwer działa na http://localhost:${PORT}`);
})
