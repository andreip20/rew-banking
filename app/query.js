import connection from "../dbConfiguration/dbConfig";

const query = (sql, params) =>
  new Promise((resolve, reject) => {
    connection.query(sql, params, (error, results) => {
      if (error) return reject(error);
      resolve(results);
    });
  });

export default query;
