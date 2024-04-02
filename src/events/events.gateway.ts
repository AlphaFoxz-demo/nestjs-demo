import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import sql from 'utils/db';
import { nanoid } from 'nanoid';
import type { QuestMeta, Question, Questionnaire } from 'utils/define';

const SCHEMA = sql.unsafe('quest');

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class EventsGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('project.getTitle')
  getTitle(): string {
    return '匿名问卷调查系统';
  }

  @SubscribeMessage('biz.getHomeList')
  async getHomeList(): Promise<QuestMeta[]> {
    const result = await sql`
      select
        id, title, create_time, password, description
      from ${SCHEMA}.questionnaire
      where
        status != 3
    `;
    return result.flatMap((r) => {
      if (r.password) {
        delete r.password;
        r.has_password = true;
      } else {
        r.has_password = false;
      }
      return r;
    }) as QuestMeta[];
  }

  @SubscribeMessage('biz.checkPassword')
  async checkPassword(
    @MessageBody('id') id: string,
    @MessageBody('password') password: string,
  ): Promise<boolean> {
    const result = await sql`
      select
        id
      from ${SCHEMA}.questionnaire
      where
        id = ${id} and
        password = ${password} and
        status != 3
    `;
    return result.length > 0;
  }

  @SubscribeMessage('biz.getQuestionnaireInfo')
  async getQuestionnaireInfo(
    @MessageBody('id') id: string,
  ): Promise<Questionnaire> {
    let result = await sql`
      select
        id, title, create_time
      from ${SCHEMA}.questionnaire
      where
        id = ${id} and
        status != 3
    `;
    const meta = result.shift() as QuestMeta;
    result = await sql`
      select
        id, content, questionnaire_id, options
      from ${SCHEMA}.questions
      where
        questionnaire_id = ${id}
    `;
    const questions = result.flat() as Question[];
    return { meta, questions };
  }

  @SubscribeMessage('biz.getToken')
  async getToken(): Promise<string> {
    const token = nanoid();
    await sql`
      insert into ${SCHEMA}.token
      (token, create_time)
      values
      (${token}, ${new Date()})
    `;
    return token;
  }

  @SubscribeMessage('biz.submitQuestionnaire')
  async submitQuest(
    @MessageBody('id') id: string,
    @MessageBody('token') token: string,
    @MessageBody('results') results: { [k: string]: string },
  ): Promise<string> {
    let code: string;
    const checkResult = await sql`
    select
      result_code,
      create_time
    from ${SCHEMA}.result
    where
      token = ${token} and
      questionnaire_id = ${id}
    `;
    if (checkResult.length > 0) {
      const r = checkResult.shift();
      code = r.result_code;
      console.log('code已存在,', code, r.create_time);
      return code;
    }
    code = nanoid();
    await sql`
    insert into ${SCHEMA}.result
    (results, create_time, token, result_code, questionnaire_id)
    values
    (${sql.json(results)}, ${new Date()}, ${token}, ${code}, ${id})
    `;
    return code;
  }
}
