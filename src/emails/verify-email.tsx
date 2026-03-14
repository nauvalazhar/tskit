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

interface VerifyEmailProps {
  url: string;
  name: string;
}

export function subject() {
  return 'Verify your email address';
}

export default function VerifyEmailEmail({ url, name }: VerifyEmailProps) {
  return (
    <Html>
      <Tailwind>
        <Head />
        <Body className="bg-[#f6f9fc] font-sans">
          <Container className="bg-white mx-auto pt-5 pb-12 mb-16 max-w-[560px]">
            <Section className="px-12">
              <Text className="text-2xl font-semibold leading-tight text-[#1a1a1a] pt-[17px]">
                Verify your email address
              </Text>
              <Text className="text-base leading-relaxed text-[#484848] my-4">
                Hi {name},
              </Text>
              <Text className="text-base leading-relaxed text-[#484848] my-4">
                Thanks for signing up! Please verify your email address by
                clicking the button below.
              </Text>
              <Button
                className="bg-[#171717] rounded-md text-white text-base font-semibold no-underline text-center block py-3 px-6 my-6"
                href={url}
              >
                Verify Email
              </Button>
              <Hr className="border-[#e6ebf1] my-8" />
              <Text className="text-[#8898aa] text-sm leading-normal">
                If you didn&apos;t create an account, you can safely ignore this
                email.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
