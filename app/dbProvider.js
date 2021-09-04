
import config from 'config'
import clickHouse from "clickhouse"
import Knex from 'knex'


const knex = Knex({ client: 'pg' });

const clickhouse = new clickHouse.ClickHouse(config.get('clickHouse'))


async function Query(knex) {
  console.log(knex.toString());
  return await clickhouse.query(knex.toString()).toPromise()
}

export { Query, knex }



