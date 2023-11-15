
# Sample reference API call flows to handle Answering Machine Detection (AMD) and Beep Detection

## Set up

Copy or rename .env-example to .env<br>
Update parameters in .env file<br>
Have Node.js installed on your system, this application has been tested with Node.js version 16.15<br>
Install node modules with the command "npm install"<br>
Start application with the command "node amd-beep-detection"<br>

If you run this application locally on your computer, you may use ngrok and establish an https tunnel to local port 8000.

## How this application works

Open a web browser, then trigger an outgoing call with the web address where this application is running
https://<public_host_name>/call?number=<callee_phone_number>

for example:
https://myserver.mycompany.com:32000/call?number=12995550101
or
https://xxxx.ngrok.io/call?number=12995550101

After the Answer webhook (called number has answered the call), the application returns an NCCO, then optionally after each event webhook with specific status or sub_state values, the application may optionally return a new NCCO if needed for your application use case.

In this sample reference code, each returned NCCO contains "talk" action as illustration, your application can return any other valid actions in the returned NCCO.

Although this sample code has been written for using the Vonage Voice API Node.js SDK, the same call flows and returned NCCO contents would be the same with any other Vonage Voice API SDK programming language, including using direct API calls.


