const { google } = require('googleapis');
const fs = require('fs');
const path = require('path'); 
const db = require('../config/db');

const getServiceAccountAuth = () => {
  const keyPath = path.resolve(__dirname, '../' + process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH);
  
  console.log('DEBUG getServiceAccountAuth:');
  console.log('   keyPath =', keyPath);
  
  if (!keyPath || !fs.existsSync(keyPath)) {
    console.error('SERVICE ACCOUNT KEY NOT FOUND:', keyPath);
    return null;
  }

  try {
    const keyFileContent = fs.readFileSync(keyPath, 'utf8');
    const keyFile = JSON.parse(keyFileContent);
    
    console.log('JSON loaded, client_email =', keyFile.client_email);

    const jwtClient = new google.auth.JWT({
      email: keyFile.client_email,
      key: keyFile.private_key,
      scopes: ['https://www.googleapis.com/auth/drive']
    });

    console.log('JWT client created');
    return jwtClient;

  } catch (err) {
    console.error('SERVICE ACCOUNT LOAD ERROR:', err.message);
    return null;
  }
};

const shareMarcomFolderToUser = async (userEmail) => {
  try {
    console.log(`\nAttempting to share folder to: ${userEmail}`);
    
    const auth = getServiceAccountAuth();
    
    if (!auth) {
      console.error('SHARE FOLDER ERROR: Service account auth gagal');
      return false;
    }

    console.log('Service account auth OK');

    // ← TAMBAH BAGIAN INI: Explicit authorize JWT client
    console.log('   → Authorizing JWT client...');
    try {
      await auth.authorize();
      console.log('JWT authorized');
    } catch (authErr) {
      console.error('JWT Authorization failed:', authErr.message);
      return false;
    }

    const drive = google.drive({ version: 'v3', auth });
    console.log('Drive API initialized');

    // Cek dulu permission yang sudah ada
    console.log('   → Checking existing permissions...');
    const permissionsResponse = await drive.permissions.list({
      fileId: process.env.MARCOMM_FOLDER_ID,
      fields: 'permissions(id, emailAddress)'
    });

    console.log('Permissions listed, total:', permissionsResponse.data.permissions.length);

    const alreadyExists = permissionsResponse.data.permissions.some(
      (perm) => perm.emailAddress === userEmail
    );

    if (alreadyExists) {
      console.log(` ${userEmail} already has access`);
      return true;
    }

    // Share folder
    console.log('   → Creating new permission...');
    const permission = await drive.permissions.create({
      fileId: process.env.MARCOMM_FOLDER_ID,
      requestBody: {
        role: 'writer',
        type: 'user',
        emailAddress: userEmail
      },
      fields: 'id'
    });

    console.log(`SHARE FOLDER SUCCESS: ${userEmail} added`);
    return true;

  } catch (err) {
    console.error(`SHARE FOLDER ERROR: ${err.message}`);
    if (err.errors) {
      console.error('   Details:', err.errors);
    }
    return false;
  }
};
const revokeMarcomFolderFromUser = async (userEmail) => {
  try {
    console.log(`\n📥 Attempting to revoke folder from: ${userEmail}`);
    
    const auth = getServiceAccountAuth();

    if (!auth) {
      console.error('REVOKE FOLDER ERROR: Service account auth gagal');
      return false;
    }

    console.log('Service account auth OK');

    // ← TAMBAH: Authorize JWT client
    console.log('   → Authorizing JWT client...');
    try {
      await auth.authorize();
      console.log('JWT authorized');
    } catch (authErr) {
      console.error('JWT Authorization failed:', authErr.message);
      return false;
    }

    const drive = google.drive({ version: 'v3', auth });
    console.log('Drive API initialized');

    // Cari permission ID untuk user itu di folder
    console.log('   → Checking existing permissions...');
    const permissionsResponse = await drive.permissions.list({
      fileId: process.env.MARCOMM_FOLDER_ID,
      fields: 'permissions(id, emailAddress)'
    });

    const userPermission = permissionsResponse.data.permissions.find(
      (perm) => perm.emailAddress === userEmail
    );

    if (!userPermission) {
      console.log(` ${userEmail} tidak ada permission di folder (already removed)`);
      return true;
    }

    console.log('   → Deleting permission...');
    await drive.permissions.delete({
      fileId: process.env.MARCOMM_FOLDER_ID,
      permissionId: userPermission.id
    });

    console.log(`REVOKE FOLDER SUCCESS: ${userEmail} removed`);
    return true;

  } catch (err) {
    console.error(`REVOKE FOLDER ERROR: ${err.message}`);
    if (err.errors) {
      console.error('   Details:', err.errors);
    }
    return false;
  }
};

/**
 * ========== USER OAUTH FUNCTIONS ==========
 * Untuk user yang connect akun Google mereka sendiri (bikin folder request & upload file)
 */

const getDriveClientForUser = async (userId) => {
  const result = await db.query(
    `SELECT google_access_token, google_refresh_token, google_token_expiry
     FROM users WHERE id = $1`,
    [userId]
  );

  if (result.rows.length === 0) {
    return null;
  }

  const user = result.rows[0];

  if (!user.google_access_token || !user.google_refresh_token) {
    return null;
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  oauth2Client.setCredentials({
    access_token: user.google_access_token,
    refresh_token: user.google_refresh_token,
    expiry_date: user.google_token_expiry
      ? new Date(user.google_token_expiry).getTime()
      : null
  });

  oauth2Client.on('tokens', async (tokens) => {
    try {
      if (tokens.access_token) {
        await db.query(
          `UPDATE users SET google_access_token = $1, google_token_expiry = to_timestamp($2 / 1000.0) WHERE id = $3`,
          [tokens.access_token, tokens.expiry_date, userId]
        );
      }

      if (tokens.refresh_token) {
        await db.query(
          `UPDATE users SET google_refresh_token = $1 WHERE id = $2`,
          [tokens.refresh_token, userId]
        );
      }
    } catch (err) {
      console.error('GAGAL SIMPAN TOKEN GOOGLE BARU:', err.message);
    }
  });

  try {
    await oauth2Client.getAccessToken();
  } catch (err) {
    console.error('GAGAL REFRESH TOKEN GOOGLE:', err.message);
    return null;
  }

  return google.drive({ version: 'v3', auth: oauth2Client });
};

const createSubFolder = async (drive, parentId, folderName) => {
  const folder = await drive.files.create({
    requestBody: {
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
      parents: [parentId]
    },
    fields: 'id, webViewLink'
  });

  return folder.data.id;
};

const createGoogleDriveFolder = async (userId, folderName) => {
  try {
    const drive = await getDriveClientForUser(userId);

    if (!drive) {
      return null;
    }

    const folder = await drive.files.create({
      requestBody: {
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
        parents: [process.env.MARCOMM_FOLDER_ID]
      },
      fields: 'id'
    });

    const mainFolderId = folder.data.id;

    const [supportFile, draft, final, documentation] = await Promise.all([
      createSubFolder(drive, mainFolderId, 'Support File'),
      createSubFolder(drive, mainFolderId, 'Draft'),
      createSubFolder(drive, mainFolderId, 'Final'),
      createSubFolder(drive, mainFolderId, 'Documentation')
    ]);

    return {
      mainFolderId,
      subfolders: { supportFile, draft, final, documentation }
    };

  } catch (err) {
    console.error('GOOGLE DRIVE ERROR:', err.message);
    return null;
  }
};

const uploadFileToDriveFolder = async (userId, folderId, file) => {
  try {
    const drive = await getDriveClientForUser(userId);

    if (!drive) {
      return null;
    }

    const uploadedFile = await drive.files.create({
      requestBody: {
        name: file.originalname,
        parents: [folderId]
      },
      media: {
        mimeType: file.mimetype,
        body: fs.createReadStream(file.path)
      },
      fields: 'id, webViewLink'
    });

    return uploadedFile.data;

  } catch (err) {
    console.error('UPLOAD DRIVE ERROR:', err.message);
    return null;
  }
};

const uploadFilesToDriveFolder = async (userId, folderId, files) => {
  const drive = await getDriveClientForUser(userId);

  if (!drive) {
    return [];
  }

  const results = [];

  for (const file of files) {
    try {
      const uploadedFile = await drive.files.create({
        requestBody: {
          name: file.originalname,
          parents: [folderId]
        },
        media: {
          mimeType: file.mimetype,
          body: fs.createReadStream(file.path)
        },
        fields: 'id, webViewLink'
      });

      results.push({
        name: file.originalname,
        id: uploadedFile.data.id,
        webViewLink: uploadedFile.data.webViewLink
      });
    } catch (err) {
      console.error(`UPLOAD DRIVE ERROR (${file.originalname}):`, err.message);
    }
  }

  return results;
};

module.exports = {
  // Service account functions (untuk admin manage permissions)
  shareMarcomFolderToUser,
  revokeMarcomFolderFromUser,
  
  // User OAuth functions (untuk user bikin folder & upload)
  createGoogleDriveFolder,
  uploadFileToDriveFolder,
  uploadFilesToDriveFolder
};