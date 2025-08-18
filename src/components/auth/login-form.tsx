import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Logo } from '@/components/logo';

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg role="img" viewBox="0 0 24 24" {...props}>
    <path
      fill="currentColor"
      d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.73 4.1-1.02 1.02-2.62 1.98-4.66 1.98-3.55 0-6.43-2.91-6.43-6.4s2.88-6.4 6.43-6.4c2.03 0 3.36.83 4.13 1.55l2.64-2.58C18.01 1.83 15.54 0 12.48 0 5.88 0 0 5.88 0 12.48s5.88 12.48 12.48 12.48c7.02 0 12.24-4.82 12.24-12.72 0-.8-.08-1.56-.22-2.32H12.48z"
    ></path>
  </svg>
);

const MicrosoftIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg role="img" viewBox="0 0 23 23" {...props}>
        <path fill="#f25022" d="M1 1h10.5v10.5H1z"/>
        <path fill="#7fba00" d="M12.5 1h10.5v10.5H12.5z"/>
        <path fill="#00a4ef" d="M1 12.5h10.5V23H1z"/>
        <path fill="#ffb900" d="M12.5 12.5h10.5V23H12.5z"/>
    </svg>
);

export function LoginForm() {
  return (
    <Card className="w-full max-w-sm shadow-xl">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4">
            <Logo />
        </div>
        <CardTitle className="text-2xl font-bold">Welcome to Soporte</CardTitle>
        <CardDescription>Your AI-powered support assistant.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <Button variant="outline" className="w-full">
            <GoogleIcon className="mr-2 h-5 w-5" />
            Sign in with Google
          </Button>
          <Button variant="outline" className="w-full">
            <MicrosoftIcon className="mr-2 h-5 w-5" />
            Sign in with Microsoft
          </Button>
        </div>
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">
              Or with email
            </span>
          </div>
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input id="email" type="email" placeholder="you@example.com" required defaultValue="personal_1@corp.com" />
          </div>
          <Link href="/" className="w-full" passHref>
            <Button className="w-full">Send Magic Link</Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
