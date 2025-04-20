# Name Corrector - Indian Police Records Management System

[![Next.js](https://img.shields.io/badge/Next.js-13+-000000?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18+-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org/)
[![Firebase](https://img.shields.io/badge/Firebase-9+-FFCA28?style=for-the-badge&logo=firebase)](https://firebase.google.com/)
[![Gemini](https://img.shields.io/badge/Gemini-AI-4285F4?style=for-the-badge&logo=google)](https://deepmind.google/technologies/gemini/)

A modern web application for Indian police departments to manage, audit, and correct case records with a focus on name standardization and data quality. This application uses AI to detect and suggest corrections for Indian names within police case records.

![Name Corrector Screenshot](screenshot.png)

## 🌟 Features

- **CSV Data Import/Export**: Upload, view, and edit CSV files containing case records
- **AI-powered Name Auditing**: Automatically detect and correct misspelled or improperly formatted Indian names
- **Crime Statistics Analysis**: Visualize and analyze crime data across records
- **Legal Context**: Get AI-generated legal information about crimes in your records
- **Data Query**: Ask questions about your data and get AI-powered insights
- **User Authentication**: Secure login with Firebase authentication
- **Cloud Storage**: Automatically save and retrieve files from Firebase Firestore
- **Responsive UI**: Modern, responsive interface that works on all devices

## 📋 Prerequisites

- Node.js 16.x or higher
- npm or yarn
- Firebase account
- Google Cloud account with Gemini API access

## 🚀 Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/name-corrector-h4b.git
   cd name-corrector-h4b
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the root directory with the following variables:
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id
   NEXT_PUBLIC_GOOGLE_GENAI_API_KEY=your_gemini_api_key
   ```

4. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📊 CSV File Structure

The application expects CSV files with the following columns:

| Column Name | Description |
|-------------|-------------|
| Case Title | Unique identifier or title for the case |
| Date | Date of the case record |
| Accused First Name | First name of the accused person |
| Accused Last Name | Last name of the accused person |
| Crime | Type of crime committed |
| Accused Status | Current status of the accused (e.g., arrested, wanted) |
| Criminal Location | Location where the crime occurred |
| Police Station | Police station handling the case |
| Inspector In charge | Name of the inspector handling the case |
| Last Audit Date | Date when the record was last audited |
| Last Audit By | Person who performed the last audit |
| Last Audit Status | Status of the last audit |
| Last Audit Remarks | Additional remarks from the last audit |
| Last Audit Location | Location field that was audited |

Additional columns will be preserved but the above structure is recommended for optimal functionality.

## 👤 User Flow

1. **Authentication**:
   - New users can sign up with email/password or Google account
   - Existing users can sign in with their credentials
   - Anonymous sign-in is available for testing

2. **File Management**:
   - Upload new CSV files from the File Management panel
   - View a list of previously uploaded files
   - Load any file to view and edit its contents

3. **Data Viewing and Editing**:
   - View case records in a tabular format
   - Edit any cell directly in the table
   - Delete rows as needed
   - Save changes or download the edited file

4. **Name Auditing**:
   - Click "Audit Data" to analyze names in the file
   - View a summary of the audit results
   - See specific correction suggestions for Indian names
   - Apply corrections individually or all at once

5. **Crime Analysis**:
   - Click "Analyze Crimes" to see statistics about crime types
   - Navigate to the dedicated crime statistics page
   - Get AI-generated legal analysis of crimes in your dataset

6. **Data Querying**:
   - Ask questions about your data in natural language
   - Receive AI-generated insights based on your records

## 💼 Use Cases

### Police Record Management
- **User**: Police Station Administrator
- **Goal**: Maintain accurate digital records of cases
- **Flow**: Upload CSV exports from legacy systems → Audit and correct data → Save corrected data

### Name Standardization
- **User**: Data Entry Officer
- **Goal**: Ensure consistent spelling of Indian names
- **Flow**: Load case file → Run Audit → Apply name corrections → Save and export

### Crime Analysis
- **User**: Police Inspector
- **Goal**: Understand crime patterns in jurisdiction
- **Flow**: Upload records → Navigate to crime analysis → View statistics → Get legal context

### Case Record Inquiry
- **User**: Investigation Officer
- **Goal**: Find specific information across multiple cases
- **Flow**: Load case file → Use AI query to ask specific questions → Receive relevant insights

### Audit Trail Maintenance
- **User**: Supervisory Officer
- **Goal**: Track changes to sensitive case data
- **Flow**: Apply corrections → System automatically logs audit trail → Export data with audit history

## 🛠️ Technologies Used

- **Frontend**: React, Next.js, TailwindCSS, shadcn/ui, Framer Motion
- **Backend**: Firebase (Authentication, Firestore)
- **AI**: Google Gemini API for name correction and data analysis
- **State Management**: React Hooks
- **Data Visualization**: Custom components and CSS

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgements

- [Next.js](https://nextjs.org/)
- [Firebase](https://firebase.google.com/)
- [Google Gemini](https://deepmind.google/technologies/gemini/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Lucide Icons](https://lucide.dev/)
- [TailwindCSS](https://tailwindcss.com/)
