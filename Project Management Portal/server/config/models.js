
//Importing Sequelize ORM and specifying the configuration details...
const {
  Sequelize,
  DataTypes,
  Model
} = require('sequelize');
/*
    Here,you will have to add your own configuration:
    Place the details in the corresponding spots like write your database name in place of database_name and similarly.
*/
const sequelize = new Sequelize('database_name', 'username', 'password', {
  host: 'host_name',
  dialect: 'dialect_name' /* one of 'mysql' | 'mariadb' | 'postgres' | 'mssql' */
});

const queryInterface = sequelize.getQueryInterface();
const Op = Sequelize.Op;


//Model definitions as specified in the database schema...
const Applicant = sequelize.define('Applicant', {

  first_Name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  middle_Name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  last_Name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  applicant_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true
  },
  applicant_year: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  applicant_password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false
  },
  absolute_year: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true
  }
}, {
  sequelize,
  modelName: 'Applicant'
});

const Application = sequelize.define('Application', {

  project_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true
  },

  applicant_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true
  },
  accepted: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  result: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  proposal: {
    type: DataTypes.STRING,
    allowNull: false
  },
  absolute_year: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true
  }
}, {
  sequelize,
  modelName: 'Application'
  // Other model options go here
});

const Super_Admin = sequelize.define('Super_Admin', {

  super_admin_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false
  },
  super_admin_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  super_admin_password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  absolute_year: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true
  }
}, {
  sequelize,
  modelName: 'Super_Admin'
});


const Mentor = sequelize.define('Mentor', {

  mentor_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false
  },
  mentor_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  mentor_password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  absolute_year: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true
  }
}, {
  sequelize,
  modelName: 'Mentor'
});


const Maintained_By = sequelize.define('Maintained_By', {

  project_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true
  },
  org_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true
  },
  absolute_year: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true
  }
}, {
  sequelize,
  modelName: 'Maintained_By'
});


const Mentor_Belongs_To = sequelize.define('Mentor_Belongs_To', {

  mentor_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true
  },
  org_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true
  },
  absolute_year: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true
  }
}, {
  sequelize,
  modelName: 'Mentor_Belongs_To'
});

const Mentored_By = sequelize.define('Mentored_By', {

  project_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true
  },
  mentor_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true
  },
  absolute_year: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true
  }
}, {
  sequelize,
  modelName: 'Mentored_By'
});

const Org_Admin_Belongs_To = sequelize.define('Org_Admin_Belongs_To', {


  org_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true
  },
  org_admin_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true
  },
  absolute_year: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true
  }
}, {
  sequelize,
  modelName: 'Org_Admin_Belongs_To'
});

const Org_Admin = sequelize.define('Org_Admin', {

  org_admin_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false
  },
  org_admin_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  org_admin_password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  absolute_year: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true
  }
}, {
  sequelize,
  modelName: 'Org_Admin'
});

const Organization = sequelize.define('Organization', {

  org_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true
  },
  org_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  absolute_year: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true
  },
  description: {
    type: DataTypes.STRING
  }
}, {
  sequelize,
  modelName: 'Organization'
});

const Prerequisite = sequelize.define('Prerequisite', {

  project_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true
  },
  prerequisites: {
    type: DataTypes.STRING,
    allowNull: false,
    primaryKey: true
  }
}, {
  sequelize,
  modelName: 'Prerequisite'
});


const Project = sequelize.define('Project', {

  project_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true
  },
  work_to_be_done: {
    type: DataTypes.STRING,
    allowNull: false
  },
  project_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  deliverables: {
    type: DataTypes.STRING,
    allowNull: false
  },
  absolute_year: {
    type: DataTypes.DATE,
    allowNull: false,
    primaryKey: true
  },
  project_start_date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  project_end_date: {
    type: DataTypes.DATE,
    allowNull: false
  }
}, {
  sequelize,
  modelName: 'Project'
});


// Associations of the Models as specified in database schema...
Applicant.hasMany(Application, {
  foreignKey: 'applicant_id',
  onDelete: 'cascade',
  onUpdate: 'cascade',
  hooks: true
});
Applicant.hasMany(Application, {
  foreignKey: 'absolute_year',
  onDelete: 'cascade',
  onUpdate: 'cascade',
  hooks: true
});
Application.belongsTo(Project, {
  foreignKey: 'project_id'
});
Application.belongsTo(Applicant, {
  foreignKey: 'applicant_id'
});
Application.belongsTo(Applicant, {
  foreignKey: 'absolute_year'
});
Project.hasMany(Application, {
  foreignKey: 'project_id',
  onDelete: 'cascade',
  onUpdate: 'cascade',
  hooks: true
});
Prerequisite.belongsTo(Project, {
  foreignKey: 'project_id'
});
Project.hasMany(Prerequisite, {
  foreignKey: 'project_id',
  onDelete: 'cascade',
  onUpdate: 'cascade',
  hooks: true
});
Organization.hasMany(Maintained_By, {
  foreignKey: 'org_id',
  onDelete: 'cascade',
  onDelete: 'cascade',
  hooks: true
});
Organization.hasMany(Org_Admin_Belongs_To, {
  foreignKey: 'org_id',
  hooks: true
});
Organization.hasMany(Org_Admin_Belongs_To, {
  foreignKey: 'absolute_year',
  hooks: true
});
Org_Admin.hasMany(Org_Admin_Belongs_To, {
  foreignKey: 'org_admin_id',
  onDelete: 'cascade',
  onUpdate: 'cascade',
  hooks: 'true'
});
Org_Admin_Belongs_To.belongsTo(Organization, {
  foreignKey: 'org_id'
});
Org_Admin_Belongs_To.belongsTo(Organization, {
  foreignKey: 'absolute_year'
});
Org_Admin_Belongs_To.belongsTo(Org_Admin, {
  foreignKey: 'org_admin_id'
});
Mentored_By.belongsTo(Mentor, {
  foreignKey: 'mentor_id'
});
Mentor.hasMany(Mentored_By, {
  foreignKey: 'mentor_id',
  onDelete: 'cascade',
  onUpdate: 'cascade',
  hooks: true
});
Mentored_By.belongsTo(Mentor, {
  foreignKey: 'absolute_year'
});
Mentor.hasMany(Mentored_By, {
  foreignKey: 'absolute_year',
  onDelete: 'cascade',
  onUpdate: 'cascade',
  hooks: true
});
Maintained_By.belongsTo(Project, {
  foreignKey: 'project_id'
});
Project.hasMany(Maintained_By, {
  foreignKey: 'project_id',
  onDelete: 'cascade',
  onUpdate: 'cascade',
  hooks: true
});
Maintained_By.belongsTo(Project, {
  foreignKey: 'absolute_year'
});
Project.hasMany(Maintained_By, {
  foreignKey: 'absolute_year',
  onDelete: 'cascade',
  onUpdate: 'cascade',
  hooks: true
});
Maintained_By.belongsTo(Organization, {
  foreignKey: 'org_id'
});
Mentored_By.belongsTo(Project, {
  foreignKey: 'project_id'
});
Project.hasMany(Mentored_By, {
  foreignKey: 'project_id',
  onDelete: 'cascade',
  onUpdate: 'cascade',
  hooks: true
});
Mentor.hasMany(Organization,{
  foreignKey:'absolute_year',
  hooks:true
});
Organization.belongsTo(Mentor,{
  foreignKey:'absolute_year'
});


//Models imported for use in other modules...
module.exports = {
  Applicant,
  Application,
  Super_Admin,
  Mentor,
  Maintained_By,
  Mentor_Belongs_To,
  Mentored_By,
  Org_Admin_Belongs_To,
  Org_Admin,
  Organization,
  Prerequisite,
  Project
};
