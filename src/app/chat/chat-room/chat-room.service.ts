import { Injectable } from '@angular/core';

import * as SendBird from 'sendbird';

@Injectable({
  providedIn: 'root',
})
export class ChatRoomService {
  messages: (SendBird.AdminMessage | SendBird.UserMessage)[] = [];

  constructor() {}

  getMessagesFromChannel(
    queryList: SendBird.PreviousMessageListQuery,
    limit: number,
    callback: Function
  ) {
    if (queryList.hasMore) {
      queryList.reverse = true;
      queryList.limit = limit;
      queryList.includeMetaArray = true;
      queryList.load((messages: any, error: any) => {
        console.log(messages);
        this.messages.push(...messages);
        callback(messages);
      });
    }
  }

  sendMessage(
    channel: SendBird.GroupChannel | SendBird.OpenChannel,
    message: string,
    user: SendBird.SendBirdInstance,
    callback: Function
  ) {
    const params = new user.UserMessageParams();
    params.message = message;
    channel.sendUserMessage(params, (userMessage, error) => {
      callback(userMessage);
    });
  }
}
