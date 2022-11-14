import express, { json } from "express";
import cors from "cors";
import { MongoClient } from "mongodb";
import dayjs from "dayjs";
import Joi from "joi";
import dotenv from "dotenv";
dotenv.config();

const userSchema = Joi.object({
  name: Joi.string().required().min(1),
})

const messageSchema = Joi.object({
  to: Joi.string().required().min(1),
  text:Joi.string().required().min(1),
  type:Joi.string().valid("message","private_message"),
})

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

  const verification = userSchema.validate(user);

  if (verification.error){
    res.sendStatus(422);
    return;
  }

  const userExists = db
  .collection("participants")
  .find({name : user.name})
  .toArray();

  if((await userExists).length > 0){
    res.sendStatus(409);
    return;
  }

  try {
    await db.collection("participants").insertOne({ name: user.name, lastStatus: Date.now() });
    res.sendStatus(201);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }

  try {
    await db.collection("messages").insertOne({from: user.name, to: 'Todos', text: 'entra na sala...', type: 'status', time: dayjs().format('DD/MM/YYYY')});
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

server.post("/messages", async (req, res) => {
  const message = req.body;
  const from = req.headers.user;

  const verification = messageSchema.validate(message);

  if (verification.error){
    res.sendStatus(422);
    return;
  }

  const userExists = await db
  .collection("participants")
  .find({name : from})
  .toArray();

  console.log(userExists)

  if(userExists.length < 1){
    res.sendStatus(409);
    return;
  }


});

server.listen(5000, () => {
  console.log("Running in http://localhost:5000");
});