'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function Home() {
  const [formData, setFormData] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [school, setSchool] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  useEffect(() => {
    fetchFormData();
  }, []);

  const fetchFormData = async () => {
    try {
      const response = await axios.get<FormData[]>('/api/forms');
      setFormData(response.data);
    } catch (error) {
      console.error('Veri alınamadı:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !school || !email || !phone) return;

    try {
      await axios.post('/api/forms', { name, school, email, phone });
      setSubmitted(true);
      fetchFormData(); // Refresh the list after submit
    } catch (error) {
      console.error('Kayıt sırasında hata:', error);
    }
  };

  const isFull = formData.length >= 25;
  const isWaitingList = formData.length >= 20;

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-100 to-blue-300 flex items-center justify-center p-4">
      <div className="bg-white shadow-lg rounded-xl p-8 max-w-md w-full">
        <h1 className="text-2xl font-semibold text-blue-700 mb-4">Etkinlik Kaydı</h1>

        {submitted || isFull ? (
          <div className="text-center">
            {isFull ? (
              <p className="text-red-500 font-semibold">Kayıtlar dolmuştur.</p>
            ) : (
              <p className="text-green-500 font-semibold">Kaydınız alınmıştır.</p>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Ad Soyad"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border rounded-md"
            />
            <input
              type="text"
              placeholder="Okul"
              value={school}
              onChange={(e) => setSchool(e.target.value)}
              className="w-full px-4 py-2 border rounded-md"
            />
            <input
              type="email"
              placeholder="E-posta"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border rounded-md"
            />
            <input
              type="tel"
              placeholder="Telefon Numarası"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-2 border rounded-md"
            />
            <button
              type="submit"
              disabled={isFull}
              className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
            >
              {isWaitingList ? 'Yedek Listeye Kaydol' : 'Kaydol'}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
