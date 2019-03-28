# How to change data settings of NOIA Node GUI for Windows 10

**Settings file automatically is located and generated on directory _AppData\Roaming\noia-node_ to quick locate settings file press "File folder" button on Wallet settings**. You can open and modify file `node.settings` by text editor. Example: Notepad

## Wallet > Wallet

Settings are for your ethereum wallet address. You can simply copy your wallet address with `ctrl+c` and in NOIA Node GUI press button "Paste from clipboard".
In settings file is located on `airdropAddress` name. **Example:** `airdropAddress=Your ethereum wallet address`

## Settings > Node > Master address

NOIA master server address.
In settings file is located on `masterAddress` name. **Example:** `masterAddress=wss://csl-masters.noia.network:5565`

## Settings > Node > WebRTC control port and WebRTC data port

WebRTC is an open source project to enable realtime communication of audio, video and data in Web and native apps. You can check it if it is active or not by clicking on "Check port" button.<br/>
In settings file control port is located on `controlPort` name. **Example:** `controlPort=8048`. Port for Transmission Control Protocol (TCP).
In settings file data port is located on `dataPort` name. **Example:** `dataPort=8058`. Port for User Datagram Protocol (UDP).

## Settings > Node > Storage directory

Storage directory is located by default on _\AppData\Roaming\noia-node\storage_ but you can change it by pressing on folder icon or on your storage address.
In settings file Storage directory is located on `dir` name under `[node.storage]`.<br/>**Example:** `dir=C:\Users\NOIA\AppData\Roaming\noia-node\storage`

## Settings > Node > Storage size

Storage size settings is to share your storage capacity. Storage is measuring in bytes.
In settings file Storage size is located on `size` name under `[node.storage]`. **Example:** `size=Storage size` or `size=10737418240 for 10 Gigabytes`

## Settings > Node > Enable NAT-PMP

The NAT Port Mapping Protocol (NAT-PMP) is a network protocol for establishing network address translation (NAT) settings and port forwarding configurations automatically without user effort.
In settings file NAT-PMP is located on `natPmp` name. **Example:** `natPmp=true` to enable or `natPmp=false` to disable. _We recommend NAT-PMP to be enabled_.

## Settings > Application > Minimize to tray

Allows user to minimize application to the windows tray.
In settings file Minimize to tray is located on `minimizeToTray` name. **Example:** `minimizeToTray=true` to minimize or `minimizeToTray=false` minimize is not allowed.

**_Important!_ After changing `node.settings` file you need to restart NOIA Node GUI**
