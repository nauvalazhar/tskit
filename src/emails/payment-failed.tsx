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

interface PaymentFailedProps {
  name: string;
}

export function subject() {
  return 'Action required: Payment failed';
}

export default function PaymentFailedEmail({ name }: PaymentFailedProps) {
  return (
    <Html>
      <Tailwind>
        <Head />
        <Body className="bg-[#f6f9fc] font-sans">
          <Container className="bg-white mx-auto pt-5 pb-12 mb-16 max-w-[560px]">
            <Section className="px-12">
              <Text className="text-2xl font-semibold leading-tight text-[#1a1a1a] pt-[17px]">
                Payment failed
              </Text>
              <Text className="text-base leading-relaxed text-[#484848] my-4">
                Hi {name},
              </Text>
              <Text className="text-base leading-relaxed text-[#484848] my-4">
                We were unable to process your latest subscription payment.
                Please update your payment method to avoid any interruption to
                your service.
              </Text>
              <Text className="text-base leading-relaxed text-[#484848] my-4">
                You can update your payment details from the billing section in
                your account settings.
              </Text>
              <Hr className="border-[#e6ebf1] my-8" />
              <Text className="text-[#8898aa] text-sm leading-normal">
                If you believe this is an error, please contact our support team.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
