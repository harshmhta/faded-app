# Appwrite Database Setup

This guide will help you set up the required Appwrite database collections for the Faded app.

## Database Structure

Database ID: `faded-database`

### Collections

#### 1. mood-check-ins
Stores daily mood check-ins from users.

**Collection ID:** `mood-check-ins`

**Attributes:**
- `userId` (String, required, size: 255)
- `date` (String, required, size: 50) - Format: YYYY-MM-DD
- `mood` (String, required, size: 100) - Emoji or mood identifier
- `comment` (String, optional, size: 5000)
- `timestamp` (String, required, size: 50) - ISO timestamp

**Indexes:**
- `userId_index` - Key: userId, Type: key, Order: ASC
- `date_index` - Key: date, Type: key, Order: DESC
- `userId_date_index` - Keys: userId (ASC), date (DESC), Type: unique

**Permissions:**
- Users can only read/update/delete their own documents (set via document-level permissions in code)

#### 2. consumption-tracking
Stores daily consumption tracking (clean vs smoked status).

**Collection ID:** `consumption-tracking`

**Attributes:**
- `userId` (String, required, size: 255)
- `date` (String, required, size: 50) - Format: YYYY-MM-DD
- `status` (String, required, size: 50) - Values: "clean" or "smoked"
- `comment` (String, optional, size: 5000)
- `timestamp` (String, required, size: 50) - ISO timestamp

**Indexes:**
- `userId_index` - Key: userId, Type: key, Order: ASC
- `date_index` - Key: date, Type: key, Order: DESC
- `userId_date_index` - Keys: userId (ASC), date (DESC), Type: unique

**Permissions:**
- Users can only read/update/delete their own documents (set via document-level permissions in code)

#### 3. sobriety-timer
Stores the sobriety timer start time for each user.

**Collection ID:** `sobriety-timer`

**Attributes:**
- `userId` (String, required, size: 255)
- `startTime` (String, required, size: 50) - ISO timestamp

**Indexes:**
- `userId_index` - Key: userId, Type: unique, Order: ASC

**Permissions:**
- Users can only read/update/delete their own documents (set via document-level permissions in code)

## Setup Instructions

### 1. Create Database
1. Go to your Appwrite Console
2. Navigate to Databases
3. Click "Create Database"
4. Set Database ID as: `faded-database`
5. Click "Create"

### 2. Create Collections

For each collection listed above:

1. Click "Create Collection" in your database
2. Set the Collection ID as specified
3. Click "Create"
4. Go to the "Attributes" tab and add each attribute as specified
5. Go to the "Indexes" tab and create each index as specified
6. Go to the "Settings" tab and configure permissions:
   - Enable "Document Security" (this allows document-level permissions)
   - Collection-level permissions can be left empty as we handle permissions in code

### 3. Update Environment Variables

Add these to your `.env` file (copy from `.env.example`):

```env
EXPO_PUBLIC_APPWRITE_ENDPOINT=https://nyc.cloud.appwrite.io/v1
EXPO_PUBLIC_APPWRITE_PROJECT_ID=your-appwrite-project-id
EXPO_PUBLIC_APPWRITE_PLATFORM=com.fadedapp
EXPO_PUBLIC_APPWRITE_DATABASE_ID=faded-database
EXPO_PUBLIC_APPWRITE_MOOD_COLLECTION_ID=mood-check-ins
EXPO_PUBLIC_APPWRITE_CONSUMPTION_COLLECTION_ID=consumption-tracking
EXPO_PUBLIC_APPWRITE_SOBRIETY_TIMER_COLLECTION_ID=sobriety-timer
```

## Notes

- The app automatically creates document-level permissions when saving data
- Each user can only access their own mood check-ins, consumption tracking, and sobriety timer
- The unique index on `userId_date_index` ensures users can only have one entry per date
- All date fields use ISO format (YYYY-MM-DD) for consistency
- Timestamps use full ISO 8601 format for precise tracking
