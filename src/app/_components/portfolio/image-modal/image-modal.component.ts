/*
 * File: c:\Users\tonyw\Desktop\molexworks.com\ng-molex-works\src\app\_components\portfolio\image-modal\image-modal.component.ts
 * Project: c:\Users\tonyw\Desktop\molexworks.com\ng-molex-works
 * Created Date: Saturday November 11th 2023
 * Author: Tony Wiedman
 * -----
 * Last Modified: Wed February 5th 2025 10:55:56 
 * Modified By: Tony Wiedman
 * -----
 * Copyright (c) 2023 - 2025 MolexWorks
 */

import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { HostListener } from '@angular/core';
import { HttpClient } from '@angular/common/http';

/**
 * ImageModalComponent
 * @classdesc - Image modal component implementation
 */
@Component({
  selector: 'app-image-modal',
  templateUrl: './image-modal.component.html',
  styleUrls: ['./image-modal.component.scss']
})

export class ImageModalComponent
{
  currentImageIndex: number = 0;
  galleryImages: any[] = [];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private http: HttpClient,
    public dialogRef: MatDialogRef<ImageModalComponent>
  )
  {
    this.galleryImages = data.galleryImages;
    this.currentImageIndex = this.galleryImages.findIndex(
      (image) => image.url === data.imageUrl
    );
  }

  /**
   * navigate
   * @method - Navigate to the next or previous image
   * @param direction - The direction to navigate
   * @returns {void}
   */
  navigate(direction: number)
  {
    const newIndex = this.currentImageIndex + direction;
    if (newIndex >= 0 && newIndex < this.galleryImages.length)
    {
      this.currentImageIndex = newIndex;
      this.data.imageUrl = this.galleryImages[newIndex].url;
    }
  }

  /**
   * downloadImage
   * @method - Download the image
   * @param imageUrl - The image URL
   * @param fileName - The file name
   * @returns {void}
   */
  downloadImage(imageUrl: string, fileName: string)
  {
    console.log('Download button clicked');

    this.http.get(imageUrl, { responseType: 'blob' }).subscribe(blob =>
    {
      console.log('Received blob data:', blob);

      const url = window.URL.createObjectURL(blob);
      console.log('Blob URL:', url);

      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);

      console.log('Download complete');
    });
  }
  
  /**
   * shouldShowRightArrow
   * @method - Check if the right arrow should be shown
   * @returns {boolean}
   */
  shouldShowLeftArrow(): boolean
  {
    return this.currentImageIndex > 0;
  }

  /**
   * shouldShowRightArrow
   * @method - Check if the right arrow should be shown
   * @returns {boolean}
   */
  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent)
  {
    if (event.key === 'ArrowLeft')
    {
      this.navigate(-1);
    } else if (event.key === 'ArrowRight')
    {
      this.navigate(1);
    }
  }

}
