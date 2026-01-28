import { useState, useEffect, useRef, useCallback } from 'react';
import AgoraRTC, { 
  IAgoraRTCClient, 
  IMicrophoneAudioTrack,
  UID
} from 'agora-rtc-sdk-ng';

export interface VoiceChatUser {
  odUid: UID;
  odName: string;
  isSpeaking: boolean;
  isMuted: boolean;
}

interface UseVoiceChatReturn {
  isConnected: boolean;
  isConnecting: boolean;
  isMuted: boolean;
  localVolume: number;
  remoteUsers: VoiceChatUser[];
  speakingUsers: Set<UID>;
  error: string | null;
  join: (channelName: string, userName: string, odUserId: string) => Promise<void>;
  leave: () => Promise<void>;
  toggleMute: () => void;
  setMuted: (muted: boolean) => void;
}

// Fetch token from server
async function fetchAgoraToken(channelName: string, uid: number): Promise<{ token: string; appId: string }> {
  const response = await fetch('/api/agora/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ channelName, uid })
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('[Agora] Token fetch failed:', response.status, errorText);
    throw new Error(`Failed to fetch Agora token: ${response.status} - ${errorText}`);
  }
  
  return response.json();
}

export function useVoiceChat(): UseVoiceChatReturn {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [localVolume, setLocalVolume] = useState(0);
  const [remoteUsers, setRemoteUsers] = useState<VoiceChatUser[]>([]);
  const [speakingUsers, setSpeakingUsers] = useState<Set<UID>>(new Set());
  const [error, setError] = useState<string | null>(null);

  const clientRef = useRef<IAgoraRTCClient | null>(null);
  const localAudioTrackRef = useRef<IMicrophoneAudioTrack | null>(null);
  const volumeIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize Agora client
  useEffect(() => {
    const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
    clientRef.current = client;

    client.on('user-published', async (user, mediaType) => {
      if (mediaType === 'audio') {
        await client.subscribe(user, mediaType);
        user.audioTrack?.play();
        
        setRemoteUsers(prev => {
          const existing = prev.find(u => u.odUid === user.uid);
          if (existing) return prev;
          return [...prev, {
            odUid: user.uid,
            odName: `Player ${user.uid}`,
            isSpeaking: false,
            isMuted: false
          }];
        });
      }
    });

    client.on('user-unpublished', (user, mediaType) => {
      if (mediaType === 'audio') {
        user.audioTrack?.stop();
      }
    });

    client.on('user-left', (user) => {
      setRemoteUsers(prev => prev.filter(u => u.odUid !== user.uid));
      setSpeakingUsers(prev => {
        const next = new Set(prev);
        next.delete(user.uid);
        return next;
      });
    });

    client.on('user-joined', (user) => {
      console.log('[VoiceChat] User joined:', user.uid);
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
      if (volumeIntervalRef.current) {
        clearInterval(volumeIntervalRef.current);
      }
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
      const numericUid = Math.abs(hashCode(odUserId)) % 1000000;
      
      // Fetch token from server
      console.log('[VoiceChat] Fetching token for channel:', channelName);
      const { token, appId } = await fetchAgoraToken(channelName, numericUid);
      console.log('[VoiceChat] Token received, joining channel...');
      
      await clientRef.current.join(appId, channelName, token, numericUid);
      
      // Create and publish local audio track
      const audioTrack = await AgoraRTC.createMicrophoneAudioTrack({
        encoderConfig: 'speech_low_quality'
      });
      localAudioTrackRef.current = audioTrack;
      
      // Start muted
      audioTrack.setEnabled(false);
      
      await clientRef.current.publish([audioTrack]);
      
      setIsConnected(true);
      setIsMuted(true);
      console.log('[VoiceChat] Joined channel successfully:', channelName);
    } catch (err) {
      console.error('[VoiceChat] Join error:', err);
      setError(err instanceof Error ? err.message : 'Failed to join voice chat');
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const leave = useCallback(async () => {
    if (!clientRef.current) return;

    try {
      if (localAudioTrackRef.current) {
        localAudioTrackRef.current.close();
        localAudioTrackRef.current = null;
      }
      
      await clientRef.current.leave();
      setIsConnected(false);
      setRemoteUsers([]);
      setSpeakingUsers(new Set());
      setLocalVolume(0);
      console.log('[VoiceChat] Left channel');
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

  const setMuted = useCallback((muted: boolean) => {
    if (localAudioTrackRef.current) {
      localAudioTrackRef.current.setEnabled(!muted);
      setIsMuted(muted);
    }
  }, []);

  return {
    isConnected,
    isConnecting,
    isMuted,
    localVolume,
    remoteUsers,
    speakingUsers,
    error,
    join,
    leave,
    toggleMute,
    setMuted
  };
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
