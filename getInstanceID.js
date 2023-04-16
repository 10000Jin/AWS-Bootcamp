
/*
fetch('http://169.254.169.254/latest/meta-data/instance-id')
    .then(response => response.text())
    .then(instanceId => console.log('Instance ID:', instanceId));
    .then(instanceId => {
        document.getElementById('instance-id').textContent = instanceId;
    });

fetch('http://169.254.169.254/latest/meta-data/placement/availability-zone')
    .then(response => response.text())
    .then(availabilityZone => {
        document.getElementById('availability-zone').textContent = availabilityZone;
    });
*/


/*
const { exec } = require("child_process");
//import exec from 'child_process';


// Execute ec2-metadata command to get instance ID
const command = exec('ec2-metadata -i');

command.stdout.on('data', (data) => {
  const instanceId = data.toString().trim().split(':')[1].trim();
  const element = document.getElementById('instance-id');
  if (element) {
    element.textContent = instanceId;
  }
});

command.stderr.on('data', (data) => {
  console.error(`Error: ${data}`);
});

command.on('close', (code) => {
  console.log(`ec2-metadata exited with code ${code}`);
});
*/

const AWS = require('aws-sdk');

const instanceId = AWS.MetadataService.request('/latest/meta-data/instance-id', (err, data) => {
  if (err) {
    console.error(err);
  } else {
    const element = document.getElementById('instance-id');
    if (element) {
      element.textContent = data;
    }
  }
});