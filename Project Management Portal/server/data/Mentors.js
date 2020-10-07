const {
  GraphQLError
} = require("graphql");
const { dbQuery } = require("../config/db");
const auth = require("../config/auth");
const modelsF = require('../config/models');

const checkOrgAdminOrg = async function(org_admin_id, org_id) {

  modelsF.Org_Admin_Belongs_To.findAll({
    raw:true,
    attributes: ['org_admin_id'],
    where: {
      org_admin_id: org_admin_id,
      org_id: org_id
    }
  }).then(
    (data) => data[0] ? true : false
  ).catch((error) => {
    console.error(error);
  });
};

const checkOrgAdminMentor = async function(org_admin_id, mentor_id) {
  modelsF.Org_Admin_Belongs_To.findAll({
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
  }).then((data) =>
    data[0] ? true : false
  ).catch((error) => {
    console.error(error);
  });
};

const checkOrgAdminProject = async function(org_admin_id, project_id) {

  const check = (project_id_length) => {
    if (project_id_length > 0)
      {
        return modelsF.Org_Admin_Belongs_To.findAll({
          raw:true,
          attributes: ['org_admin_id'],
          where: {
            org_admin_id: org_admin_id
          },
          include: {
            model: modelsF.Maintained_By,
            where: {
              project_id: project_id[project_id_length - 1]
        }
      }
      }).then((data) =>
         data[0] ? check(project_id_length - 1):false
      ).catch((error) => {
          console.error(error);
      });
    }
   else if (project_id_length == 0) return true;
};

return check(project_id.length);
};

const getMentors = async function(year, orgID, user) {
  if (user.type == "orgAdmin" || user.type == "superAdmin") {
    if (year == null) year = new Date().getFullYear();
    return dbQuery("CALL get_mentors_by_org(?)", [orgID]).then((data) => data);
  } else return new GraphQLError("Insufficient permissions");
};

const addMentor = async function(reg_num, email, password, name, org_id, user) {
  if (!((user.type == "orgAdmin" && org_id.length == 1 && await checkOrgAdminOrg(user.id, org_id)) || user.type == "superAdmin")) {
    console.log(user);
    return new GraphQLError("Insufficient permissions.");
  }
  const year = new Date().getFullYear();
  password = auth.hash(password);

  const startTransaction = () => {
    return sequelize.transaction({
      autocommit: false
    }).then(
      (t) => addMentorToMentors1(email, name, password, year, t),
      (err) => new GraphQLError(err)
    ).catch((error) => {
      console.error(error);
    });
  };
  const addMentorToMentors1 = (email, name, password, year, t) => {

    return modelsF.Mentor.create({
      mentor_id: reg_num,
      email: email,
      mentor_name: name,
      mentor_password: password,
      absolute_year: year
    }, {
      transaction: t
    }).then(
      (data) => addMentorToMentors2(email, name, password, year, t),
      (error) => rollbackTransaction(error, t)
    ).catch((error) => {
      console.error(error);
    });
  };

  const addMentorToMentors2 = (email, name, password, year, t) => {

    return modelsF.Mentor.findAll({
      raw:true,
      attributes: ['mentor_id'],
      where: {
        email: email,
        absolute_year: year
      },
      transaction: t
    }).then(
      (data) => addMentorOrgs(data[0].mentor_id, org_id.length, t),
      (error) => rollbackTransaction(error, t)
    ).catch((error) => {
      console.error(error);
    });
  };

  const addMentorOrgs = (mentor_id, org_id_length, t) => {
    if (org_id_length > 0) {
      const orgID = parseInt(org_id[org_id_length - 1]);
      const year = new Date().getFullYear();
      return modelsF.Mentor_Belongs_To.create({
        mentor_id: mentor_id,
        org_id: orgID,
        absolute_year: year
      }, {
        transaction: t
      }).then(
        (data) => addMentorOrgs(mentor_id, org_id_length - 1, t),
        (error) => rollbackTransaction(error, t)
      ).catch((error) => {
        console.error(error);
      });
    } else if (org_id_length == 0) return commitTransaction(mentor_id, t);
  };
  const commitTransaction = (mentor_id, t) => {
    return t.commit().then(
      (data) => {
        return {
          mentor_id: mentor_id
        };
      },
      (error) => new GraphQLError(error)
    ).catch((error) => {
      console.error(error);
    });
  };
  const rollbackTransaction = (error, t) => {
    return t.rollback().then(
      (data) => new GraphQLError(error),
      (error) => new GraphQLError(error)
    ).catch((error) => {
      console.error(error);
    });
  };
  return startTransaction();
};

const deleteMentor = async function(mentorID, user) {
  if (!((user.type == "orgAdmin" && await checkOrgAdminMentor(user.id, mentorID)) || user.type == "superAdmin")) {
    return new GraphQLError("Insufficient permissions.");
  }
  return modelsF.Mentor.destroy({
    where: {
      mentor_id: mentorID
    }
  }).then(
    (data) => Boolean(data),
    (error) => new GraphQLError(error)
  ).catch((error) => {
    console.error(error);
  });
};

const addMentorToOrg = async function(mentor_id, org_id, user) {
  if (!((user.type == "orgAdmin" && org_id.length == 1 && await checkOrgAdminOrg(user.id, org_id)) || user.type == "superAdmin")) {
    return new GraphQLError("Insufficient permissions.");
  }
  const startFunction = (org_id_length) => {
    if (org_id_length > 0) {
      const orgID = parseInt(org_id[org_id_length - 1]);
      const year = new Date().getFullYear();

      return modelsF.Mentor_Belongs_To.create({
        mentor_id: mentor_id,
        org_id: orgID,
        absolute_year: year
      }).then(
        (data) => startFunction(org_id_length - 1),
        (error) => new GraphQLError(error)
      ).catch((error) => {
        console.error(error);
      });
    } else if (org_id_length == 0) return mentor_id;
  };
  return startFunction(org_id.length);
};

const removeMentorFromOrg = async function(mentor_id, org_id, user) {
  if (!((user.type == "orgAdmin" && org_id.length == 1 && await checkOrgAdminOrg(user.id, org_id)) || user.type == "superAdmin")) {
    return new GraphQLError("Insufficient permissions.");
  }
  const startFunction = (org_id_length) => {
    if (org_id_length > 0) {
      const orgID = parseInt(org_id[org_id_length - 1]);

      return modelsF.Mentor.destroy({
        where: {
          mentor_id: mentorID,
          org_id: orgID
        }
      }).then(
        (data) => startFunction(org_id_length - 1),
        (error) => new GraphQLError(error)
      ).catch((error) => {
        console.error(error);
      });
    } else if (org_id_length == 0) return mentor_id;
  };
  return startFunction(org_id.length);
};

const addMentorToProject = async function(mentor_id, project_id, user) {
  if (!((user.type == "orgAdmin" && await checkOrgAdminProject(user.id, project_id)) || user.type == "superAdmin")) {
    return new GraphQLError("Insufficient permissions.");
  }
  const startFunction = (project_id_length) => {
    if (project_id_length > 0) {
      const projectID = parseInt(project_id[project_id_length - 1]);
      const year = new Date().getFullYear();

      return modelsF.Mentored_By.create({
        project_id: projectID,
        mentor_id: mentor_id,
        absolute_year: year
      }).then(
        (data) => startFunction(project_id_length - 1),
        (error) => new GraphQLError(error)
      ).catch((error) => {
        console.error(error);
      });

    } else if (project_id_length == 0) return mentor_id;
  };
  return startFunction(project_id.length);
};

const removeMentorFromProject = async function(mentor_id, project_id, user) {
  if (!((user.type == "orgAdmin" && await checkOrgAdminProject(user.id, project_id)) || user.type == "superAdmin")) {
    return new GraphQLError("Insufficient permissions.");
  }
  const startFunction = (project_id_length) => {
    const projectID = parseInt(project_id[project_id_length - 1]);
    if (project_id_length > 0) {

      return modelsF.Mentored_By.destroy({
        where: {
          mentor_id: mentor_id,
          project_id: projectID
        }
      }).then(
        (data) => startFunction(project_id_length - 1),
        (error) => new GraphQLError(error)
      ).catch((error) => {
        console.error(error);
      });
    } else if (project_id_length == 0) return mentor_id;
  };
  return startFunction(project_id.length);
};

const MentorResolvers = {
  id: (parent) =>
    modelsF.Mentor.findAll({
      raw:true,
      attributes: ['mentor_id'],
      where: {
        mentor_id: parent.mentor_id
      }
    }).then((data) =>
      data[0] ? data[0].mentor_id : new GraphQLError("No such entry")
    ).catch((error) => {
      console.error(error);
    }),

  email: (parent) =>
    modelsF.Mentor.findAll({
      raw:true,
      attributes: ['email'],
      where: {
        mentor_id: parent.mentor_id
      }
    }).then((data) =>
      data[0] ? data[0].email : new GraphQLError("No such entry")
    ).catch((error) => {
      console.error(error);
    }),

  name: (parent) =>
    modelsF.Mentor.findAll({
      raw:true,
      attributes: ['mentor_name'],
      where: {
        mentor_id: parent.mentor_id
      }
    }).then((data) =>
      data[0] ? data[0].mentor_name : new GraphQLError("No such entry")
    ).catch((error) => {
      console.error(error);
    }),

  absolute_year: (parent) =>
    modelsF.Mentor.findAll({
      raw:true,
      attributes: ['absolute_year'],
      where: {
        mentor_id: parent.mentor_id
      }
    }).then((data) =>
      data[0] ? data[0].absolute_year : new GraphQLError("No such entry")
    ).catch((error) => {
      console.error(error);
    }),

  organization: (parent) =>
    modelsF.Mentor_Belongs_To.findAll({
      raw:true,
      attributes: ['org_id'],
      where: {
        mentor_id: parent.mentor_id
      }
    }).then((data) =>
      data[0] ? data[0] : new GraphQLError("No such entry")
    ).catch((error) => {
      console.error(error);
    }),
    projects: (parent) =>
    modelsF.Mentored_By.findAll({
      raw:true,
      attributes:['project_id'],
      where:{
        mentor_id:parent.mentor_id
      }
    }).then((data)=>
    data[0]? data[0] :new GraphQLError("No such entry")
    ).catch((error)=>{
    console.error(error);
    })
};

module.exports = {
  getMentors,
  addMentor,
  deleteMentor,
  addMentorToOrg,
  removeMentorFromOrg,
  addMentorToProject,
  removeMentorFromProject,
  MentorResolvers
};
