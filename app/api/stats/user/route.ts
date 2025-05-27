import { auth } from '@/app/(auth)/auth';
import { getUserStats } from '@/lib/db/queries';
import { ChatSDKError } from '@/lib/errors';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return new ChatSDKError(
      'bad_request:api',
      'Parameter userId is required.',
    ).toResponse();
  }

  const session = await auth();

  if (!session?.user) {
    return new ChatSDKError('unauthorized:auth').toResponse();
  }

  if (session.user.id !== userId) {
    return new ChatSDKError('forbidden:auth').toResponse();
  }

  const stats = await getUserStats(userId);

  return Response.json(stats, { status: 200 });
}
