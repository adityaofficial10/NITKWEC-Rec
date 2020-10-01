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
  
  function getDataFromSpreadsheet(){
     return axios.get('https://sheetdb.io/api/v1/6l02cg86oregw');
  }
  function clubEvents(agent)
  {
    const name=agent.parameters.name;
    return getDataFromSpreadsheet().then(res =>{
      res.data.map(event=>{
        if(event.title===name)
        { 
          agent.add('Here are the details for '+ name +':1.Venue-' + event.venue + ',2.Date-' + event.date +'\n'+ '.If you are interested in the event and yet to apply, please head over to:'+ event.apply);
        }
        
        });
    });
  }
  function getInfo(agent)
  {
    if(agent.parameters.why !== 'nothing')
      agent.add('Web Enthusiasts Club is an exclusive club of NITK.We conduct many activities related to Competitive Programming, Development and much more.It is a platform to take your skills to the next level');
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
  function calculate(agent)
  {
    const month=["january","february","march","april","may","june","july","august","september","october","november","december"];
    const value=agent.parameters.months;
    const str=value.toLowerCase();
    const index=month.indexOf(str);
    var stri=' ';
    console.log(index);
    var cnt=0;
    return getDataFromSpreadsheet().then(res =>{
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
  
  function welcome(agent) {
    if(agent.parameters.hello !== 'nothing')
    agent.add('Hi there! Greetings! How can I assist? If you want to enquire about a particular event, just tell me the name.');   
   
  }
 
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
  intentMap.set('Default Welcome Intent', welcome);
  intentMap.set('Default Fallback Intent', fallback);
  // intentMap.set('your intent name here', yourFunctionHandler);
  // intentMap.set('your intent name here', googleAssistantHandler);
  agent.handleRequest(intentMap);
});
