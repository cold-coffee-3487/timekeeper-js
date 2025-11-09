const express = require('express');
const app = express();

app.use(express.json());
app.use(express.static('public')); // Serve HTML from 'public' folder

app.post('/submit', (req, res) => {
    const { text1, text2 } = req.body;
    console.log('Received:', text1, text2);
    
    // Your processing logic here
    res.json({ message: 'Data received', text1, text2 });
});

app.listen(3000, () => console.log('Server running on port 3000'));