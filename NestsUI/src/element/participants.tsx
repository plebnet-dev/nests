import { useParticipants } from "@livekit/components-react";
import { useUserProfile } from "@snort/system-react";
import { LocalParticipant, RemoteParticipant } from "livekit-client";
import Icon from "../icon";
import Avatar from "./avatar";
import { hexToBech32 } from "@snort/shared";
import { useUserPresence } from "../hooks/useRoomPresence";
import { NostrEvent } from "@snort/system";
import { useCallback, useRef, useState } from "react";
import { PrimaryButton } from "./button";
import ProfileCard from "./profile-card";

export default function NostrParticipants({ event }: { event: NostrEvent }) {
    const participants = useParticipants();

    return <>
        <div className="grid grid-cols-4 gap-4 content-evenly">
            {participants.filter(a => a.audioTracks.size > 0).map(a => {
                return <NostrParticipant p={a} key={a.sid} event={event} />
            })}
        </div>
        <div className="h-[1px] bg-foreground w-full"></div>
        <div className="grid grid-cols-4 gap-4 content-evenly">
            {participants.filter(a => a.audioTracks.size === 0).map(a => {
                return <NostrParticipant p={a} key={a.sid} event={event} />
            })}
        </div>
    </>
}

function NostrParticipant({ p, event }: { p: RemoteParticipant | LocalParticipant, event: NostrEvent }) {
    const isGuest = p.identity.startsWith("guest-");
    const profile = useUserProfile(isGuest ? undefined : p.identity);
    const presnce = useUserPresence(p.identity);
    const [isHovering, setIsHovering] = useState(false);

    const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const handleMouseEnter = useCallback(() => {
        hoverTimeoutRef.current && clearTimeout(hoverTimeoutRef.current);
        hoverTimeoutRef.current = setTimeout(() => setIsHovering(true), 100); // Adjust timeout as needed
    }, []);

    const handleMouseLeave = useCallback(() => {
        hoverTimeoutRef.current && clearTimeout(hoverTimeoutRef.current);
        hoverTimeoutRef.current = setTimeout(() => setIsHovering(false), 300); // Adjust timeout as needed
    }, []);

    const isHandRaised = Boolean(presnce?.tags.find(a => a[0] === "hand")?.[1]);
    const isHost = event.pubkey === p.identity;

    return <div className="flex items-center flex-col gap-2" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
        <div className="relative">
            {isHandRaised && <div className="absolute w-full h-full">
                <div className="bg-foreground rounded-full inline-block w-10 h-10 -mt-4 -ml-4 flex items-center justify-center">
                    <Icon name="hand" size={25} />
                </div>
            </div>}
            {(profile?.lud16 || profile?.lud06) && <div className="absolute w-full h-full rotate-[80deg]">
                <div className="text-primary inline-block mt-[-8px] ml-[-8px]">
                    <Icon name="zap" className="rotate-[-80deg]" size={32} />
                </div>
            </div>}
            {p.audioTracks.size > 0 && !p.isMicrophoneEnabled && <div className="absolute w-full h-full rotate-[135deg]">
                <div className="bg-foreground rounded-full inline-block mt-[-4px] ml-[-4px] w-8 h-8 flex items-center justify-center">
                    <Icon name={p.isMicrophoneEnabled ? "mic" : "mic-off"} className="rotate-[-135deg]" size={20} />
                </div>
            </div>}
            <Avatar pubkey={p.identity} size={72} className={p.isSpeaking ? `outline outline-3${isHost ? " outline-primary" : ""}` : ""} />

            {isHovering && <div className="absolute z-10 bg-foreground p-3 rounded-xl w-60 flex flex-col gap-2">
                <ProfileCard pubkey={p.identity} profile={profile} />
            </div>}
        </div>
        <div className={isHost ? "text-primary" : ""}>
            {isGuest ? "Guest (me)" :
                profile?.display_name ?? profile?.name ?? hexToBech32("npub", p.identity).slice(0, 12)}
        </div>
        {isHost && <div className="text-primary">Host</div>}
    </div>
}