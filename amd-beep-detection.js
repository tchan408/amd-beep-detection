'use strict'

//-------------

require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser')
const app = express();

const serviceNumber = process.env.SERVICE_PHONE_NUMBER;

// ------------------

const Vonage = require('@vonage/server-sdk');

const options = {
  debug: true,
  // apiHost: "api-ap-3.vonage.com"  // make sure this matches what is set for the application in the dashboard (dashboard.nexmo.com)
  // apiHost: "api-ap-4.vonage.com"  // make sure this matches what is set for the application in the dashboard (dashboard.nexmo.com)
  // apiHost: "api-eu-3.vonage.com"  // make sure this matches what is set for the application in the dashboard (dashboard.nexmo.com)
  // apiHost: "api-eu-4.vonage.com"  // make sure this matches what is set for the application in the dashboard (dashboard.nexmo.com)
  apiHost: "api-us-3.vonage.com"  // make sure this matches what is set for the application in the dashboard (dashboard.nexmo.com)
  // apiHost: "api-us-4.vonage.com"  // make sure this matches what is set for the application in the dashboard (dashboard.nexmo.com)
};

const vonage = new Vonage({
  apiKey: process.env.API_KEY,
  apiSecret: process.env.API_SECRET,
  applicationId: process.env.APP_ID,
  privateKey: './.private.key'
}, options);


//==========================================================

app.use(bodyParser.json());

//-------

// to simulate placing an outbound call, open a web browser and enter
// https://<server>/call?number=<phone_number>

console.log('https://<server>/call?number=<phone_number>');

//---

app.get('/call', (req, res) => {

  const hostName = `${req.hostname}`;

  console.log('called number:', req.query.number);
  console.log('caller number:', serviceNumber);

  vonage.calls.create({
    to: [{
      type: 'phone',
      number: req.query.number
      }],
    from: {
      type: 'phone',
      number: serviceNumber
      },
    advanced_machine_detection: {
      "behavior": "continue",
      "mode": "default",  // use this value for the latest AMD implementation
      // "mode": "detect_beep",
      "beep_timeout": 45
    },
    ringing_timer: 70,
    answer_url: ['https://' + hostName + '/answer1'],
    answer_method: 'GET',
    event_url: ['https://' + hostName + '/event1'],
    }, (err, res) => {
     if(err)  { 
              console.error('Outgoing call error:', err);
              console.log('error:', err.body.invalid_parameters); 
              }
     else { console.log('Outgoing call status:', res); }

  });

  res.status(200).send('Ok');
});

//-----------        

app.get('/answer1', (req, res) => {

    const uuid = req.query.uuid; 

    const nccoResponse = [
        {
          "action": "talk",
          "text": "Hello, this is a test call for beep detection. This is a test message from your preferred provider. This is a friendly reminder for your appointment tomorrow at 3 pm. Please do not forget to bring your ID and arrive 15 minutes before your appointment.",
          "language": "en-US",
          "style": 0
        }
      ];

    res.status(200).json(nccoResponse);

});

//--------

app.post('/event1', (req, res) => {

  let nccoResponse = null;

  //-- You may uncomment this section
  // //-- AMD returns status machine 
  // if (req.body.status == "machine") {
  //   console.log('>>> /event1 status: "machine"');
  //   nccoResponse = [
  //     {
  //       "action": "talk",
  //       "text": "Status machine has been detected. Generally, in real deployment, no new message would be played on this event.",
  //       "language": "en-US",
  //       "style": 0
  //     }
  //   ];
  // };

  //-- You may uncomment this section
  // //-- AMD returns status machine 
  // if (req.body.status == "machine" && req.body.sub_state == undefined) {
  //   console.log('>>> /event1 status: "machine"');
  //   nccoResponse = [
  //     {
  //       "action": "talk",
  //       "text": "Status machine has been detected. Generally, in real deployment, no new message would be played on this event.",
  //       "language": "en-US",
  //       "style": 0
  //     }
  //   ];
  // };

  //-- You may uncomment this section
  // //-- AMD returns status human
  // if (req.body.status == "human") {
  //   console.log('>>> /event1 status: "human"');
  //   nccoResponse = [
  //     {
  //       "action": "talk",
  //       "text": "Status human has been detected. Generally, in real deployment, no new message would be played on this event.",
  //       "language": "en-US",
  //       "style": 0
  //     }
  //   ];
  // };

  //-- Beep detected
  if (req.body.status == "machine" && req.body.sub_state == "beep_start") {
    console.log('>>> /event1 status: "machine", sub_state: "beep_start"');
    nccoResponse = [
      {
        "action": "talk",
        "text": "Beep has been detected. This is the voice message for the recipient",
        "language": "en-US",
        "style": 0
      }
    ];
  }

  //-- You may uncomment this section
  // //-- No beep detected after timeout to detect beep has expired
  // if (req.body.status == "machine" && req.body.sub_state == "beep_timeout") {
  //   console.log('>>> /event1 status: "machine", sub_state: "beep_timeout"');
  //   nccoResponse = [
  //     {
  //       "action": "talk",
  //       "text": "No beep has been detected. Generally, in real deployment, no new message would be played on this event.",
  //       "language": "en-US",
  //       "style": 0
  //     }
  //   ];
  // };

  if (nccoResponse) {
    res.status(200).json(nccoResponse);
  } else {
    res.status(200).send('Ok');
  }  

});

//-----------        

//-- This is a placeholder action to handle possible incoming calls - in case someome calls back
//-- the Vonage number used as caller number on outbound calls.

//-- This is not really related to the AMD/Beep detection handling with outbound calls

//-- The path here should match the Answer webhook URL and HTTP method as set in your application in
//-- your dashboard (dashboard.nexmo.com)

app.get('/answer', (req, res) => {

    const nccoResponse = [
        {
          "action": "talk",
          "text": "Hello and good bye!",
          "language": "en-US",
          "style": 0
        }
      ];

    res.status(200).json(nccoResponse);

});

//=========================================


const port = process.env.PORT || 8000;

app.listen(port, () => console.log(`Server application listening on port ${port}!`));

//------------
