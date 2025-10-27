import { FeedbackForm } from '@/components/FeedbackForm';

export default function HomePage() {
  return (
    <main>
      {/* The main logic lives inside the client boundary */}
      <FeedbackForm />
    </main>
  );
}