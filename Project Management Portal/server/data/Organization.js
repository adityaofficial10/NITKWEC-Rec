const { GraphQLError } = require("graphql");
const { dbQuery } = require("../config/db");
const auth = require("../config/auth");
const modelsF = require("../config/models")

const getOrganizations = function (year) {
	if(year == null) {
		year = new Date().getFullYear();
	}
	return modelsF.Organization.findAll({
    raw:true,
			attributes:['org_id'],
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

const addOrganization = function (name, description, user) {
	if (user.type == "superAdmin") {
		const year = new Date().getFullYear();
  const findOrganz = ()=>{

       return modelsF.Organization.findAll({
         raw:true,
			 attributes:['org_id'],
			 where:{
				 org_name:name
			 }
		   }).then(
       (data)=> data[0] ? true: false,
       (error)=>error
		   ).catch((error)=>{
			 console.error(error);
		 });
   };

  const fetch_orgID = () =>{

    return modelsF.Organization.findAll({
      raw:true,
    attributes:['org_id'],
    where:{
      org_name:name
    }
    }).then(
    (data)=> data[0] ? data[0].org_id: null,
    (error)=>error
    ).catch((error)=>{
    console.error(error);
  });
};
    findOrganz().then(function(ok){
      fetch_orgID().then(function(orgID){
		   if(ok)
		   {
         modelsF.Organization.create({
          org_id:orgID,
          org_name:name,
          absolute_year:year,
          description:description
        }).then(
          (data)=> data,
          (error) => error
        ).catch((error)=>{
          console.error(error);
        });

		    }
       else{
          modelsF.Organization.create({
          org_name:name,
          absolute_year:year,
          description:description
          }).then(
            (data)=> data,
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

          return modelsF.Organization.findAll({
            raw:true,
            attributes:['org_id'],
            where:{
              org_name:name,
              absolute_year:year
            }
            }).then(
               (data)=>data[0],
               (error) => new GraphQLError(error)
            ).catch((error)=>{
            console.error(error);
            });
        }
	return new GraphQLError("Insufficient permissions.");
};

const deleteOrganization = function (orgID, user) {
	if (user.type == "superAdmin") {

	return modelsF.Organization.destroy({
  where: {
    org_id: org_id
  }
  }).then(
			(data) => Boolean(data),
			(error) => new GraphQLError(error)
	).catch((error) => {
      console.error(error);
  });
	}
	return new GraphQLError("Insufficient permissions.");
};

const OrganizationResolvers = {
	id: (parent) =>
	modelsF.Organization.findAll({
    raw:true,
		attributes:['org_id'],
	where: {
		org_id: parent.org_id
	}
	}).then((data) =>
			data[0] ? data[0].org_id : new GraphQLError("No such entry")
		).catch((error) => {
      console.error(error);
    }),
	name: (parent) =>
	modelsF.Organization.findAll({
    raw:true,
		attributes:['org_name'],
	where: {
		org_id: parent.org_id
	}
	}).then((data) =>
			data[0] ? data[0].org_name : new GraphQLError("No such entry")
		).catch((error) => {
      console.error(error);
    }),
	description: (parent) =>
	modelsF.Organization.findAll({
    raw:true,
		attributes:['description'],
	where: {
		org_id: parent.org_id
	}
	}).then((data) =>
			data[0] ? data[0].description : new GraphQLError("No such entry")
		).catch((error) => {
      console.error(error);
    }),
	projects: (parent) =>
	   modelsF.Project.findAll({
       raw:true,
			attributes:['project_id'],
			include:{
				model:modelsF.Maintained_By,
				where:{
					org_id:parent.org_id
				}
			}
		}).then((data) =>
			data ? data : new GraphQLError("No such entry")
		).catch((error)=>{
			console.error(error);
		}),

	mentors: (parent) =>
	modelsF.Mentor_Belongs_To.findAll({
    raw:true,
		attributes:[org_id],
	where: {
		mentor_id: parent.org_id
	}
	}).then((data) =>
			data[0] ? data[0] : new GraphQLError("No such entry")
		).catch((error) => {
      console.error(error);
    }),
	OrgAdmins: (parent) =>

		modelsF.Org_Admin.findAll({
      raw:true,
			attributes:['org_admin_id'],
			include:{
				model:Org_Admin_Belongs_To,
				where:{
					org_id:parent.org_id
				}
			}
		}).then(
			(data) => (data ? data : new GraphQLError("No such entry"))
		).catch((error)=>{
			console.error(error);
		})
};

module.exports = {
	getOrganizations,
	addOrganization,
	deleteOrganization,
	OrganizationResolvers
};
