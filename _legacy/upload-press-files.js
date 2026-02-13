const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.SUPABASE_URL || 'https://fjnfsabvuiyzuzfhxzcc.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseKey) {
  console.error('Error: SUPABASE_SERVICE_ROLE_KEY environment variable not set');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function uploadFile(filePath) {
  try {
    const fileName = path.basename(filePath);
    const fileBuffer = fs.readFileSync(filePath);
    const fileExt = path.extname(fileName);
    const contentType = fileExt === '.pdf' ? 'application/pdf' :
                       fileExt === '.png' ? 'image/png' : 'image/jpeg';

    // Determine folder based on file type
    const folder = fileExt === '.pdf' ? 'press-pdfs' : 'press-images';
    const storagePath = `${folder}/${fileName}`;

    console.log(`Uploading ${fileName} to ${storagePath}...`);

    const { data, error } = await supabase.storage
      .from('media')
      .upload(storagePath, fileBuffer, {
        contentType: contentType,
        upsert: true
      });

    if (error) {
      console.error(`Error uploading ${fileName}:`, error);
      return null;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('media')
      .getPublicUrl(storagePath);

    console.log(`✅ ${fileName} uploaded successfully`);
    console.log(`   URL: ${urlData.publicUrl}\n`);

    return {
      fileName,
      url: urlData.publicUrl,
      type: fileExt === '.pdf' ? 'pdf' : 'image'
    };

  } catch (err) {
    console.error(`Error processing ${filePath}:`, err);
    return null;
  }
}

async function main() {
  const files = [
    '/Users/paulgosnell/Desktop/press1.jpg',
    '/Users/paulgosnell/Desktop/press2.png',
    '/Users/paulgosnell/Desktop/press3.png',
    '/Users/paulgosnell/Desktop/press1.pdf',
    '/Users/paulgosnell/Desktop/press3.pdf'
  ];

  console.log('Starting upload...\n');

  const results = {};
  for (const file of files) {
    if (fs.existsSync(file)) {
      const result = await uploadFile(file);
      if (result) {
        results[result.fileName] = result.url;
      }
    } else {
      console.log(`⚠️  File not found: ${file}`);
    }
  }

  console.log('\n📋 Summary:');
  console.log('Images:');
  console.log('  press1.jpg:', results['press1.jpg'] || 'Not uploaded');
  console.log('  press2.png:', results['press2.png'] || 'Not uploaded');
  console.log('  press3.png:', results['press3.png'] || 'Not uploaded');
  console.log('\nPDFs:');
  console.log('  press1.pdf:', results['press1.pdf'] || 'Not uploaded');
  console.log('  press3.pdf:', results['press3.pdf'] || 'Not uploaded');
}

main().catch(console.error);
