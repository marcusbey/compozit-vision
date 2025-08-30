# 📦 Storage Setup Guide - Reference Images System

## 🎯 Overview
This guide walks you through setting up Supabase storage buckets for the Reference Library system with proper security policies and configuration.

---

## 🗂️ **Step 1: Create Storage Buckets**

### **1.1 Access Supabase Dashboard**
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: `xmkkhdxhzopgfophlyjd`
3. Navigate to **Storage** in the left sidebar

### **1.2 Create Required Buckets**

Create these **3 buckets** with the following settings:

#### **Bucket 1: `reference-images`**
```
Name: reference-images
Public: ❌ No (Private bucket)
File Size Limit: 10 MB
Allowed MIME Types: 
  - image/jpeg
  - image/png  
  - image/webp
  - image/heic
  - image/heif
```

#### **Bucket 2: `reference-thumbnails`**
```
Name: reference-thumbnails
Public: ✅ Yes (Public bucket)
File Size Limit: 1 MB
Allowed MIME Types:
  - image/jpeg
  - image/png
  - image/webp
```

#### **Bucket 3: `temp-uploads`**
```
Name: temp-uploads
Public: ❌ No (Private bucket)
File Size Limit: 20 MB
Allowed MIME Types:
  - image/jpeg
  - image/png
  - image/webp
  - image/heic
  - image/heif
```

---

## 🛡️ **Step 2: Apply Security Policies**

### **2.1 Execute SQL Policies**
1. Go to **SQL Editor** in your Supabase dashboard
2. Copy the entire content of `scripts/setup-reference-storage.sql`
3. Execute the script

This will create:
- ✅ Row Level Security policies for each bucket
- ✅ Helper functions for path generation
- ✅ Cleanup functions for temp files
- ✅ Proper user access controls

### **2.2 Verify Policies**
After execution, verify in **Storage > Policies** that you see:

**reference-images policies:**
- Users can view own reference images
- Users can upload own reference images
- Users can update own reference images
- Users can delete own reference images

**reference-thumbnails policies:**
- Thumbnails are publicly viewable
- Service role can upload thumbnails
- Service role can update thumbnails
- Service role can delete thumbnails

**temp-uploads policies:**
- Users can upload to temp storage
- Users can view own temp uploads
- Users can delete own temp uploads

---

## 🔧 **Step 3: Test Storage Configuration**

### **3.1 Test Upload (via Supabase Dashboard)**
1. Go to **Storage > reference-images**
2. Create a folder with your user ID (copy from **Authentication > Users**)
3. Try uploading a test image
4. Verify it appears in the bucket

### **3.2 Test Access Control**
1. Try accessing the image URL directly - should require authentication
2. Check that thumbnails bucket allows public access
3. Verify temp uploads are private

---

## 📱 **Step 4: Integration with React Native App**

### **4.1 Upload Flow Example**
```typescript
// Example usage in your app
const uploadReferenceImage = async (imageUri: string, userId: string) => {
  // 1. Generate secure path
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `${timestamp}-reference.jpg`;
  const path = `${userId}/${filename}`;

  // 2. Upload to reference-images bucket
  const { data, error } = await supabase.storage
    .from('reference-images')
    .upload(path, {
      uri: imageUri,
      type: 'image/jpeg',
      name: filename,
    });

  if (error) throw error;

  // 3. Get signed URL for private access
  const { data: urlData } = await supabase.storage
    .from('reference-images')
    .createSignedUrl(path, 3600); // 1 hour expiry

  return {
    path: data.path,
    url: urlData?.signedUrl
  };
};
```

### **4.2 Thumbnail Generation**
```typescript
// After upload, create thumbnail (server-side or edge function)
const createThumbnail = async (originalPath: string) => {
  // This would typically be an edge function or server process
  const thumbnailPath = `thumbnails/${originalPath.split('/')[1]}-thumb.jpg`;
  
  // Process and upload thumbnail to public bucket
  const { data } = await supabase.storage
    .from('reference-thumbnails')
    .upload(thumbnailPath, processedThumbnail);

  return supabase.storage
    .from('reference-thumbnails')
    .getPublicUrl(thumbnailPath);
};
```

---

## 🔄 **Step 5: Cleanup and Maintenance**

### **5.1 Automated Cleanup**
The SQL script includes a `cleanup_temp_uploads()` function that removes files older than 24 hours from temp storage.

### **5.2 Manual Cleanup**
Run this in SQL Editor when needed:
```sql
SELECT cleanup_temp_uploads(24); -- Clean files older than 24 hours
```

### **5.3 Monitor Usage**
- Check **Settings > Usage** for storage consumption
- Set up alerts if approaching limits
- Monitor **Logs** for upload errors

---

## 📊 **Storage Architecture**

```
📦 Storage Buckets
├── 📁 reference-images/ (Private, 10MB limit)
│   ├── 📁 user_uuid_1/
│   │   ├── 📄 2024-12-28-123456-living-room.jpg
│   │   └── 📄 2024-12-28-123457-kitchen.png
│   └── 📁 user_uuid_2/
│       └── 📄 2024-12-28-123458-bedroom.webp
│
├── 📁 reference-thumbnails/ (Public, 1MB limit)
│   ├── 📄 2024-12-28-123456-living-room-thumb.jpg
│   ├── 📄 2024-12-28-123457-kitchen-thumb.jpg
│   └── 📄 2024-12-28-123458-bedroom-thumb.jpg
│
└── 📁 temp-uploads/ (Private, 20MB limit, Auto-cleanup)
    ├── 📁 user_uuid_1/
    │   └── 📄 temp-processing-123.jpg (expires in 24h)
    └── 📁 user_uuid_2/
        └── 📄 temp-processing-456.png (expires in 24h)
```

---

## ✅ **Verification Checklist**

- [ ] ✅ Created 3 storage buckets with correct settings
- [ ] ✅ Applied all RLS policies via SQL script
- [ ] ✅ Tested upload functionality
- [ ] ✅ Verified access control (private vs public)
- [ ] ✅ Confirmed helper functions work
- [ ] ✅ Set up cleanup automation (optional)

---

## 🚨 **Troubleshooting**

### **Common Issues:**

**1. "Bucket not found" error**
- Verify bucket names match exactly: `reference-images`, `reference-thumbnails`, `temp-uploads`

**2. "Policy violation" error**
- Check user is authenticated
- Verify file is being uploaded to correct user folder (user_id/filename.ext)

**3. "File too large" error**
- reference-images: 10MB limit
- reference-thumbnails: 1MB limit
- temp-uploads: 20MB limit

**4. "Invalid MIME type" error**
- Only allow: image/jpeg, image/png, image/webp, image/heic, image/heif

---

## 🎉 **Storage Setup Complete!**

Your storage system is now ready to handle:
- ✅ **User reference image uploads** with security
- ✅ **Thumbnail generation and serving**
- ✅ **Temporary file processing**
- ✅ **Automatic cleanup**
- ✅ **Proper access controls**

Next step: Implement the image upload service in React Native!