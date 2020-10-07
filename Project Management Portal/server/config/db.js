const mysql = require("mysql");
const env = require("dotenv");

env.config();

const connectionPool = mysql.createPool({
	connectionLimit: 7,
	host: "localhost",
	database: "winterofcode",
	user: "root",
	password: "1234"
});

const queryFunction = (query, params) => {
	return new Promise((resolve, reject) => {
		connectionPool.getConnection(function (error, connection) {
			if (error) {
				reject(error);
			}
			const dbQueryFunction = (query, params) => {
				return new Promise((resolve, reject) => {
					connection.query(query, params, function (error, rows) {
						if (error) {
							connection.release();
							console.log("ERRRRRR");
							console.log(error);
							console.log("ERRRRRR");
							reject(error.sqlMessage);
						} else {
							connection.release();
							console.log(
								query + " ----- |" + params + "| ----- "
							);
							console.log(rows);
							resolve(rows[0]);
						}
					});
				});
			};
			resolve(dbQueryFunction(query, params));
		});
	});
};

module.exports.dbQuery = queryFunction;
