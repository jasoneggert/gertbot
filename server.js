const express = require("express");
const fs = require("fs");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");

const port = 3001;
app.use(cors()); // Allow all CORS requests
// Configure body-parser middleware
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
// Define the endpoint to append data to the CSV file
app.post("/append-data", (req, res) => {
  const newData = req.body; // Assuming the new data is sent in the request body
  // Function to escape commas and double quotes in the field
  const escapeField = (field) => {
    let escapedField = field.replace(/(\r\n|\n|\r)/gm, " ").replace(/"/g, '""'); // Remove Line breaks and Escape double quotes by doubling them
    if (escapedField.includes(",") || escapedField.includes('"')) {
      escapedField = `"${escapedField}"`; // Wrap the field in double quotes if it contains commas or double quotes
    }
    return escapedField;
  };

  // Escape commas and double quotes in the CSV fields
  const prompt = escapeField(newData.prompt);
  const response = escapeField(newData.response);
  const date = escapeField(newData.date);
  // Convert the data to CSV format
  const csvData = `"${prompt}",${response},"${date}"\n`;

  console.log("sssss", csvData);
  //Append the data to the CSV file
  fs.appendFile("data.csv", csvData, (err) => {
    if (err) {
      console.error(err);
      res
        .status(500)
        .send("Error occurred while appending data to the CSV file");
    } else {
      res.send("Data appended to the CSV file successfully");
    }
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
