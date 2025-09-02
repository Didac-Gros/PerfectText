import { useState } from "react";
import { Calls } from "./CallsSection";
import { CallState } from "../../hooks/useVoiceCall";

interface CallsTabProps {
  state: CallState;
  sendCall: (toUserId: string) => Promise<void>;
  hangup: () =>void;
}

export function CallsTab({state, sendCall, hangup}: CallsTabProps) {
  const [activeCall, setActiveCall] = useState<{
    participants: any[];
    initiator: any;
    startTime: Date;
  } | null>(null);


  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#161616] p-6">
      <div className="max-w-[1400px] mx-auto space-y-8">
        <Calls
          // recentCalls={recentCalls}
          onCallStart={setActiveCall}
          state={state}
          call={sendCall}
          hangup={hangup}
        />
      </div>
    </div>
  );
}
