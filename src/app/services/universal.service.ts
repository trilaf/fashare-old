import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UniversalService {

  constructor() { }

  fileSizeConversion(size): string {
    let converted: string;
    let kB: number;
    let mB: number;
    if (size > 1024) {
      kB = size / 1024;
      if (kB > 1024) {
        mB = kB / 1024;
        converted = mB.toFixed(2) + ' MB';
      } else {
        converted = kB.toFixed(2) + ' kB';
      }
    } else {
      converted = size + ' bytes';
    }
    return converted;
  }

  getIcon(fileType: string) {
    if (fileType.match(/(?=image)\w+/g)) {
      return 'photo';
    } else if (fileType.match(/(?=audio)\w+/g)) {
      return 'music_note';
    } else if (fileType.match(/(?=video)\w+/g)) {
      return 'videocam';
    } else {
      return 'description';
    }
  }

  totalSize(fileData: Array<any>) {
    let total: number = 0;
    for (const files of fileData) {
      total += files.size;
    }
    return this.fileSizeConversion(total) as string;
  }
}
