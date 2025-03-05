const express = require('express');
const User = require('./models/user');
require('./config/connect');

const app = express();
app.use(express.json());

app.post('/add',(req,res)=>{

    data = req.body;
    usr = new User(data);
    usr.save()
        .then(
            (savedUser)=>{
                res.send(savedUser)
            }
        )
        .catch(
            (err)=>{
                res.send(err)
            }
        )


    console.log('user added');

});

app.post('/create', async (req,res)=>{
    try {
        data = req.body;
        usr = new User(data);

        savedUser = await usr.save();

        res.send(savedUser)


    } catch (error) {
        res.send(error)
        
    }

})



app.get('/getall' , (req,res)=>{
    User.find()
    .then(
        (users)=>{
        res.send(users);
    })
    .catch(
        (err)=>{
        res.send(err)
    })

})





app.get('/all',async(req,res)=>{
    try {
        users = await User.find();
        res.send(users);

        
        
    } catch (error) {
        res.send(error)
        
    }
})

app.get('/filter',async(req,res)=>{
    try {
        users = await User.find( {age:21  ,name:"ela"} );
        res.send(users);

        
        
    } catch (error) {
        res.send(error)
        
    }
})




app.get("/findbyid/:id" ,(req,res)=>{
    myid = req.params.id;
    User.findById(myid)
    .then(
        (user)=>{
        res.send(user)
    })
    .catch(
        (err)=>{
        res.send(err)

    })
})



app.get('/findone/:id',async(req,res)=>{
    try {
        myid = req.params.id;
        users = await User.findOne({_id : myid})
        res.send(users);
    } catch (error) {
        res.send(error)
    }
})



app.delete('/delete/:id',(req,res)=>{

    myid = req.params.id;
    User.findOneAndDelete({_id:myid})
    .then(
        (deletedUser)=>{
            res.send(deletedUser);
        }
    )
    .catch(        
        (err)=>{
        res.send(err)
            
    })
})


app.delete('/delete2/:id',async (req ,res)=>{
    try {
        myid = req.params.id;
        deleteduser = await User.findByIdAndDelete(myid);
        res.send(deleteduser);
        
    } catch (error) {
        res.send(error);        
    }
}) 


app.put('/update/:id' , (req,res)=>{
    myid = req.params.id;
    data = req.body;
    User.findOneAndUpdate({_id:myid},data)
    .then(
        (updateduser)=>{
            res.send(updateduser);

        }
    )
    .catch(
        (err)=>{
            res.send(err)

    }
)
})


app.put('/update2/:id',async(req,res)=>{
    try {
        myid = req.params.id;
        data = req.body;
        update = await User.findByIdAndUpdate({_id:myid},data);
        res.send(update);


    } catch (error) {
        res.send(error)
        
    }
})




app.listen(3000,()=>{
    console.log('server work');
})
