import { Layer } from "effect";
import { AuthTeamMemberLive } from "~/layers/auth-user";
import { TeamMemberSessionLive } from "~/layers/session";

export const TeamMemberLive = AuthTeamMemberLive.pipe(
	Layer.provideMerge(TeamMemberSessionLive),
);
