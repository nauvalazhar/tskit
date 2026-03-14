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

interface PasswordChangedProps {
  name: string;
}

export function subject() {
  return 'Your password has been changed';
}

export default function PasswordChangedEmail({ name }: PasswordChangedProps) {
  return (
    <Html>
      <Tailwind>
        <Head />
        <Body className="bg-[#f6f9fc] font-sans">
          <Container className="bg-white mx-auto pt-5 pb-12 mb-16 max-w-[560px]">
            <Section className="px-12">
              <Text className="text-2xl font-semibold leading-tight text-[#1a1a1a] pt-[17px]">
                Password changed
              </Text>
              <Text className="text-base leading-relaxed text-[#484848] my-4">
                Hi {name},
              </Text>
              <Text className="text-base leading-relaxed text-[#484848] my-4">
                Your password has been successfully changed. If you made this
                change, no further action is needed.
              </Text>
              <Hr className="border-[#e6ebf1] my-8" />
              <Text className="text-[#8898aa] text-sm leading-normal">
                If you did not make this change, please reset your password
                immediately or contact support.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
