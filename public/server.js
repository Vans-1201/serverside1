// server.js

// Import necessary modules
const express = require('express');        // Express.js for creating the server
const bodyParser = require('body-parser'); // Body-parser to handle POST request data
const fs = require('fs');                 // File system module to work with files

const app = express();
const port = 3000; // You can choose any port, e.g., 3000, 5000, 8080

// Middleware to parse URL-encoded bodies (for form submissions)
app.use(bodyParser.urlencoded({ extended: false }));
// Middleware to parse JSON bodies (though not strictly needed for this example, good practice)
app.use(bodyParser.json());

// Serve static files from the 'public' directory
// This assumes your HTML file (index.html) and other static assets are in a folder named 'public'
app.use(express.static('public'));

const usersFilePath = 'users.json'; // Path to the JSON file to store user data

// --- Signup Endpoint ---
app.post('/signup', (req, res) => {
    const { email, password } = req.body; // Extract email and password from the request body

    if (!email || !password) {
        return res.status(400).send('Email and password are required'); // Respond with an error if fields are missing
    }

    const newUser = {
        email: email,
        password: password, // In a real application, you would hash the password!
        timestamp: new Date().toISOString()
    };

    fs.readFile(usersFilePath, 'utf8', (err, data) => {
        let users = []; // Initialize users array
        if (!err) { // No error means file exists and was read successfully
            try {
                users = JSON.parse(data); // Parse existing users data from JSON file
            } catch (parseError) {
                console.error("Error parsing users.json:", parseError);
                return res.status(500).send('Error reading user data.'); // Respond with an error if JSON parsing fails
            }
        } else if (err.code !== 'ENOENT') { // If error is not 'File Not Found' (ENOENT), then it's a different error
            console.error("Error reading users.json:", err);
            return res.status(500).send('Failed to read user data.'); // Respond with an error if file reading fails (other than file not found)
        }
        // If file doesn't exist (ENOENT error), 'users' array remains empty (initialized above)

        users.push(newUser); // Add the new user to the users array

        fs.writeFile(usersFilePath, JSON.stringify(users, null, 2), (writeErr) => {
            if (writeErr) {
                console.error("Error writing to users.json:", writeErr);
                return res.status(500).send('Signup failed: Could not save user data.'); // Respond with an error if writing to file fails
            }
            console.log(`User signed up: ${email}`);
            res.send('Signup successful!'); // Respond with success message
        });
    });
});

// --- Login Endpoint ---
app.post('/login', (req, res) => {
    const { email, password } = req.body; // Extract email and password from the request body

    if (!email || !password) {
        return res.status(400).send('Email and password are required for login.'); // Respond with error if fields are missing
    }

    fs.readFile(usersFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error("Error reading users.json for login:", err);
            return res.status(500).send('Login failed: Could not read user data.'); // Respond with error if reading user data fails
        }

        let users = [];
        try {
            users = JSON.parse(data); // Parse user data from JSON file
        } catch (parseError) {
            console.error("Error parsing users.json during login:", parseError);
            return res.status(500).send('Login failed: Error processing user data.'); // Respond with error if JSON parsing fails
        }

        // Find a user with the provided email and password
        const user = users.find(u => u.email === email && u.password === password);

        if (user) {
            console.log(`User logged in: ${email}`);
            res.send('Login successful!'); // Respond with success message if user found
        } else {
            console.log(`Login failed for email: ${email}`);
            res.status(401).send('Login failed: Invalid email or password.'); // Respond with error if user not found (unauthorized)
        }
    });
});

// --- Start the server ---
app.listen(port, () => {
    console.log(`Server listening on port http://localhost:${port}`); // Log message when server starts
});
