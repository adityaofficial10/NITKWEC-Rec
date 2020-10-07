const {
  GraphQLError
} = require("graphql");

const { dbQuery } = require("../config/db");
const auth = require("../config/auth");
const modelsF = require("../config/models");


const checkProjectOrg = (project_id, org_admin_id) => {
  return modelsF.Maintained_By.findAll({
    raw:true,
		attributes:['project_id'],
		where:{
			 project_id: project_id
		},
  include: {
    model: Org_Admin_Belongs_To,
    where: {
		  org_admin_id: org_admin_id
    }
  }
}).then((data) =>
    data[0] ? true : false
  ).catch((error) => {
	console.error(error);
});
};

const checkProjectMentor = (project_id, mentor_id) => {

  return modelsF.Mentored_By.findAll({
    raw:true,
    attributes: ['project_id'],
    where: {
      project_id: project_id,
      mentor_id: mentor_id
    }
  }).then((data) =>
    data[0] ? true : false
  ).catch((error) => {
    console.log(error);
  });
};

const getApplications = async function(
  year,
  projectID,
  orgID,
  applicantID,
  user
) {
  if (
    orgID == null &&
    applicantID == null &&
    year == null &&
    projectID != null &&
    ((user.type == "orgAdmin" && checkProjectOrg(projectID, user.id)) ||
      (user.type == "mentor" && checkProjectMentor(projectID, user.id)) ||
      (await user.type) == "superAdmin")
  ) {
    return modelsF.Application.findAll({
      raw:true,
      attributes: ['applicant_id', 'project_id'],
      where: {
        project_id: projectID
      }
    }).then(
      (data) => data,
      (error) => new GraphQLError(error)
    ).catch((error) => {
      console.error(error);
    });

  } else if (
    projectID == null &&
    applicantID == null &&
    year == null &&
    orgID != null &&
    user.type !== "applicant" &&
    user.type !== "mentor"
  ) {
    return dbQuery("CALL get_applications_by_org(?)", [orgID]).then(
      (data) => data,
      (error) => new GraphQLError(error)
    );
  } else if (
    orgID == null &&
    projectID == null &&
    year == null &&
    applicantID != null &&
    (user.type == "superAdmin" ||
      (user.type == "applicant" && user.id == applicantID))
  ) {
    modelsF.Application.findAll({
      raw:true,
      attributes:['applicant_id','project_id'],
      where:{
        applicant_id:parent.applicant_id
      }
    }).then((data) =>
     data[0] ? data : new GraphQLError("No such entry")
   ).catch((error)=>{
     console.error(error);
   });
  } else if (
    orgID == null &&
    projectID == null &&
    applicantID == null &&
    year != null &&
    user.type == "superAdmin"
  ) {
    return modelsF.Application.findAll({
      raw:true,
      attributes: ['project_id', 'applicant_id'],
      where: {
        absolute_year: year,
        accepted: {
          [Op.ne]: null
        }
      }
    }).then(
      (data) => data,
      (error) => new GraphQLError(error)
    ).catch((error) => {
      console.error(error);
    });
  } else
    return new GraphQLError(
      "Invalid arguments passed to Query applications"
    );
};

const addApplication = async function(projectID, applicantID, proposal, user) {
  if (
    (user.type == "applicant" && user.id == applicantID) ||
    (user.type == "orgAdmin" && await checkProjectOrg(projectID, user.id)) ||
    user.type == "superAdmin"
  ) {
    const year = new Date().getFullYear();
    modelsF.Application.create({
      project_id: projectID,
      applicant_id: applicantID,
      proposal: proposal,
      absolute_year: year
    }).then(
      (data) => data,
      (error) => error
    ).catch((error) => {
      console.error(error);
    });
    return modelsF.Application.findAll({
      raw:true,
      attributes: ['applicant_id', 'project_id'],
      where: {
        applicant_id: applicantID,
        project_id: projectID
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

const deleteApplication = async function (projectID, applicantID, user) {
	if (
		(user.type == "applicant" && user.id == applicantID) ||
		(user.type == "orgAdmin" && checkProjectOrg(projectID, user.id)) ||
		(await user.type) == "superAdmin"
	) {

    return modelsF.Application.destroy({
      where:{
        applicant_id:applicantID,
        project_id:projectID
      }
    }).then(
      (data)=>Boolean(data),
      (error)=>new GraphQLError(error)
    ).catch((error)=>{
      console.error(error);
    });

	}
	return new GraphQLError("Insufficient permissions.");
};

const updateProposal = function (applicantID, projectID, proposal, user) {
	if (user.type == "applicant" && user.id == applicantID) {
    const year=new Date().getFullYear();
    modelsF.Application.update({
      proposal:proposal
    },
    {
      where:{
        applicant_id:applicantID,
        project_id:projectID,
        absolute_year:year
      }
    }).then(
      (data)=>data,
      (error)=>error
    ).catch((error)=>{
      console.error(error);
    });
    return modelsF.Application.findAll({
      raw:true,
      attributes:['project_id','applicant_id'],
      where:{
        project_id:projectID,
        applicant_id:applicantID
      }
    }).then(
			(data) => data[0],
			(error) => new GraphQLError(error)
		).catch((error)=>{
      console.error(error);
    });

	}
	return new GraphQLError("Insufficient permissions.");
};

const acceptorRejectApplication = async function (
	projectID,
	applicantID,
	accept,
	user
) {
	if (
		(user.type == "mentor" && await checkProjectMentor(projectID, user.id)) ||
		(user.type == "orgAdmin" && await checkProjectOrg(projectID, user.id)) ||
		(await user.type) == "superAdmin"
	) {
		const year = new Date().getFullYear();
		if(accept) accept = 1; else accept = 0;

    modelsF.Application.update({
      accepted:accept
    },
    {
      where:{
        project_id:projectID,
        applicant_id:applicantID,
        absolute_year:year
      }
    }).then(
      (data)=>data,
      (error)=>error
    ).catch((error)=>{
      console.error(error);
    });
    return modelsF.Application.findAll({
      raw:true,
      attributes:['project_id','applicant_id'],
      where:{
        applicant_id:applicantID,
        project_id:projectID
      }
    }).then(
			(data) => data[0],
			(error) => new GraphQLError(error)
		).catch((error)=>{
      console.error(error);
    });
	}
	return new GraphQLError("Insufficient permissions.");
};


const passApplication = async function (projectID, applicantID, result, user) {
	if (
		(user.type == "mentor" && checkProjectMentor(projectID, user.id)) ||
		(user.type == "orgAdmin" && checkProjectOrg(projectID, user.id)) ||
		(await user.type) == "superAdmin"
	) {
		const year = new Date().getFullYear();
    modelsF.Application.update({
      result:result
    },
    {
      where:{
        applicant_id:applicantID,
        project_id:projectID,
        absolute_year:year,
        accepted:1
      }
    }).then(
      (data)=>data,
      (error)=>error
    ).catch((error)=>{
      console.error(error);
    });
    return modelsF.Application.findAll({
      raw:true,
      attributes:['project_id','applicant_id'],
      where:{
        project_id:projectID,
        applicant_id:applicantID
      }
    }).then(
			(data) => data[0],
			(error) => new GraphQLError(error)
		).catch((error)=>{
      console.error(error);
    });
	}
	return new GraphQLError("Insufficient permissions.");
};

const ApplicationResolvers = {

  applicant: (parent) =>
    modelsF.Application.findAll({
      raw:true,
      attributes:['applicant_id'],
      where:{
        applicant_id:parent.applicant_id,
        project_id:parent.project_id
      }
    }).then(
      (data) => (data ? data : new GraphQLError("No such entry"))
    ).catch((error)=>{
      console.error(error);
    }),

	project: (parent) =>
		{
      console.log("-----PARENT-----"); console.log(parent); console.log("-----");
      return modelsF.Application.findAll({
        raw:true,
        attributes:['project_id'],
        where:{
          applicant_id:parent.applicant_id,
          project_id:parent.project_id
        }
      }).then(
        (data) => (data ? data : new GraphQLError("No such entry"))
      ).catch((error)=>{
        console.error(error);
      });
  },
	accepted: (parent) =>

    modelsF.Application.findAll({
      raw:true,
      attributes:['accepted'],
      where:{
        applicant_id:parent.applicant_id,
        project_id:parent.project_id
      }
    }).then((data) =>
			data[0] ? data[0].accepted : new GraphQLError("No such entry")
		).catch((error)=>{
      console.error(error);
    }),

	result: (parent) =>

    modelsF.Application.findAll({
      raw:true,
      attributes:['result'],
      where:{
        applicant_id:parent.applicant_id,
        project_id:parent.project_id
      }
    }).then((data) =>
			data[0] ? data[0].result : new GraphQLError("No such entry")
		).catch((error)=>{
      console.error(error);
    }),
	absolute_year: (parent) =>

    modelsF.Application.findAll({
      raw:true,
    attributes:['absolute_year'],
    where:{
      applicant_id:parent.applicant_id,
      project_id:parent.project_id
    }
    }).then((data) =>
    data[0] ? data[0].absolute_year : new GraphQLError("No such entry")
    ).catch((error)=>{
    console.error(error);
    }),

	proposal: (parent) =>

    modelsF.Application.findAll({
      raw:true,
    attributes:['proposal'],
    where:{
      applicant_id:parent.applicant_id,
      project_id:parent.project_id
    }
  }).then((data) =>
    data[0] ? data[0].proposal : new GraphQLError("No such entry")
  ).catch((error)=>{
    console.error(error);
  })
};

module.exports = {
	getApplications,
	addApplication,
	deleteApplication,
	acceptorRejectApplication,
	passApplication,
	updateProposal,
	ApplicationResolvers
};
