const multer = require('multer');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

// Multer: armazena o arquivo em memória (buffer) para repassar ao S3
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Apenas imagens são permitidas'));
    }
  },
});

// Cliente S3-compatível do Backblaze B2
const getS3Client = () =>
  new S3Client({
    endpoint: process.env.BACKBLAZE_ENDPOINT,
    region: process.env.BACKBLAZE_REGION || 'us-east-005',
    credentials: {
      accessKeyId: process.env.BACKBLAZE_KEYID,
      secretAccessKey: process.env.BACKBLAZE_APPLICATIONKEY,
    },
    forcePathStyle: true, // obrigatório para Backblaze B2
  });

const uploadFile = async (req, res) => {
  try {
    const file = req.file;
    const fileName = req.body.fileName;

    if (!file) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado' });
    }
    if (!fileName) {
      return res.status(400).json({ error: 'fileName é obrigatório' });
    }

    if (!process.env.BACKBLAZE_ENDPOINT || !process.env.BACKBLAZE_KEYID) {
      return res.status(500).json({ error: 'Backblaze não configurado no servidor' });
    }

    const s3 = getS3Client();
    const bucket = process.env.BACKBLAZE_BUCKET;

    await s3.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: fileName,
        Body: file.buffer,
        ContentType: file.mimetype,
        // ACL: 'public-read' -- descomente se o bucket não for público por padrão
      })
    );

    // URL pública: funciona se o bucket estiver configurado como público no Backblaze
    const url = `${process.env.BACKBLAZE_ENDPOINT}/${bucket}/${fileName}`;

    console.log('Upload concluído:', { fileName, url });
    res.json({ url, fileName });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: `Erro ao fazer upload: ${error.message}` });
  }
};

module.exports = { uploadFile, upload };
