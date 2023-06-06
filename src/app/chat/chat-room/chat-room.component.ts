import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import * as SendBird from 'sendbird';
import { AuthService } from 'src/app/auth/auth.service';
import { ChatService } from '../chat.service';
import { ChatRoomService } from './chat-room.service';

@Component({
  selector: 'app-chat-room',
  templateUrl: './chat-room.component.html',
  styleUrls: ['./chat-room.component.css'],
})
export class ChatRoomComponent implements OnInit {
  channelHandler = new this.authService.sb.ChannelHandler();
  channel!: SendBird.GroupChannel | any;
  messages: any[] = [];
  groupUrl: any;
  limit = 15;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private chatService: ChatService,
    private chatRoomService: ChatRoomService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params: Params) => {
      this.groupUrl = params['url'];
      this.authService.sb.GroupChannel.getChannel(this.groupUrl).then(
        (channel: any) => {
          if(channel){
            this.channel = channel;
            this.reloadMsg(this.limit);
          }
        }
      );
    });
    this.registerEventHandlers(this.messages);
  }
  
  registerEventHandlers(messagesList: any) {
    this.channelHandler.onMessageReceived = (channel, message) => {
      this.reloadMsg(this.limit)
    };
    this.channelHandler.onUserReceivedInvitation = (channel, message) => {
      this.chatService.getMyGroupChannels();
    };
    this.channelHandler.onChannelDeleted = () => {
      this.chatService.getMyGroupChannels();
    };
    this.channelHandler.onUserLeft = () => {
      console.log("User left the chat");
    };

    this.authService.sb.addChannelHandler(
      '6f688da4e9a446de',
      this.channelHandler
    );
  }

  reloadMsg(limit: any) {
    this.chatRoomService.getMessagesFromChannel(
      this.channel,
      limit,
      (messages:any)=>this.messages = messages
    );
  }


  leaveChat(channel: SendBird.GroupChannel){
      channel.leave().then(()=>{
        this.chatService.getMyGroupChannels();
        this.router.navigate(['/chat']);
      });
  }

  handleSendForm(form: any){
    if(!form.valid) return;
    const message = form.value.message;
    this.chatRoomService.sendMessage(this.channel, message, this.authService.sb, (msg: any) => {
      this.messages.unshift(msg);
    });
    form.reset();
  }
  
  trackById(index: number, item: any): number {
    return item.messageId;
  }
}
