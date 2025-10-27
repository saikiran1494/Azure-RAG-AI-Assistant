import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpEventType, HttpResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay, map, tap } from 'rxjs/operators';
import { Document, DocumentStatus } from '../models/document.model';
import { AzureAIService } from './azure-ai.service';

@Injectable({
  providedIn: 'root'
})
export class DocumentService {
  private documents = new BehaviorSubject<Document[]>([]);
  public documents$ = this.documents.asObservable();
  
  // This would be an environment variable in a real application
  private apiUrl = 'https://your-storage-api-url.azurewebsites.net/api';
  
  constructor(
    private http: HttpClient,
    private azureAIService: AzureAIService
  ) {
    // Initialize with mock data for demo purposes
    this.loadMockDocuments();
  }
  
  /**
   * Upload a document to Azure Storage
   */
  uploadDocument(file: File): Observable<Document> {
    
    const formData = new FormData();
    formData.append('file', file);

    this.http.post('https://localhost:7139/api/FileUpload', formData).subscribe({
      next: (res) => 
        console.log('File uploaded successfully!'),
      error: (err) => alert('Upload failed')
    });
    
    // Create a temporary document entry
    const newDocument: Document = {
      id: Date.now().toString(),
      name: file.name,
      size: file.size,
      type: file.type,
      uploadDate: new Date(),
      status: DocumentStatus.UPLOADING,
      processingProgress: 0
    };
    
    // Add to the documents list
    const currentDocs = this.documents.value;
    this.documents.next([...currentDocs, newDocument]);
    
    // This is a mock implementation
    // In a real application, this would upload to Azure Storage
    // and then process with Azure AI Search
    
    // Simulate upload progress
    return this.simulateUploadProgress(newDocument);

    // Real implementation would look like:
    /*
    const formData = new FormData();
    formData.append('file', file);
    
    return this.http.post<Document>(`${this.apiUrl}/upload`, formData, {
      reportProgress: true,
      observe: 'events'
    }).pipe(
      map(event => this.getUploadProgress(event, newDocument)),
      tap(doc => {
        if (doc.status === DocumentStatus.READY) {
          // Process the document with Azure AI Search
          this.azureAIService.processDocument(doc.id, doc.url).subscribe();
        }
      })
    );
    */
  }
  
  /**
   * Delete a document
   */
  deleteDocument(documentId: string): Observable<void> {
    // Remove from the local list
    const currentDocs = this.documents.value;
    const updatedDocs = currentDocs.filter(doc => doc.id !== documentId);
    this.documents.next(updatedDocs);
    
    // This is a mock implementation
    // In a real application, this would delete from Azure Storage and Azure AI Search
    return of(undefined).pipe(delay(500));
    
    // Real implementation would look like:
    /*
    return this.http.delete<void>(`${this.apiUrl}/documents/${documentId}`);
    */
  }
  
  /**
   * Get all documents
   */
  getDocuments(): Observable<Document[]> {
    return this.documents$;
  }
  
  /**
   * Get a document by ID
   */
  getDocumentById(documentId: string): Observable<Document | undefined> {
    return this.documents$.pipe(
      map(docs => docs.find(doc => doc.id === documentId))
    );
  }
  
  // Private helper methods
  
  private simulateUploadProgress(document: Document): Observable<Document> {
    // Simulate a 3-second upload with progress updates
    const totalSteps = 10;
    const stepTime = 300;
    
    return new Observable<Document>(observer => {
      let step = 0;
      
      const interval = setInterval(() => {
        step++;
        const progress = Math.min(100, step * (100 / totalSteps));
        
        const updatedDoc: Document = {
          ...document,
          processingProgress: progress
        };
        
        if (step < totalSteps) {
          // Update progress
          updatedDoc.status = DocumentStatus.UPLOADING;
          this.updateDocumentInList(updatedDoc);
          observer.next(updatedDoc);
        } else {
          // Upload complete
          updatedDoc.status = DocumentStatus.PROCESSING;
          this.updateDocumentInList(updatedDoc);
          observer.next(updatedDoc);
          
          // Simulate processing with Azure AI
          setTimeout(() => {
            const processedDoc: Document = {
              ...updatedDoc,
              status: DocumentStatus.READY,
              processingProgress: 100
            };
            
            this.updateDocumentInList(processedDoc);
            observer.next(processedDoc);
            observer.complete();
          }, 2000);
          
          clearInterval(interval);
        }
      }, stepTime);
      
      // Cleanup logic
      return () => {
        clearInterval(interval);
      };
    });
  }
  
  private updateDocumentInList(document: Document): void {
    const currentDocs = this.documents.value;
    const updatedDocs = currentDocs.map(doc => 
      doc.id === document.id ? document : doc
    );
    this.documents.next(updatedDocs);
  }
  
  private loadMockDocuments(): void {
    const mockDocuments: Document[] = [
      {
        id: '1',
        name: 'Annual Report 2024.pdf',
        size: 2500000,
        type: 'application/pdf',
        uploadDate: new Date(2024, 3, 15),
        status: DocumentStatus.READY
      },
      {
        id: '2',
        name: 'Project Proposal.docx',
        size: 1200000,
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        uploadDate: new Date(2024, 4, 2),
        status: DocumentStatus.READY
      }
    ];
    
    this.documents.next(mockDocuments);
  }
}
