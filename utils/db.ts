import * as postgres from 'postgres';

const sql = postgres({
  host: '127.0.0.1',
  port: 5432,
  database: 'postgres',
  username: 'postgres',
  password: '123456',
  ssl: false,
  max: 10,
  connection: {
    TimeZone: 'Asia/Shanghai',
  },
});

// sql.subscribe('*', (row, info) => {
//   console.error(row, info);
// });

export default sql;
