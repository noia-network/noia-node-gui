declare module "wrtc" {
    export interface RTCPeerConnectionIceEvent extends Event {
        readonly candidate: IceCandidate;
    }

    export interface IceCandidate {
        sdpMLineIndex: number | null;
        candidate: string | null;
    }

    export interface Description {}

    export interface DataChannel extends EventTarget {
        onmessage: (event: MessageEvent) => void;
        onopen: (event: Event) => void;
        send: (data: unknown) => void;
    }

    export class RTCSessionDescription {
        constructor(desc: RTCSessionDescriptionInit);
    }

    interface handleErrorCallback {
        (error: ErrorEvent): void;
    }

    interface setLocalDescriptionFn {
        (rtcSD: RTCSessionDescription, successCallback: () => void, handleError: handleErrorCallback): void;
    }

    export class RTCPeerConnection extends EventTarget {
        signalingState: string;
        iceConnectionState: string;
        iceGatheringState: string;
        connectionState: string;
        localDescription: RTCSessionDescriptionInit;
        remoteDescription: RTCSessionDescriptionInit;

        onerror: (event: ErrorEvent) => void;
        onnegotationneeded: (event: Event) => void;
        onicecandidateerror: (event: Event) => void;
        onsignalingstatechange: (event: Event) => void;
        oniceconnectionstatechange: (event: Event) => void;
        onicegatheringstatechange: (event: Event) => void;
        onconnectionstatechange: (event: Event) => void;
        onicecandidate: (candidate: RTCPeerConnectionIceEvent) => void;

        addIceCandidate: (candidate: RTCIceCandidate) => void;
        setRemoteDescription: (rtcSD: RTCSessionDescription, successCallback: () => void, handleError: handleErrorCallback) => void;
        setLocalDescription: setLocalDescriptionFn;
        createOffer: (setLocalDescription: setLocalDescriptionFn, handleError: handleErrorCallback) => void;
        createDataChannel: (name: string) => DataChannel;
        close: () => void;
    }

    export class RTCIceCandidate {
        constructor(iceCandidate: IceCandidate);
    }
}

declare module "diskusage-ng" {
    namespace diskusage {
        interface DiskUsageResult {
            total: number;
            used: number;
            available: number;
        }
    }

    function diskusage(path: string, callback: (error: Error, usage: diskusage.DiskUsageResult) => void): void;

    export = diskusage;
}

/**
 * DO NOT USE. This only available in renderer project.
 */
declare const __APPVERSION__: string;
