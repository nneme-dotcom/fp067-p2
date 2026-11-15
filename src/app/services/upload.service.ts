import { Injectable } from '@angular/core';
import uploadConfig from '../upload.config.json';

/** The two kinds of file a drill can have. */
export type FileKind = 'image' | 'video';

/** The biggest file the free Cloudinary plan accepts, in MB. */
export const MAX_SIZE_MB: Record<FileKind, number> = { image: 10, video: 100 };

/**
 * Sends the files chosen on the computer to Cloudinary (the file server)
 * and gives back the link, which is what we save in Firestore.
 * Firebase Storage is not used because it needs the paid plan.
 */
@Injectable({ providedIn: 'root' })
export class UploadService {
  /** False until the account data is put in upload.config.json. */
  readonly configured = !uploadConfig.cloudName.startsWith('YOUR_');

  /** Returns the error message if the file cannot be used, or null if it is fine. */
  check(file: File, kind: FileKind): string | null {
    if (!file.type.startsWith(`${kind}/`)) {
      return kind === 'image' ? 'Choose an image file.' : 'Choose a video file.';
    }
    if (file.size > MAX_SIZE_MB[kind] * 1024 * 1024) {
      return `This file is too big (the limit is ${MAX_SIZE_MB[kind]} MB).`;
    }
    return null;
  }

  /**
   * Uploads the file and returns its link.
   * `onProgress` gets a number from 0 to 100 while it goes up.
   * We use XMLHttpRequest because fetch does not tell how much has been sent.
   */
  upload(file: File, kind: FileKind, onProgress: (percent: number) => void): Promise<string> {
    const url = `https://api.cloudinary.com/v1_1/${uploadConfig.cloudName}/${kind}/upload`;

    const body = new FormData();
    body.append('file', file);
    body.append('upload_preset', uploadConfig.uploadPreset);

    return new Promise((resolve, reject) => {
      const request = new XMLHttpRequest();
      request.open('POST', url);

      request.upload.onprogress = (event) => {
        if (event.lengthComputable) onProgress(Math.round((event.loaded / event.total) * 100));
      };

      request.onload = () => {
        try {
          const answer = JSON.parse(request.responseText);
          if (request.status === 200 && answer.secure_url) {
            resolve(answer.secure_url);
          } else {
            reject(new Error(answer.error?.message ?? `Upload failed (${request.status})`));
          }
        } catch {
          reject(new Error(`Upload failed (${request.status})`));
        }
      };

      request.onerror = () => reject(new Error('Upload failed: no connection'));
      request.send(body);
    });
  }
}
