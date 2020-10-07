const { GraphQLError } = require("graphql");
const { dbQuery } = require("../config/db");
const auth = require("../config/auth");
const modelsF = require("../config/models")

const getSuperAdmins = function (year) {
	if (year == null) year = new Date().getFullYear();
	return modelsF.Super_Admin.findAll({
    raw:true,
		attributes:['super_admin_id'],
  where: {
    absolute_year: year
  }
	}).then(
		(data) => data,
    (error)=>error
	).catch((error) => {
		console.error(error);
	});
};

const SuperAdminResolvers = {
	id: (parent) =>
	modelsF.Super_Admin.findAll({
    raw:true,
		attributes:['super_admin_id'],
  where: {
    super_admin_id: parent.super_admin_id
  }
	}).then((data) =>
			data[0] ? data[0].super_admin_id : new GraphQLError("No such entry")
		).catch((error) => {
      console.error(error);
    }),
	email: (parent) =>
	modelsF.Super_Admin.findAll({
    raw:true,
		attributes:['email'],
	where: {
		super_admin_id: parent.super_admin_id
	}
	}).then((data) =>
			data[0] ? data[0].email : new GraphQLError("No such entry")
		).catch((error) => {
      console.error(error);
    }),
	name: (parent) =>
	modelsF.Super_Admin.findAll({
    raw:true,
		attributes:['super_admin_name'],
	where: {
		super_admin_id: parent.super_admin_id
	}
	}).then((data) =>
			data[0] ? data[0].super_admin_name : new GraphQLError("No such entry")
		).catch((error) => {
      console.error(error);
    }),
	absolute_year: (parent) =>
	modelsF.Super_Admin.findAll({
    raw:true,
		attributes:['absolute_year'],
	where: {
		super_admin_id: parent.super_admin_id
	}
	}).then((data) =>
			data[0] ? data[0].absolute_year : new GraphQLError("No such entry")
		).catch((error) => {
      console.error(error);
    })
};

module.exports = { getSuperAdmins, SuperAdminResolvers };
