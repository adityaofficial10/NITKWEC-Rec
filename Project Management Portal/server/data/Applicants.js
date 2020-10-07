const {
  GraphQLError
} = require("graphql");
const { dbQuery } = require("../config/db");
const auth = require("../config/auth");
const modelsF = require("../config/models");


const getApplicants = (year, user) => {
  if (user.type == "superAdmin") {
    if (year == null) year = new Date().getFullYear();
    return modelsF.Applicant.findAll({
      raw:true,
      attributes:['applicant_id'],
      where: {
        absolute_year: year
      }
    }).then(
      (data) => data,
      (error)=> error
    ).catch((err) => {
      console.error('error');
    });
  }
  return new GraphQLError("Insufficient permissions.");
};

const deleteApplicant = function(applicantID, user) {

  if (user.type == "superAdmin") {
    return modelsF.Applicant.destroy({
      where: {
        applicant_id: applicantID
      }
    }).then(
      (res) => Boolean(res),
      (error)=>new GraphQLError(error)
    ).catch((err) => {
      console.error(err);
    });
  }
  return new GraphQLError("Insufficient permissions.");
};


const addApplicant = function(
  reg_num,
  email,
  password,
  firstName,
  middleName,
  lastName,
  user
) {
  if (user.type == "superAdmin") {
    const year = new Date().getFullYear();
    password = auth.hash(password);
    modelsF.Applicant.create({
      first_Name: firstName,
      middle_Name: middleName,
      last_Name: lastName,
      applicant_id: req_num,
      email: email,
      applicant_year:year,
      applicant_password: password,
      absolute_year: year
    }).then(
      (data)=> data,
      (error) => new GraphQLError(error)
    ).catch((error)=>{
      console.error(error);
    });

    return modelsF.Applicant.findAll({
      raw:true,
      attributes: ['applicant_id'],
      where: {
        email: email,
        absolute_year: year
      }
    }).then(
      (data) => data[0],
      (error) => new GraphQLError(error)
    ).catch((error) => {
      console.error(error);
    });
  }
  return new GraphQLError("Insufficient permissions.");
};


const editApplicant = function(applicantID, email, password, user) {
  if (
    user.type == "superAdmin" ||
    (user.type == "applicant" && user.id == applicantID)
  ) {
    const year = new Date().getFullYear();
    modelsF.Applicant.update({
      email: email,
      applicant_password: password
    }, {
      where: {
        applicant_id: applicantID,
        absolute_year: year
      }
    }).then(
      (data) => data,
      (error) => new GraphQLError(error)
    );
    return modelsF.Applicant.findAll({
      raw:true,
      attributes: ['applicant_id'],
      where: {
        applicant_id: applicantID
      }
    }).then(
      (data) => data[0],
      (error) => new GraphQLError(error)
    ).catch((error) => {
      console.error(error);
    });
  }
  return new GraphQLError("Insufficient permissions.");
};


var ApplicantResolvers = {
  id: (parent) =>
    modelsF.Applicant.findAll({
      raw:true,
      attributes: ['applicant_id'],
      where: {
        applicant_id: parent.applicant_id
      }
    }).then((data) =>
      data[0] ? data[0].applicant_id : new GraphQLError("No such entry")
    ).catch((error) => {
      console.error(error);
    }),
  email: (parent) =>
    modelsF.Applicant.findAll({
      raw:true,
      attributes: ['email'],
      where: {
        applicant_id: parent.applicant_id
      }
    }).then((data) =>
      data[0] ? data[0].email : new GraphQLError("No such entry")
    ).catch((error) => {
      console.error(error);
    }),
  first_name: (parent) =>
    modelsF.Applicant.findAll({
      raw:true,
      attributes: ['first_Name'],
      where: {
        applicant_id: parent.applicant_id
      }
    }).then((data) =>
      data[0] ? data[0].first_Name : new GraphQLError("No such entry")
    ).catch((error) => {
      console.error(error);
    }),
  middle_name: (parent) =>
    modelsF.Applicant.findAll({
      raw:true,
      attributes: ['middle_Name'],
      where: {
        applicant_id: parent.applicant_id
      }
    }).then((data) =>
      data[0]? data[0].middle_Name : new GraphQLError("No such entry")
    ).catch((error) => {
      console.error(error);
    }),

  last_name: (parent) =>
    modelsF.Applicant.findAll({
      raw:true,
      attributes: ['last_Name'],
      where: {
        applicant_id: parent.applicant_id
      }
    }).then((data) =>
      data[0] ? data[0].last_Name : new GraphQLError("No such entry")
    ).catch((error) => {
      console.error(error);
    }),

  applicant_year: (parent) =>
    modelsF.Applicant.findAll({
      raw:true,
      attributes: ['applicant_year'],
      where: {
        applicant_id: parent.applicant_id
      }
    }).then((data) =>
      data[0] ? data[0].applicant_year : new GraphQLError("No such entry")
    ).catch((error) => {
      console.error(error);
    }),
  absolute_year: (parent) =>
  modelsF.Applicant.findAll({
    raw:true,
    attributes: ['absolute_year'],
    where: {
      applicant_id: parent.applicant_id
    }
  }).then((data) =>
    data[0] ? data[0].absolute_year : new GraphQLError("No such entry")
  ).catch((error) => {
    console.error(error);
  }),

  applications: (parent) =>
    modelsF.Application.findAll({
      raw:true,
      attributes:['applicant_id','project_id'],
      where:{
        applicant_id:parent.applicant_id
      }
    }).then((data) =>
     data[0] ? data: new GraphQLError("No such entry")
   ).catch((error)=>{
     console.error(error);
   })
};

module.exports = {
  getApplicants,
  deleteApplicant,
  addApplicant,
  editApplicant,
  ApplicantResolvers
};
