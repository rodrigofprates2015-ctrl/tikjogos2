import { createContext, useContext, ReactNode, useState, useCallback, useRef, useEffect } from 'react';
import AgoraRTC, { 
  IAgoraRTCClient, 
  IMicrophoneAudioTrack,
  IRemoteAudioTrack,
  UID
} from 'agora-rtc-sdk-ng';

interface VoiceChatContextType {
  isConnected: boolean;
  isConnecting: boolean;
  isMuted: boolean;
  localVolume: number;
  speakingUsers: Set<UID>;
  mutedRemoteUsers: Set<string>;
  error: string | null;
  join: (channelName: string, userName: string, odUserId: string) => Promise<void>;
  leave: () => Promise<void>;
  toggleMute: () => void;
  toggleMuteRemoteUser: (odUserId: string) => void;
  isRemoteUserMuted: (odUserId: string) => boolean;
  getNumericUid: (odUserId: string) => number;
}

const VoiceChatContext = createContext<VoiceChatContextType | null>(null);

async function fetchAgoraToken(channelName: string, uid: number): Promise<{ token: string; appId: string }> {
  const response = await fetch('/api/agora/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ channelName, uid })
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch Agora token: ${response.status} - ${errorText}`);
  }
  
  return response.json();
}

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash;
}

export function VoiceChatProvider({ children }: { children: ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [localVolume, setLocalVolume] = useState(0);
  const [speakingUsers, setSpeakingUsers] = useState<Set<UID>>(new Set());
  const [mutedRemoteUsers, setMutedRemoteUsers] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  const clientRef = useRef<IAgoraRTCClient | null>(null);
  const localAudioTrackRef = useRef<IMicrophoneAudioTrack | null>(null);
  const remoteAudioTracksRef = useRef<Map<UID, IRemoteAudioTrack>>(new Map());

  const getNumericUid = useCallback((odUserId: string) => {
    return Math.abs(hashCode(odUserId)) % 1000000;
  }, []);

  useEffect(() => {
    const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
    clientRef.current = client;

    client.on('user-published', async (user, mediaType) => {
      if (mediaType === 'audio') {
        await client.subscribe(user, mediaType);
        if (user.audioTrack) {
          remoteAudioTracksRef.current.set(user.uid, user.audioTrack);
          user.audioTrack.play();
        }
      }
    });

    client.on('user-unpublished', (user, mediaType) => {
      if (mediaType === 'audio') {
        user.audioTrack?.stop();
        remoteAudioTracksRef.current.delete(user.uid);
      }
    });

    client.on('user-left', (user) => {
      remoteAudioTracksRef.current.delete(user.uid);
      setSpeakingUsers(prev => {
        const next = new Set(prev);
        next.delete(user.uid);
        return next;
      });
    });

    client.enableAudioVolumeIndicator();
    client.on('volume-indicator', (volumes) => {
      const speaking = new Set<UID>();
      volumes.forEach(vol => {
        if (vol.level > 5) {
          speaking.add(vol.uid);
        }
      });
      setSpeakingUsers(speaking);

      const localVol = volumes.find(v => v.uid === 0);
      if (localVol) {
        setLocalVolume(localVol.level);
      }
    });

    return () => {
      client.removeAllListeners();
      if (localAudioTrackRef.current) {
        localAudioTrackRef.current.close();
      }
      client.leave();
    };
  }, []);

  const join = useCallback(async (channelName: string, userName: string, odUserId: string) => {
    if (!clientRef.current) return;
    
    setIsConnecting(true);
    setError(null);

    try {
      const numericUid = getNumericUid(odUserId);
      const { token, appId } = await fetchAgoraToken(channelName, numericUid);
      
      await clientRef.current.join(appId, channelName, token, numericUid);
      
      const audioTrack = await AgoraRTC.createMicrophoneAudioTrack({
        encoderConfig: 'speech_low_quality'
      });
      localAudioTrackRef.current = audioTrack;
      audioTrack.setEnabled(false);
      
      await clientRef.current.publish([audioTrack]);
      
      setIsConnected(true);
      setIsMuted(true);
    } catch (err) {
      console.error('[VoiceChat] Join error:', err);
      setError(err instanceof Error ? err.message : 'Failed to join voice chat');
    } finally {
      setIsConnecting(false);
    }
  }, [getNumericUid]);

  const leave = useCallback(async () => {
    if (!clientRef.current) return;

    try {
      if (localAudioTrackRef.current) {
        localAudioTrackRef.current.close();
        localAudioTrackRef.current = null;
      }
      
      remoteAudioTracksRef.current.clear();
      await clientRef.current.leave();
      setIsConnected(false);
      setSpeakingUsers(new Set());
      setLocalVolume(0);
      setMutedRemoteUsers(new Set());
    } catch (err) {
      console.error('[VoiceChat] Leave error:', err);
    }
  }, []);

  const toggleMute = useCallback(() => {
    if (localAudioTrackRef.current) {
      const newMuted = !isMuted;
      localAudioTrackRef.current.setEnabled(!newMuted);
      setIsMuted(newMuted);
    }
  }, [isMuted]);

  const toggleMuteRemoteUser = useCallback((odUserId: string) => {
    const numericUid = getNumericUid(odUserId);
    const audioTrack = remoteAudioTracksRef.current.get(numericUid);
    
    setMutedRemoteUsers(prev => {
      const next = new Set(prev);
      if (next.has(odUserId)) {
        next.delete(odUserId);
        audioTrack?.setVolume(100);
      } else {
        next.add(odUserId);
        audioTrack?.setVolume(0);
      }
      return next;
    });
  }, [getNumericUid]);

  const isRemoteUserMuted = useCallback((odUserId: string) => {
    return mutedRemoteUsers.has(odUserId);
  }, [mutedRemoteUsers]);

  return (
    <VoiceChatContext.Provider value={{
      isConnected,
      isConnecting,
      isMuted,
      localVolume,
      speakingUsers,
      mutedRemoteUsers,
      error,
      join,
      leave,
      toggleMute,
      toggleMuteRemoteUser,
      isRemoteUserMuted,
      getNumericUid
    }}>
      {children}
    </VoiceChatContext.Provider>
  );
}

export function useVoiceChatContext() {
  const context = useContext(VoiceChatContext);
  if (!context) {
    throw new Error('useVoiceChatContext must be used within VoiceChatProvider');
  }
  return context;
}
