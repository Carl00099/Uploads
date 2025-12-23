'use client';

import { upload } from '@vercel/blob/client';
import { useState, useRef } from 'react';

export default function Home() {
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const uploadFile = async () => {
    if (!fileRef.current?.files?.length) return setMsg('Pick a file first');

    const file = fileRef.current.files[0];
    setUploading(true);
    setMsg('Uploading...');

    try {
      const blob = await upload(file.name, file, {
        access: 'public',
        handleUploadUrl: '/api/upload',
      });
      setMsg(`Done! 🎉\nView: ${blob.url}`);
      fileRef.current.value = '';
      window.location.reload();
    } catch (e) {
      setMsg('Failed. Try again.');
    }
    setUploading(false);
  };

  return (
    <main className="p-6 max-w-xl mx-auto">
      <h1 className="text-4xl font-bold text-center my-8">Zim Upload Gallery 🇿🇼</h1>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <input type="file" ref={fileRef} className="block w-full mb-4" />
        <button onClick={uploadFile} disabled={uploading} className="w-full bg-blue-600 text-white py-3 rounded">
          {uploading ? 'Uploading...' : 'Upload'}
        </button>
        {msg && <p className="mt-4 whitespace-pre-line">{msg}</p>}
      </div>

      <Gallery />
    </main>
  );
}

async function Gallery() {
  'use server';
  const { list } = await import('@vercel/blob');
  const { blobs } = await list();

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold mb-4">Public Gallery ({blobs.length})</h2>
      <div className="grid grid-cols-2 gap-4">
        {blobs.map(b => (
          <div key={b.url} className="bg-white rounded overflow-hidden shadow">
            {b.pathname.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
              <img src={b.url} className="w-full" />
            ) : (
              <div className="h-48 bg-gray-200 flex items-center justify-center">📄</div>
            )}
            <a href={b.url} target="_blank" className="block p-2 text-center text-sm bg-gray-100">
              {b.pathname}
            </a>
          </div>
        ))}
      </div>
      {blobs.length === 0 && <p className="text-center">No files yet!</p>}
    </div>
  );
      }
