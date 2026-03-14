import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Button,
  Hr,
  Tailwind,
} from '@react-email/components';

interface ResetPasswordProps {
  url: string;
  name: string;
}

export function subject() {
  return 'Reset your password';
}

export default function ResetPasswordEmail({ url, name }: ResetPasswordProps) {
  return (
    <Html>
      <Tailwind>
        <Head />
        <Body className="bg-[#f6f9fc] font-sans">
          <Container className="bg-white mx-auto pt-5 pb-12 mb-16 max-w-[560px]">
            <Section className="px-12">
              <Text className="text-2xl font-semibold leading-tight text-[#1a1a1a] pt-[17px]">
                Reset your password
              </Text>
              <Text className="text-base leading-relaxed text-[#484848] my-4">
                Hi {name},
              </Text>
              <Text className="text-base leading-relaxed text-[#484848] my-4">
                We received a request to reset your password. Click the button
                below to choose a new one.
              </Text>
              <Button
                className="bg-[#171717] rounded-md text-white text-base font-semibold no-underline text-center block py-3 px-6 my-6"
                href={url}
              >
                Reset Password
              </Button>
              <Hr className="border-[#e6ebf1] my-8" />
              <Text className="text-[#8898aa] text-sm leading-normal">
                If you didn&apos;t request a password reset, you can safely
                ignore this email. This link will expire in 1 hour.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
