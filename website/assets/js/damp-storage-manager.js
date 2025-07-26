/**
 * DAMP Smart Drinkware - Storage Manager
 * Handles file uploads, image optimization, and asset management
 */

import { storage, auth } from './firebase-services.js';
import { ref, uploadBytes, uploadBytesResumable, getDownloadURL, deleteObject, listAll } from 'firebase/storage';

export class DampStorageManager {
  constructor() {
    this.storage = storage;
    this.maxFileSize = 10 * 1024 * 1024; // 10MB
    this.allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    this.allowedDocumentTypes = ['application/pdf', 'text/plain', 'application/msword'];
  }

  // ==================== PRODUCT IMAGE MANAGEMENT ====================

  async uploadProductImage(file, productId, imageType = 'gallery') {
    try {
      if (!this.validateImageFile(file)) {
        throw new Error('Invalid image file');
      }

      const optimizedFile = await this.optimizeImage(file);
      const fileName = `${imageType}_${Date.now()}_${file.name}`;
      const path = `products/${productId}/images/${fileName}`;
      
      const storageRef = ref(this.storage, path);
      const snapshot = await uploadBytes(storageRef, optimizedFile);
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      console.log('Product image uploaded:', downloadURL);
      return {
        url: downloadURL,
        path: path,
        size: optimizedFile.size,
        type: imageType
      };
    } catch (error) {
      console.error('Error uploading product image:', error);
      throw error;
    }
  }

  async uploadProductGallery(files, productId) {
    const uploads = [];
    for (let i = 0; i < files.length; i++) {
      try {
        const result = await this.uploadProductImage(files[i], productId, `gallery_${i}`);
        uploads.push(result);
      } catch (error) {
        console.error(`Failed to upload image ${i}:`, error);
      }
    }
    return uploads;
  }

  // ==================== USER CONTENT MANAGEMENT ====================

  async uploadUserProfileImage(file, userId) {
    try {
      if (!auth.currentUser || auth.currentUser.uid !== userId) {
        throw new Error('Unauthorized: User mismatch');
      }

      if (!this.validateImageFile(file)) {
        throw new Error('Invalid image file');
      }

      const optimizedFile = await this.optimizeImage(file, 300, 300); // Profile image size
      const fileName = `profile_${Date.now()}.jpg`;
      const path = `users/${userId}/profile/${fileName}`;
      
      const storageRef = ref(this.storage, path);
      const snapshot = await uploadBytes(storageRef, optimizedFile);
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      return {
        url: downloadURL,
        path: path,
        size: optimizedFile.size
      };
    } catch (error) {
      console.error('Error uploading profile image:', error);
      throw error;
    }
  }

  async uploadDeviceImage(file, userId, deviceId) {
    try {
      if (!auth.currentUser || auth.currentUser.uid !== userId) {
        throw new Error('Unauthorized: User mismatch');
      }

      if (!this.validateImageFile(file)) {
        throw new Error('Invalid image file');
      }

      const optimizedFile = await this.optimizeImage(file, 800, 600);
      const fileName = `device_${Date.now()}_${file.name}`;
      const path = `devices/${userId}/images/${deviceId}/${fileName}`;
      
      const storageRef = ref(this.storage, path);
      const uploadTask = uploadBytesResumable(storageRef, optimizedFile);
      
      // Return upload task for progress tracking
      return this.trackUploadProgress(uploadTask);
    } catch (error) {
      console.error('Error uploading device image:', error);
      throw error;
    }
  }

  // ==================== FIRMWARE & DOCUMENTS ====================

  async uploadFirmware(file, version, deviceType) {
    try {
      if (!auth.currentUser) {
        throw new Error('Authentication required');
      }

      // Only admin users can upload firmware
      const userDoc = await this.getUserRole(auth.currentUser.uid);
      if (userDoc.role !== 'admin') {
        throw new Error('Unauthorized: Admin access required');
      }

      const fileName = `${deviceType}_v${version}_${Date.now()}.bin`;
      const path = `firmware/${deviceType}/${fileName}`;
      
      const storageRef = ref(this.storage, path);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      return {
        url: downloadURL,
        path: path,
        version: version,
        deviceType: deviceType,
        size: file.size,
        uploadedAt: new Date()
      };
    } catch (error) {
      console.error('Error uploading firmware:', error);
      throw error;
    }
  }

  async uploadDocument(file, category, userId = null) {
    try {
      if (!this.validateDocumentFile(file)) {
        throw new Error('Invalid document file');
      }

      const userPath = userId ? `users/${userId}/` : 'public/';
      const fileName = `${category}_${Date.now()}_${file.name}`;
      const path = `documents/${userPath}${fileName}`;
      
      const storageRef = ref(this.storage, path);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      return {
        url: downloadURL,
        path: path,
        category: category,
        size: file.size
      };
    } catch (error) {
      console.error('Error uploading document:', error);
      throw error;
    }
  }

  // ==================== MARKETING ASSETS ====================

  async uploadMarketingAsset(file, assetType, campaign = null) {
    try {
      if (!auth.currentUser) {
        throw new Error('Authentication required');
      }

      const campaignPath = campaign ? `${campaign}/` : '';
      const fileName = `${assetType}_${Date.now()}_${file.name}`;
      const path = `marketing/${campaignPath}${fileName}`;
      
      const storageRef = ref(this.storage, path);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      return {
        url: downloadURL,
        path: path,
        assetType: assetType,
        campaign: campaign,
        size: file.size
      };
    } catch (error) {
      console.error('Error uploading marketing asset:', error);
      throw error;
    }
  }

  // ==================== FILE MANAGEMENT ====================

  async deleteFile(path) {
    try {
      const storageRef = ref(this.storage, path);
      await deleteObject(storageRef);
      console.log('File deleted:', path);
      return true;
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  }

  async listFiles(path) {
    try {
      const storageRef = ref(this.storage, path);
      const result = await listAll(storageRef);
      
      const files = [];
      for (const item of result.items) {
        const url = await getDownloadURL(item);
        files.push({
          name: item.name,
          path: item.fullPath,
          url: url
        });
      }
      
      return files;
    } catch (error) {
      console.error('Error listing files:', error);
      throw error;
    }
  }

  // ==================== UTILITY FUNCTIONS ====================

  validateImageFile(file) {
    if (!file) return false;
    if (file.size > this.maxFileSize) {
      throw new Error(`File size too large. Maximum ${this.maxFileSize / 1024 / 1024}MB allowed.`);
    }
    if (!this.allowedImageTypes.includes(file.type)) {
      throw new Error('Invalid file type. Only JPEG, PNG, WebP, and GIF allowed.');
    }
    return true;
  }

  validateDocumentFile(file) {
    if (!file) return false;
    if (file.size > this.maxFileSize) {
      throw new Error(`File size too large. Maximum ${this.maxFileSize / 1024 / 1024}MB allowed.`);
    }
    if (![...this.allowedImageTypes, ...this.allowedDocumentTypes].includes(file.type)) {
      throw new Error('Invalid file type.');
    }
    return true;
  }

  async optimizeImage(file, maxWidth = 1200, maxHeight = 800, quality = 0.8) {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img;
        
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width *= ratio;
          height *= ratio;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(resolve, 'image/jpeg', quality);
      };
      
      img.src = URL.createObjectURL(file);
    });
  }

  async trackUploadProgress(uploadTask) {
    return new Promise((resolve, reject) => {
      uploadTask.on('state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log('Upload progress:', progress + '%');
          
          // You can emit events here for UI progress bars
          document.dispatchEvent(new CustomEvent('uploadProgress', {
            detail: { progress, snapshot }
          }));
        },
        (error) => {
          console.error('Upload error:', error);
          reject(error);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          resolve({
            url: downloadURL,
            path: uploadTask.snapshot.ref.fullPath,
            size: uploadTask.snapshot.totalBytes
          });
        }
      );
    });
  }

  async getUserRole(userId) {
    // This would typically fetch from Firestore
    // For now, return a default role
    return { role: 'user' };
  }

  // ==================== BATCH OPERATIONS ====================

  async uploadMultipleFiles(files, basePath, options = {}) {
    const results = [];
    const errors = [];
    
    for (let i = 0; i < files.length; i++) {
      try {
        const file = files[i];
        const fileName = options.prefix ? `${options.prefix}_${i}_${file.name}` : file.name;
        const path = `${basePath}/${fileName}`;
        
        const storageRef = ref(this.storage, path);
        const snapshot = await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);
        
        results.push({
          index: i,
          url: downloadURL,
          path: path,
          originalName: file.name,
          size: file.size
        });
      } catch (error) {
        errors.push({
          index: i,
          fileName: files[i].name,
          error: error.message
        });
      }
    }
    
    return { results, errors };
  }
}

// Create singleton instance
export const dampStorage = new DampStorageManager();

// Export individual functions for convenience
export const uploadProductImage = (file, productId, imageType) => 
  dampStorage.uploadProductImage(file, productId, imageType);

export const uploadUserProfileImage = (file, userId) => 
  dampStorage.uploadUserProfileImage(file, userId);

export const uploadDeviceImage = (file, userId, deviceId) => 
  dampStorage.uploadDeviceImage(file, userId, deviceId);

export const deleteFile = (path) => 
  dampStorage.deleteFile(path);

export default dampStorage; 