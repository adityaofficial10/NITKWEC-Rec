const {
  GraphQLError
} = require("graphql");
const { dbQuery } = require("../config/db");
const auth = require("../config/auth");
const modelsF = require("../config/models")

const getOrgAdmins = function (orgID) {

  return modelsF.Org_Admin.findAll({
    raw:true,
    attributes:['org_admin_id'],
    include:{
      model:modelsF.Org_Admin_Belongs_To,
      where:{
        org_id:orgID
      }
    }
  }).then(
		(data) => data,
    (error)=>error
	).catch((error)=>{
    console.error(error);
  });
};

const addOrgAdmin = function (reg_num, email, password, name, org_id, year, user) {
	if (user.type != "superAdmin") {
		return new GraphQLError("Insufficient permissions.");
	}
	if (year == null) year = new Date().getFullYear();
	password = auth.hash(password);

	const startTransaction = () => {
		return sequelize.transaction({
      autocommit:false
    }).then(
			(t) => addOrgAdmin1(email, name, password, year,t),
			(err) => new GraphQLError(err)
		).catch((error) => {
  		console.error(error);
  	}).finally(() => {
  		console.log('');
  	});
	};
	const addOrgAdmin1 = (email, name, password, year,t) => {

    return modelsF.Org_Admin.create({
      org_admin_id:reg_num,
      email:email,
      org_admin_name:name,
      org_admin_password:password,
      absolute_year:year
    },{transaction:t}).then(
      (data)=>addOrgAdmin2(email, name, password, year,t),
      (error)=>rollbackTransaction(error,t)
    ).catch((error)=>{
      console.error(error);
    });
  };

  const addOrgAdmin2 = (email, name, password, year,t) => {
    return modelsF.Org_Admin.findAll({
      raw:true,
      attributes:['org_admin_id'],
      where:{
        email:email,
        absolute_year:year
      },
      transaction:t
    }).then(
			(data) => addOrgAdminOrg(data[0].org_admin_id,t),
			(error) => rollbackTransaction(error,t)
		).catch((error)=>{
      console.error(error);
    });

	};
	const addOrgAdminOrg = (org_admin_id,t) => {
    const year = new Date().getFullYear();
    const orgID = parseInt(org_id);
    return modelsF.Org_Admin_Belongs_To.create({
      org_id:orgID,
      org_admin_id:org_admin_id,
      absolute_year:year
    },{transaction:t}).then(
			(data) => commitTransaction(org_admin_id,t),
			(error) => rollbackTransaction(error,t)
		).catch((error)=>{
      console.error(error);
    });
	};
	const commitTransaction = (org_admin_id,t) => {
		return t.commit().then(
			(data) => {
				return { org_admin_id: org_admin_id };
			},
			(error) => new GraphQLError(error)
		).catch((error) => {
  		console.error(error);
  	});
	};
	const rollbackTransaction = (error,t) => {
		return  t.rollback().then(
			(data) => new GraphQLError(error),
			(error) => new GraphQLError(error)
		).catch((error) => {
  		console.error(error);
  	});
	};
	return startTransaction();
};

const deleteOrgAdmin = function (orgAdminID, user) {
	if (user.type !== "superAdmin") {
		return new GraphQLError("Insufficient permissions.");
	}
  return modelsF.Org_Admin.destroy({
    where:{
      org_admin_id:orgAdminID
    }
  }).then(
		(data) => Boolean(data),
		(error) => new GraphQLError(error)
	).catch((error)=>{
    console.error(error);
  });
};

const OrgAdminResolvers = {
	id: (parent) =>
    modelsF.Org_Admin.findAll({
      raw:true,
      attributes:['org_admin_id'],
      where:{
        org_admin_id:parent.org_admin_id
      }
    }).then((data) =>
			data[0] ? data[0].org_admin_id : new GraphQLError("No such entry")
		).catch((error)=>{
      console.error(error);
    }),

	email: (parent) =>
    modelsF.Org_Admin.findAll({
      raw:true,
      attributes:['email'],
      where:{
        org_admin_id:parent.org_admin_id
      }
    }).then((data) =>
    data[0] ? data[0].email : new GraphQLError("No such entry")
    ).catch((error)=>{
    console.error(error);
    }),

	name: (parent) =>
    modelsF.Org_Admin.findAll({
      raw:true,
      attributes:['org_admin_name'],
      where:{
        org_admin_id:parent.org_admin_id
      }
    }).then((data) =>
    data[0] ? data[0].org_admin_name : new GraphQLError("No such entry")
    ).catch((error)=>{
    console.error(error);
    }),

	absolute_year: (parent) =>
    modelsF.Org_Admin.findAll({
      raw:true,
      attributes:['absolute_year'],
      where:{
        org_admin_id:parent.org_admin_id
      }
    }).then((data) =>
    data[0] ? data[0].absolute_year : new GraphQLError("No such entry")
    ).catch((error)=>{
    console.error(error);
    }),

	organization: (parent) =>
    modelsF.Org_Admin_Belongs_To.findAll({
      raw:true,
      attributes:['org_id'],
      where:{
        org_admin_id:parent.org_admin_id
      }
    }).then((data) =>
    data ? data[0] : new GraphQLError("No such entry")
    ).catch((error)=>{
    console.error(error);
    })

};

module.exports = {
	getOrgAdmins,
	addOrgAdmin,
	deleteOrgAdmin,
	OrgAdminResolvers
};
