import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/auth/callback')({
  component: OAuthCallbackHandler,
  beforeLoad({ context }) {
    if (context.auth.isAuthenticated()) throw redirect({ to: "/" });
  },
  loader({ context }) {
    context.auth.handleOAuthCallback();
  },
})

function OAuthCallbackHandler() {
  return <div className='h-dvh w-dvw flex flex-col gap-4 items-center justify-center'>
    <div className="animate-spin rounded-full h-12 w-12 border-b-3 border-primary mx-auto"></div>
    <h1 className='text-xl'>Autenticando...</h1>
  </div>
}
