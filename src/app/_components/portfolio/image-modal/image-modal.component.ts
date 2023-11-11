import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { HostListener } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-image-modal',
  templateUrl: './image-modal.component.html',
  styleUrls: ['./image-modal.component.scss']
})
export class ImageModalComponent {
  currentImageIndex: number = 0;
  galleryImages: any[] = [];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private http: HttpClient,
    public dialogRef: MatDialogRef<ImageModalComponent>
  ) {
    this.galleryImages = data.galleryImages;
    this.currentImageIndex = this.galleryImages.findIndex(
      (image) => image.url === data.imageUrl
    );
  }

  navigate(direction: number) {
    const newIndex = this.currentImageIndex + direction;
    if (newIndex >= 0 && newIndex < this.galleryImages.length) {
      this.currentImageIndex = newIndex;
      this.data.imageUrl = this.galleryImages[newIndex].url; 
    }
  }
  

  downloadImage(imageUrl: string, fileName: string) {
    this.http.get(imageUrl, { responseType: 'blob' }).subscribe(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    });
  }

  shouldShowLeftArrow(): boolean {
    return this.currentImageIndex > 0;
  }
  

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.key === 'ArrowLeft') {
      this.navigate(-1);
    } else if (event.key === 'ArrowRight') {
      this.navigate(1);
    }
  }

}
