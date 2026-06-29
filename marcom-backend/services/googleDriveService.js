const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');
const db = require('../config/db');

// ─── SERVICE ACCOUNT ────────────────────────────────────────────────────────

const getServiceAccountAuth = () => {
  const keyPath = path.resolve(
    __dirname,
    '../' + process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH
  );

  console.log('DEBUG getServiceAccountAuth:');
  console.log('   keyPath =', keyPath);

  if (!keyPath || !fs.existsSync(keyPath)) {
    console.error('SERVICE ACCOUNT KEY NOT FOUND:', keyPath);
    return null;
  }

  try {
    const keyFile = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
    console.log('JSON loaded, client_email =', keyFile.client_email);

    const jwtClient = new google.auth.JWT({
      email: keyFile.client_email,
      key: keyFile.private_key,
      scopes: ['https://www.googleapis.com/auth/drive'],
    });

    console.log('JWT client created');
    return jwtClient;
  } catch (err) {
    console.error('SERVICE ACCOUNT LOAD ERROR:', err.message);
    return null;
  }
};

/**
 * Buat Drive client pakai service account.
 * Dipakai sebagai fallback ketika user OAuth tidak tersedia / expired.
 */
const getServiceAccountDriveClient = async () => {
  const auth = getServiceAccountAuth();
  if (!auth) return null;

  try {
    await auth.authorize();
    return google.drive({ version: 'v3', auth });
  } catch (err) {
    console.error('Service account authorize error:', err.message);
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

    await auth.authorize();
    const drive = google.drive({ version: 'v3', auth });

    const permissionsResponse = await drive.permissions.list({
      fileId: process.env.MARCOMM_FOLDER_ID,
      fields: 'permissions(id, emailAddress)',
    });

    const alreadyExists = permissionsResponse.data.permissions.some(
      (perm) => perm.emailAddress === userEmail
    );

    if (alreadyExists) {
      console.log(`${userEmail} already has access`);
      return true;
    }

    await drive.permissions.create({
      fileId: process.env.MARCOMM_FOLDER_ID,
      requestBody: { role: 'writer', type: 'user', emailAddress: userEmail },
      fields: 'id',
    });

    console.log(`SHARE FOLDER SUCCESS: ${userEmail} added`);
    return true;
  } catch (err) {
    console.error(`SHARE FOLDER ERROR: ${err.message}`);
    if (err.errors) console.error('   Details:', err.errors);
    return false;
  }
};

const revokeMarcomFolderFromUser = async (userEmail) => {
  try {
    console.log(`\nAttempting to revoke folder from: ${userEmail}`);

    const auth = getServiceAccountAuth();
    if (!auth) {
      console.error('REVOKE FOLDER ERROR: Service account auth gagal');
      return false;
    }

    await auth.authorize();
    const drive = google.drive({ version: 'v3', auth });

    const permissionsResponse = await drive.permissions.list({
      fileId: process.env.MARCOMM_FOLDER_ID,
      fields: 'permissions(id, emailAddress)',
    });

    const userPermission = permissionsResponse.data.permissions.find(
      (perm) => perm.emailAddress === userEmail
    );

    if (!userPermission) {
      console.log(`${userEmail} tidak ada permission (already removed)`);
      return true;
    }

    await drive.permissions.delete({
      fileId: process.env.MARCOMM_FOLDER_ID,
      permissionId: userPermission.id,
    });

    console.log(`REVOKE FOLDER SUCCESS: ${userEmail} removed`);
    return true;
  } catch (err) {
    console.error(`REVOKE FOLDER ERROR: ${err.message}`);
    if (err.errors) console.error('   Details:', err.errors);
    return false;
  }
};

// ─── USER OAUTH ─────────────────────────────────────────────────────────────

const getDriveClientForUser = async (userId) => {
  const result = await db.query(
    `SELECT google_access_token, google_refresh_token, google_token_expiry
     FROM users WHERE id = $1`,
    [userId]
  );

  if (result.rows.length === 0) return null;

  const user = result.rows[0];

  if (!user.google_access_token || !user.google_refresh_token) {
    console.warn(`getDriveClientForUser: user ${userId} belum connect Google OAuth`);
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
      : null,
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
    return google.drive({ version: 'v3', auth: oauth2Client });
  } catch (err) {
    console.error(`GAGAL REFRESH TOKEN GOOGLE (user ${userId}):`, err.message);
    return null;
  }
};

// ─── HELPERS ────────────────────────────────────────────────────────────────

const createSubFolder = async (drive, parentId, folderName) => {
  const folder = await drive.files.create({
    requestBody: {
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
      parents: [parentId],
    },
    fields: 'id',
  });
  return folder.data.id;
};

/**
 * Hapus file temp multer dari disk setelah upload ke Drive selesai.
 */
const cleanupTempFiles = (files) => {
  for (const file of files) {
    try {
      if (file.path && fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
    } catch (err) {
      console.warn(`Gagal hapus temp file ${file.path}:`, err.message);
    }
  }
};

// ─── EXPORTED FUNCTIONS ─────────────────────────────────────────────────────

/**
 * Buat folder Google Drive untuk satu request.
 * Coba user OAuth dulu → fallback ke service account.
 */
const createGoogleDriveFolder = async (userId, folderName) => {
  try {
    // Coba user OAuth dulu
    let drive = await getDriveClientForUser(userId);

    if (!drive) {
      console.warn('createGoogleDriveFolder: user OAuth tidak tersedia, fallback ke service account');
      drive = await getServiceAccountDriveClient();
    }

    if (!drive) {
      console.error('createGoogleDriveFolder: tidak ada Drive client yang tersedia');
      return null;
    }

    const folder = await drive.files.create({
      requestBody: {
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
        parents: [process.env.MARCOMM_FOLDER_ID],
      },
      fields: 'id',
    });

    const mainFolderId = folder.data.id;

    const [supportFile, draft, final, documentation] = await Promise.all([
      createSubFolder(drive, mainFolderId, 'Support File'),
      createSubFolder(drive, mainFolderId, 'Draft'),
      createSubFolder(drive, mainFolderId, 'Final'),
      createSubFolder(drive, mainFolderId, 'Documentation'),
    ]);

    return {
      mainFolderId,
      subfolders: { supportFile, draft, final, documentation },
    };
  } catch (err) {
    console.error('GOOGLE DRIVE ERROR (createGoogleDriveFolder):', err.message);
    return null;
  }
};

const uploadFileToDriveFolder = async (userId, folderId, file) => {
  try {
    let drive = await getDriveClientForUser(userId);

    if (!drive) {
      console.warn('uploadFileToDriveFolder: user OAuth tidak tersedia, fallback ke service account');
      drive = await getServiceAccountDriveClient();
    }

    if (!drive) return null;

    const uploadedFile = await drive.files.create({
      requestBody: { name: file.originalname, parents: [folderId] },
      media: { mimeType: file.mimetype, body: fs.createReadStream(file.path) },
      fields: 'id, webViewLink',
    });

    cleanupTempFiles([file]);
    return uploadedFile.data;
  } catch (err) {
    console.error('UPLOAD DRIVE ERROR:', err.message);
    return null;
  }
};

/**
 * Upload banyak file ke folder Drive.
 * Coba user OAuth dulu → fallback ke service account.
 * File temp di disk dihapus setelah upload.
 */
const uploadFilesToDriveFolder = async (userId, folderId, files) => {
  // Pilih Drive client: user OAuth → service account
  let drive = await getDriveClientForUser(userId);

  if (!drive) {
    console.warn(`uploadFilesToDriveFolder: user ${userId} tidak punya OAuth aktif, fallback ke service account`);
    drive = await getServiceAccountDriveClient();
  }

  if (!drive) {
    console.error('uploadFilesToDriveFolder: tidak ada Drive client yang tersedia (OAuth & service account keduanya gagal)');
    return [];
  }

  const results = [];

  for (const file of files) {
    try {
      const uploadedFile = await drive.files.create({
        requestBody: { name: file.originalname, parents: [folderId] },
        media: { mimeType: file.mimetype, body: fs.createReadStream(file.path) },
        fields: 'id, webViewLink, name',
      });

      results.push({
        name: file.originalname,
        id: uploadedFile.data.id,
        webViewLink: uploadedFile.data.webViewLink,
        size: file.size,
        uploadedAt: new Date().toISOString(),
      });

      console.log(`Upload OK: ${file.originalname}`);
    } catch (err) {
      console.error(`UPLOAD DRIVE ERROR (${file.originalname}):`, err.message);
    } finally {
      // Hapus file temp meski upload gagal
      cleanupTempFiles([file]);
    }
  }

  return results;
};

module.exports = {
  shareMarcomFolderToUser,
  revokeMarcomFolderFromUser,
  createGoogleDriveFolder,
  uploadFileToDriveFolder,
  uploadFilesToDriveFolder,
};