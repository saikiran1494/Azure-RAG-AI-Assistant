import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ChatMessage } from '../models/chat-message.model';
import { AzureAIService } from './azure-ai.service';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private chatHistory = new BehaviorSubject<ChatMessage[]>([]);
  public chatHistory$ = this.chatHistory.asObservable();
  
  private selectedDocumentIds = new BehaviorSubject<string[]>([]);
  public selectedDocumentIds$ = this.selectedDocumentIds.asObservable();
  
  constructor(private azureAIService: AzureAIService) {
    // Initialize with a welcome message
    this.addSystemMessage('Hello! I\'m your Document AI assistant. Upload documents and ask me questions about them.');
  }
  
  /**
   * Send a user message and get a response
   */
  sendMessage(content: string): Observable<any> {
    // Add user message to chat history
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content,
      timestamp: new Date(),
      isUser: true
    };
    
    this.addMessageToHistory(userMessage);
    
    // Get response from Azure AI
    return this.azureAIService.sendChatMessage(
      content, 
      this.selectedDocumentIds.value
    );
  }
  
  /**
   * Add a message to the chat history
   */
  addMessageToHistory(message: ChatMessage): void {
    const currentHistory = this.chatHistory.value;
    this.chatHistory.next([...currentHistory, message]);
  }
  
  /**
   * Add a system message to the chat history
   */
  addSystemMessage(content: string): void {
    const systemMessage: ChatMessage = {
      id: Date.now().toString(),
      content,
      timestamp: new Date(),
      isUser: false
    };
    
    this.addMessageToHistory(systemMessage);
  }
  
  /**
   * Clear the chat history
   */
  clearChatHistory(): void {
    // Keep only the welcome message
    const welcomeMessage = this.chatHistory.value[0];
    this.chatHistory.next([welcomeMessage]);
  }
  
  /**
   * Set the document IDs to use for context
   */
  setSelectedDocumentIds(documentIds: string[]): void {
    this.selectedDocumentIds.next(documentIds);
    
    // If documents were selected, add a system message
    if (documentIds.length > 0) {
      this.addSystemMessage(`I'm now using ${documentIds.length} document(s) for context in our conversation.`);
    } else {
      this.addSystemMessage('No documents are selected. I\'ll respond based on general knowledge.');
    }
  }
}
