const {
  dbQuery
} = require("../config/db");
const {
  GraphQLError
} = require("graphql");

const auth = require("../config/auth");
const modelsF = require("../config/models")

const checkOrgAdminOrg = async function(org_admin_id, org_id) {
  return modelsF.Org_Admin_Belongs_To.findAll({
    raw:true,
    attributes: ['org_admin_id'],
    where: {
      [Op.and]: [{
          org_admin_id: org_admin_id
        },
        {
          org_id: org_id
        }
      ]
    }
  }).then((data) =>
    data[0] ? true: false,
    (error)=> error
  ).catch((error) => {
    console.error(error);
  });
};

const checkOrgAdminMentor = async function(org_admin_id, mentor_id) {
  return modelsF.Org_Admin_Belongs_To.findAll({
    raw:true,
    attributes: ['org_admin_id'],
    where: {
      org_admin_id: org_admin_id
    },
    include: {
      model: modelsF.Mentor_Belongs_To,
      where: {
        mentor_id: mentor_id
      }
    }
  }).then(
    (data) => data[0]? true : false,
    (error)=>error
  ).catch((error) => {
    console.error(error);
  });
};

const getProjects = function(year, orgID, mentorID, applicantID) {
  if (
    orgID == null &&
    applicantID == null &&
    year == null &&
    mentorID != null
  )
    return modelsF.Mentored_By.findAll({
      raw:true,
      attributes:['project_id'],
      where:{
        mentor_id:mentorID
      }
    }).then(
      (data)=> data,
      (error)=> new GraphQLError(error)
    ).catch((error)=>{
      console.error(error);
    });
   else if (
    mentorID == null &&
    applicantID == null &&
    year == null &&
    orgID != null
  ) {

    return modelsF.Project.findAll({
      raw:true,
      attributes:['project_id'],
      include:{
        model:modelsF.Maintained_By,
        where:{
          org_id:orgID
        }
      }
    }).then(
      (data)=> data,
      (error) => new GraphQLError(error)
    ).catch((error)=>{
      console.error(error);
    });

  } else if (
    orgID == null &&
    mentorID == null &&
    year == null &&
    applicantID != null
  ) {
    return modelsF.Project.findAll({
      raw:true,
      attributes:['project_id'],
      include:{
        model:modelsF.Application,
        where:{
          applicant_id:applicantID,
          accepted:1
        }
      }
    }).then(
      (data)=> data,
      (error) => new GraphQLError(error)
    ).catch((error)=>{
      console.error(error);
    });

  } else if (
    orgID == null &&
    mentorID == null &&
    applicantID == null &&
    year != null
  ) {
    return modelsF.Project.findAll({
      raw:true,
      attributes:['project_id'],
      where:{
        absolute_year:year
      }
    }).then(
      (data) => data,
      (error) => new GraphQLError(error)
    ).catch((error)=>{
      console.error(error);
    });

  } else if (
    orgID == null &&
    mentorID == null &&
    applicantID == null &&
    year == null
  ) {
    const year_new = new Date().getFullYear();
    return modelsF.Project.findAll({
      raw:true,
      attributes:['project_id'],
      where:{
        absolute_year:year_new
      }
    }).then(
      (data) => data,
      (error) => new GraphQLError(error)
    ).catch((error)=>{
      console.error(error);
    });
  } else
    return new GraphQLError("Invalid arguments passed to Query projects");
};

const addProject = async function(
  name,
  work,
  deliverables,
  prerequisites,
  year,
  startDate,
  endDate,
  org_id,
  mentor_id,
  user
) {
  if (user.type == undefined || user.type == "applicant" || (user.type == "orgAdmin" && !((await checkOrgAdminOrg(user.id, org_id))))) {
    return new GraphQLError("Insufficient Permissions");
  }
  for (var i = 0; i < mentor_id.length; i++) {
    if (!(await checkOrgAdminMentor(user.id, mentor_id[i])))
      return new GraphQLError("Insufficient Permissions.");
  }
  if (year == null) year = new Date().getFullYear();

  const startTransaction = () => {
    return sequelize.transaction({
      autocommit: false
    }).then(
      (t) =>
      addProject(name, work, deliverables, year, startDate, endDate,t),
      (err) => new GraphQLError(err)
    ).catch((error) => {
      console.error(error);
    });
  };
  const addProject = (name, work, deliverables, year, startDate, endDate,t) => {


    const findProj = (t)=>{

         return modelsF.Project.findAll({
           raw:true,
  			 attributes:['project_id'],
  			 where:{
  				 project_name:name
  			 },
         transaction:t
  		   }).then(
         (data)=> data[0] ? true: false,
         (error)=>error
  		   ).catch((error)=>{
  			 console.error(error);
  		 });
     };

    const fetch_projectID = (t) =>{

      return modelsF.Project.findAll({
        raw:true,
      attributes:['project_id'],
      where:{
        project_name:name
      },
      transaction:t
      }).then(
      (data)=> data[0] ? data[0].project_id: -1,
      (error)=>error
      ).catch((error)=>{
      console.error(error);
    });
  };

  findProj().then(function(ok){
    fetch_projectID().then(function(projectID){
     if(ok)
     {
        modelsF.Project.create({
        project_id:projectID,
        work_to_be_done:work,
        project_name:name,
        deliverables:deliverables,
        absolute_year:year,
        project_start_date:startDate,
        project_end_date:endDate
      },{transaction:t}).then(
        (data)=> (data),
        (error) => new GraphQLError(error)
      ).catch((error)=>{
        console.error(error);
      });

      }
     else{
          modelsF.Project.create({
          work_to_be_done:work,
          project_name:name,
          deliverables:deliverables,
          absolute_year:year,
          project_start_date:startDate,
          project_end_date:endDate
        },{transaction:t}).then(
          (data)=> (data),
          (error) => new GraphQLError(error)
        ).catch((error)=>{
        console.error(error);
        });
      }
       }).catch((error)=>{
         console.error(error);
       });
     }).catch((error)=>{
       console.error(error);
     });
     return modelsF.Project.findAll({
       raw:true,
       where:{
         project_name:name,
         absolute_year:year
       },
       transaction:t
       }).then(
         (data) => addProjectToOrg(data[0].project_id, org_id,t),
         (error) => rollbackTransaction(error,t)
       ).catch((error)=>{
       console.error(error);
       });
  };

  const addProjectToOrg = (project_id, org_id,t) => {
    const year = new Date().getFullYear();
    return modelsF.Maintained_By.create({
      project_id: project_id,
      org_id: org_id,
      absolute_year: year
    },{transaction:t}).then(
      (data) => addMentorsToProject(project_id, mentor_id.length,t),
      (error) => rollbackTransaction(error,t)
    ).catch((error) => {
      console.error(error);
    });
  };
  const addMentorsToProject = (project_id, mentor_id_length,t) => {
    if (mentor_id_length > 0){

      const projectID = parseInt(project_id[project_id_length - 1]);
    const year = new Date().getFullYear();

    return modelsF.Mentored_By.create({
      project_id: projectID,
      mentor_id: mentor_id,
      absolute_year: year
    },{transaction:t}).then(
      (data) => addMentorsToProject(project_id, mentor_id_length - 1,t),
      (error) => rollbackTransaction(error,t)
    ).catch((error) => {
      console.error(error);
    });
  }
    else if (mentor_id_length == 0)
      return addPrerequisitesToProject(project_id, prerequisites.length,t);
  };
  const addPrerequisitesToProject = (project_id, prerequisites_length,t) => {
    if (prerequisites_length > 0)
      return modelsF.Prerequisite.create({
        project_id: project_id,
        prerequisites: prerequisites[prerequisites_length - 1]
      },{transaction:t}).then(
        (data) =>
        addPrerequisitesToProject(
          project_id,
          prerequisites_length - 1,
          t
        ),
			  (error) => rollbackTransaction(error,t)
			  ).catch((error) => {
          console.error(error);
        });

    else if (prerequisites_length == 0)
      return commitTransaction(project_id,t);
  };
  const commitTransaction = (project_id,t) => {
    return t.commit().then(
      (data) => {
        return {
          project_id: project_id
        };
      },
      (error) => new GraphQLError(error)
    ).catch((error) => {
      console.error(error);
    });
  };
  const rollbackTransaction = (error,t) => {
    return t.rollback().then(
      (data) => new GraphQLError(error),
      (error) => new GraphQLError(error)
    ).catch((error) => {
      console.error(error);
    });
  };
  return startTransaction();
};

const deleteProject = function(projectID) {
  const year = new Date().getFullYear();
  return modelsF.Project.destroy({
    where: {
      [Op.and]: [{
          project_id: projectID
        },
        {
          absolute_year: year
        }
      ]
    }
  }).then(
    (data) => Boolean(data),
    (error) =>  new GraphQLError(error)
  ).catch((error) => {
    console.error(error);
  });
};

const updateProject = function(
  projectID,
  name,
  work,
  deliverables,
  startDate,
  endDate
) {

  const startTransaction = () => {
    return sequelize.transaction({
      autocommit: false
    }).then(
      (t) => updateName(name,t),
      (err) => new GraphQLError(err)
    ).catch((error) => {
      console.error(error);
    });
  };
  const updateName = (name,t) => {
    if (name != null)
      return modelsF.Project.update({
        project_name: name
      }, {
        where: {
          project_id: projectID
        },
        transaction:t
      }).then(
        (data) => updateWork(work,t),
        (error) => rollbackTransaction(error,t)
      ).catch((error) => {
        console.error(error);
      });
    else return updateWork(work,t);
  };
  const updateWork = (work,t) => {
    if (work != null)
      return modelsF.Project.update({
        work_to_be_done: work
      }, {
        where: {
          project_id: projectID
        },
        transaction:t
      }).then(
        (data) => updateWork(work,t),
        (error) => rollbackTransaction(error,t)
      ).catch((error) => {
        console.error(error);
      });
    else return updateDeliverables(deliverables,t);
  };
  const updateDeliverables = (deliverables,t) => {
    if (deliverables != null)
      return modelsF.Project.update({
        deliverables: deliverables
      }, {
        where: {
          project_id: projectID
        },
        transaction:t
      }).then(
        (data) => updateStartDate(startDate,t),
        (error) => rollbackTransaction(error,t)
      ).catch((error) => {
        console.error(error);
      });
    else return updateStartDate(startDate,t);
  };
  const updateStartDate = (startDate,t) => {
    if (startDate != null)
      return modelsF.Project.update({
        project_start_date: startDate
      }, {
        where: {
          project_id: projectID
        },
        transaction:t
      }).then(
        (data) => updateEndDate(endDate,t),
        (error) => rollbackTransaction(error,t)
      ).catch((error) => {
        console.error(error);
      });
    else return updateEndDate(endDate,t);
  };
  const updateEndDate = (endDate,t) => {
    if (endDate != null)
      return modelsF.Project.update({
        project_end_date: endDate
      }, {
        where: {
          project_id: projectID
        },
        transaction:t
      }).then(
        (data) => commitTransaction(projectID,t),
        (error) => rollbackTransaction(error,t)
      ).catch((error) => {
        console.error(error);
      });
    else return commitTransaction(projectID,t);
  };
  const commitTransaction = (org_admin_id,t) => {
    return t.commit().then(
      (data) => {
        return {
          org_admin_id: org_admin_id
        };
      },
      (error) => new GraphQLError(error)
    ).catch((error) => {
      console.error(error);
    });
  };
  const rollbackTransaction = (error,t) => {
    return t.rollback().then(
      (data) => new GraphQLError(error),
      (error) => new GraphQLError(error)
    ).catch((error) => {
      console.error(error);
    });
  };
  return startTransaction();
};

const addPrerequisites = function(projectID, prerequisites) {
  const startFunction = (prerequisites_length) => {
    if (prerequisites_length > 0)
      return modelsF.Prerequisite.create({
        project_id: projectID,
        prerequisites: prerequisites[prerequisites_length - 1]
      }).then(
        (data) => startFunction(prerequisites - 1),
        (error) => new GraphQLError(error)
      ).catch((error) => {
        console.error(error);
      });
    else if (prerequisites_length == 0) return projectID;
  };
  return startFunction(prerequisites.length);
};

const removePrerequisites = function(projectID, prerequisites) {
  const startFunction = (prerequisites_length) => {
    if (prerequisites_length > 0)
      return modelsF.Prerequisite.destroy({
        where: {
          [Op.and]: [{
              project_id: projectID
            },
            {
              prerequisites: prerequisites[prerequisites_length - 1]
            }
          ]
        }
      }).then(
        (data) => startFunction(prerequisites - 1),
        (error) => new GraphQLError(error)
      ).catch((error) => {
        console.error(error);
      });
    else if (prerequisites_length == 0) return projectID;
  };
  return startFunction(prerequisites.length);
};

const ProjectsResolvers = {
  id: (parent) =>
    modelsF.Project.findAll({
      raw:true,
      attributes: ['project_id'],
      where: {
        project_id: parent.project_id
      }
    }).then((data) =>
      data[0] ? data[0].project_id : new GraphQLError("No such entry")
    ).catch((error) => {
      console.error(error);
    }),
  name: (parent) =>
    modelsF.Project.findAll({
      raw:true,
      attributes: ['project_name'],
      where: {
        project_id: parent.project_id
      }
    }).then((data) =>
      data[0] ? data[0].project_name : new GraphQLError("No such entry")
    ).catch((error) => {
      console.error(error);
    }),
  work: (parent) =>
    modelsF.Project.findAll({
      raw:true,
      attributes: ['work_to_be_done'],
      where: {
        project_id: parent.project_id
      }
    }).then((data) =>
      data[0] ? data[0].work_to_be_done : new GraphQLError("No such entry")
    ).catch((error) => {
      console.error(error);
    }),
  deliverables: (parent) =>
    modelsF.Project.findAll({
      raw:true,
      attributes: ['deliverables'],
      where: {
        project_id: parent.project_id
      }
    }).then((data) =>
      data[0] ? data[0].deliverables : new GraphQLError("No such entry")
    ).catch((error) => {
      console.error(error);
    }),
  prerequisites: (parent) =>
    modelsF.Prerequisite.findAll({
      raw:true,
      attributes: ['prerequisites'],
      where: {
        project_id: parent.project_id
      }
    }).then((data) =>
      data[0] ?
      data[0].prerequisites:
      new GraphQLError("No such entry")
    ).catch((error) => {
      console.error(error);
    }),
  absolute_year: (parent) =>
    modelsF.Project.findAll({
      raw:true,
      attributes: ['absolute_year'],
      where: {
        project_id: parent.project_id
      }
    }).then((data) =>
      data[0] ? data[0].absolute_year : new GraphQLError("No such entry")
    ).catch((error) => {
      console.error(error);
    }),
  project_start_date: (parent) =>
    modelsF.Project.findAll({
      raw:true,
      attributes: ['project_start_date'],
      where: {
        project_id: parent.project_id
      }
    }).then((data) =>
      data[0] ? data[0].project_start_date.toISOString().slice(0, 10) : new GraphQLError("No such entry")
    ).catch((error) => {
      console.error(error);
    }),
  project_end_date: (parent) =>
    modelsF.Project.findAll({
      raw:true,
      attributes: ['project_end_date'],
      where: {
        project_id: parent.project_id
      }
    }).then((data) =>
      data[0] ? data[0].project_end_date.toISOString().slice(0, 10) : new GraphQLError("No such entry")
    ).catch((error) => {
      console.error(error);
    }),
  organization: (parent) =>
    modelsF.Maintained_By.findAll({
      raw:true,
      attributes: ['org_id'],
      where: {
        project_id: parent.project_id
      }
    }).then((data) => (data[0] ? data[0] : new GraphQLError("No such entry"))).catch((error) => {
      console.error(error);
    }),
  mentors: (parent) =>
    modelsF.Mentored_By.findAll({
      raw:true,
      attributes: ['mentor_id'],
      where: {
        project_id: parent.project_id
      }
    }).then((data) => (data[0] ? data[0] : new GraphQLError("No such entry"))).catch((error) => {
      console.error(error);
    }),
  applications: (parent) =>
    modelsF.Application.findAll({
      raw:true,
      attributes: ['applicant_id', 'project_id'],
      where: {
        project_id: parent.project_id
      }
    }).then((data) => (data[0] ? data[0] : new GraphQLError("No such entry"))).catch((error) => {
      console.error(error);
    })


module.exports = {
  getProjects,
  addProject,
  deleteProject,
  updateProject,
  addPrerequisites,
  removePrerequisites,
  ProjectsResolvers,
};
