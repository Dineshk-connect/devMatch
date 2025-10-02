const express=require('express');

const app=express();

// app.use("/test",(req,res)=>{
//     res.send("Hey /test");
// });


// app.use("/hello",(req,res)=>{
//     res.send("Hello from the server");
// });

// app.use("/",(req,res)=>{
//     res.send("Route is blank");
// });

app.get("/User",(req,res)=>{
    res.send({firstname:"kendrick", lastname:"lamar"});
});

app.post("/User", (req,res)=>{
    res.send("Data successfully sent to database");
})

app.delete("/User", (req,res)=>{
    res.send("Deleted Successfully");
})
app.listen(3000,()=>{
    console.log("Server is running successfully");
});