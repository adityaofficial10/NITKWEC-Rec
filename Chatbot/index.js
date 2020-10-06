//Made by:Aditya R Rudra
//Dept of CSE


// See https://github.com/dialogflow/dialogflow-fulfillment-nodejs
// for Dialogflow fulfillment library docs, samples, and to report issues
'use strict';
 
const functions = require('firebase-functions');
const {WebhookClient} = require('dialogflow-fulfillment');
const {Card, Suggestion} = require('dialogflow-fulfillment');
const axios=require('axios');

process.env.DEBUG = 'dialogflow:debug'; // enables lib debugging statements
 
exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {
  const agent = new WebhookClient({ request, response });
  console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
  console.log('Dialogflow Request body: ' + JSON.stringify(request.body));
  
 //These functions are deployed to fetch realtime data from the spreadsheets related to Club Events and Members.Although members functionality is not yet used but has been implemented.
  function getDataFromSpreadsheet1(){
     return axios.get('https://sheetdb.io/api/v1/6l02cg86oregw');
  }
  function getDataFromSpreadsheet2(){
     return axios.get('https://sheetdb.io/api/v1/tl3emr4k277kz');
  }
 
 //The function to fetch real time data of the requested event from the spreadsheet 
  function clubEvents(agent)
  {
    const name=agent.parameters.name;
    return getDataFromSpreadsheet1().then(res =>{
      res.data.map(event=>{
        if(event.title===name)
        { 
          agent.add('Here are the details for '+ name +':1.Venue-' + event.venue + ',2.Date-' + event.date +'\n'+ '.If you are interested in the event and yet to apply, please head over to:'+ event.apply);
        }
        
        });
    });
  }
 //The function to return a variety of general information related to the club as required by the user
  function getInfo(agent)
  {
    if(agent.parameters.why !== 'nothing')
      agent.add('Web Enthusiasts Club is an exclusive club of NITK.We conduct many activities related to Competitive Programming, Development and much more.It is a platform to take your skills to the next level. If you want to join, then check out the recruitment drive.');
    if(agent.parameters.post !== 'nothing')
    {
      var post=agent.parameters.post;
      post=post.toUpperCase();
      if(post==='HEAD'||post==='HEADS'||post==='CONVENER')
      agent.add('The convener of the club is Mr. Vilas Bhat');
    }
    if(agent.parameters.when !== 'nothing')
      agent.add('The club was established in 2000.');
    if(agent.parameters.purpose !== 'nothing')
      agent.add('The club was started to promote algorithmic thinking and open source development.It strives to improve the open source culture in the institute.');
  }
 //The function calculates number of events scheduled in a month as specified by the user.This is just a sample which shows that the chatbot can interpret the realtime data properly.
  function calculate(agent)
  {
    const month=["january","february","march","april","may","june","july","august","september","october","november","december"];
    const value=agent.parameters.months;
    const str=value.toLowerCase();
    const index=month.indexOf(str);
    var stri=' ';
    console.log(index);
    var cnt=0;
    return getDataFromSpreadsheet1().then(res =>{
      res.data.map(event=>{
        var dateval=new Date(event.date);
        console.log(dateval.getMonth());
        if(dateval.getMonth()===index)
        {
          cnt++;
          stri=stri.concat(event.title + ', ');
        }
        });
        if(cnt)
        {
          agent.add('There are currently '+ cnt + ' events scheduled in the month of '+ value + '. They are: ' + stri + ' If you want to enquire about an event, just tell me its name.');
        }
        else
          agent.add('There are no events scheduled for this month.');
    });
  }
 
 //The function which calculates member data(not used yet)
  function calcmembers(){
    var cnt=0;
    return getDataFromSpreadsheet2().then((res)=>{
      res.data.map((event)=>{
        if(event.id)
          cnt++;
      });
      agent.add('There are currently '+cnt+' members in the club.');
    });
  }
 
 //The function returning general information about members
  function memberinfo(agent){
    if(agent.parameters.members !== 'nothing')
      agent.add('Thanks for your interest in Web Enthusiasts Club. We have got a lot of people onboard, who work on a wide array of projects. Want to be one of them? Then, join the recruitment drive and show off your skills... ,For more information on members like count and contact info, check the clubs team page:https://webclub.nitk.ac.in/team ');
  }
 
 //The function which reveals application details to the user regarding registration,etc.
  function applyfunction(agent){
    if(agent.parameters.apply !== 'nothing')
      agent.add('Thanks for your interest in WEC.If you want to apply for an event, then head over to: https://webclub.nitk.ac.in/events ..If you want to check out the recruitment process, go to:  https://github.com/WebClub-NITK/DSC-NITK-Recruitments-2020..., If you want to enquire about a particular event, just tell me the name.');
    else
      agent.add('Sorry, I couldnt understand what you said. Try it another way...');
  }
  
 //The function returns general information about upcoming events and asks the user if it wants to enquire about a particular event.
  function upcomingEvent(agent)
  {
    if(agent.parameters.event !== 'nothing')
      agent.add('Thanks for your interest in Web Enthusiasts Club.There is a lot going on here. If you want to attend a particular event,check out our events page for more information: https://webclub.nitk.ac.in/events,,,Or, If you want to enquire about a particular event, just tell me the name.');
    else
      agent.add('Sorry, I couldnt get what you said.. Can you rephrase that?');
  }
 
 //The default welcome intent
  function welcome(agent) {
    if(agent.parameters.hello !== 'nothing')
    agent.add('Hi there! Greetings! How can I assist? If you want to enquire about a particular event, just tell me the name.');   
   
  }
 
 //The default fallback intent
  function fallback(agent) {
    agent.add(`I didn't understand`);
    agent.add(`I'm sorry, can you try again?`);
  }

  // // Uncomment and edit to make your own intent handler
  // // uncomment `intentMap.set('your intent name here', yourFunctionHandler);`
  // // below to get this function to be run when a Dialogflow intent is matched
  // function yourFunctionHandler(agent) {
  //   agent.add(`This message is from Dialogflow's Cloud Functions for Firebase editor!`);
  //   agent.add(new Card({
  //       title: `Title: this is a card title`,
  //       imageUrl: 'https://developers.google.com/actions/images/badges/XPM_BADGING_GoogleAssistant_VER.png',
  //       text: `This is the body text of a card.  You can even use line\n  breaks and emoji! 💁`,
  //       buttonText: 'This is a button',
  //       buttonUrl: 'https://assistant.google.com/'
  //     })
  //   );
  //   agent.add(new Suggestion(`Quick Reply`));
  //   agent.add(new Suggestion(`Suggestion`));
  //   agent.setContext({ name: 'weather', lifespan: 2, parameters: { city: 'Rome' }});
  // }

  // // Uncomment and edit to make your own Google Assistant intent handler
  // // uncomment `intentMap.set('your intent name here', googleAssistantHandler);`
  // // below to get this function to be run when a Dialogflow intent is matched
  // function googleAssistantHandler(agent) {
  //   let conv = agent.conv(); // Get Actions on Google library conv instance
  //   conv.ask('Hello from the Actions on Google client library!') // Use Actions on Google library
  //   agent.add(conv); // Add Actions on Google library responses to your agent's response
  // }
  // // See https://github.com/dialogflow/fulfillment-actions-library-nodejs
  // // for a complete Dialogflow fulfillment library Actions on Google client library v2 integration sample

  // Run the proper function handler based on the matched Dialogflow intent name
  let intentMap = new Map();
  intentMap.set('Club Events.',clubEvents);
  intentMap.set('General Information',getInfo);
  intentMap.set('Event Calculation',calculate);
  intentMap.set('Members',memberinfo);
  intentMap.set('Apply',applyfunction);
  intentMap.set('Upcoming Events',upcomingEvent);
  intentMap.set('Default Welcome Intent', welcome);
  intentMap.set('Default Fallback Intent', fallback);
  // intentMap.set('your intent name here', yourFunctionHandler);
  // intentMap.set('your intent name here', googleAssistantHandler);
  agent.handleRequest(intentMap);
});

