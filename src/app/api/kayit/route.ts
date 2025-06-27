import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  const { adSoyad, okul } = await req.json();

  const total = await prisma.kayit.count();

  if (total >= 25) {
    return NextResponse.json({ message: 'Kayıt kontenjanı dolmuştur.' });
  }

  await prisma.kayit.create({
    data: { adSoyad, okul },
  });

  const asilMi = total < 20;
  return NextResponse.json({
    message: asilMi
      ? 'Kayıt başarıyla alındı. (Asil Katılımcı)'
      : 'Kayıt başarıyla alındı. (Yedek Katılımcı)',
  });
}
