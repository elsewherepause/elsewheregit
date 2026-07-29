import LoginForm from './LoginForm'

export const metadata = { title: 'Sign In' }

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-paper-warm)]">
      <div className="w-full max-w-sm">
        <h1
          className="text-3xl mb-8 text-center tracking-tight"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          .elsewhere
        </h1>
        <LoginForm />
      </div>
    </div>
  )
}
