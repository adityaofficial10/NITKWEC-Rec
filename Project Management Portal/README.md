#NITK_WEC-REC:

##NITK Winter of Code Server:

#TaskID : Winter_of_Code_Server (Hard)

#Candidates: ADITYA R RUDRA and PRANAV JOSHI

#Introduction:

This task features replacement of raw SQL queries in the server using ORMs.
It involves interpretation of the schema and then the implementation of ORM to interact with database.

#Description:

We have used Sequelize ORM to replace the raw SQL queries which had been previously deployed in the server to interact with the database.  
Firstly, we started with interpretation of the GraphQL server and the database schema to have a better understanding of the task. Then, we studied Sequelize ORM in depth to understand more about queries and return values to client.
Finally, all the queries were replaced with corresponding Sequelize queries including transactions. Also, the configuration was updated.

#Technology Used: NodeJS, GraphQL, Sequelize, MySQL

#Individual Contributions:

#ADITYA R RUDRA:

#1.Interpretation of server and GraphQL Schema
#2.Understanding Sequelize implementation
#3.Writing Sequelize queries
#4.Establishing Sequelize Associations
#5.Implementing Unmanaged Transactions
#6.Checking return values to client
#7.Final Testing and Error Handling

#PRANAV JOSHI:

#1.Understanding raw SQL queries
#2.Understanding Sequelize ORM
#3.Sequelize Model Definition
#4.Writing Sequelize Queries
#5.Understanding SQL Transactions and implementing complex queries.
#6.Writing basic structure of Unmanaged Transactions


It was a great learning experience for both of us to work on this task, as we were complete newbies to the technologies used. It wouldn't have been possible without the great guidance provided my the mentors Adarsh Kamath and Saurabh Agarwala.

Thanks...

###Also please read Note(3) at the end of page before going to setup instructions.   

#References Used:
#1.Official GraphQL Documentation
#2.Sequelize ORM Documentation
#3.Using MySQL 
#4.Sequelize Github Issues Page
#5.StackOverflow


#Note:
#1.Some tables had been deprecated but still some queries using them were present. So, in agreement with the mentor, they have been left undisturbed.
#2.Since it was a hectic task to document all the code.Comments are far and few but enough for understanding the structure.
#3.Instead of updating the env file, directly go to server/config/models.js and specify the configuration of your host and database.So, skip the instruction (6) env file.
Also, you'll have to install sequelize first by using the command:
 'npm install sequelize' on the command line.


### Project Management Portal

Temporarily hosted at [https://woc-portal-demo.herokuapp.com/](https://woc-portal-demo.herokuapp.com/)

#### Installation and Setup

Please refer to the [wiki](https://github.com/woc-nitk/Project-Management-Portal/wiki) for Setup and List of current capabilites of the portal.


