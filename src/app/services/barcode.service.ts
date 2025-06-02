import {Injectable} from '@angular/core';
import {Subject} from 'rxjs';

@Injectable({providedIn: 'root'})
export class BarcodeService {
  private buffer = '';
  private isListening = false;
  private scannedBarcodeSubject = new Subject<string>();
  scannedBarcode$ = this.scannedBarcodeSubject.asObservable();

  startListening() {
    this.buffer = '';
    this.isListening = true;
  }

  handleKey(event: KeyboardEvent) {
    if (!this.isListening) return;
    if (event.key === 'Enter') {
      const code = this.buffer.trim();
      this.buffer = '';
      this.isListening = false;

      if (code.length >= 8 && code.length <= 20) {
        this.scannedBarcodeSubject.next(code);
      }
    } else if (event.key.length === 1 && !isNaN(Number(event.key))) {
      this.buffer += event.key;
    }
  }
}
