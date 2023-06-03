import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AuthService } from '../auth/auth.service';
import { ChatService } from './chat.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  host: {
    class: 'chat-component',
  },
  styleUrls: ['./chat.component.css'],
})
export class ChatComponent implements OnInit {
  groupUsersAdded: any[] = []

  constructor(private chatService: ChatService, private authService: AuthService, private router: Router, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.authService.user.subscribe({
        next:(user)=>{
          this.groupUsersAdded.push(user?.userId)
        }
      })
    this.chatService.getMyGroupChannels();
  }

  addUserToGroup(channelForm: NgForm){
    const userId = channelForm.value['userId'];
    this.groupUsersAdded.push(userId);
  }
  createGroupChannel(
    channelName: string,
    userIds: Array<string>,
    callback: any
  ) {
    const params = new this.authService.sb.GroupChannelParams();
    params.addUserIds(userIds);
    params.name = channelName;
    this.authService.sb.GroupChannel.createChannel(
      params,
      (groupChannel: SendBird.GroupChannel, error: SendBird.SendBirdError) => {
        callback(groupChannel, error);
      }
    );
  }

  onChannelCreate(channelForm: NgForm){
    const channelName = channelForm.value['channelName'];
    this.createGroupChannel(channelName, this.groupUsersAdded, 
      (groupChannel: SendBird.GroupChannel, error: SendBird.SendBirdError)=>{
        this.chatService.getMyGroupChannels();
        this.router.navigate([groupChannel.url], {relativeTo: this.route})
      });
    this.groupUsersAdded = [];
    channelForm.reset();
  }
}
