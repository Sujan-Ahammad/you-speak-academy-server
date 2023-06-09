const express = require('express');
const app =express()
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const port =process.env.PORT || 5000;


// MiddleWare
app.use(cors())
app.use(express.json())

// JWT Middle Ware
// const verifyJWT= (req,res,next)=>{
//     const authorization=req.headers.authorization;
//     if(!authorization){
//       return res.status(401).send({error: true, message:'unauthorization access'})
//     }
//     // 
//     const token=authorization.split(' ')[1]
//     jwt.verify(token, process.env.JWT_ACCESS_TOKEN,(error,decoded)=>{
//       if(error){
//         return res.status(403).send({error: true, message:'Forbidden access'})
//       }
//       req.decoded=decoded
//       next()
//     })
//   }




// Server Home Routes
app.get('/', (req,res)=>{
    res.send('Final Project is comming Soon')
})




const uri = `mongodb+srv://${process.env.ACADEMYDB_USER}:${process.env.ACADEMYDB_PASS}@cluster0.ceweuof.mongodb.net/?retryWrites=true&w=majority`;

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
    await client.connect();

    const usersCollection=client.db('speakAcademyDB').collection('allUsers')
    const classesCollection=client.db('speakAcademyDB').collection('classes')
    const selectClassesCollection=client.db('speakAcademyDB').collection('selectClasses')




    
//     const verifyAdmin=async (req,res,next)=>{
//         const email=req.decoded.email;
//         const query={email:email}
//         const user= await usersCollection.findOne(query)
//         if(user?.role!=='admin'){
//           return res.status(403).send({error: true, message:'Forbidden access'})
//       }
//      next()
//   }
  


    // USERS DASHBOARD
    app.get('/users', async (req,res)=>{
        const result= await usersCollection.find().toArray()
        res.send(result)
      })


    //   JWT TOKEN FOR SECURUTY
    app.post('/jwt', (req,res)=>{
        const user=req.body;
        const token=jwt.sign(user, process.env.JWT_ACCESS_TOKEN,{ expiresIn: '1h' })
        res.send({token})
      })

    app.post('/users', async (req, res) => {
        const user=req.body
        const query={email:user.email}
        const existingUser=await usersCollection.findOne(query)
        if(existingUser){
          return res.status(409).send({message: 'user exists already'})
        }
        const result = await usersCollection.insertOne(user)
        res.send(result)
      })



    //   INSTRUCTOR DASHBOARD 

    app.patch('/addclass/status/:id', async (req,res)=>{
        const id=req.params.id;
        const filter={_id: new ObjectId(id)} 
        const updateDoc = {
            $set: {
                status: 'approved',
            },
          };
          const result = await classesCollection.updateOne(filter,updateDoc)
          res.send(result)
      })

    // Get Classes From MongoDB
    app.get('/addclass',  async (req,res)=>{
        // const status=req.query.status;

        // const query = { status: status };
        const result= await classesCollection.find().toArray()
        res.send(result)
      })

    // POST Classes From Client Side
    app.post('/addclass',async (req,res)=>{
        const classes=req.body;
        const result=await classesCollection.insertOne(classes)
        res.send(result)
      })




      // STUDENT DASHBOARD

      // GET SELECTED CLASS FROM DATABASE

      app.get('/selectedclass', async (req,res)=>{
        const email=req.query.email;
        // console.log(email);
        if(!email){
          res.send([])
        }
  
        // After Verifiying JWT
        // const decodedEmail=req.decoded.email
        // if(email!==decodedEmail){
        //   return res.status(403).send({error: true, message:'Forbidden access'})
        // }
        const query = { email: email };
        const result=await selectClassesCollection.find(query).toArray();
        res.send(result)
  })

      app.post('/selectedclass', async (req,res)=>{
        const selectclass=req.body;
        const result= await selectClassesCollection.insertOne(selectclass)
        res.send(result)
      })

      app.delete('/selectedclass/:id',async (req,res)=>{
        const id=req.params.id
        const query={_id: new ObjectId(id)};
        const result = await selectClassesCollection.deleteOne(query)
        res.send(result)
      })




    //   MAKE ALL DASHBOARD SECTION

    // app.get('/users/admin/:email', async (req,res)=>{
    //     const email=req.params.email
    //     if(req.decoded.email!==email){
    //       res.send({admin:false})
    //     }
    //     const query={email:email}
    //     const user=await usersCollection.findOne(query)
    //     const result ={admin: user?.role==='admin'}
    //     res.send(result)
  
    //   })

      app.patch('/users/admin/:id', async (req,res)=>{
        const id=req.params.id;
        const filter={_id: new ObjectId(id)} 
        const updateDoc = {
            $set: {
              role: 'admin'
            },
          };
          const result = await usersCollection.updateOne(filter,updateDoc)
          res.send(result)
      })
    //   Make User Instructor
      app.patch('/users/instructor/:id', async (req,res)=>{
        const id=req.params.id;
        const filter={_id: new ObjectId(id)} 
        const updateDoc = {
            $set: {
              role: 'instructor'
            },
          };
          const result = await usersCollection.updateOne(filter,updateDoc)
          res.send(result)
      })








    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);










app.listen(port, ()=>{
    console.log(`Final Project is comming Soon${port}`);
})