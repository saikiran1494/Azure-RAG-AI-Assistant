import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { ChatComponent } from './components/chat/chat.component';
import { DocumentsComponent } from './components/documents/documents.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'chat', component: ChatComponent },
  { path: 'documents', component: DocumentsComponent },
  { path: '**', redirectTo: '' }
];
