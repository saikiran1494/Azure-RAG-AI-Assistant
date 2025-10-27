import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { ChatMessage } from '../models/chat-message.model';

@Injectable({
  providedIn: 'root'
})
export class AzureAIService {
  // These would be environment variables in a real application
  private apiUrl = 'https://localhost:7139/api';
  
  constructor(private http: HttpClient) {}
  
  /**
   * Send a chat message and get a response from Azure OpenAI
   */
  sendChatMessage(message: string, documentIds: string[]): Observable<ChatMessage> {
    // This is a mock implementation
    // In a real application, this would call your Azure Function endpoint
    // that integrates with Azure OpenAI and Azure AI Search
    
    // For demo purposes, we'll simulate a response
    const mockResponse: ChatMessage = {
      id: Date.now().toString(),
      content: `This is a simulated response to: "${message}". In a real implementation, this would come from Azure OpenAI with context from your documents.`,
      timestamp: new Date(),
      isUser: false,
      documentReferences: [
        {
          documentId: documentIds[0] || 'mock-doc-1',
          documentName: 'Example Document',
          pageNumber: 5,
          confidence: 0.92
        }
      ]
    };
    
    // Simulate network delay
   // return of(mockResponse).pipe(delay(1500));
    
    // Real implementation would look like:
    return this.http.post<ChatMessage>(`${this.apiUrl}/chat`, {
      message,
      documentIds
    });
  }
  
  /**
   * Process an uploaded document with Azure AI Search
   */
  processDocument(documentId: string, documentUrl: string): Observable<void> {
    // This is a mock implementation
    // In a real application, this would call your Azure Function endpoint
    // that processes the document with Azure AI Search
    
    // Simulate network delay
    return of(undefined).pipe(delay(3000));
    
    // Real implementation would look like:
    /*
    return this.http.post<void>(`${this.apiUrl}/process-document`, {
      documentId,
      documentUrl
    });
    */
  }
}
