import { redirect } from 'next/navigation'

interface Props {
  searchParams?: { [key: string]: string | string[] | undefined }
}

export default function LoginAliasPage({ searchParams }: Props) {
  const redirectTo = typeof searchParams?.redirectTo === 'string' ? searchParams.redirectTo : ''
  redirect(redirectTo ? `/auth/login?redirectTo=${encodeURIComponent(redirectTo)}` : '/auth/login')
}
