'use client';
import { useState } from 'react';

export default function Home() {
  const [formData, setFormData] = useState({ adSoyad: '', okul: '' });
  const [message, setMessage] = useState('');
  const [formDisabled, setFormDisabled] = useState(false);

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const res = await fetch('/api/kayit', {
      method: 'POST',
      body: JSON.stringify(formData),
    });

    const data = await res.json();
    setMessage(data.message);

    if (data.message.includes('dolmuştur')) {
      setFormData({ adSoyad: '', okul: '' });
      setFormDisabled(true);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-500 to-teal-400 flex items-center justify-center px-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-sm p-8">
        <h2 className="text-2xl font-bold text-center text-gray-800">Kayıt Ol</h2>
        <hr className="my-4 border-gray-200" />

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 text-sm mb-1">Ad Soyad</label>
            <input
              name="adSoyad"
              type="text"
              placeholder="Adınızı yazın"
              value={formData.adSoyad}
              onChange={handleChange}
              disabled={formDisabled}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm mb-1">Okul</label>
            <input
              name="okul"
              type="text"
              placeholder="Okulunuzu yazın"
              value={formData.okul}
              onChange={handleChange}
              disabled={formDisabled}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <button
            type="submit"
            disabled={formDisabled}
            className={`w-full py-2 rounded-full font-semibold transition ${
              formDisabled
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {formDisabled ? 'Kontenjan Doldu' : 'Kaydol'}
          </button>
        </form>

        {message && (
          <p className="mt-4 text-center text-sm bg-blue-50 text-blue-700 p-2 rounded">{message}</p>
        )}

        <p className="text-center text-sm text-gray-500 mt-6">
          © 2025 Abdulgazi Şimşek tarafından yapılmıştır.
        </p>
      </div>
    </main>
  );
}
