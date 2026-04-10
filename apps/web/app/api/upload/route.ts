import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getUser, ok, err } from '@/lib/api';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function POST(req: NextRequest) {
  try {
    const user = await getUser(req);
    if (!user) return err('인증이 필요합니다.', 401);

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    if (!file) return err('파일이 없습니다.', 400);

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) return err('이미지 파일만 업로드 가능합니다.', 400);

    const MAX_SIZE = 5 * 1024 * 1024; // 5MB
    if (file.size > MAX_SIZE) return err('파일 크기는 5MB 이하여야 합니다.', 400);

    const ext = file.name.split('.').pop() ?? 'jpg';
    const fileName = `posts/${Date.now()}-${crypto.randomUUID()}.${ext}`;

    const arrayBuffer = await file.arrayBuffer();
    const { error } = await supabase.storage
      .from('posts')
      .upload(fileName, arrayBuffer, {
        contentType: file.type,
        upsert: false,
      });

    if (error) return err('파일 업로드에 실패했습니다.', 500);

    const { data: urlData } = supabase.storage.from('posts').getPublicUrl(fileName);
    return ok({ url: urlData.publicUrl }, 201);
  } catch {
    return err('서버 오류가 발생했습니다.', 500);
  }
}
