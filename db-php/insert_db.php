<?php
// Get the name from the form data
$name = $_POST["name"];

$servername = "fb-db-17.cwunrkwgelkc.us-east-1.rds.amazonaws.com";
$username = "manjin";
$password = "12341234";
$dbname = "immersionday";

// Connect to MySQL
$mysqli = new mysqli($servername, $username, $password, $dbname);

// Check for errors
if ($mysqli->connect_errno) {
    die("Failed to connect to MySQL: " . $mysqli->connect_error);
}

// Prepare the query
$stmt = $mysqli->prepare("INSERT INTO rank_table (name) VALUES (?)");

// Bind the parameter
$stmt->bind_param("s", $name);

// Execute the query
if ($stmt->execute()) {
    echo "Name added successfully";
} else {
    echo "Error adding name: " . $stmt->error;
}

// Close the statement and the connection
$stmt->close();
$mysqli->close();
?>
