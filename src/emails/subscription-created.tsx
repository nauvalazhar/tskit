import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Hr,
  Tailwind,
} from '@react-email/components';

interface SubscriptionCreatedProps {
  name: string;
  planName: string;
}

export function subject() {
  return 'Your subscription is active';
}

export default function SubscriptionCreatedEmail({
  name,
  planName,
}: SubscriptionCreatedProps) {
  return (
    <Html>
      <Tailwind>
        <Head />
        <Body className="bg-[#f6f9fc] font-sans">
          <Container className="bg-white mx-auto pt-5 pb-12 mb-16 max-w-[560px]">
            <Section className="px-12">
              <Text className="text-2xl font-semibold leading-tight text-[#1a1a1a] pt-[17px]">
                Your subscription is active
              </Text>
              <Text className="text-base leading-relaxed text-[#484848] my-4">
                Hi {name},
              </Text>
              <Text className="text-base leading-relaxed text-[#484848] my-4">
                Thank you for subscribing! Your <strong>{planName}</strong> plan
                is now active. You can manage your subscription at any time from
                your billing settings.
              </Text>
              <Hr className="border-[#e6ebf1] my-8" />
              <Text className="text-[#8898aa] text-sm leading-normal">
                If you have any questions about your subscription, please
                don&apos;t hesitate to reach out to our support team.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
