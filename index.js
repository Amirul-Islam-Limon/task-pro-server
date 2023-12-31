const express = require('express');
const app = express();
const cors = require("cors")
const helmet = require('helmet');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(helmet({
  crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' }
}));



const uri = process.env.DATABASE_URI;
const client = new MongoClient(uri, {serverApi: {version: ServerApiVersion.v1,strict: true,deprecationErrors: true,}});

async function run() {
  try {
    const usersCollection = client.db("taskProDB").collection("usersCollection");
    const tasksCollection = client.db("taskProDB").collection("tasks");


    app.post("/user", async(req, res)=>{
      const userInfo = req.body;
      // console.log("userInfo",userInfo);
      try {
        const AllUsers = await usersCollection.find().toArray();
        const previousAddedUser = AllUsers.find(user=> user.email === userInfo.email);
        if(!previousAddedUser){
          const result = await usersCollection.insertOne(userInfo);
          res.status(201).json(result);
          // console.log(result);
        }
        else{
          res.status(201).json("User already added!");
        }
      } catch (err) {
        console.error('Error creating user:', err);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    })

    
    app.get("/user", async(req, res)=>{
      try {
        const users = await usersCollection.find().toArray();
        res.json(users);
      } catch (err) {
        console.error('Error fetching users:', err);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    });

    
    app.post("/task", async(req, res)=>{
      const taskData = req.body;
      try {
        const result = await tasksCollection.insertOne(taskData);
        res.status(201).json(result);
        // console.log(result);
      } catch (err) {
        console.error('Error creating user:', err);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    })


    app.get("/task", async(req, res)=>{
      try {
        const tasks = await tasksCollection.find().toArray();
        res.json(tasks);
      } catch (err) {
        console.error('Error fetching users:', err);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    });


    app.get("/task/:id", async(req, res)=>{
      try {
        const id = req.params.id;
        const query = {_id: new ObjectId(id)};
        const task = await tasksCollection.findOne(query);
        res.json(task);
      } catch (err) {
        console.error('Error fetching users:', err);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    });


    app.patch("/changeTaskStatus/:id", async(req, res)=>{
      try {
        const taskId = req.params.taskId;
        // console.log(taskId);
        const filter = {_id: new ObjectId(taskId)};
        const updatedDoc = {
          $set: {
            status: 'completed',
          },
        };
        const result = await tasksCollection.updateOne(filter, updatedDoc);
        // console.log(result);
        res.json(result);
      } catch (err) {
        console.error('Error deleting task:', err);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    });


    app.patch("/updateTaskInfo", async(req, res)=>{
      const updatedDoc = req.body;
      console.log(updatedDoc);
      return res.status(200).send("data updated successfully");
    });


    app.delete("/deleteTask/:taskId", async(req, res)=>{
      try {
        const taskId = req.params.taskId;
        // console.log(taskId);
        const query = {_id: new ObjectId(taskId)};
        const result = await tasksCollection.deleteOne(query);
        // console.log(result);
        res.json(result);
      } catch (err) {
        console.error('Error deleting task:', err);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    });


    app.get("/", (req, res)=>{
      res.send("Welcome to Task Pro Server");
    })
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
