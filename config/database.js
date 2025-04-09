const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI)
    .then(()=>{
        console.log('connected');
        
    })
    .catch(
        (err)=>{
            console.log("DB error", err);
        }
    )
module.exports = mongoose;