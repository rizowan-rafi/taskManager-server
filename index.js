require('dotenv').config()
const express = require('express');
const app = express();
const cors = require("cors");
const port = process.env.PORT || 5000;


app.use(cors());
app.use(express.json())




// app.get('/', (req, res) => {
//     res.send('Hello, World!');
// })


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.v8zqf.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        // await client.connect();
        const userCollection = await client.db('TaskManager').collection('users');
        const taskCollection = await client.db('TaskManager').collection('tasks');

        // Insert a document into the "users" collection
        app.post('/users', async (req, res) => {
            const { name, email } = req.body.user;
            const u = {
                name,
                email
            }
            console.log(u);
            const userExist = await userCollection.findOne({ email: email });
            if (!userExist) {
                const result = await userCollection.insertOne(u);
                res.status(201).send(result);
            }
            else {
                res.status(409).send({ message: 'User already exists.' });
            }

        })

        app.post('/tasks', async (req, res) => {
            const { title, description, dueDate, userId, status } = req.body;
            console.log(req.body.task);
            const t = {
                title,
                description,
                dueDate,
                userId,
                status
            }
            // console.log(t);
            const result = await taskCollection.insertOne(t);
            res.status(201).send(result);
        })

        app.get('/tasks/:email', async (req, res) => {
            try {
                const email = req.params.email;
                const tasks = await taskCollection.find({
                    userId: email
                }).toArray();
                res.send(tasks);
            } catch (error) {
                console.error("Error fetching tasks:", error);
                res.status(500).send({ message: "Internal Server Error" });
            }
        });


        app.patch('/tasks/:id', async (req, res) => {
            try {
                const taskId = req.params.id;
                const { status } = req.body; // Only updating status

                const result = await taskCollection.updateOne(
                    { _id: new ObjectId(taskId) }, // Ensure correct ID format
                    { $set: { status } }
                );

                if (result.modifiedCount > 0) {
                    res.send(result)
                } else {
                    res.status(404).send({ message: "Task not found" });
                }
            } catch (error) {
                console.error("Error updating task:", error);
                res.status(500).send({ message: "Internal server error" });
            }
        });

        app.delete("/tasks/:id", async (req, res) => {
           
            const { id } = req.params;
            const result = await taskCollection.deleteOne({ _id: new ObjectId(id) });
            res.send(result);
        });


        app.patch("/task/:id", async (req, res) => {
            const { id } = req.params;
            const updatedTask = req.body;

            const result = await taskCollection.updateOne(
                { _id: new ObjectId(id) },
                { $set: updatedTask }
            );

            res.send(result);
        });

        // Send a ping to confirm a successful connection
        // await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});