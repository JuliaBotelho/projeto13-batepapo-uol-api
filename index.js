import express, { json } from "express";
import cors from "cors";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";
dotenv.config(); 

const server = express();
server.use(cors());
server.use(json());

const mongoClient = new MongoClient(process.env.MONGO_URI);

try {
    await mongoClient.connect();
    console.log("MongoDB Conectado");
} catch (err) {
    console.log(err);
}

const db = mongoClient.db("uolChat");


server.post("/participants", async (req, res) => {
    const user = req.body;

    try {
        await db.collection("participants").insertOne({ name: user.name, lastStatus: Date.now()});
        res.sendStatus(201); 
    } catch (err) {
        console.error(err);
        res.sendStatus(500);
    }

});

server.get("/participants", async (req, res) => {
    try {
      const users = await db
        .collection("participants")
        .find()
        .toArray();
      res.status(201).send(users);
    } catch (err) {
      console.log(err);
      res.sendStatus(500);
    }
  });



server.listen(5000, () => {
    console.log("Running in http://localhost:5000");
});