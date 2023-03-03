import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms'

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomePageComponent } from './home-page/home-page.component';
import { AuthComponent } from './auth/auth.component';
import { ChatModule } from './chat/chat.module';
import { ChatGuard } from './chat/chat.guard';

@NgModule({
  declarations: [
    AppComponent,
    HomePageComponent,
    AuthComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    AppRoutingModule,
    ChatModule
  ],
  providers: [ChatGuard],
  bootstrap: [AppComponent]
})
export class AppModule { }
