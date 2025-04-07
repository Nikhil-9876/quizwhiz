const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const SignUpModel = require('./models/SignUpSchema');
const Results = require('./models/ResultSchema');

const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect("mongodb+srv://nikhilsolanki9876:23bce198@cluster0.a9bwwoh.mongodb.net/UserDetails")
    .then(() => {
        console.log("MongoDB connected");
    })
    .catch(() => {
        console.log("Failed to connect MongoDB");
    });

app.post('/Signup', (req, res) => {
    SignUpModel.create(req.body)
        .then(userDetails => res.json({ message: "User registered successfully!", userDetails }))
        .catch(err => res.status(500).json({ error: err.message }));
});

app.post('/Login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await SignUpModel.findOne({ email: email, password: password });
        if (!user) {
            return res.status(401).json({ message: "Invalid email or password" });
        }
        res.json({ message: "Login successful"});
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/SaveQuizResults', async (req, res) => {
    try {
      const { date, topic, difficulty, timeTaken, score, totalQuestions, email } = req.body;
      
      if (!email) {
        return res.status(400).json({ message: 'Email is required' });
      }
  
      const newResult = new Results({
        date: date || new Date(), 
        topic,
        difficulty,
        timeTaken,
        score,
        totalQuestions,
        email 
      });
  
      await newResult.save();
      res.status(201).json({ message: 'Results saved successfully' });
    } catch (error) {
      console.error("Backend error:", error);
      res.status(500).json({ 
        message: 'Error saving results',
        error: error.message,
        fullError: error 
      });
    }
  });


  app.get('/GetUserResults/:email', async (req, res) => {
      try {
        const userEmail = req.params.email;
        const userResults = await Results.find({ email: userEmail }).sort({ date: -1 }); // Newest first
        res.json(userResults);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

app.listen(5175, () => {
    console.log("Server Running on port 5175");
});
