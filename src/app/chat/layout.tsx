import { ChatLayout } from '@/components/chat/chat-layout';

export default function ChatLayoutPage({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ChatLayout>{children}</ChatLayout>;
}
