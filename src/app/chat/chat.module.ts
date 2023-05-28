import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ChatRoutingModule } from './chat-routing.module';
import { ChatComponent } from './chat.component';
import { ChatRoomListComponent } from './chat-room-list/chat-room-list.component';
import { ChatRoomComponent } from './chat-room/chat-room.component';
import { HttpClientModule } from '@angular/common/http';
import { ChatRoomRenderingDirective } from './chat-room/chat-room-rendering.directive';
import { FormsModule } from '@angular/forms';
import { ChatRoomMessageComponent } from './chat-room/chat-room-message/chat-room-message.component';


@NgModule({
  declarations: [
    ChatComponent,
    ChatRoomListComponent,
    ChatRoomComponent,
    ChatRoomRenderingDirective,
    ChatRoomMessageComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ChatRoutingModule,
    HttpClientModule
  ]
})
export class ChatModule { }
