<?php
header('Content-Type: application/json');

$servername = "fb-db-17.cwunrkwgelkc.us-east-1.rds.amazonaws.com";
$username = "manjin";
$password = "12341234";
$dbname = "immersionday";

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);
//$conn = mysqli_connect($servername, $username, $password);
//if(mysqli_connect_errno()) echo "Failed to connect to MySQL: " . mysqli_connect_error();
//$database = mysqli_select_db($connection, $dbname);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}


$sql = "SELECT name, point, creation FROM rank_table ORDER BY point ASC";
$result = $conn->query($sql);

$data = array();

// Loop through the results and add them to the array
if ($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        $data[] = $row;
    }
}

// Close the connection
$conn->close();

// Convert the array to a JSON object and return it
echo json_encode($data);
?>
