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

interface TeamInvitationProps {
  teamName: string;
  inviterName: string;
  inviterEmail: string;
  acceptUrl: string;
}

export function subject({ teamName }: TeamInvitationProps) {
  return `You've been invited to join ${teamName}`;
}

export default function TeamInvitationEmail({
  teamName,
  inviterName,
  inviterEmail,
  acceptUrl,
}: TeamInvitationProps) {
  return (
    <Html>
      <Tailwind>
        <Head />
        <Body className="bg-[#f6f9fc] font-sans">
          <Container className="bg-white mx-auto pt-5 pb-12 mb-16 max-w-[560px]">
            <Section className="px-12">
              <Text className="text-2xl font-semibold leading-tight text-[#1a1a1a] pt-[17px]">
                Join {teamName}
              </Text>
              <Text className="text-base leading-relaxed text-[#484848] my-4">
                {inviterName} ({inviterEmail}) has invited you to join their team
                on TSKit.
              </Text>
              <Text className="text-base leading-relaxed text-[#484848] my-4">
                Click the button below to accept the invitation and join the
                team.
              </Text>
              <Button
                className="bg-[#171717] rounded-md text-white text-base font-semibold no-underline text-center block py-3 px-6 my-6"
                href={acceptUrl}
              >
                Accept Invitation
              </Button>
              <Hr className="border-[#e6ebf1] my-8" />
              <Text className="text-[#8898aa] text-sm leading-normal">
                If you weren&apos;t expecting this invitation, you can safely
                ignore this email. The invitation will expire in 48 hours.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
